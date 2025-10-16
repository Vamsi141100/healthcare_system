require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http'); 
const { Server } = require('socket.io'); 

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const supportRoutes = require('./routes/supportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statsRoutes = require('./routes/statsRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const labRoutes = require('./routes/labRoutes');
const medicationRoutes = require('./routes/medicationRoutes');

const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
    
    cors: {
        
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"], 
        
    },
    
    
    
});

require('./signaling/signalingServer')(io);

const PORT = process.env.PORT || 5001; 

app.use(cors({ 
    origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api', (req, res) => res.send('Healthcare API Running')); 
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/medications', medicationRoutes);

app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`Server (API & Socket.IO) running on http://localhost:${PORT}`);
    console.log(`Frontend clients should connect sockets to http://localhost:${PORT}`); 
});

server.on('error', (error) => {
    console.error(`Server startup error: ${error.message}`);
    
    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
});