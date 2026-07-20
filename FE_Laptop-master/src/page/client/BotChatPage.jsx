import React, { useEffect } from "react";
import BotChat from "./BotChat";
import "../style/BotChat.css";

const BotChatPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bot-chat-page-wrapper">
            <div className="bot-chat-page-header">
                <div className="bot-chat-page-title-area">
                    <h1 className="bot-chat-page-title">
                        Tư vấn Laptop
                    </h1>
                    <p className="bot-chat-page-subtitle">
                        Hỏi bất cứ điều gì về laptop — chúng tôi sẽ tư vấn sản phẩm phù hợp nhất cho bạn
                    </p>
                </div>
            </div>
            <BotChat showBotChat={true} isFullScreen={true} />
        </div>
    );
};

export default BotChatPage;
