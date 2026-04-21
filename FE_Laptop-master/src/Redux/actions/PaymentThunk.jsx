import { paymentService } from "../../Service/PaymentService";

export const createUrlPay = (amount, orderInfo) => async (dispatch) => {
    try {
        const res = await paymentService.createUrlPay(amount, orderInfo);
        console.log(res);
        if (res && res.data) {
            const paymentUrl = res.data; // Lấy URL thanh toán từ API trả về

            // Kiểm tra và chuyển hướng nếu URL hợp lệ
            if (paymentUrl) {
                window.location.href = paymentUrl; // Chuyển hướng trình duyệt tới URL thanh toán
            }

            dispatch({
                type: "PAYMENT_URL_CREATED",
                payload: paymentUrl, // Lưu URL thanh toán vào state nếu cần
            });
        } else {
            console.log("Không có dữ liệu trả về từ API tạo URL thanh toán");
        }
    } catch (error) {
        if (error.response) {
            // Nếu lỗi có response, log thông báo lỗi chi tiết
            console.log("Error during payment URL creation:", error.response.data.message);
        } else {
            // Nếu lỗi không có response (ví dụ lỗi mạng), log lỗi chung
            console.log("Error during payment URL creation:", error.message);
        }
    }
};

export const check = (body) => async (dispatch) => {
    try {
        const res = await paymentService.paycheck(body);

        if (res && res.data && res.data.amount) {
            dispatch({
                type: "RESULT_CHECK",
                payload: res, // Đảm bảo trả về dữ liệu có key 'amount'
            });
            return res;
        } else {
            console.log("Không có dữ liệu trả về từ API tạo URL thanh toán");
            throw new Error('Dữ liệu không hợp lệ');
        }
    } catch (error) {
        console.error("Đã xảy ra lỗi:", error);
        throw error; // Truyền lỗi cho phần gọi useEffect
    }
};



