import { orderItemService } from "../../Service/OrderItemService";

export const insertOrder = (body) => async (dispatch) => {
    try {
        console.log("📦 Đang gửi order:", body);

        const response = await orderItemService.insertOrder(body);

        console.log("✅ Phản hồi từ server:", response);

        const code = response?.code;

        if (code) {
            dispatch({
                type: "INSERT_ORDER",
                payload: response,
            });
        } else {
            console.warn("⚠️ Server không trả về dữ liệu order.");
        }

        return response;
    } catch (error) {
        console.error("❌ Lỗi khi gửi đơn hàng:");

        if (error.response?.data?.message) {
            console.error("🧨 API Error:", error.response.data.message);
        } else {
            console.error("🧨 Lỗi không xác định:", error.message);
        }

        throw error; // Rất quan trọng nếu phía gọi muốn biết lỗi
    }
};
export const getAllHistoryOrder = (page,size,orderStatus,sort,userId) => async (dispatch) => {
    try {

        const response = await orderItemService.historyOrders({page,size,orderStatus,sort},userId);

        if (response.data) {
            dispatch({
                type: "HISTORY_ORDER",
                payload: response.data,
            });
        } else {
            console.warn("⚠️ Server không trả về dữ liệu order.");
        }

        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi gửi đơn hàng:");

        if (error.response?.data?.message) {
            console.error("🧨 API Error:", error.response.data.message);
        } else {
            console.error("🧨 Lỗi không xác định:", error.message);
        }

        throw error; // Rất quan trọng nếu phía gọi muốn biết lỗi
    }
};

export const refundOrder = (orderId) => async (dispatch) => {
    try {

        const response = await orderItemService.refund(orderId);

        if (response) {
            dispatch({
                type: "REFUND_ORDER",
                payload: response,
            });
        } else {
            console.warn("⚠️ Server không trả về dữ liệu order.");
        }

        return response;
    } catch (error) {
        console.error("❌ Lỗi khi gửi đơn hàng:");

        throw error;
    }
};
export const cancelOrder = (orderId) => async (dispatch) => {
    try {

        const response = await orderItemService.cancel(orderId);

        if (response) {
            dispatch({
                type: "CANCEL_ORDER",
                payload: response,
            });
        } else {
            console.warn("⚠️ Server không trả về dữ liệu order.");
        }

        return response;
    } catch (error) {
        console.error("❌ Lỗi khi gửi đơn hàng:");

        throw error;
    }
};
export const getAllOrders = ( startDate, endDate, orderStatus, paymentMethod, paymentStatus, page, size, sortBy, sortDir) => async (dispatch) => {
    try {
        const response = await orderItemService.adminGetAllOrders(startDate, endDate, orderStatus, paymentMethod, paymentStatus, page, size, sortBy, sortDir);

        if (response.data) {
            dispatch({
                type: "ADMIN_GET_ALL_ORDERS",
                payload: response.data,
            });
        } else {
            console.warn("⚠️ Server không trả về dữ liệu order.");
        }

        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi gửi đơn hàng:");

        throw error;
    }
};

export const updateOrderStatus = (orderId, data) => async (dispatch) => {
    try {
        const response = await orderItemService.adminUpdateOrderStatus(orderId, data);

        if (response) {
            dispatch({
                type: "UPDATE_ORDER_STATUS",
                payload: response.code,
            });
        } else {
            console.warn("⚠️ Server không trả về dữ liệu order.");
        }

        return response.code;
    } catch (error) {
        console.error("❌ Lỗi khi gửi đơn hàng:");

        throw error;
    }
};

export const revenueByMonth = (year) => async (dispatch) => {
    try {
        const response = await orderItemService.revenueByMonth(year);

        if (response) {
            dispatch({
                type: "REVENUE",
                payload: response.data,
            });
        } else {
            console.warn("⚠️ Server không trả về dữ liệu order.");
        }

        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi gửi đơn hàng:");

        throw error;
    }
};

export const acceptRefund = (id) => async (dispatch) => {
    try {
        const response = await orderItemService.acceptRefund(id);

        if (response) {
            dispatch({
                type: "ACCEPT_REFUND",
                payload: response.code,
            });
        } else {
            console.warn("⚠️ Server không trả về dữ liệu order.");
        }

        return response.code;
    } catch (error) {
        console.error("❌ Lỗi khi gửi đơn hàng:");

        throw error;
    }
}

export const getTotalRevenue = () => async (dispatch) => {
    try {
        const response = await orderItemService.getTotalRevenue();

        if (response) {
            dispatch({
                type: "GET_TOTAL_REVENUE",
                payload: response.data,
            });
        } else {
            console.warn("⚠️ Server không trả về dữ liệu doanh thu tổng.");
        }

        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi lấy doanh thu tổng:", error);
        throw error;
    }
};

export const getRevenueByYear = () => async (dispatch) => {
    try {
        const response = await orderItemService.getRevenueByYear();

        if (response) {
            dispatch({
                type: "GET_REVENUE_BY_YEAR",
                payload: response.data,
            });
        } else {
            console.warn("⚠️ Server không trả về dữ liệu doanh thu theo năm.");
        }

        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi lấy doanh thu theo năm:", error);
        throw error;
    }
};

export const getDashboardSummary = (year) => async (dispatch) => {
    try {
        const response = await orderItemService.getDashboardSummary(year);

        if (response) {
            dispatch({
                type: "GET_DASHBOARD_SUMMARY",
                payload: response.data,
            });
        } else {
            console.warn("⚠️ Server không trả về dữ liệu dashboard summary.");
        }

        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu dashboard summary:", error);
        throw error;
    }
};