import React, { useState, useEffect, useRef, useCallback } from "react";
import {Layout, List, Input, Button, Typography, Pagination, Avatar} from "antd";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { useDispatch, useSelector } from "react-redux";
import { get_all_messages, get_all_users } from "../../Redux/actions/MessageThunk";
import {
    CloseOutlined,
    ExclamationCircleOutlined,
    LoadingOutlined,
    MessageOutlined,
    SendOutlined, SmileOutlined,
    UserOutlined
} from "@ant-design/icons";
import {Footer} from "antd/es/modal/shared";
import {  Badge } from 'antd';

// Destructure Text từ Typography
const { Text } = Typography;
const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const ChatAdmin = () => {
    const dispatch = useDispatch();
    const [activeUser, setActiveUser] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const totalElements = useSelector((state) => state.MessageReducer.totalElements || 0);
    const listUsers = useSelector((state) => state.MessageReducer.users);
    const [users, setUsers] = useState([]);
    const [pageSize, setPageSize] = useState(8);
    const messagesFromStore = useSelector((state) => state.MessageReducer.messages);
    const totalPages = useSelector((state) => state.MessageReducer.totalPages || []);
    const [messages, setMessages] = useState([]);

    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const chatContentRef = useRef(null);
    const lastScrollHeight = useRef(0);
    const userScrolling = useRef(false);
    const [userPage, setUserPage] = useState(1);
    useEffect(() => {
        const socket = new SockJS("http://localhost:8081/ws");
        const client = Stomp.over(socket);

        client.connect({}, () => {
            client.subscribe(`/user/1/queue/messages`, (message) => {
                const chatMessage = JSON.parse(message.body);
                console.log(message.body);

                if (chatMessage.senderId === activeUser || chatMessage.receiverId === activeUser) {
                    setMessages((prev) => [...prev, chatMessage]);
                    if (!userScrolling.current) {
                        scrollToBottom(true);
                    }

                } else {
                    setUsers((prevUsers) => {
                        let updatedUsers = [...prevUsers];

                        const existingUserIndex = updatedUsers.findIndex(user => user.id === chatMessage.senderId);

                        if (existingUserIndex !== -1) {
                            // Nếu user đã tồn tại, cập nhật trạng thái `hasNewMessage`
                            updatedUsers[existingUserIndex] = {
                                ...updatedUsers[existingUserIndex],
                                hasNewMessage: true,
                            };

                            // Đưa user có tin nhắn mới lên đầu danh sách
                            const updatedUser = updatedUsers.splice(existingUserIndex, 1)[0];
                            updatedUsers = [updatedUser, ...updatedUsers];

                        } else {
                            if (updatedUsers.length >= pageSize) {
                                updatedUsers.pop(); // Xóa user cuối nếu danh sách quá dài
                            }

                            // Thêm user mới vào đầu danh sách
                            updatedUsers = [
                                {
                                    id: chatMessage.senderId,
                                    nameUser: chatMessage.userName,
                                    hasNewMessage: true,
                                    statusMessage: "UNREAD"
                                },
                                ...updatedUsers
                            ];
                        }

                        return updatedUsers;
                    });
                }
            });
        });

        client.activate();
        setStompClient(client);

        return () => client.deactivate();
    }, [activeUser, pageSize]);


    useEffect(() => {
        dispatch(get_all_users(userPage - 1, pageSize));
    }, [userPage, dispatch, pageSize]);

    useEffect(() => {
        if (messagesFromStore.length > 0) {
            setMessages((prevMessages) => {
                const mergedMessages = [...prevMessages, ...messagesFromStore];
                const uniqueMessages = Array.from(new Map(mergedMessages.map(m => [m.id, m])).values());
                return uniqueMessages;
            });
            if (!userScrolling.current) {
                scrollToBottom(false);
            }
        }
    }, [messagesFromStore]);



    useEffect(() => {
        if (activeUser) {
            dispatch(get_all_messages(currentPage, pageSize, activeUser, 1));
        }
    }, [activeUser, currentPage, pageSize, dispatch]);
    useEffect(() => {
        if (listUsers.length > 0) {
            setUsers(listUsers);
            console.log(users);
        }
    }, [listUsers]);
    useEffect(() => {
        if (users.length > 0 && !activeUser) {
            setActiveUser(users[0].id);
        }
    }, [users, activeUser]);

    const selectUser = useCallback((userId) => {
        setMessages(messagesFromStore);
        setActiveUser(userId);

        setUsers((prevUsers) =>
            prevUsers.map(user =>
                user.id === userId ? {...user, hasNewMessage: false} : user
            )
        );
    }, [messagesFromStore]);


    const sendMessage = useCallback(() => {
        if (!messageInput.trim()) return;
        if (!stompClient || !stompClient.connected) {
            console.error("WebSocket chưa kết nối. Không thể gửi tin nhắn.");
            return;
        }
        if (!activeUser) return;

        const message = {
            senderId: 1,
            receiverId: activeUser,
            content: messageInput,
            messageType: 1,
            createdAt: new Date().toISOString(),
            createdBy: "admin",
            status: 0
        };

        stompClient.publish({
            destination: "/app/sendMessage",
            body: JSON.stringify(message),
        });

        setMessages((prev) => [...prev, message]);

        setUsers((prevUsers) =>
            prevUsers.map(user =>
                user.id === activeUser
                    ? { ...user, hasNewMessage: false, statusMessage: "READ" }
                    : user
            )
        );

        setCurrentPage(0);
        setHasMore(true);
        setMessageInput("");
        scrollToBottom(true);
    }, [messageInput, stompClient, activeUser]);

    const handlePageChange = useCallback((page) => {
        setUserPage(page);
    }, []);

    const fetchOldMessages = useCallback(async () => {
        if (!hasMore || !activeUser) return;
        if (hasMore) {
            setCurrentPage(currentPage + 1);
        } else {
            console.log("het r");

        }
    }, [currentPage, hasMore, activeUser, dispatch]);


    const handleScroll = () => {
        const chatBox = chatContentRef.current;
        if (!chatBox) return;

        // Nếu cuộn lên trên cùng, tải tin nhắn cũ
        if (chatBox.scrollTop === 0 && hasMore) {
            lastScrollHeight.current = chatBox.scrollHeight;
            userScrolling.current = true;
            fetchOldMessages().then(() => {
                setTimeout(() => {
                    if (chatBox) {
                        chatBox.scrollTo({top: chatBox.scrollHeight - lastScrollHeight.current, behavior: "auto"});
                    }
                }, 200);
            });
        }

        // Nếu cuộn xuống dưới cùng, tải tin nhắn mới nhất
        if (chatBox.scrollTop + chatBox.clientHeight >= chatBox.scrollHeight - 50) {
            userScrolling.current = false;
            fetchNewMessages();
        }
    };
    const fetchNewMessages = useCallback(async () => {
        if (!activeUser || currentPage <= 0) return;
        try {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            scrollToBottom(true);

        } catch (error) {
            console.error("❌ Lỗi tải tin nhắn mới:", error);
        }
    }, [currentPage, activeUser, dispatch]);

    const scrollToBottom = (smooth) => {
        if (chatContentRef.current) {
            setTimeout(() => {
                chatContentRef.current.scrollTo({
                    top: chatContentRef.current.scrollHeight,
                    behavior: smooth ? "smooth" : "auto",
                });
            }, 100);
        }
    };

    return (
        <section id="content" className="content">
            <div className="content__header content__boxed rounded-0">
                <div className="content__wrap">
                    <div className="mt-auto">
                        <div className="row">
                            <div className="col-md-12">
                                <Layout style={{
                                    height: "80vh",
                                    border: "1px solid #e8e8e8",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    display: "flex",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                }}>
                                    {/* Sidebar - User List */}
                                    <Sider width={300} style={{
                                        background: "#fff",
                                        borderRight: "1px solid #f0f0f0",
                                        display: "flex",
                                        flexDirection: "column",
                                        padding: "16px 0"
                                    }}>
                                        <div style={{
                                            padding: "0 16px 16px",
                                            borderBottom: "1px solid #f0f0f0",
                                            marginBottom: "16px"
                                        }}>
                                            <Title level={4} style={{
                                                margin: 0,
                                                fontWeight: "600",
                                                color: "#333"
                                            }}>
                                                Danh sách người dùng
                                            </Title>
                                            <Text type="secondary" style={{fontSize: "13px"}}>
                                                {totalElements} người dùng
                                            </Text>
                                        </div>

                                        <div style={{flex: 1, overflowY: "auto", padding: "0 8px"}}>
                                            <List
                                                dataSource={users}
                                                renderItem={(user) => (
                                                    <List.Item
                                                        style={{
                                                            cursor: "pointer",
                                                            background: activeUser === user.id ? "#e6f7ff" : "transparent",
                                                            borderLeft: activeUser === user.id ? "3px solid #1890ff" : "3px solid transparent",
                                                            padding: "12px",
                                                            borderRadius: "6px",
                                                            margin: "4px 0",
                                                            transition: "all 0.2s",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "12px",
                                                            borderBottom: "1px solid #f5f5f5"
                                                        }}
                                                        onClick={() => selectUser(user.id)}
                                                    >
                                                        <Avatar
                                                            style={{
                                                                backgroundColor: activeUser === user.id ? '#1890ff' : '#f56a00',
                                                                color: '#fff'
                                                            }}
                                                        >
                                                            {user.userName.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <div style={{flex: 1}}>
                                                            <div style={{
                                                                fontWeight: user.hasNewMessage ? "600" : "500",
                                                                color: activeUser === user.id ? "#1890ff" : "#333"
                                                            }}>
                                                                {user.userName}
                                                            </div>
                                                            {user.hasNewMessage && (
                                                                <Badge dot color="red" style={{marginLeft: "8px"}}/>
                                                            )}
                                                        </div>
                                                    </List.Item>
                                                )}
                                            />
                                        </div>

                                        <div style={{
                                            padding: "16px",
                                            borderTop: "1px solid #f0f0f0",
                                            display: "flex",
                                            justifyContent: "center"
                                        }}>
                                            <Pagination
                                                current={userPage}
                                                pageSize={pageSize}
                                                onChange={handlePageChange}
                                                total={totalElements}
                                                showSizeChanger={false}
                                                simple
                                            />
                                        </div>
                                    </Sider>

                                    {/* Main Chat Area */}
                                    <Layout style={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        background: "#fafafa"
                                    }}>
                                        {/* Chat Header */}
                                        <Header style={{
                                            background: "#fff",
                                            padding: "0 24px",
                                            borderBottom: "1px solid #f0f0f0",
                                            height: "64px",
                                            display: "flex",
                                            alignItems: "center",
                                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
                                        }}>
                                            <Title level={4} style={{
                                                margin: 0,
                                                color: "#333",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px"
                                            }}>
                                                <MessageOutlined/> Trò chuyện với khách hàng
                                            </Title>
                                        </Header>

                                        {/* Chat Content */}
                                        <Content style={{
                                            flex: 1,
                                            padding: "24px",
                                            overflow: "hidden",
                                            display: "flex",
                                            flexDirection: "column"
                                        }}>
                                            {/* Welcome Message */}
                                            <div style={{
                                                background: "#f0f9ff",
                                                padding: "12px 16px",
                                                borderRadius: "8px",
                                                marginBottom: "16px",
                                                border: "1px solid #d0e8ff",
                                                textAlign: "center"
                                            }}>
                                                <Text style={{color: "#1890ff"}}>
                                                    <SmileOutlined style={{marginRight: "8px"}}/>
                                                    Hãy thật thân thiện và niềm nở với khách hàng!
                                                </Text>
                                            </div>

                                            {/* Messages Container */}
                                            <div
                                                ref={chatContentRef}
                                                onScroll={handleScroll}
                                                style={{
                                                    flex: 1,
                                                    overflowY: "auto",
                                                    padding: "8px",
                                                    borderRadius: "8px",
                                                    background: "#fff",
                                                    border: "1px solid #f0f0f0",
                                                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)"
                                                }}
                                            >
                                                {hasMore && currentPage < totalPages - 1 && (
                                                    <div style={{
                                                        textAlign: "center",
                                                        padding: "8px",
                                                        marginBottom: "16px"
                                                    }}>
                                                        <Button
                                                            type="text"
                                                            icon={<LoadingOutlined/>}
                                                            loading
                                                            style={{color: "#888"}}
                                                        >
                                                            Đang tải tin nhắn cũ...
                                                        </Button>
                                                    </div>
                                                )}

                                                {messages.map((msg, index) => (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            marginBottom: "12px",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: msg.senderId !== activeUser ? "flex-end" : "flex-start"
                                                        }}
                                                    >
                                                        <div style={{
                                                            maxWidth: "80%",
                                                            padding: "12px 16px",
                                                            borderRadius: msg.senderId !== activeUser
                                                                ? "16px 16px 0 16px"
                                                                : "16px 16px 16px 0",
                                                            background: msg.senderId !== activeUser ? "#1890ff" : "#f5f5f5",
                                                            color: msg.senderId !== activeUser ? "#fff" : "#333",
                                                            boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                                                            position: "relative"
                                                        }}>
                                                            <div style={{
                                                                fontWeight: "500",
                                                                marginBottom: "4px",
                                                                fontSize: "13px",
                                                                color: msg.senderId !== activeUser ? "#e6f7ff" : "#666"
                                                            }}>
                                                                {msg.senderId !== activeUser ? "Hỗ trợ viên" : "Khách hàng"}
                                                            </div>
                                                            <div style={{wordBreak: "break-word"}}>
                                                                {msg.content}
                                                            </div>
                                                            <div style={{
                                                                fontSize: "11px",
                                                                textAlign: "right",
                                                                marginTop: "4px",
                                                                color: msg.senderId !== activeUser ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.4)"
                                                            }}>
                                                                {new Date(msg.createdAt).toLocaleString("en-US", { timeZone: "Asia/Bangkok" })}

                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Content>

                                        {/* Message Input */}
                                        <div style={{
                                            padding: "16px 24px",
                                            background: "#fff",
                                            borderTop: "1px solid #f0f0f0",
                                            boxShadow: "0 -1px 4px rgba(0,0,0,0.02)"
                                        }}>
                                            <div style={{
                                                display: "flex",
                                                gap: "12px",
                                                alignItems: "center"
                                            }}>
                                                <Input.TextArea
                                                    value={messageInput}
                                                    onChange={(e) => setMessageInput(e.target.value)}
                                                    placeholder="Nhập tin nhắn..."
                                                    autoSize={{minRows: 1, maxRows: 4}}
                                                    style={{
                                                        flex: 1,
                                                        borderRadius: "20px",
                                                        padding: "12px 16px",
                                                        resize: "none"
                                                    }}
                                                    onPressEnter={(e) => {
                                                        if (!e.shiftKey) {
                                                            e.preventDefault();
                                                            sendMessage();
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="primary"
                                                    shape="circle"
                                                    icon={<SendOutlined/>}
                                                    onClick={sendMessage}
                                                    style={{
                                                        width: "48px",
                                                        height: "48px"
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Layout>
                                </Layout>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChatAdmin;