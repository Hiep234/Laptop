import {baseService} from "./BaseService";

export class VoucherService extends baseService {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super()
    };
    getAllVoucher = (keyword, discountType, isActive, startDate, endDate, page,size, sortBy, sortDir) => {
        const rawParams = { keyword, discountType, isActive, startDate, endDate, page,size, sortBy, sortDir };

        const filteredParams = Object.fromEntries(
            Object.entries(rawParams).filter(([_, value]) => value !== null && value !== undefined)
        );
        const params = new URLSearchParams(filteredParams).toString();
        return this.get(`api/v1/discounts/page?${params}`, false);
    }

    createVoucher = (data) => {
        return this.post('api/v1/discounts/create', data, true);
    }
    updateVoucher = (id, data) => {
        return this.put(`api/v1/discounts/update/${id}`, data, true);
    }
    deleteVoucher = (id) => {
        return this.delete(`api/v1/discounts/delete/${id}`, true);
    }
}
export const voucherService = new VoucherService ();

