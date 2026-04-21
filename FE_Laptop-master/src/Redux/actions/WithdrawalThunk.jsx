import { withdrawalService } from "../../Service/WithdrawalService";


export const getAllWithdrawals = (startDate, endDate, status, page, size, sortBy, sortDir) => async (dispatch) => {
    try {
        const res = await withdrawalService.adminGetAllWithdrawals(startDate, endDate, status, page, size, sortBy, sortDir);
        console.log("Withdrawals response:", res);
        if (res && res.data && res.data.content) {
            dispatch({
                type: "SET_WITHDRAWALS",
                payload: res.data,
            });
        } else {
            console.log("No withdrawal data found.");
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

export const updateWithdrawalStatus = (withdrawalId, data) => async (dispatch) => {
    try {
        const res = await withdrawalService.adminUpdateWithdrawalStatus(withdrawalId, data);
        console.log("Withdrawal status update response:", res);
        if (res && res.code === 200) {
            dispatch({
                type: "UPDATE_WITHDRAWAL_STATUS",
                payload: res.code,
            });
        } else {
            console.log("Withdrawal status update failed");
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