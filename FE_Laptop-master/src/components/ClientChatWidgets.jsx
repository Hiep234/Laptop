import React, { useState, useContext } from "react";
import { useSelector } from "react-redux";
import { RobotOutlined } from "@ant-design/icons";
import { NotificationContext } from "./NotificationProvider";
import ChatBox from "../page/client/SupportChat";
import BotChat from "../page/client/BotChat";
import khImg from "../assets/kh.jpg";
import "../page/style/HomeScreen.css";
import "../page/style/BotChat.css";

const ClientChatWidgets = () => {
    const [showChatBox, setShowChatBox] = useState(false);
    const [showBotChat, setShowBotChat] = useState(false);
    const notification = useContext(NotificationContext);

    const userData = (() => {
        try {
            const saved = localStorage.getItem("USER_LOGIN");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    })();

    const toggleChatBox = () => {
        if (!userData) {
            notification.warning({
                message: "Thông báo",
                description: "Đăng nhập để được hỗ trợ!",
                placement: "topRight",
            });
            return;
        }
        setShowBotChat(false); // đóng bot nếu đang mở
        setShowChatBox((prev) => !prev);
    };

    const toggleBotChat = () => {
        if (!userData) {
            notification.warning({
                message: "Thông báo",
                description: "Vui lòng đăng nhập để sử dụng chức năng chatbot với AI!",
                placement: "topRight",
            });
            return;
        }
        setShowChatBox(false); // đóng support nếu đang mở
        setShowBotChat((prev) => !prev);
    };

    return (
        <>
            {/* Stack 2 icon bên phải dưới, bot ở trên - hỗ trợ ở dưới */}
            <div className="chat-widgets-stack">
                {/* Bot Chat AI Icon */}
                <button
                    className="bot-chat-icon"
                    onClick={toggleBotChat}
                    title="Tư vấn Laptop AI"
                >
                    <RobotOutlined />
                    <span className="bot-icon-badge">AI</span>
                </button>

                {/* Support Chat Icon */}
                <div className="chat-icon" onClick={toggleChatBox} title="Hỗ trợ khách hàng">
                    <img src={khImg} alt="Chat Icon" />
                </div>
            </div>

            {/* Chat Windows */}
            <ChatBox showChatBox={showChatBox} toggleChatBox={toggleChatBox} />
            <BotChat showBotChat={showBotChat} toggleBotChat={toggleBotChat} />
        </>
    );
};

export default ClientChatWidgets;
