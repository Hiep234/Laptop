import { brandService } from "../../Service/BrandService";

export const getAllBrandPagination = (keyword, countryId, page, size, sortBy, sortDir) => async (dispatch) => {
    try {
        const res = await brandService.getAllBrandPagination(keyword, countryId, page, size, sortBy, sortDir);
        console.log("Brand response:", res);
        if (res && res.data && res.data.content) {
            dispatch({
                type: "SET_BRANDS",
                payload: res.data,
            });
        } else {
            console.log("No brand data found.");
        }
        return res.data;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
    }
}

export const createBrand = (data) => async (dispatch) => {
    try {
        const res = await brandService.createBrand(data);
        console.log("Brand creation response:", res);
        if (res && res.code === 201) {
            dispatch({
                type: "CREATE_BRAND",
                payload: res.code,
            });
        } else {
            console.log("Brand creation failed");
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

export const updateBrand = (id, data) => async (dispatch) => {
    try {
        const res = await brandService.updateBrand(id, data);
        console.log("Brand update response:", res);
        if (res && res.code === 200) {
            dispatch({
                type: "UPDATE_BRAND",
                payload: res.code,
            });
        } else {
            console.log("Brand update failed");
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

export const deleteBrand = (id) => async (dispatch) => {
    try {
        const res = await brandService.deleteBrand(id);
        console.log("Brand deletion response:", res);
        if (res && res.code === 204) {
            dispatch({
                type: "DELETE_BRAND",
                payload: res.code,
            });
        } else {
            console.log("Brand deletion failed");
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