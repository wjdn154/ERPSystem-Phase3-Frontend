import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import {logout, setAuth} from "../../../config/redux/authSlice.jsx";

const AuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const exchangeCodeForToken = async (code) => {

            console.log("토큰 교환 요청 시작");
            try {
                const domain = "ap-northeast-2dwcymwq0b.auth.ap-northeast-2.amazoncognito.com";
                const clientId = "7aftsthsr58mjtcjk7tp00to1l";
                const redirectUri = "http://localhost:3000/callback";

                console.log('인증 코드:', code);

                const params = new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    redirect_uri: redirectUri,
                    code,
                });


                console.log("요청 바디:", params.toString());
                const response = await axios.post(
                    `https://${domain}/oauth2/token`,
                    params,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                );

                const { id_token } = response.data;
                console.log("토큰 응답:", response.data);
                if (id_token) {
                    console.log('토큰 획득 성공:', id_token);
                    dispatch(setAuth({ token: id_token }));
                    localStorage.setItem('jwtToken', id_token);

                    navigate('/company-selection'); // 회사 선택 페이지로 이동
                } else {
                    console.error('ID 토큰 없음');
                    navigate('/error');
                }
            } catch (error) {
                console.error('토큰 교환 중 오류:', error.response?.data || error.message);
                navigate('/error');
            }
        };

        const code = new URLSearchParams(location.search).get('code');
        if (code) {
            console.log('URL에서 코드 확인:', code);
            exchangeCodeForToken(code);
        } else {
            console.error('URL에서 인증 코드 누락');
            navigate('/error');
        }
    }, [location, navigate, dispatch]);


    return loading ? <div>Loading...</div> : null; // 로딩 상태를 표시
};

export default AuthCallback;
