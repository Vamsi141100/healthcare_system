import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client'; 
import { iceServersConfig } from '../../config/webrtcConfig'; 
import { useSelector } from 'react-redux';
import {
    Box, Button, Typography, CircularProgress, Alert, Paper, Grid,
    IconButton, Tooltip, alpha
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import PersonIcon from '@mui/icons-material/Person';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';

let socket = null;
const SIGNALING_SERVER_URL = process.env.REACT_APP_API_BASE_URL
    ? process.env.REACT_APP_API_BASE_URL.replace('/api', '')
    : 'http://localhost:5001';

const VideoCallSelfHosted = ({ roomName, onLeaveCall }) => {
    const theme = useTheme();
    const { profile } = useSelector((state) => state.auth);
    const [isConnected, setIsConnected] = useState(false);
    const [isJoining, setIsJoining] = useState(true);
    const [error, setError] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({}); 

    const peerConnections = useRef({});
    const localVideoRef = useRef();
    const remoteVideoRefs = useRef({});
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoStopped, setIsVideoStopped] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const getPeerConnection = useCallback((socketId) => {
        if (peerConnections.current[socketId]) {
            return peerConnections.current[socketId];
        }

        
        console.log(`Creating new PeerConnection for ${socketId}`);
        const pc = new RTCPeerConnection(iceServersConfig);
        peerConnections.current[socketId] = pc;

        pc.onicecandidate = (event) => {
            if (event.candidate && socket?.connected) {
                console.log(`[PC ${socketId}] Sending ICE candidate`);
                socket.emit('ice_candidate', { targetSocketId: socketId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            console.log(`[PC ${socketId}] Track received:`, event.track.kind);
            if (event.streams && event.streams[0]) {
                setRemoteStreams(prev => ({ ...prev, [socketId]: event.streams[0] }));
            } else {
                 console.warn(`[PC ${socketId}] Track received without stream array`);
                let stream = new MediaStream();
                 stream.addTrack(event.track);
                 setRemoteStreams(prev => ({ ...prev, [socketId]: stream }));
            }
        };

        pc.oniceconnectionstatechange = () => {
             const currentState = pc.iceConnectionState;
             console.log(`[PC ${socketId}] ICE State Change: ${currentState}`);
             if (['disconnected', 'failed', 'closed'].includes(currentState)) {
                 if (remoteStreams[socketId]) {
                     enqueueSnackbar(`Connection with peer lost.`, { variant: 'warning' });
                     closePeerConnection(socketId);
                 }
             }
         };

         if (localStream) {
            localStream.getTracks().forEach(track => {
                try {
                    console.log(`[PC ${socketId}] Adding local track: ${track.kind}`);
                    pc.addTrack(track, localStream);
                } catch (err) {
                     console.error(`[PC ${socketId}] Error adding local track:`, err);
                }
            });
         } else {
            console.warn(`[PC ${socketId}] Local stream not available when creating PeerConnection`);
        }

        return pc;

    }, [localStream, remoteStreams, enqueueSnackbar]); 

    const closePeerConnection = useCallback((socketId) => {
         const pc = peerConnections.current[socketId];
         if (pc) {
            console.log(`Closing PeerConnection for ${socketId}`);
            pc.onicecandidate = null;
            pc.ontrack = null;
             pc.oniceconnectionstatechange = null;
             pc.onnegotiationneeded = null; 
             pc.onsignalingstatechange = null;

            pc.close();
             delete peerConnections.current[socketId]; 

             setRemoteStreams(prev => {
                 const newState = { ...prev };
                 delete newState[socketId];
                 return newState;
            });
            delete remoteVideoRefs.current[socketId];
         }
    }, []);

    const cleanup = useCallback(() => {
         console.log("--- Running Video Call Cleanup ---");

        if (localStream) {
            console.log("Stopping local media tracks");
             localStream.getTracks().forEach(track => track.stop());
             setLocalStream(null);
             if(localVideoRef.current) localVideoRef.current.srcObject = null;
         }

         console.log("Closing peer connections");
         Object.keys(peerConnections.current).forEach(socketId => {
            closePeerConnection(socketId);
         });
        peerConnections.current = {};

        if (socket?.connected) { 
             console.log("Disconnecting Socket.IO");
             socket.emit('leave_room'); 
             socket.disconnect();
         }
         socket = null; 

        setRemoteStreams({});
        setIsConnected(false);
        setIsJoining(false);
        setError(null);

        console.log("--- Cleanup Complete ---");

    }, [localStream, closePeerConnection]);

     useEffect(() => {
        if (!profile || !roomName) {
            setError("Missing user/room information."); setIsJoining(false); return;
        }
         let localStreamInstance = null;
         let socketInstance = null; 

        const initialize = async () => {
            setError(null); setIsJoining(true);
             try {
                 console.log("Requesting user media...");
                localStreamInstance = await navigator.mediaDevices.getUserMedia({ video: { width: 640 }, audio: true });
                setLocalStream(localStreamInstance);
                 if (localVideoRef.current) localVideoRef.current.srcObject = localStreamInstance;
                 console.log("Local media stream obtained.");

                 if (!socket || !socket.connected) {
                     console.log(`Connecting to signaling server at ${SIGNALING_SERVER_URL}...`);
                     socketInstance = io(SIGNALING_SERVER_URL, {
                         reconnectionAttempts: 3,
                     });
                     socket = socketInstance;

                    socket.on('connect', () => {
                        console.log('SOCKET CONNECTED:', socket.id);
                         setIsConnected(true);
                        if(localStreamInstance) {
                             console.log(`Emitting join_room for ${roomName}`);
                             socket.emit('join_room', { roomName, user: profile });
                        } else {
                             console.error("Connected but local stream not ready, cannot join room yet.");
                        }
                    });
                     socket.on('connect_error', (err) => { console.error('SOCKET CONN ERROR:', err.message); setError(`Signaling connect error: ${err.message}`); setIsJoining(false); setIsConnected(false); cleanup(); });
                    socket.on('disconnect', (reason) => { console.warn('SOCKET DISCONNECTED:', reason); setError(`Disconnected: ${reason}. Manual reconnect needed.`); setIsConnected(false);  });
                     socket.on('join_error', (data) => { console.error('JOIN ERROR:', data.error); setError(`Error joining room: ${data.error}`); setIsJoining(false); cleanup(); });
                     socket.on('room_peers', async ({ peerIds }) => { console.log('PEERS RECEIVED:', peerIds); setIsJoining(false);  if (localStreamInstance) { peerIds.forEach(async (peerId) => { const pc = getPeerConnection(peerId); try { console.log(`Creating offer for peer ${peerId}`); const offer = await pc.createOffer(); await pc.setLocalDescription(offer); socket.emit('offer', { targetSocketId: peerId, sdp: pc.localDescription }); } catch (err) { console.error(`Offer Error to ${peerId}:`, err); } }); } else { console.error("Local stream gone during room_peers handling?"); } });
                     socket.on('user_joined', ({ socketId: joinedSocketId, user: joinedUser }) => { console.log('USER JOINED:', joinedSocketId, joinedUser?.name); enqueueSnackbar(`${joinedUser?.name || 'User'} joined.`, { variant: 'info' }); getPeerConnection(joinedSocketId);  });
                     socket.on('offer_received', async ({ senderSocketId, sdp: offer }) => { console.log('OFFER RECEIVED from', senderSocketId); const pc = getPeerConnection(senderSocketId); try { await pc.setRemoteDescription(new RTCSessionDescription(offer)); console.log(`Creating answer for ${senderSocketId}`); const answer = await pc.createAnswer(); await pc.setLocalDescription(answer); socket.emit('answer', { targetSocketId: senderSocketId, sdp: pc.localDescription }); } catch (err) { console.error(`Answer Error for ${senderSocketId}:`, err); } });
                     socket.on('answer_received', async ({ senderSocketId, sdp: answer }) => { console.log('ANSWER RECEIVED from', senderSocketId); const pc = peerConnections.current[senderSocketId]; if (pc) { try { await pc.setRemoteDescription(new RTCSessionDescription(answer)); } catch (err) { console.error(`Set Remote Answer Error for ${senderSocketId}:`, err); } } else { console.warn(`No PC for answer from ${senderSocketId}`); } });
                     socket.on('candidate_received', async ({ senderSocketId, candidate }) => { console.log('CANDIDATE RECEIVED from', senderSocketId); const pc = peerConnections.current[senderSocketId]; if (pc && candidate) { try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (err) {  if (!err.message.includes("operation")) console.error(`Add ICE Error for ${senderSocketId}:`, err); } } else {  if(candidate) console.warn(`No PC for candidate from ${senderSocketId}`); } });
                     socket.on('user_left', ({ socketId }) => { console.log('USER LEFT:', socketId); enqueueSnackbar(`User left.`, { variant: 'info' }); closePeerConnection(socketId); });

                 } else {
                     console.log("Socket already connected. Re-emitting join_room just in case.");
                     socket.emit('join_room', { roomName, user: profile });
                     setIsJoining(false);
                     setIsConnected(true);
                 }

             } catch (err) {
                console.error('GetUserMedia Error:', err);
                 setError(`Init Error: ${err.message}. Check camera/mic permissions.`);
                 setIsJoining(false); setIsConnected(false); cleanup();
             }
         };

         initialize();

         return () => {
             console.log("-------> useEffect cleanup for initialization effect <-------");
             cleanup();
         };
     }, [roomName, profile?.id]);

    const toggleAudio = useCallback(() => {
        if (!localStream) {
            console.warn("toggleAudio: No local stream available.");
            return;
        }
        const audioTracks = localStream.getAudioTracks();
        if (audioTracks.length > 0) {
            const currentTrackStateEnabled = audioTracks[0].enabled;
            const nextTrackStateEnabled = !currentTrackStateEnabled;

            console.log(`TOGGLE AUDIO: Current Track Enabled: ${currentTrackStateEnabled}, Setting Track Enabled to: ${nextTrackStateEnabled}`);

            audioTracks.forEach(track => {
                track.enabled = nextTrackStateEnabled;
            });

            setIsAudioMuted(!nextTrackStateEnabled);
            console.log(`UI State isAudioMuted set to: ${!nextTrackStateEnabled}`);

        } else {
            console.warn("toggleAudio: No audio tracks found in local stream.");
        }
    }, [localStream]);

    const toggleVideo = useCallback(() => {
        if (!localStream) {
             console.warn("toggleVideo: No local stream available.");
             return;
        }
        const videoTracks = localStream.getVideoTracks();
         if (videoTracks.length > 0) {
             const currentTrackStateEnabled = videoTracks[0].enabled;
             const nextTrackStateEnabled = !currentTrackStateEnabled;

             console.log(`TOGGLE VIDEO: Current Track Enabled: ${currentTrackStateEnabled}, Setting Track Enabled to: ${nextTrackStateEnabled}`);

             videoTracks.forEach(track => {
                 track.enabled = nextTrackStateEnabled;
            });

             setIsVideoStopped(!nextTrackStateEnabled);
             console.log(`UI State isVideoStopped set to: ${!nextTrackStateEnabled}`);

         } else {
            console.warn("toggleVideo: No video tracks found in local stream.");
        }
     }, [localStream]);

    const leaveCall = useCallback(() => {
         console.log("Leave Call button clicked.");
         cleanup();
         if (onLeaveCall) onLeaveCall();
    }, [cleanup, onLeaveCall]);

    useEffect(() => {
        Object.keys(remoteStreams).forEach(socketId => {
             const stream = remoteStreams[socketId];
            const videoElement = remoteVideoRefs.current[socketId];
            if (videoElement && videoElement.srcObject !== stream) {
                console.log(`Attaching remote stream from ${socketId} to video element.`);
                videoElement.srcObject = stream;
             }
        });
     }, [remoteStreams]);

    if (isJoining) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}><CircularProgress /><Typography sx={{ ml: 2 }}>Joining call...</Typography></Box>;
    if (error) return <Alert severity="error" sx={{ m: 2 }}>{error} <Button size="small" onClick={leaveCall}>Close Video</Button></Alert>;
     if (!isConnected || !localStream) return <Alert severity="warning" sx={{ m: 2 }}>Could not connect or access media. Check permissions and connection. <Button size="small" onClick={leaveCall}>Close Video</Button></Alert>;

     const remoteParticipantIds = Object.keys(remoteStreams);

    return (
        <Paper elevation={3} sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'common.black', overflow: 'hidden' }}>

            <Box sx={{
                flexGrow: 1, display: 'grid', gap: '8px', height: 'calc(100% - 70px)',
                gridTemplateColumns: `repeat(auto-fit, minmax(${remoteParticipantIds.length > 0 ? '200px': '100%'}, 1fr))`,
                gridAutoRows: 'minmax(150px, auto)',
                overflowY: 'auto', p: 1, bgcolor: '#1c1c1c', borderRadius: 1,
            }}>

                <Paper variant="outlined" sx={{ overflow: 'hidden', position: 'relative', bgcolor: '#333', border:'none', aspectRatio: '16/9' }}>

                    <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                    {}
                    {isVideoStopped && (
                         <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#000', 0.7) }}>
                             <PersonIcon sx={{ fontSize: 60, color: 'grey.500' }} />
                         </Box>
                     )}

                    <Typography variant="caption" sx={{ position: 'absolute', bottom: 3, left: 3, color: 'white', bgcolor: 'rgba(0,0,0,0.6)', px: 0.5, borderRadius: 0.5, zIndex: 1, display:'flex', alignItems:'center', gap: 0.5 }}>
                        You
                        {isAudioMuted && <MicOffIcon fontSize='inherit'/>}
                         {isVideoStopped && <VideocamOffIcon fontSize='inherit'/>}
                    </Typography>
                 </Paper>

                {remoteParticipantIds.map(socketId => (
                    <Paper key={socketId} variant="outlined" sx={{ overflow: 'hidden', position: 'relative', bgcolor: '#444', border:'none', aspectRatio: '16/9' }}>

                         <video ref={el => { remoteVideoRefs.current[socketId] = el; }} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         {(!remoteStreams[socketId] || remoteStreams[socketId]?.getVideoTracks().length === 0 || !remoteStreams[socketId]?.getVideoTracks().some(t => t.enabled) ) && (
                              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#000', 0.6) }}>
                                  <PersonIcon sx={{ fontSize: 50, color: 'grey.600' }} />
                              </Box>
                          )}
                        <Typography variant="caption" sx={{ position: 'absolute', bottom: 3, left: 3, color: 'white', bgcolor: 'rgba(0,0,0,0.6)', px: 0.5, borderRadius: 0.5, zIndex: 1 }}>
                             Peer {socketId.substring(0, 4)}

                         </Typography>
                     </Paper>
                ))}
                {remoteParticipantIds.length === 0 && (
                     <Box sx={{ gridColumn: '1 / -1', display:'flex', alignItems:'center', justifyContent:'center', minHeight:'150px', height: '100%', color:'grey.500' }}>
                        <Typography>Waiting for others to join...</Typography>
                     </Box>
                )}
             </Box>

             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: { xs: 1, sm: 2 }, pt: 1, mt: 'auto'  }}>
                 <Tooltip title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}>
                    <IconButton onClick={toggleAudio} size="large" sx={{ color: isAudioMuted ? '#fff' : '#fff', bgcolor: isAudioMuted ? 'error.main' : alpha('#fff', 0.2), '&:hover': { bgcolor: isAudioMuted ? 'error.dark' : alpha('#fff', 0.3) } }}>
                         {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
                     </IconButton>
                 </Tooltip>
                 <Tooltip title={isVideoStopped ? "Start Camera" : "Stop Camera"}>
                     <IconButton onClick={toggleVideo} size="large" sx={{ color: isVideoStopped ? '#fff' : '#fff', bgcolor: isVideoStopped ? 'error.main' : alpha('#fff', 0.2), '&:hover': { bgcolor: isVideoStopped ? 'error.dark' : alpha('#fff', 0.3) } }}>
                        {isVideoStopped ? <VideocamOffIcon /> : <VideocamIcon />}
                     </IconButton>
                 </Tooltip>
                 <Tooltip title="Leave Call">
                     <IconButton onClick={leaveCall} size="large" sx={{ color: 'white', bgcolor: theme.palette.error.dark, '&:hover': { bgcolor: alpha(theme.palette.error.dark, 0.8)} }}>
                        <CallEndIcon />
                     </IconButton>
                 </Tooltip>
             </Box>
        </Paper>
    );
};

export default VideoCallSelfHosted;