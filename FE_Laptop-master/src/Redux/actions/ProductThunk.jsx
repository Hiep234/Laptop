import { productService } from "../../Service/ProductService";

export const getProductDetailById = (id) => async (dispatch) => {
    try {
        const res = await productService.getProductDetailById(id);
        console.log("Cart items response:", res);

        if (res && res.data) {
            dispatch({
                type: "PRODUCT_DETAIL",
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

export const searchProducts = (params) => async (dispatch) => {
    try {
        const res = await productService.searchProducts(params);
        console.log("Search products response:", res);

        if (res && res.data) {
            dispatch({
                type: "PRODUCT_SEARCH_SUCCESS",
                payload: res.data
            });
        } else {
            console.log("No product data found.");
        }

        return res.data;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }

        dispatch({
            type: "PRODUCT_SEARCH_FAILURE",
            payload: error.message
        });
    }
};
export const getAllProductFeature = (userId) => async (dispatch) => {
    try {
        const res = await productService.getAllProductFeature(userId);
        console.log("Search products response:", res);

        if (res && res.data) {
            dispatch({
                type: "PRODUCT_FEATURE",
                payload: res.data
            });
        } else {
            console.log("No product data found.");
        }

        return res.data;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }

        dispatch({
            type: "PRODUCT_FEATURE_FAILURE",
            payload: error.message
        });
    }
};
export const searchProductsDetail = (params) => async (dispatch) => {
    try {
        dispatch({ type: "PRODUCT_SEARCH_REQUEST" });

        const res = await productService.searchDetailProducts(params);

        if (res && res.data) {
            dispatch({
                type: "PRODUCT_SEARCH_SUCCESS",
                payload: res.data
            });
        } else {
            dispatch({
                type: "PRODUCT_SEARCH_FAILURE",
                payload: "No product data found"
            });
        }

        return res.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        dispatch({
            type: "PRODUCT_SEARCH_FAILURE",
            payload: errorMessage
        });
    }
};

export const getAllCategories = () => async (dispatch) => {
    try {
        dispatch({ type: "CATEGORY_REQUEST" });
        const response = await productService.getAllCategories();
        dispatch({
            type: "CATEGORY_SUCCESS",
            payload: response.data
        });
        return response.data;
    } catch (error) {
        dispatch({
            type: "CATEGORY_FAILURE",
            payload: error.response?.data?.message || error.message
        });
    }
};

export const getAllBrands = () => async (dispatch) => {
    try {
        dispatch({ type: "BRAND_REQUEST" });
        const response = await productService.getAllBrands();
        dispatch({
            type: "BRAND_SUCCESS",
            payload: response.data
        });
        return response.data;
    } catch (error) {
        dispatch({
            type: "BRAND_FAILURE",
            payload: error.response?.data?.message || error.message
        });
    }
};

export const adminGetAllProducts = (keyword, categoryId, brandId, page, size, sortBy, sortDir) => async (dispatch) => {
    try {
        dispatch({ type: "PRODUCT_ADMIN_REQUEST" });
        const response = await productService.adminGetAllProducts(keyword, categoryId, brandId, page, size, sortBy, sortDir);
        dispatch({
            type: "PRODUCT_ADMIN_SUCCESS",
            payload: response.data
        });
        return response.data;
    } catch (error) {
        dispatch({
            type: "PRODUCT_ADMIN_FAILURE",
            payload: error.response?.data?.message || error.message
        });
    }
};

export const adminDetailProduct = (productId) => async (dispatch) => {
    try {
        dispatch({ type: "PRODUCT_ADMIN_DETAIL_REQUEST" });
        const response = await productService.adminDetailProduct(productId);
        dispatch({
            type: "PRODUCT_ADMIN_DETAIL_SUCCESS",
            payload: response.data
        });
        return response.data;
    } catch (error) {
        dispatch({
            type: "PRODUCT_ADMIN_DETAIL_FAILURE",
            payload: error.response?.data?.message || error.message
        });
    }
};

export const adminCreateProduct = (product) => async (dispatch) => {
    try {
        dispatch({ type: "PRODUCT_ADMIN_CREATE_REQUEST" });
        const response = await productService.adminCreateProduct(product);
        if (response && response.code === 201) {
            dispatch({
                type: "PRODUCT_ADMIN_CREATE_SUCCESS",
                payload: response.code,
            });
        } else {
            console.log("Product creation failed");
        }
        return response.code;
    } catch (error) {
        dispatch({
            type: "PRODUCT_ADMIN_CREATE_FAILURE",
            payload: error.response?.data?.message || error.message
        });
    }
};

export const adminUpdateProduct = (productId, product) => async (dispatch) => {
    try {
        dispatch({ type: "PRODUCT_ADMIN_UPDATE_REQUEST" });
        const response = await productService.adminUpdateProduct(productId, product);
        if (response && response.code === 200) {
            dispatch({
                type: "PRODUCT_ADMIN_UPDATE_SUCCESS",
                payload: response.code,
            });
        } else {
            console.log("Product update failed");
        }
        return response.code;
    } catch (error) {
        dispatch({
            type: "PRODUCT_ADMIN_UPDATE_FAILURE",
            payload: error.response?.data?.message || error.message
        });
    }
};

export const adminDeleteProduct = (productId) => async (dispatch) => {
    try {
        dispatch({ type: "PRODUCT_ADMIN_DELETE_REQUEST" });
        const response = await productService.adminDeleteProduct(productId);
        if (response && response.code === 204) {
            dispatch({
                type: "PRODUCT_ADMIN_DELETE_SUCCESS",
                payload: response.code,
            });
        } else {
            console.log("Product deletion failed");
        }
        return response.code;
    } catch (error) {
        dispatch({
            type: "PRODUCT_ADMIN_DELETE_FAILURE",
            payload: error.response?.data?.message || error.message
        });
    }
};