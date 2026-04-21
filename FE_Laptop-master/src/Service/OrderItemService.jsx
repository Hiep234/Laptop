import {baseService} from "./BaseService";

export class OrderItemService extends baseService {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super()
    };
    insertOrder  = (body) => {
        return  this.post('api/v1/order',body)
    }
    historyOrders = (params, userId) => {
        const {
            page = 0,
            size = 5,
            orderStatus = null,
            sort = null
        } = params;

        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('size', size);

        // Only add optional parameters if they exist
        if (orderStatus) queryParams.append('orderStatus', orderStatus);
        if (sort) queryParams.append('sort', sort);

        return this.get(`api/v1/order/history/${userId}?${queryParams.toString()}`, true);
    }
    refund = (id) => {
        return this.put(`api/v1/order/refund/${id}`,{});
    }
    cancel = (id) => {
        return this.put(`api/v1/order/cancel/${id}`,{});
    }

    adminGetAllOrders = ( startDate,endDate, orderStatus, paymentMethod, paymentStatus, page, size, sortBy, sortDir ) => {
        const rawParams = { startDate,endDate, orderStatus, paymentMethod, paymentStatus, page, size, sortBy, sortDir };

        const filteredParams = Object.fromEntries(
            Object.entries(rawParams).filter(([_, value]) => value !== null && value !== undefined)
        );

        const queryString = new URLSearchParams(filteredParams).toString();

        return this.get(`api/v1/order/page?${queryString}`, true);
    }

    adminUpdateOrderStatus = (orderId, data) => {
        return this.put(`api/v1/order/update/status/${orderId}`, data);
    }
    revenueByMonth = (year) => {
        return this.get(`api/v1/revenue/month/${year}`,true);
    }

    acceptRefund = (id) => {
        return this.put(`api/v1/order/accept/refund/${id}`,{});
    }

}
export const orderItemService = new OrderItemService ();