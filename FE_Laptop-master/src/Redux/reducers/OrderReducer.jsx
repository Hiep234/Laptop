const initialState = {
    orders: {
        content: [],
        pageNumber: 0,
        pageSize: 5,
        totalElements: 0,
        totalPages: 0,
    },
    totalRevenue: 0,
    revenueYears: [],
    dashboardSummary: null,
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

        case 'GET_TOTAL_REVENUE':
            return {
                ...state,
                totalRevenue: action.payload,
                loading: false,
                error: null
            };

        case 'GET_REVENUE_BY_YEAR':
            return {
                ...state,
                revenueYears: action.payload,
                loading: false,
                error: null
            };

        case 'GET_DASHBOARD_SUMMARY':
            return {
                ...state,
                dashboardSummary: action.payload,
                loading: false,
                error: null
            };

        default:
            return state;
    }
};