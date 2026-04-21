import {baseService} from "./BaseService";

export class ProductService extends baseService {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super()
    };
    getProductDetailById = (id) => {
        return this.get(`api/v1/products/detail/${id}` , false);
    }
    searchProducts = (params) => {
        const {
            keyword,
            page,
            size,
        } = params;

        const query = new URLSearchParams({
            keyword: keyword || '',
            page: page || 1,
            size: size || 10,
        }).toString();

        return this.get(`api/v1/products/page?${query}`, false);
    }

    getAllProductFeature = (userId) => {
        return this.get(`api/v1/products/feature?userId=${userId}`, false);
    }
    searchDetailProducts = (params) => {
        const {
            keyword,
            categoryId,
            brandId,
            minPrice,
            maxPrice,
            page,
            size,
            sortBy,
            sortDir
        } = params;

        const query = new URLSearchParams({
            keyword: keyword || '',
            categoryId: categoryId || '',
            brandId: brandId || '',
            minPrice: minPrice || '',
            maxPrice: maxPrice || '',
            page: page || 0,
            size: size || 10,
            sortBy: sortBy || 'name',
            sortDir: sortDir || 'asc'
        }).toString();

        return this.get(`api/v1/products/page?${query}`, false);
    }
    getAllCategories = () => {
        return this.get(`api/v1/categories/all`, false);
    }
    getAllBrands = () => {
        return this.get(`api/v1/brands/all`, false);
    }
    adminGetAllProducts = (keyword, categoryId, brandId, page, size, sortBy, sortDir) => {
        const rawParams = {keyword, categoryId, brandId, page, size, sortBy, sortDir };

        const filteredParams = Object.fromEntries(
            Object.entries(rawParams).filter(([_, value]) => value !== null && value !== undefined)
        );
        const params = new URLSearchParams(filteredParams).toString();

        return this.get(`api/v1/products/admin/all?${params}`, true);
    }
    
    adminDetailProduct = (productId) => {
        return this.get(`api/v1/products/admin/detail/${productId}`, true);
    }

    adminCreateProduct = (product) => {
        return this.post(`api/v1/products/create`, product, true);
    }
    adminUpdateProduct = (productId, product) => {
        return this.put(`api/v1/products/update/${productId}`, product, true);
    }
    adminDeleteProduct = (productId) => {
        return this.delete(`api/v1/products/delete/${productId}`, true);
    }
}
export const productService = new ProductService ();