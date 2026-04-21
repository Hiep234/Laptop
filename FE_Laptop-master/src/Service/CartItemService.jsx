import {baseService} from "./BaseService";

export class CartItemService extends baseService {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super()
    };
    getCartItemByIdUser = (page, size, idUser) => {
        const params = new URLSearchParams({
            page: page,
            size: size,
        }).toString();
        return this.get(`api/v1/cart/${idUser}?` + params, true);
    }
    updateQuantity = (id,quantity) => {
        const params = new URLSearchParams({
            id: id,
            quantity: quantity,
        }).toString();
        return  this.post('api/v1/cart/update?' +params,{});
    }
    deleteCartItems  = (listId) => {
        const params = new URLSearchParams({
            listId: listId,
        });
        return  this.delete('api/v1/cart?' + params)
    }
    deleteCartItem  = (idCartItem) => {
        return  this.delete('api/v1/cart/only?id=' + idCartItem)
    }
    insertCartItem = (body) => {
        return  this.post('api/v1/cart/insert',body)
    }
    totalCartItemById = (id) => {
        return  this.get(`api/v1/cart/total/${id}`,true)
    }
}
export const cartItemService = new CartItemService ();