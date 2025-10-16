const TURN_SERVER_URL = process.env.REACT_APP_TURN_URL;
const TURN_USERNAME = process.env.REACT_APP_TURN_USERNAME;
const TURN_PASSWORD = process.env.REACT_APP_TURN_PASSWORD;

export const iceServersConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

if (TURN_SERVER_URL && TURN_USERNAME && TURN_PASSWORD) {
  iceServersConfig.iceServers.push({
    urls: TURN_SERVER_URL,
    username: TURN_USERNAME,
    credential: TURN_PASSWORD,
  });
  console.log("TURN server configured.");
} else {
  console.warn("TURN server not fully configured. Using only STUN servers.");
}