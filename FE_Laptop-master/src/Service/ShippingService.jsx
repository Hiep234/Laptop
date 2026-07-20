import { baseService } from "./BaseService";

export class ShippingService extends baseService {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }

    getProvinces = () => {
        return this.get('api/v1/provinces', false);
    }

    getDistricts = (provinceId) => {
        return this.get(`api/v1/districts/${provinceId}`, false);
    }

    getWards = (districtId) => {
        return this.get(`api/v1/wards/${districtId}`, false);
    }

    getAvailableServices = (data) => {
        return this.post('api/shipping/ghn/available-services', data);
    }

    calculateFee = (data) => {
        return this.post('api/shipping/ghn/fee', data);
    }
}

export const shippingService = new ShippingService();
