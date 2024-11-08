import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import './styles/index.css'
import store, { persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { ConfigProvider } from 'antd';  // Ant Design의 ConfigProvider
import koKR from 'antd/lib/locale/ko_KR';  // 한국어 locale 파일
import dayjs from "dayjs";
import 'dayjs/locale/ko';
dayjs.locale('ko');


ReactDOM.createRoot(document.getElementById('root')).render(
    <ConfigProvider locale={koKR}>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <App />
            </PersistGate>
        </Provider>
    </ConfigProvider>
);