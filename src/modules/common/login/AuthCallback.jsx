import React, { useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {

        // JWT 디코더 함수
        const decodeJwt = (token) => {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        };

        const exchangeCodeForToken = async (code) => {
            try {

                const clientId = "189901934577-ir0en4b9eqe4j6ehb6imcou61t2ec9mn.apps.googleusercontent.com";
                const redirectUri = "http://localhost:3000/callback";
                //const domain = "ap-northeast-2217t3ejhc.auth.ap-northeast-2.amazoncognito.com";
                const tokenEndpoint = "https://oauth2.googleapis.com/token";
                const clientSecret = "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"; // 구글 클라이언트 시크릿

                // 토큰 교환을 위한 요청 데이터
                const params = new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                    code,
                });

                console.log('Code:', code);
                console.log('Token Request Params:', params.toString());
                console.log("Client ID:", clientId);
                console.log("Redirect URI:", redirectUri);
                console.log("Client Secret:", clientSecret);

                // 구글로 토큰 요청
                const response = await axios.post(tokenEndpoint, params, {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                });

                console.log("구글 토큰 응답:", response.data);


                const { access_token, id_token } = response.data;

                if (id_token) {
                    const decodedIdToken = decodeJwt(id_token);
                    console.log("Decoded ID Token:", decodedIdToken);
                }

                if (access_token) {
                    return access_token;
                }
                else {
                    console.error("Access token이 없습니다.");
                    navigate("/error");
                }
            } catch (error) {
                console.error("구글 토큰 요청 실패:", error.response?.data || error.message);

                if (error.response) {
                    console.error("응답 상태 코드:", error.response.status);
                    console.error("응답 데이터:", error.response.data);
                }

                navigate("/error");
            }
        };

        const fetchGoogleUserInfo = async (accessToken) => {
            try {
                const userInfoEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";

                // 사용자 정보 요청
                const response = await axios.get(userInfoEndpoint, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                console.log("구글 사용자 정보:", response.data);
                return response.data; // { email, name, ... }
            } catch (error) {
                console.error("구글 사용자 정보 요청 실패:", error.response?.data || error.message);
                throw error;
            }
        };

        const initializeAuthCallback = async () => {
            const code = new URLSearchParams(location.search).get('code');
            console.log("code: ",code);

            if (code) {
                // 인증 코드를 로컬 스토리지에 저장
                localStorage.setItem("authCode", code);
                console.log("authcallback code: ",code);
                // 3. 회사 선택 페이지로 이동하며 사용자 정보 전달
                navigate("/company-selection");
            } else {
                console.error("google 인증코드가 없습니다.");
                navigate('/error');
            }
        };
        initializeAuthCallback();
    }, [location, navigate]);

    return null;
};

export default AuthCallback;
