import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { iceServersConfig } from '../../config/webrtcConfig';
import { useSelector } from 'react-redux';
import {
    Box, Button, Typography, CircularProgress, Alert, Paper,
    IconButton, Tooltip, alpha, Avatar
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';

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
    const [peerInfo, setPeerInfo] = useState({});
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoStopped, setIsVideoStopped] = useState(false);

    
    const socketRef = useRef(null);
    const peerConnections = useRef({});
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});

    const closePeerConnection = useCallback((socketId) => {
        const pc = peerConnections.current[socketId];
        if (pc) {
            console.log(`Closing PeerConnection for ${socketId}`);
            pc.close();
            delete peerConnections.current[socketId];
            setRemoteStreams(prev => {
                const newState = { ...prev };
                delete newState[socketId];
                return newState;
            });
            setPeerInfo(prev => {
                const newState = { ...prev };
                delete newState[socketId];
                return newState;
            });
        }
    }, []);
    
    
    useEffect(() => {
        if (!profile || !roomName) {
            setError("Authentication error. Cannot join the call.");
            setIsJoining(false);
            return;
        }

        let localStreamInstance;

        const initialize = async () => {
            try {
                try {
                    localStreamInstance = await navigator.mediaDevices.getUserMedia({ video: { width: 640 }, audio: true });
                } catch (err) {
                    console.warn("Could not get video stream, falling back to audio-only.", err.name);
                    if (['NotFoundError', 'NotAllowedError', 'OverconstrainedError', 'NotReadableError'].includes(err.name)) {
                        localStreamInstance = await navigator.mediaDevices.getUserMedia({ audio: true });
                        setIsVideoStopped(true);
                    } else {
                        throw err;
                    }
                }
                
                setLocalStream(localStreamInstance);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStreamInstance;
                }

                socketRef.current = io(SIGNALING_SERVER_URL, { reconnectionAttempts: 3 });
                const socket = socketRef.current;

                const createPeerConnection = (socketId) => {
                    const pc = new RTCPeerConnection(iceServersConfig);
                    pc.onicecandidate = (event) => event.candidate && socket.emit('ice_candidate', { targetSocketId: socketId, candidate: event.candidate });
                    pc.ontrack = (event) => event.streams[0] && setRemoteStreams(prev => ({ ...prev, [socketId]: event.streams[0] }));
                    pc.oniceconnectionstatechange = () => {
                        if (['disconnected', 'failed', 'closed'].includes(pc.iceConnectionState)) {
                            enqueueSnackbar(`Connection with a peer was lost.`, { variant: 'warning' });
                            closePeerConnection(socketId);
                        }
                    };
                    localStreamInstance.getTracks().forEach(track => pc.addTrack(track, localStreamInstance));
                    peerConnections.current[socketId] = pc;
                    return pc;
                };

                socket.on('connect', () => socket.emit('join_room', { roomName, user: profile }));

                socket.on('room_peers', ({ peerIds, peersInfo }) => {
                    setIsJoining(false);
                    const initialPeerInfo = peersInfo.reduce((acc, peer) => {
                        acc[peer.socketId] = peer.user;
                        return acc;
                    }, {});
                    setPeerInfo(initialPeerInfo);

                    peerIds.forEach(async peerId => {
                        const pc = createPeerConnection(peerId);
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socket.emit('offer', { targetSocketId: peerId, sdp: pc.localDescription });
                    });
                });

                socket.on('user_joined', ({ socketId, user }) => {
                    enqueueSnackbar(`${user?.name || 'A new user'} has joined.`, { variant: 'info' });
                    setPeerInfo(prev => ({ ...prev, [socketId]: user }));
                    createPeerConnection(socketId);
                });

                socket.on('offer_received', async ({ senderSocketId, sdp, user }) => {
                    setPeerInfo(prev => ({ ...prev, [senderSocketId]: user }));
                    const pc = createPeerConnection(senderSocketId);
                    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit('answer', { targetSocketId: senderSocketId, sdp: pc.localDescription });
                });

                socket.on('answer_received', async ({ senderSocketId, sdp }) => {
                    peerConnections.current[senderSocketId]?.setRemoteDescription(new RTCSessionDescription(sdp));
                });

                socket.on('candidate_received', async ({ senderSocketId, candidate }) => {
                    peerConnections.current[senderSocketId]?.addIceCandidate(new RTCIceCandidate(candidate));
                });

                socket.on('user_left', ({ socketId }) => {
                    const leavingUser = peerInfo[socketId];
                    enqueueSnackbar(`${leavingUser?.name || 'A user'} has left.`, { variant: 'info' });
                    closePeerConnection(socketId);
                });

                socket.on('connect_error', (err) => { throw new Error(err.message) });
                socket.on('join_error', (data) => { throw new Error(data.error) });

            } catch (err) {
                console.error("Initialization error:", err);
                setError(`Failed to start video call: ${err.message}. Please check camera/microphone permissions and try again.`);
                setIsJoining(false);
                if (localStreamInstance) {
                    localStreamInstance.getTracks().forEach(track => track.stop());
                }
            }
        };

        initialize();

        return () => {
            console.log("--- Running Video Call Cleanup ---");
            if (localStreamInstance) {
                localStreamInstance.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            Object.keys(peerConnections.current).forEach(closePeerConnection);
        };
    
    }, []);

    useEffect(() => {
        Object.keys(remoteStreams).forEach(socketId => {
            const stream = remoteStreams[socketId];
            const videoElement = remoteVideoRefs.current[socketId];
            if (videoElement && stream && videoElement.srcObject !== stream) {
                videoElement.srcObject = stream;
            }
        });
    }, [remoteStreams]);

    
    const hasVideoTrack = localStream?.getVideoTracks().length > 0 && !localStream.getVideoTracks().every(t => t.readyState === 'ended');

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
        if (hasVideoTrack) {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoStopped(!videoTrack.enabled);
        }
    }, [localStream, hasVideoTrack]);
    
    const handleLeaveCall = useCallback(() => {
        if (onLeaveCall) onLeaveCall();
    }, [onLeaveCall]);
    
    
    if (isJoining) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, height: '100%' }}><CircularProgress /><Typography sx={{ ml: 2 }}>Joining call...</Typography></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 2 }}>{error} <Button size="small" onClick={handleLeaveCall}>Close</Button></Alert>;
    }

    const remoteParticipantIds = Object.keys(remoteStreams);

    return (
        <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'common.black', overflow: 'hidden' }}>
            {}
            <Box sx={{ flexGrow: 1, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center', overflowY: 'auto' }}>
                {}
                <Paper sx={{ flex: '1 1 300px', maxWidth: '500px', aspectRatio: '16/9', overflow: 'hidden', position: 'relative', bgcolor: '#333', borderRadius: 2 }}>
                    {(!hasVideoTrack || isVideoStopped) ? (
                        <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            <Avatar sx={{ width: 80, height: 80, fontSize: '2.5rem' }}>{profile?.name?.charAt(0)}</Avatar>
                        </Box>
                    ) : (
                        <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                    )}
                    <Typography variant="caption" sx={{ position: 'absolute', bottom: 4, left: 8, color: 'white', bgcolor: 'rgba(0,0,0,0.6)', px: 1, py: 0.5, borderRadius: 1 }}>
                        {profile?.name} (You)
                    </Typography>
                </Paper>

                {}
                {remoteParticipantIds.length > 0 ? (
                    remoteParticipantIds.map(socketId => (
                        <Paper key={socketId} sx={{ flex: '1 1 300px', maxWidth: '500px', aspectRatio: '16/9', overflow: 'hidden', position: 'relative', bgcolor: '#444', borderRadius: 2 }}>
                            <video ref={el => { remoteVideoRefs.current[socketId] = el; }} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <Typography variant="caption" sx={{ position: 'absolute', bottom: 4, left: 8, color: 'white', bgcolor: 'rgba(0,0,0,0.6)', px: 1, py: 0.5, borderRadius: 1 }}>
                                {peerInfo[socketId]?.name || 'Connecting...'}
                            </Typography>
                        </Paper>
                    ))
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'grey.500', flex: '1 1 300px' }}>
                        <CircularProgress color="inherit" size={30} />
                        <Typography variant="h6" sx={{ mt: 2 }}>
                            Waiting for others to join...
                        </Typography>
                    </Box>
                )}
            </Box>

            {}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, pt: 2, mt: 'auto', flexShrink: 0 }}>
                <Tooltip title={isAudioMuted ? "Unmute" : "Mute"}>
                    <IconButton onClick={toggleAudio} sx={{ color: '#fff', bgcolor: isAudioMuted ? 'error.main' : alpha('#fff', 0.2), '&:hover': { bgcolor: isAudioMuted ? 'error.dark' : alpha('#fff', 0.3) }}}>
                        {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
                    </IconButton>
                </Tooltip>
                <Tooltip title={hasVideoTrack ? (isVideoStopped ? "Start Camera" : "Stop Camera") : "No camera detected"}>
                    <span>
                        <IconButton onClick={toggleVideo} disabled={!hasVideoTrack} sx={{ color: '#fff', bgcolor: isVideoStopped ? 'error.main' : alpha('#fff', 0.2), '&:hover': { bgcolor: isVideoStopped ? 'error.dark' : alpha('#fff', 0.3) }}}>
                            {isVideoStopped || !hasVideoTrack ? <VideocamOffIcon /> : <VideocamIcon />}
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title="Hang Up">
                    <IconButton onClick={handleLeaveCall} size="large" sx={{ color: 'white', bgcolor: theme.palette.error.dark, '&:hover': { bgcolor: theme.palette.error.main } }}>
                        <CallEndIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        </Paper>
    );
};

export default VideoCallSelfHosted;