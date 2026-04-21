import {baseService} from "./BaseService";

export class LocationService extends baseService {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super()
    };
    getProvinces  = () => {
        return  this.get('api/v1/provinces',false)
    }
    getDistrict  = (provinceId) => {
        return  this.get(`api/v1/districts/${provinceId}`,false)
    }
    getWards  = (wardId) => {
        return  this.get(`api/v1/wards/${wardId}`,false)
    }
    getCountries  = () => {
        return  this.get('api/v1/countries',false)
    }
}
export const locationService = new LocationService ();