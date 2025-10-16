const rooms = {}; 
const socketIdToUser = {}; 

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        
        socket.on('join_room', async (data) => {
            const { roomName, user } = data;
            if (!roomName || !user || !user.id) {
                console.warn(`Invalid join_room request from ${socket.id}:`, data);
                socket.emit('join_error', { error: 'Invalid room or user data.' });
                return;
            }

            
            
            let isAuthorized = false;
            try {
                
                const appointmentId = roomName.startsWith('appt-') ? roomName.split('-')[1] : null;
                if (!appointmentId || isNaN(parseInt(appointmentId, 10))) {
                    throw new Error("Invalid appointment ID format in room name.");
                }
                const pool = require('../config/db'); 
                const [appRows] = await pool.query(
                     `SELECT a.patient_id, d.user_id AS doctor_user_id
                      FROM appointments a
                      LEFT JOIN doctors d ON a.doctor_id = d.id
                      WHERE a.id = ? AND a.status = 'confirmed'`, 
                    [appointmentId]
                );
                if (appRows.length > 0) {
                    const appointment = appRows[0];
                    const loggedInUserId = user.id; 
                    if (loggedInUserId === appointment.patient_id || loggedInUserId === appointment.doctor_user_id) {
                         isAuthorized = true;
                    }
                }
            } catch (dbError) {
                console.error(`Database error during authorization check for user ${user.id}, room ${roomName}:`, dbError);
                socket.emit('join_error', { roomName, error: 'Server error during authorization check.' });
                 return;
             }

            if (!isAuthorized) {
                 console.warn(`Unauthorized attempt: User ${user.id} (${user.name}) joining room ${roomName}`);
                 socket.emit('join_error', { roomName, error: 'You are not authorized to join this video session.' });
                 return;
             }
             console.log(`Authorization success: User ${user.id} (${user.name}) joining room ${roomName}`);
             

            socket.join(roomName);
            socket.currentRoom = roomName;
            socketIdToUser[socket.id] = user;

            if (!rooms[roomName]) {
                rooms[roomName] = new Set();
            }
            rooms[roomName].add(socket.id);

            
            const otherUsersInRoom = Array.from(rooms[roomName]).filter(id => id !== socket.id);
            socket.to(roomName).emit('user_joined', {
                socketId: socket.id,
                user: socketIdToUser[socket.id]
            });
            socket.emit('room_peers', {
                roomName,
                peerIds: otherUsersInRoom,
                peersInfo: otherUsersInRoom.map(id => ({ socketId: id, user: socketIdToUser[id] }))
            });
            console.log(`Room ${roomName} users:`, Array.from(rooms[roomName]));
        });

        
        socket.on('offer', (data) => {
            const { targetSocketId, sdp } = data;
            console.log(`Relaying OFFER from ${socket.id} to ${targetSocketId}`);
            socket.to(targetSocketId).emit('offer_received', { senderSocketId: socket.id, sdp });
        });

        socket.on('answer', (data) => {
            const { targetSocketId, sdp } = data;
            console.log(`Relaying ANSWER from ${socket.id} to ${targetSocketId}`);
            socket.to(targetSocketId).emit('answer_received', { senderSocketId: socket.id, sdp });
        });

        socket.on('ice_candidate', (data) => {
            const { targetSocketId, candidate } = data;
            console.log(`Relaying ICE CANDIDATE from ${socket.id} to ${targetSocketId}`);
            socket.to(targetSocketId).emit('candidate_received', { senderSocketId: socket.id, candidate });
        });

        
        const handleLeaveRoom = () => {
            const roomName = socket.currentRoom;
            if (roomName && rooms[roomName]) {
                console.log(`User ${socket.id} leaving room ${roomName}`);
                rooms[roomName].delete(socket.id);
                delete socket.currentRoom;
                socket.to(roomName).emit('user_left', { socketId: socket.id });
                if (rooms[roomName].size === 0) {
                    console.log(`Room ${roomName} is now empty, deleting.`);
                    delete rooms[roomName];
                }
            }
            delete socketIdToUser[socket.id];
        };

        socket.on('leave_room', handleLeaveRoom);
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            handleLeaveRoom();
        });
    });

    console.log('Socket.IO Signaling Server Logic Initialized and attached to listeners.');
};