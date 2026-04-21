// NotificationProvider.js
import React from 'react';
import {notification} from 'antd';

export const NotificationContext = React.createContext(null);

const NotificationProvider = ({children}) => {
    const [api, contextHolder] = notification.useNotification();

    return (
        <NotificationContext.Provider value={api}>
            {contextHolder}
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;
