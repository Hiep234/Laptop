import { voucherService } from "../../Service/VoucherService";

export const getAllVoucher = (keyword, discountType, isActive, startDate, endDate, page,size, sortBy, sortDir) => async (dispatch) => {
    try {
        const res = await voucherService.getAllVoucher(keyword, discountType, isActive, startDate, endDate, page,size, sortBy, sortDir);
        if (res && res.data) {
            dispatch({
                type: "VOUCHER",
                payload: res.data,
            });
        } else {
            console.log("No cart data found.");
        }
        return res.data;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
    }
};

export const createVoucher = (data) => async (dispatch) => {
    try {
        const res = await voucherService.createVoucher(data);
        console.log("Voucher creation response:", res);
        if (res && res.code === 201) {
            dispatch({
                type: "CREATE_VOUCHER",
                payload: res.code,
            });
        } else {
            console.log("Voucher creation failed");
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

export const updateVoucher = (id, data) => async (dispatch) => {
    try {
        const res = await voucherService.updateVoucher(id, data);
        console.log("Voucher update response:", res);
        if (res && res.code === 200) {
            dispatch({
                type: "UPDATE_VOUCHER",
                payload: res.code,
            });
        } else {
            console.log("Voucher update failed");
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

export const deleteVoucher = (id) => async (dispatch) => {
    try {
        const res = await voucherService.deleteVoucher(id);
        console.log("Voucher deletion response:", res);
        if (res && res.code === 204) {
            dispatch({
                type: "DELETE_VOUCHER",
                payload: res.code,
            });
        } else {
            console.log("Voucher deletion failed");
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