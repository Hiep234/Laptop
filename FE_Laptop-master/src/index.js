import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {BrowserRouter} from "react-router-dom";
import {Provider} from "react-redux";
import store from "./Redux/configStore";
import {ToastContainer} from "react-toastify";
import NotificationProvider from './components/NotificationProvider';
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <BrowserRouter>
        <Provider store={store}>
            <NotificationProvider>
                <App />
                <ToastContainer />
            </NotificationProvider>
        </Provider>
    </BrowserRouter>
);