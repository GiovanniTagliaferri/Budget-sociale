import React from "react";

const FeedbackContext = React.createContext({
    setFeedback: (message) => {},
    setFeedbackFromError: (error) => {},
    setShouldRefresh: (value) => {},
    setDefinizioneProposte: (value) => {},
});

export default FeedbackContext;