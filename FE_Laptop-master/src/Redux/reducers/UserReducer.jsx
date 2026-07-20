import { LOGIN_SUCCESS, LOGOUT_SUCCESS, TOKEN, USER_LOGIN} from "../../Utils/Setting/Config";


const initialState = {
    isAuthenticated: JSON.parse(localStorage.getItem(USER_LOGIN)),
    userData: JSON.parse(localStorage.getItem(USER_LOGIN)) || null,
    token: localStorage.getItem(TOKEN) || null,
    drawlList : [],
}

export const UserReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                userData: action.payload.userData,
                token: action.payload.token,
            };
        case LOGOUT_SUCCESS:
            return {
                ...state,
                isAuthenticated: false,
                userData: null,
                token: null,
                error: null
            }
        case "DRAWL_LIST":
            return {
                ...state,
                drawlList: action.payload,
            }
        default:
            return {...state}
    }
}
