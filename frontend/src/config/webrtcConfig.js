const TURN_SERVER_URL = process.env.REACT_APP_TURN_URL || 'turn:your_turn_server_ip_or_domain:3478'; 
const TURN_USERNAME = process.env.REACT_APP_TURN_USERNAME || 'your_turn_username';
const TURN_PASSWORD = process.env.REACT_APP_TURN_PASSWORD || 'your_turn_password';

export const iceServersConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  
  
};