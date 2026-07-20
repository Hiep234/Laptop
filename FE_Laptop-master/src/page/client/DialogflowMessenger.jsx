import React, { useEffect } from "react";

const DialogflowMessenger = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src =
            "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return (
        <df-messenger
            intent="WELCOME"
            chat-title="TrungNguyenBOT"
            agent-id="490e6455-c0f0-4bcb-bcab-76b7bdc40b4d"
            language-code="vi"
        ></df-messenger>
    );
};

export default DialogflowMessenger;
