import {baseService} from "./BaseService";

export class BrandService extends baseService {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super()
    };
    getAllBrandPagination = (keyword, countryId, page, size, sortBy, sortDir) => {
        const rawParams = { keyword, countryId, page, size, sortBy, sortDir };
        
        const filteredParams = Object.fromEntries(
            Object.entries(rawParams).filter(([_, value]) => value !== null && value !== undefined)
        );

        const params = new URLSearchParams(filteredParams).toString();
        return this.get(`api/v1/brands/page?${params}`, true);
    };

    createBrand = (data) => {
        return this.post('api/v1/brands/create', data);
    }
    updateBrand = (id, data) => {
        return this.put(`api/v1/brands/update/${id}`, data);
    }
    deleteBrand = (brandId) => {
        return this.delete(`api/v1/brands/delete/${brandId}`);
    }

}
export const brandService = new BrandService();