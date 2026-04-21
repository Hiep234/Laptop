import {userService} from "../../Service/UserService";
import {
    LOGIN_SUCCESS,
    TOKEN,
    USER_LOGIN
} from "../../Utils/Setting/Config";


export const loginUser = (credentials) => async (dispatch) => {
    try {
        const res = await userService.login(credentials.username, credentials.password);
        if (res.data && res.data.accessToken) {
            const { id,accessToken, username, fullName, email, role } = res.data;
            const userDetails = { id,username, fullName, email, role };

            localStorage.setItem(TOKEN, accessToken);
            localStorage.setItem(USER_LOGIN, JSON.stringify(userDetails));

            dispatch({
                type: LOGIN_SUCCESS,
                payload: {
                    userData: userDetails,
                    token: accessToken
                }
            });

            // ✅ Trả về kết quả cho component gọi dispatch
            return {
                success: true,
                data: {
                    ...userDetails,
                    accessToken
                }
            };
        } else {
            return {
                success: false,
                error: { message: 'Không nhận được accessToken' }
            };
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
        return {
            success: false,
            error: { message: errorMessage }
        };
    }
};

export const changePassword = (current, newPassword,confirmPassword) => async (dispatch) => {
    try {
        const res = await userService.changePassword(current, newPassword,confirmPassword);

        if (res && res.data) {
            dispatch({
                type: "ChangePassword",
                payload: res.data,
            });
            return res.data;
        } else {
            console.log("Không có dữ liệu trả về từ API tạo URL thanh toán");
            throw new Error('Dữ liệu không hợp lệ');
        }
    } catch (error) {
        console.error("Đã xảy ra lỗi:", error);
        throw error; // Truyền lỗi cho phần gọi useEffect
    }
};
export const register = (username,password,fullName,email) => async (dispatch) => {
    try {
        const res = await userService.register(username,password,fullName,email);

        if (res && res.data) {
            dispatch({
                type: "Register",
                payload: res.data,
            });
            return res.data;
        } else {
            throw new Error('Dữ liệu không hợp lệ');
        }
    } catch (error) {
        console.error("Đã xảy ra lỗi:", error);
        throw error; // Truyền lỗi cho phần gọi useEffect
    }
};

export const getUserByUsername = (username) => async (dispatch) => {
    try {
        const res = await userService.informationUser(username);

        if (res && res.data) {
            dispatch({
                type: "InfoUser",
                payload: res.data,
            });
            return res.data;
        } else {
            console.log("Không có dữ liệu trả về từ API tạo URL thanh toán");
            throw new Error('Dữ liệu không hợp lệ');
        }
    } catch (error) {
        console.error("Đã xảy ra lỗi:", error);
        throw error; // Truyền lỗi cho phần gọi useEffect
    }
};

export const getUserBalance = (id) => async (dispatch) => {
    try {
        const res = await userService.getBalanceOfUser(id);

        if (res) {
            dispatch({
                type: "Balance",
                payload: res,
            });
            return res;
        } else {
            console.log("Không có dữ liệu trả về từ API tạo URL thanh toán");
            throw new Error('Dữ liệu không hợp lệ');
        }
    } catch (error) {
    }
};

export const adminGetAllUser = (keyword, page, size, sortDir, sortBy) => async (dispatch) => {
    try {
        const res = await userService.adminGetAllUser(keyword, page,size, sortDir, sortBy);
        console.log("Users response:", res);
        if (res && res.data && res.data.content) {
            dispatch({
                type: "SET_USERS",
                payload: res.data,
            });
        } else {
            console.log("No user data found.");
        }
        return res.data;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
        throw error;
    }
}

export const blockUser = (userId) => async (dispatch) => {
    try {
        const res = await userService.blockUser(userId);
        console.log("User block response:", res);
        if (res && res.code === 200) {
            dispatch({
                type: "BLOCK_USER",
                payload: {
                    userId: userId,
                    code: res.code
                },
            });
        } else {
            console.log("User block operation failed");
        }
        return res.code;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
        throw error;
    }
}

export const sendRequestDrawl = (body) => async (dispatch) => {
    try {
        const res = await userService.sendRequestDrawl(body);

        if (res) {
            dispatch({
                type: "DRAWL",
                payload: res,
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
export const getAllDrawl = (startDate, endDate, page, size, sortBy, sortDirection) => async (dispatch) => {
    try {
        const res = await userService.userGetAllWithdrawals(startDate, endDate, page, size, sortBy, sortDirection);

        if (res) {
            dispatch({
                type: "DRAWL_LIST",
                payload: res.data,
            });
            return res.data;
        } else {
            console.log("Không có dữ liệu trả về từ API tạo URL thanh toán");
            throw new Error('Dữ liệu không hợp lệ');
        }
    } catch (error) {
        console.error("Đã xảy ra lỗi:", error);
        throw error; // Truyền lỗi cho phần gọi useEffect
    }
};