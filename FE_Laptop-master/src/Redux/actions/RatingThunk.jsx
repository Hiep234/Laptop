import { ratingService } from "../../Service/RatingService";

export const createReview = (body) => async (dispatch) => {
    try {
        const res = await ratingService.postReview(body);
        if (res && res.data) {
            dispatch({
                type: "PUSHRATING",
                payload: res,
            });
        } else {
            console.log("No cart data found.");
        }
        return res;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
    }
};
export const getAllReview = (id, page = 1, size = 5) => async (dispatch) => {
    try {
        const res = await ratingService.getReview(id, page, size);
        console.log(res);
        if (res && res.data) {
            dispatch({
                type: "GETRATING",
                payload: res,
            });
        } else {
            console.log("No review data found.");
        }
        return res;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
        throw error;
    }
};