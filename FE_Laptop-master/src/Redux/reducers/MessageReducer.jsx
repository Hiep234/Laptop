// Reducer xử lý các hành động liên quan đến tin nhan


const initialState = {
    messages: [],
    totalPages: 0,
    totalElements: 0,
    users : [],
};

export const MessageReducer = (state = initialState, action) => {
    switch (action.type) {
        case "GET_MESSAGE":
            return {
                ...state,
                messages: action.payload.content,
                totalPages: action.payload.totalPages,
            };
        case "GET_USER":
            return {
                ...state,
                users: action.payload.content,
                totalElements: action.payload.totalElements,
            };
        default:
            return state;
    }
};
