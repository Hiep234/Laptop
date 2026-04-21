import {baseService} from "./BaseService";

export class CategoryService extends baseService {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super()
    };
    getAllCategoryPagination = (keyword, page, size, sortBy, sortDir) => {
        const rawParams = { keyword, page, size, sortBy, sortDir };
        
        const filteredParams = Object.fromEntries(
            Object.entries(rawParams).filter(([_, value]) => value !== null && value !== undefined)
        );

        const params = new URLSearchParams(filteredParams).toString();
        return this.get(`api/v1/categories/page?${params}`, true);
    };

    createCategory = (data) => {
        return this.post('api/v1/categories/create', data);
    }
    updateCategory = (id, data) => {
        return this.put(`api/v1/categories/update/${id}`, data);
    }
    deleteCategory = (categoryId) => {
        return this.delete(`api/v1/categories/delete/${categoryId}`);
    }

}
export const categoryService = new CategoryService();