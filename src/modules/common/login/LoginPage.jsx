import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Box, TextField, Typography, Grid, Paper } from "@mui/material";
import { Button } from "antd";
import { COMMON_API } from "../../../config/apiConstants.jsx";
import { useDispatch } from "react-redux";
import { setAuth } from "../../../config/redux/authSlice.jsx";
import background from "../../../assets/img/background3.png";
import DebounceSelect from '../../../components/DebounceSelect.jsx';
import { useNotificationContext } from "../../../config/NotificationContext.jsx";
import apiClient from "../../../config/apiClient.jsx";
import { GoogleLogin } from '@react-oauth/google'; // 새로운 라이브러리로 import 변경


const LoginPage = () => {
    const notify = useNotificationContext();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        companyId: null,
    });

    const [companyId, setCompanyId] = useState(null); // 회사 ID 관리


    useEffect(() => {
        // 회원가입 후 알림 표시
        if (location.state?.registered) {
            notify('success', '회원가입 완료', '성공적으로 회원가입 되었습니다. 이제 로그인하세요!', 'top');
            navigate('/login', { replace: true, state: {} });
        }
    }, [location.state, notify]);

    // 초기값 API 호출
    const fetchInitialCompanyOptions = async () => {
        try {
            const response = await apiClient.post(COMMON_API.COMPANY_LIST_API);
            return response.data.map((company) => ({
                label: company.name,
                value: company.id
            }));
        } catch (error) {
            console.error('초기 회사 목록을 불러오는 중 오류 발생', error);
            return [];
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post(COMMON_API.LOGIN_API, formData);
            const { token, permission, isAdmin } = response.data;
            Cookies.set('jwt', token, { expires: 1 });
            dispatch(setAuth({ token, permission, isAdmin }));
            navigate('/integration', { state: { login: true } });
        } catch (error) {
            notify('error', '로그인 실패', error.response.data, 'top');
        }
    };

    // 구글 로그인 처리
    const handleGoogleLogin = async (credentialResponse) => {
        const { credential } = credentialResponse; // Google OAuth 토큰 추출

        try {
            const response = await apiClient.post(COMMON_API.GOOGLE_LOGIN_API, {
                idToken: credential,
                companyId,
            });

            const { token, permission, isAdmin } = response.data;

            // JWT 쿠키 저장 및 Redux 상태 업데이트
            Cookies.set('jwt', token, { expires: 1 });
            dispatch(setAuth({ token, permission, isAdmin }));

            navigate('/integration', { state: { login: true } });
        } catch (error) {
            console.error('Google 로그인 처리 중 오류 발생:', error);
            notify('error', 'Google 로그인 실패', error.response?.data || 'Google 로그인 중 문제가 발생했습니다.', 'top');
        }
    };


    return (
        <>
            <Grid container style={{ height: '100vh' }}>
                <Grid item xs={12} md={4} style={{
                    backgroundImage: `url(${background})`,
                    backgroundSize: 'cover',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Box p={6}>
                        <Typography sx={{ fontSize: '30px' }}>
                            Think Global, Act Local ERP 솔루션<br />
                            지역사회를 위한 지속 가능한 성장
                        </Typography>
                        <Typography>
                            개인사업자, 중소기업을 위한 소프트웨어 업무 효율 및 생산성 향상을 위한 선택
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} md={8} component={Paper}>
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: '750px',
                                backgroundColor: '#fff',
                                padding: '40px',
                                borderRadius: '8px',
                            }}
                        >
                            <Typography variant="h4" gutterBottom>로그인</Typography>
                            <form onSubmit={handleLogin} style={{ marginTop: '20px' }}>
                                <Box mb={2}>
                                    <DebounceSelect
                                        value={formData.companyId}
                                        placeholder="회사 선택"
                                        fetchInitialOptions={fetchInitialCompanyOptions}
                                        onChange={(value) => setFormData({ ...formData, companyId: value })}
                                        style={{ width: '100%' }}
                                    />
                                </Box>

                                <Box mb={2}>
                                    <TextField
                                        label="Email"
                                        name="userName"
                                        value={formData.userName}
                                        variant="outlined"
                                        onChange={handleInputChange}
                                        fullWidth
                                        required
                                    />
                                </Box>
                                <Box>
                                    <TextField
                                        label="비밀번호"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        variant="outlined"
                                        onChange={handleInputChange}
                                        fullWidth
                                        required
                                    />
                                </Box>

                                <Box mt={2}>
                                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>로그인</Button>
                                </Box>
                                <Box mt={2}>
                                    <GoogleLogin
                                        onSuccess={handleGoogleLogin}
                                        onError={() => notify('error', 'Google 로그인 실패', '로그인 중 문제가 발생했습니다.', 'top')}
                                    />
                                </Box>
                            </form>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </>
    );
};

export default LoginPage;
