import {baseService} from "./BaseService";

export class PaymentService extends baseService {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super()
    };
    createUrlPay = (amount, orderInfo) => {
        const encodedOrderInfo = encodeURIComponent(orderInfo.toString());
        return this.post(`api/v1/payments/create?amount=${amount}&orderInfo=${encodedOrderInfo}`, {});
    }
    paycheck = (body) => {
       return this.post('api/v1/payments/check', body);
    }

}
export const paymentService = new PaymentService ();