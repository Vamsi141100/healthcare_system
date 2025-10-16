import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { iceServersConfig } from '../../config/webrtcConfig';
import { useSelector } from 'react-redux';
import {
    Box, Button, Typography, CircularProgress, Alert, Paper,
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
    const { enqueueSnackbar } = useSnackbar();

    
    const [isJoining, setIsJoining] = useState(true);
    const [error, setError] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoStopped, setIsVideoStopped] = useState(false);

    
    const peerConnections = useRef({});
    const localVideoRef = useRef();
    const remoteVideoRefs = useRef({});

    

    const closePeerConnection = useCallback((socketId) => {
        const pc = peerConnections.current[socketId];
        if (pc) {
            console.log(`Closing PeerConnection for ${socketId}`);
            pc.onicecandidate = null;
            pc.ontrack = null;
            pc.oniceconnectionstatechange = null;
            pc.close();
            delete peerConnections.current[socketId];

            setRemoteStreams(prev => {
                const newState = { ...prev };
                delete newState[socketId];
                return newState;
            });
        }
    }, []);

    const cleanup = useCallback(() => {
        console.log("--- Running Video Call Cleanup ---");
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            if (localVideoRef.current) localVideoRef.current.srcObject = null;
        }

        Object.keys(peerConnections.current).forEach(socketId => {
            closePeerConnection(socketId);
        });
        peerConnections.current = {};

        if (socket?.connected) {
            socket.emit('leave_room');
            socket.disconnect();
            socket = null;
        }
        setRemoteStreams({});
    }, [localStream, closePeerConnection]);

    const leaveCall = useCallback(() => {
        cleanup();
        if (onLeaveCall) onLeaveCall();
    }, [cleanup, onLeaveCall]);

    

    useEffect(() => {
        if (!profile || !roomName) {
            setError("Missing user profile or room information.");
            setIsJoining(false);
            return;
        }

        let localStreamInstance;

        
        const createPeerConnection = (socketId) => {
            if (peerConnections.current[socketId]) {
                return peerConnections.current[socketId];
            }
            const pc = new RTCPeerConnection(iceServersConfig);

            pc.onicecandidate = (event) => {
                if (event.candidate && socket?.connected) {
                    socket.emit('ice_candidate', { targetSocketId: socketId, candidate: event.candidate });
                }
            };

            pc.ontrack = (event) => {
                if (event.streams && event.streams[0]) {
                    setRemoteStreams(prev => ({ ...prev, [socketId]: event.streams[0] }));
                }
            };

            pc.oniceconnectionstatechange = () => {
                const currentState = pc.iceConnectionState;
                if (['disconnected', 'failed', 'closed'].includes(currentState)) {
                    enqueueSnackbar(`Peer connection lost`, { variant: 'warning' });
                    closePeerConnection(socketId);
                }
            };

            if (localStreamInstance) {
                localStreamInstance.getTracks().forEach(track => {
                    pc.addTrack(track, localStreamInstance);
                });
            }
            peerConnections.current[socketId] = pc;
            return pc;
        };
        
        
        const initialize = async () => {
            try {
                
                localStreamInstance = await navigator.mediaDevices.getUserMedia({ video: { width: 640 }, audio: true });
                setLocalStream(localStreamInstance);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStreamInstance;
                }

                
                socket = io(SIGNALING_SERVER_URL, { reconnectionAttempts: 3 });

                
                socket.on('connect', () => {
                    socket.emit('join_room', { roomName, user: profile });
                });

                socket.on('room_peers', ({ peerIds }) => {
                    setIsJoining(false);
                    peerIds.forEach(async (peerId) => {
                        const pc = createPeerConnection(peerId);
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socket.emit('offer', { targetSocketId: peerId, sdp: pc.localDescription });
                    });
                });

                socket.on('user_joined', ({ socketId, user }) => {
                    enqueueSnackbar(`${user?.name || 'User'} has joined.`, { variant: 'info' });
                    createPeerConnection(socketId);
                });
                
                socket.on('offer_received', async ({ senderSocketId, sdp }) => {
                    const pc = createPeerConnection(senderSocketId);
                    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit('answer', { targetSocketId: senderSocketId, sdp: pc.localDescription });
                });
                
                socket.on('answer_received', async ({ senderSocketId, sdp }) => {
                    const pc = peerConnections.current[senderSocketId];
                    if (pc) {
                       await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                    }
                });
                
                socket.on('candidate_received', async ({ senderSocketId, candidate }) => {
                    const pc = peerConnections.current[senderSocketId];
                    if (pc && candidate) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                });

                socket.on('user_left', ({ socketId }) => {
                    enqueueSnackbar(`User left the call.`, { variant: 'info' });
                    closePeerConnection(socketId);
                });
                
                socket.on('connect_error', (err) => { throw new Error(`Connection failed: ${err.message}`) });
                socket.on('join_error', (data) => { throw new Error(data.error) });

            } catch (err) {
                console.error("Initialization Error:", err);
                setError(`Failed to start video call: ${err.message}. Please check camera/mic permissions.`);
                setIsJoining(false);
                cleanup();
            }
        };

        initialize();

        
        return () => {
            cleanup();
        };
    }, [roomName, profile, enqueueSnackbar, closePeerConnection, cleanup]);

    
    useEffect(() => {
        Object.keys(remoteStreams).forEach(socketId => {
            const stream = remoteStreams[socketId];
            const videoElement = remoteVideoRefs.current[socketId];
            if (videoElement && stream && videoElement.srcObject !== stream) {
                videoElement.srcObject = stream;
            }
        });
    }, [remoteStreams]);
    
    
    const toggleAudio = useCallback(() => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                audioTracks[0].enabled = !audioTracks[0].enabled;
                setIsAudioMuted(!audioTracks[0].enabled);
            }
        }
    }, [localStream]);

    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                videoTracks[0].enabled = !videoTracks[0].enabled;
                setIsVideoStopped(!videoTracks[0].enabled);
            }
        }
    }, [localStream]);
    
    
    
    if (isJoining) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <CircularProgress /><Typography sx={{ ml: 2 }}>Joining call...</Typography>
        </Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 2 }}>{error} <Button size="small" onClick={leaveCall}>Close</Button></Alert>;
    }

    const remoteParticipantIds = Object.keys(remoteStreams);

    return (
        <Paper elevation={3} sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'common.black', overflow: 'hidden' }}>
            {}
            <Box sx={{
                flexGrow: 1, display: 'grid', gap: '8px', height: 'calc(100% - 70px)',
                gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
            }}>
                {}
                <Paper variant="outlined" sx={{ overflow: 'hidden', position: 'relative', bgcolor: '#333', border:'none' }}>
                    <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                    {isVideoStopped && (
                        <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#000', 0.7) }}>
                             <PersonIcon sx={{ fontSize: 60, color: 'grey.500' }} />
                        </Box>
                    )}
                    <Typography variant="caption" sx={{ position: 'absolute', bottom: 3, left: 3, color: 'white', bgcolor: 'rgba(0,0,0,0.6)', px: 1, py: 0.5, borderRadius: 1 }}>
                        You {isAudioMuted && <MicOffIcon fontSize='inherit'/>}
                    </Typography>
                </Paper>

                {}
                {remoteParticipantIds.map(socketId => (
                    <Paper key={socketId} variant="outlined" sx={{ overflow: 'hidden', position: 'relative', bgcolor: '#444', border:'none' }}>
                         <video ref={el => { remoteVideoRefs.current[socketId] = el; }} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <Typography variant="caption" sx={{ position: 'absolute', bottom: 3, left: 3, color: 'white', bgcolor: 'rgba(0,0,0,0.6)', px: 1, py: 0.5, borderRadius: 1 }}>
                             Peer
                         </Typography>
                     </Paper>
                ))}

                 {remoteParticipantIds.length === 0 && (
                     <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', color:'grey.500' }}>
                        <Typography>Waiting for others to join...</Typography>
                     </Box>
                )}
            </Box>

            {}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, pt: 1, mt: 'auto' }}>
                <Tooltip title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}>
                    <IconButton onClick={toggleAudio} sx={{ color: '#fff', bgcolor: isAudioMuted ? 'error.main' : alpha('#fff', 0.2)}}>
                        {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
                    </IconButton>
                </Tooltip>
                <Tooltip title={isVideoStopped ? "Start Camera" : "Stop Camera"}>
                    <IconButton onClick={toggleVideo} sx={{ color: '#fff', bgcolor: isVideoStopped ? 'error.main' : alpha('#fff', 0.2)}}>
                        {isVideoStopped ? <VideocamOffIcon /> : <VideocamIcon />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="Leave Call">
                    <IconButton onClick={leaveCall} size="large" sx={{ color: 'white', bgcolor: theme.palette.error.dark }}>
                        <CallEndIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        </Paper>
    );
};

export default VideoCallSelfHosted;