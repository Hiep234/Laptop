import {baseService} from "./BaseService";

export class RatingService extends baseService {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super()
    };
    postReview = (body) => {
        return this.post(`api/v1/product-reviews/create`, body);
    }
    getReview = (id,page,size) => {
        return this.get(`api/v1/product-reviews/${id}?page=${page}&size=${size}`, false);
    }
}
export const ratingService = new RatingService ();