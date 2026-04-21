const initialState = {
    orders: {
        content: [],
        pageNumber: 0,
        pageSize: 5,
        totalElements: 0,
        totalPages: 0,
    },
    loading: false,
    error: null
};

export const OrderReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'HISTORY_ORDER':
            return {
                ...state,
                orders: {  // Changed from 'products' to 'orders'
                    content: action.payload.content || [],
                    pageNumber: action.payload.number || 0,
                    pageSize: action.payload.size || 5,
                    totalElements: action.payload.totalElements || 0,
                    totalPages: action.payload.totalPages || 0,
                },
                loading: false,
                error: null
            };

        default:
            return state;
    }
};