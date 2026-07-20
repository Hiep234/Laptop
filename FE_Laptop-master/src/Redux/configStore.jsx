import { applyMiddleware, combineReducers, legacy_createStore } from 'redux';
import {thunk} from 'redux-thunk';
import { UserReducer } from './reducers/UserReducer';
import { LoadingReducer } from './reducers/LoadingReducer';
import {LocationReducer} from "./reducers/LocationReducer";
import {ProductReducer} from "./reducers/ProductReducer";
import {OrderReducer} from "./reducers/OrderReducer";
import {MessageReducer} from "./reducers/MessageReducer";

const rootReducer = combineReducers({
    UserReducer,
    LoadingReducer,
    ProductReducer,
    OrderReducer,
    MessageReducer,
    LocationReducer,
});

const store = legacy_createStore(rootReducer, applyMiddleware(thunk));

export default store;
