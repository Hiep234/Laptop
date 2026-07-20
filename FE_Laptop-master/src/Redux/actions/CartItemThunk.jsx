import { cartItemService } from "../../Service/CartItemService";

export const getCartItemByIdUser = (page, size, idUser) => async (dispatch) => {
    try {
        const res = await cartItemService.getCartItemByIdUser(page, size, idUser);
        console.log("Cart items response:", res);

        if (res && res.data && res.data.content) {
            dispatch({
                type: "SET_CART_ITEMS",
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
export const deleteAllCartItems = (userId,page,size) => async (dispatch) => {
    try {
        // Lấy danh sách ID của tất cả sản phẩm trong giỏ hàng
        const cartResponse = await cartItemService.getCartItemByIdUser(0, 1000, userId);
        const allCartItems = cartResponse.data.content;

        if (allCartItems.length === 0) {
            throw new Error("Giỏ hàng trống");
        }

        // Tạo danh sách ID cần xóa
        const listCartId = allCartItems.map(item => item.id);

        // Gọi API xóa
        const res = await cartItemService.deleteCartItems(listCartId);

        return {
            payload: res.code,
            meta: { userId, deletedCount: listCartId.length }
        };
    } catch (error) {
        throw error;
    }
};
export const deleteCartItem = (id) => async (dispatch) => {
    try {
        const res = await cartItemService.deleteCartItem(id);

        if (res && res.code === 200) {
            dispatch({
                type: "DELETE_CART_ITEM",
                payload: res.code,
            });
        } else {
            console.log("No cart data found.");
        }
        return res.code;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
    }
};

export const updateCartItemQuantity = ({id,quantity}) => async (dispatch) => {
    try {
        const res = await cartItemService.updateQuantity(id,quantity);

        if (res && res.code === 200) {
            dispatch({
                type: "UPDATE_CART_ITEM",
                payload: res.code,
            });
        } else {
            console.log("No cart data found.");
        }
        return res.code;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
    }
};

export const insertCartItem = ({ quantity, productVariantId, userId }) => async (dispatch) => {
    try {
        const body = {
            quantity,
            productVariantId,
            userId
        };

        const res = await cartItemService.insertCartItem(body);

        if (res && res.code === 200) {
            dispatch({
                type: "INSERT_CART_ITEM",
                payload: res.code,
            });
        } else {
            console.log("No cart data found.");
        }

        return res.code;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
    }
};
export const totalCartItem = (id) => async (dispatch) => {
    try {
        const res = await cartItemService.totalCartItemById(id);

        if (res && res.code === 200) {
            dispatch({
                type: "TOTAL_CART_ITEM",
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