import React, { useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const exchangeCodeForToken = async (code) => {
            try {
                // Cognito 환경 변수 가져오기
                const clientId = "2vbjbe8baqj88bmckgvag8klmt";
                const redirectUri = "http://localhost:3000/callback";
                const domain = "ap-northeast-2217t3ejhc.auth.ap-northeast-2.amazoncognito.com";

                // 토큰 교환을 위한 요청 데이터
                const params = new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    redirect_uri: redirectUri,
                    code,
                });
                console.log("토큰 요청 성공");
                // 토큰 교환 요청
                const response = await axios.post(
                    `https://${domain}/oauth2/token`,
                    params,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                );

                const { id_token, access_token, refresh_token } = response.data;

                if (id_token && access_token && refresh_token) {
                    localStorage.setItem("idToken", id_token);
                    localStorage.setItem("accessToken", access_token);
                    localStorage.setItem("refreshToken", refresh_token);

                    // 회사 선택 화면으로 이동
                    navigate("/company-selection");
                } else {
                    throw new Error("토큰 정보가 누락되었습니다.");
                }
            } catch (error) {
                console.error("토큰 교환 실패:", error.response?.data || error.message);
                navigate('/error', { state: { message: "토큰 교환 중 오류가 발생했습니다. 다시 시도해주세요." } });
            }
        };



        const initializeAuthCallback = async () => {
            const code = new URLSearchParams(location.search).get('code');
            if (code) {
                await exchangeCodeForToken(code);
            } else {
                console.error("Authorization code not found in URL.");
                navigate('/error', { state: { message: "유효한 인증 코드가 URL에 포함되어 있지 않습니다." } });
            }
        };
        initializeAuthCallback();
    }, [location, navigate]);


    return (
        <div>
            <p>인증 처리 중입니다. 잠시만 기다려주세요...</p>
        </div>
    );
    };
export default AuthCallback;
