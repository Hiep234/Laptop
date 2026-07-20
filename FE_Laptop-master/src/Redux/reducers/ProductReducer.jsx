const initialState = {
    products: {
        content: [],
        pageNumber: 0,
        pageSize: 12,
        totalElements: 0,
        totalPages: 0,
        last: false
    },
    categories: {
        data: [],
        loading: false,
        error: null
    },
    brands: {
        data: [],
        loading: false,
        error: null
    },
    loading: false,
    error: null
};

export const ProductReducer = (state = initialState, action) => {
    switch (action.type) {
        // Product cases
        case 'PRODUCT_SEARCH_REQUEST':
            return {
                ...state,
                loading: true,
                error: null
            };
        case 'PRODUCT_SEARCH_SUCCESS':
            return {
                ...state,
                products: {
                    content: action.payload.content || [],
                    pageNumber: action.payload.number || 0,
                    pageSize: action.payload.size || 12,
                    totalElements: action.payload.totalElements || 0,
                    totalPages: action.payload.totalPages || 0,
                    last: action.payload.last || false
                },
                loading: false,
                error: null
            };
        case 'PRODUCT_SEARCH_FAILURE':
            return {
                ...state,
                loading: false,
                error: action.payload
            };

        // Category cases
        case 'CATEGORY_REQUEST':
            return {
                ...state,
                categories: {
                    ...state.categories,
                    loading: true,
                    error: null
                }
            };
        case 'CATEGORY_SUCCESS':
            return {
                ...state,
                categories: {
                    data: action.payload,
                    loading: false,
                    error: null
                }
            };
        case 'CATEGORY_FAILURE':
            return {
                ...state,
                categories: {
                    ...state.categories,
                    loading: false,
                    error: action.payload
                }
            };

        // Brand cases
        case 'BRAND_REQUEST':
            return {
                ...state,
                brands: {
                    ...state.brands,
                    loading: true,
                    error: null
                }
            };
        case 'BRAND_SUCCESS':
            return {
                ...state,
                brands: {
                    data: action.payload,
                    loading: false,
                    error: null
                }
            };
        case 'BRAND_FAILURE':
            return {
                ...state,
                brands: {
                    ...state.brands,
                    loading: false,
                    error: action.payload
                }
            };

        default:
            return state;
    }
};