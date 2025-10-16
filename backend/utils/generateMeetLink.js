const generateMeetLink = (appointmentId, scheduledTime) => {
    console.log(`SIMULATING: Generating Google Meet link for appointment ${appointmentId} at ${scheduledTime}`);
    
    
    
    
    const meetLink = `https://meet.google.com/lookup/${appointmentId}-${Date.now()}`;
    const googleEventId = `event_${appointmentId}_${Date.now()}`;
    console.log(`SIMULATED LINK: ${meetLink}`);

    return { meetLink, googleEventId };
};

module.exports = { generateMeetLink };