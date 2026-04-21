import React, { useState, useRef, useEffect, useCallback } from "react";
import { CloseOutlined, SendOutlined, RobotOutlined, UserOutlined, ShoppingCartOutlined, StarFilled, LaptopOutlined, HistoryOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import axios from "axios";
import { DOMAIN, TOKEN } from "../../Utils/Setting/Config";
import "../style/BotChat.css";

const HISTORY_PAGE_SIZE = 15;

const BotChat = ({ showBotChat, toggleBotChat }) => {
    const welcomeMessage = {
        type: "bot",
        text: "Xin chào! 👋 Tôi là trợ lý tư vấn laptop. Hãy cho tôi biết nhu cầu của bạn, ví dụ:\n\n• \"Tư vấn laptop dưới 20 triệu\"\n• \"Laptop gaming tầm 25 triệu\"\n• \"Laptop văn phòng nhẹ dưới 15 triệu\"",
        products: [],
        timestamp: new Date().toISOString(),
    };

    const [messages, setMessages] = useState([welcomeMessage]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [historyPage, setHistoryPage] = useState(0);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const chatContentRef = useRef(null);
    const inputRef = useRef(null);
    const lastScrollHeight = useRef(0);

    // Get userId from localStorage
    const getUserId = () => {
        try {
            const savedUser = localStorage.getItem("USER_LOGIN");
            if (savedUser) {
                const user = JSON.parse(savedUser);
                return user?.id || null;
            }
        } catch (e) {
            return null;
        }
        return null;
    };

    const scrollToBottom = () => {
        if (chatContentRef.current) {
            setTimeout(() => {
                chatContentRef.current.scrollTo({
                    top: chatContentRef.current.scrollHeight,
                    behavior: "smooth",
                });
            }, 100);
        }
    };

    // Load chat history when bot chat opens
    useEffect(() => {
        if (showBotChat && !historyLoaded) {
            loadChatHistory(0, true);
        }
        if (showBotChat && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showBotChat]);

    const loadChatHistory = async (page, isInitial = false) => {
        const userId = getUserId();
        if (!userId || isLoadingHistory) return;

        setIsLoadingHistory(true);
        try {
            const token = localStorage.getItem(TOKEN);
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(
                `${DOMAIN}/api/bot/history?userId=${userId}&page=${page}&size=${HISTORY_PAGE_SIZE}`,
                { headers }
            );
            const data = response.data;
            const historyItems = data.content || data || [];
            const totalPages = data.totalPages || 1;

            if (historyItems.length === 0 || page >= totalPages - 1) {
                setHasMoreHistory(false);
            }

            // Convert history items to message format
            const historyMessages = historyItems
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((item) => ({
                    type: item.fromBot ? "bot" : "user",
                    text: item.content,
                    products: item.products || [],
                    timestamp: item.createdAt,
                    isHistory: true,
                    historyId: item.id,
                }));

            if (isInitial) {
                if (historyMessages.length > 0) {
                    setMessages([welcomeMessage, ...historyMessages]);
                }
                setHistoryLoaded(true);
                setTimeout(() => scrollToBottom(), 150);
            } else {
                // Prepend older messages (after welcome message)
                setMessages((prev) => {
                    const welcome = prev[0];
                    const rest = prev.slice(1);
                    return [welcome, ...historyMessages, ...rest];
                });
                // Maintain scroll position
                setTimeout(() => {
                    if (chatContentRef.current) {
                        chatContentRef.current.scrollTop =
                            chatContentRef.current.scrollHeight - lastScrollHeight.current;
                    }
                }, 100);
            }

            setHistoryPage(page);
        } catch (error) {
            console.error("Failed to load chat history:", error);
            if (isInitial) setHistoryLoaded(true);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // Scroll to load older messages
    const handleHistoryScroll = () => {
        const chatBox = chatContentRef.current;
        if (!chatBox) return;
        if (chatBox.scrollTop === 0 && hasMoreHistory && !isLoadingHistory) {
            lastScrollHeight.current = chatBox.scrollHeight;
            loadChatHistory(historyPage + 1);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatPrice = (price) => {
        if (!price && price !== 0) return "Liên hệ";
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    const formatBotReply = (reply) => {
        if (!reply) return "";

        // Extract and convert markdown tables to HTML tables
        const lines = reply.split("\n");
        const result = [];
        let i = 0;

        while (i < lines.length) {
            // Detect markdown table: line with | and next line is separator |---|
            if (
                lines[i].includes("|") &&
                i + 1 < lines.length &&
                /^\|[\s\-:|]+\|$/.test(lines[i + 1].trim())
            ) {
                // Parse table header
                const headerCells = lines[i]
                    .split("|")
                    .filter((c) => c.trim() !== "")
                    .map((c) => c.trim());

                // Skip separator line
                i += 2;

                // Parse table body rows
                const bodyRows = [];
                while (i < lines.length && lines[i].includes("|") && lines[i].trim().startsWith("|")) {
                    const cells = lines[i]
                        .split("|")
                        .filter((c) => c.trim() !== "")
                        .map((c) => c.trim());
                    bodyRows.push(cells);
                    i++;
                }

                // Build HTML table
                let table = '<div class="bot-table-wrapper"><table class="bot-compare-table">';
                table += "<thead><tr>";
                headerCells.forEach((h, idx) => {
                    table += `<th${idx === 0 ? ' class="bot-table-label"' : ""}>${formatInlineText(h)}</th>`;
                });
                table += "</tr></thead><tbody>";
                bodyRows.forEach((row) => {
                    table += "<tr>";
                    row.forEach((cell, idx) => {
                        table += `<td${idx === 0 ? ' class="bot-table-label"' : ""}>${formatInlineText(cell)}</td>`;
                    });
                    table += "</tr>";
                });
                table += "</tbody></table></div>";
                result.push(table);
            } else {
                result.push(formatInlineText(lines[i]));
                i++;
            }
        }

        return result.join("<br/>");
    };

    // Helper: format inline markdown (bold, italic, product codes)
    const formatInlineText = (text) => {
        if (!text) return "";
        let formatted = text.replace(/\*\*\[([^\]]+)\]\*\*/g, '<span class="bot-product-code">[$1]</span>');
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        formatted = formatted.replace(/\*([^*]+)\*/g, "<em>$1</em>");
        return formatted;
    };

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue("");

        // Add user message
        setMessages((prev) => [
            ...prev,
            {
                type: "user",
                text: userMessage,
                timestamp: new Date().toISOString(),
            },
        ]);

        setIsLoading(true);

        try {
            const userId = getUserId();
            const payload = {
                senderId: userId || 0,
                message: userMessage,
            };
            if (sessionId) {
                payload.sessionId = sessionId;
            }

            const response = await axios.post(`${DOMAIN}/api/bot`, payload);
            const data = response.data;

            // Save sessionId for conversation continuity
            if (data.sessionId) {
                setSessionId(data.sessionId);
            }

            setMessages((prev) => [
                ...prev,
                {
                    type: "bot",
                    text: data.reply || "Xin lỗi, tôi không hiểu yêu cầu của bạn.",
                    products: data.products || [],
                    intent: data.intent,
                    budget: data.budget,
                    tags: data.tags,
                    timestamp: data.timestamp || new Date().toISOString(),
                },
            ]);
        } catch (error) {
            console.error("Bot API error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    type: "bot",
                    text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau! 😔",
                    products: [],
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const navigateToProduct = (productDetailId) => {
        window.location.href = `/products/${productDetailId}`;
    };

    const renderHistoryProductCard = (product) => {
        const productName = product.productName || product.name || "";
        const price = product.price;
        const rating = product.ratingAverage || 0;
        const salesCount = product.salesCount || 0;
        const mainImage = product.imageUrl || product.image || "";
        const brandName = product.brandName || product.brand || "";
        const cpu = product.cpu || "";
        const ram = product.ram || "";

        return (
            <div
                key={product.id}
                className="bot-product-card"
                onClick={() => navigateToProduct(product.id)}
            >
                <div className="bot-product-image">
                    {mainImage ? (
                        <img src={mainImage} alt={productName} loading="lazy" />
                    ) : (
                        <div className="bot-product-image-placeholder">
                            <LaptopOutlined />
                        </div>
                    )}
                    {brandName && <span className="bot-product-brand">{brandName}</span>}
                </div>
                <div className="bot-product-info">
                    <h4 className="bot-product-name">{productName}</h4>
                    {(cpu || ram) && (
                        <div className="bot-product-specs">
                            {cpu && (
                                <span className="bot-spec-tag">
                                    <LaptopOutlined /> {cpu}
                                </span>
                            )}
                            {ram && <span className="bot-spec-tag">{ram}</span>}
                        </div>
                    )}
                    <div className="bot-product-bottom">
                        <span className="bot-product-price">{formatPrice(price)}</span>
                        <div className="bot-product-meta">
                            {rating > 0 && (
                                <span className="bot-product-rating">
                                    <StarFilled style={{ color: "#faad14", fontSize: 12 }} /> {rating}
                                </span>
                            )}
                            <span className="bot-product-sales">Đã bán {salesCount}</span>
                        </div>
                    </div>
                    <button
                        className="bot-product-view-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateToProduct(product.id);
                        }}
                    >
                        <ShoppingCartOutlined /> Xem chi tiết
                    </button>
                </div>
            </div>
        );
    };

    const renderProductCard = (productDetail) => {
        const product = productDetail.product;
        const mainImage =
            productDetail.productVariants?.[0]?.imageUrl ||
            product?.images?.[0]?.url ||
            "";
        const brandName = product?.brand?.name || "";
        const productName = product?.name || "";
        const price = productDetail.price;
        const rating = productDetail.ratingAverage || 5.0;
        const salesCount = productDetail.salesCount || 0;

        return (
            <div
                key={productDetail.id}
                className="bot-product-card"
                onClick={() => navigateToProduct(productDetail.id)}
            >
                <div className="bot-product-image">
                    <img src={mainImage} alt={productName} loading="lazy" />
                    {brandName && <span className="bot-product-brand">{brandName}</span>}
                </div>
                <div className="bot-product-info">
                    <h4 className="bot-product-name">{productName}</h4>
                    <div className="bot-product-specs">
                        {productDetail.cpu && (
                            <span className="bot-spec-tag">
                                <LaptopOutlined /> {productDetail.cpu}
                            </span>
                        )}
                        {productDetail.ram && (
                            <span className="bot-spec-tag">{productDetail.ram}</span>
                        )}
                        {productDetail.storage && (
                            <span className="bot-spec-tag">{productDetail.storage}</span>
                        )}
                        {productDetail.displaySize && (
                            <span className="bot-spec-tag">{productDetail.displaySize}</span>
                        )}
                    </div>
                    <div className="bot-product-bottom">
                        <span className="bot-product-price">{formatPrice(price)}</span>
                        <div className="bot-product-meta">
                            <span className="bot-product-rating">
                                <StarFilled style={{ color: "#faad14", fontSize: 12 }} /> {rating}
                            </span>
                            <span className="bot-product-sales">Đã bán {salesCount}</span>
                        </div>
                    </div>
                    <button
                        className="bot-product-view-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateToProduct(productDetail.id);
                        }}
                    >
                        <ShoppingCartOutlined /> Xem chi tiết
                    </button>
                </div>
            </div>
        );
    };

    const renderMessage = (msg, index) => {
        if (msg.type === "user") {
            return (
                <div key={index} className="bot-message-row user-row">
                    <div className="bot-message-bubble user-bubble">
                        <p>{msg.text}</p>
                    </div>
                    <div className="bot-avatar user-avatar">
                        <UserOutlined />
                    </div>
                </div>
            );
        }

        return (
            <div key={index} className="bot-message-row bot-row">
                <div className="bot-avatar assistant-avatar">
                    <RobotOutlined />
                </div>
                <div className="bot-message-content">
                    <div className="bot-message-bubble assistant-bubble">
                        <div
                            className="bot-reply-text"
                            dangerouslySetInnerHTML={{ __html: formatBotReply(msg.text) }}
                        />
                    </div>
                    {msg.products && msg.products.length > 0 && (
                        <div className="bot-products-section">
                            <div className="bot-products-header">
                                <LaptopOutlined />
                                <span>Sản phẩm gợi ý ({msg.products.length})</span>
                            </div>
                            <div className="bot-products-grid">
                                {msg.products.map((p) =>
                                    msg.isHistory
                                        ? renderHistoryProductCard(p)
                                        : renderProductCard(p)
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const suggestedQuestions = [
        "Laptop gaming dưới 25 triệu",
        "Laptop văn phòng nhẹ",
        "Laptop học sinh sinh viên",
    ];

    const handleSuggestedQuestion = (q) => {
        setInputValue(q);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 50);
    };

    return (
        <div className={`bot-chat-container ${showBotChat ? "show" : ""}`}>
            {showBotChat && (
                <div className="bot-chat-window">
                    {/* Header */}
                    <div className="bot-chat-header">
                        <div className="bot-chat-header-left">
                            <div className="bot-header-avatar">
                                <RobotOutlined />
                            </div>
                            <div className="bot-header-info">
                                <span className="bot-header-name">Trợ lý Laptop AI</span>
                                <span className="bot-header-status">
                                    <span className="status-dot"></span> Đang hoạt động
                                </span>
                            </div>
                        </div>
                        <button onClick={toggleBotChat} className="bot-close-btn">
                            <CloseOutlined />
                        </button>
                    </div>

                    {/* Chat Content */}
                    <div className="bot-chat-content" ref={chatContentRef} onScroll={handleHistoryScroll}>
                        {/* Load more history indicator */}
                        {isLoadingHistory && (
                            <div className="bot-history-loading">
                                <Spin size="small" />
                                <span>Đang tải tin nhắn cũ...</span>
                            </div>
                        )}
                        {historyLoaded && !hasMoreHistory && messages.length > 1 && (
                            <div className="bot-history-end">
                                <HistoryOutlined /> Đã hiển thị toàn bộ lịch sử
                            </div>
                        )}
                        {messages.map((msg, index) => renderMessage(msg, index))}

                        {isLoading && (
                            <div className="bot-message-row bot-row">
                                <div className="bot-avatar assistant-avatar">
                                    <RobotOutlined />
                                </div>
                                <div className="bot-typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        )}

                        {/* Suggested questions - only show at the beginning */}
                        {messages.length <= 1 && !isLoading && (
                            <div className="bot-suggestions">
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        className="bot-suggestion-btn"
                                        onClick={() => handleSuggestedQuestion(q)}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="bot-chat-input-area">
                        <div className="bot-input-wrapper">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập yêu cầu tư vấn laptop..."
                                disabled={isLoading}
                            />
                            <button
                                className={`bot-send-btn ${inputValue.trim() ? "active" : ""}`}
                                onClick={sendMessage}
                                disabled={!inputValue.trim() || isLoading}
                            >
                                {isLoading ? <Spin size="small" /> : <SendOutlined />}
                            </button>
                        </div>
                        <p className="bot-input-hint">
                            Nhấn Enter để gửi • AI có thể mắc sai sót
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BotChat;
