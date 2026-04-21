import { categoryService } from "../../Service/CategoryService";

export const getAllCategoryPagination = (keyword, page, size, sortBy, sortDir) => async (dispatch) => {
    try {
        const res = await categoryService.getAllCategoryPagination(keyword, page, size, sortBy, sortDir);
        console.log("Category response:", res);
        if (res && res.data && res.data.content) {
            dispatch({
                type: "SET_CATEGORIES",
                payload: res.data,
            });
        } else {
            console.log("No category data found.");
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

export const createCategory = (data) => async (dispatch) => {
    try {
        const res = await categoryService.createCategory(data);
        console.log("Category creation response:", res);
        if (res && res.code === 201) {
            dispatch({
                type: "CREATE_CATEGORY",
                payload: res.code,
            });
        } else {
            console.log("Category creation failed");
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

export const updateCategory = (id, data) => async (dispatch) => {
    try {
        const res = await categoryService.updateCategory(id, data);
        console.log("Category update response:", res);
        if (res && res.code === 200) {
            dispatch({
                type: "UPDATE_CATEGORY",
                payload: res.code,
            });
        } else {
            console.log("Category update failed");
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

export const deleteCategory = (id) => async (dispatch) => {
    try {
        const res = await categoryService.deleteCategory(id);
        console.log("Category deletion response:", res);
        if (res && res.code === 204) {
            dispatch({
                type: "DELETE_CATEGORY",
                payload: res.code,
            });
        } else {
            console.log("Category deletion failed");
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