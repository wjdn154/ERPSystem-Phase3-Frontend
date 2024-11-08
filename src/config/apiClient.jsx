import axios from 'axios';
import { COMMON_API } from './apiConstants.jsx'; // API 경로 상수
import Cookies from 'js-cookie';
import { logout } from "./redux/authSlice.jsx";
import {useDispatch} from "react-redux";
import store from "../store.jsx";

// Axios 인스턴스 생성
const apiClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 설정 (모든 요청에 JWT 토큰 추가)
apiClient.interceptors.request.use((config) => {
    const token = Cookies.get('jwt');

    if (config.url === COMMON_API.COMPANY_LIST_API || config.url === COMMON_API.COMPANY_SEARCH_API ||
        config.url === COMMON_API.LOGIN_API || config.url === COMMON_API.REGISTER_API ||
        config.url === COMMON_API.REFRESH_TOKEN_API) {
        return config; // 토큰 없이 요청 진행
    }

    if(!token) {
        store.dispatch(logout());
    }

    config.headers.Authorization = `Bearer ${token}`; // JWT 토큰을 헤더에 추가

    return config;
}, (error) => Promise.reject(error)); // 에러 처리

// 응답 인터셉터 설정 (403 에러 발생 시 리프레시 토큰을 사용하여 액세스 토큰 갱신)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 403 에러 발생 시 리프레시 토큰을 사용하여 재시도
        if (error.response && error.response.status === 401 && error.response.data.error === 'TOKEN_EXPIRED' && !originalRequest._retry) {
            originalRequest._retry = true; // 리프레시 시도 중인지 플래그 설정

            const refreshToken = Cookies.get('refreshToken'); // 리프레시 토큰 가져오기

            if (!refreshToken) {
                store.dispatch(logout());
                return Promise.reject(new Error('JWT refresh 토큰이 없습니다. 로그아웃 처리됨.'));
            }

            try {
                // 리프레시 토큰으로 새로운 액세스 토큰 요청
                const res = await axios.post(COMMON_API.REFRESH_TOKEN_API, { refreshToken });

                if (res.status === 200) {
                    const newToken = res.data.token;

                    if (!newToken) {
                        return Promise.reject(error);
                    }

                    // 새 JWT 토큰을 쿠키에 저장

                    // 원래 요청에 새로운 토큰을 추가하고 재시도
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error); // 그 외 에러 처리
    }
);

export default apiClient;