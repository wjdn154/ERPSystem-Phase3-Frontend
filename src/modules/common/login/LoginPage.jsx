import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Box, TextField, Typography, Grid, Paper, Link, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@mui/material";
import {Button, Alert, notification} from "antd";
import { COMMON_API } from "../../../config/apiConstants.jsx";
import { useDispatch } from "react-redux";
import {logout, setAuth} from "../../../config/redux/authSlice.jsx";
import background from "../../../assets/img/background3.png";
import DebounceSelect from '../../../components/DebounceSelect.jsx';
import {useNotificationContext} from "../../../config/NotificationContext.jsx";
import apiClient from "../../../config/apiClient.jsx";
import {jwtDecode} from "jwt-decode";

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

    useEffect(() => {
        // 회원가입 후 넘어온 경우 알림 표시
        if (location.state?.registered) {
            notify('success', '회원가입 완료', '성공적으로 회원가입 되었습니다. 이제 로그인하세요!', 'top');
            navigate('/login', {replace: true, state: {}});
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

    // 검색 API 호출
    const fetchSearchCompanyOptions = async (searchText) => {
        try {
            const response = await apiClient.post(COMMON_API.COMPANY_SEARCH_API, { searchText });
            return response.data.map((company) => ({
                label: company.name,
                value: company.id
            }));
        } catch (error) {
            return [];
        }
    };

    // 입력 필드의 변화에 따른 상태 업데이트
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    // 회사 선택 시 상태 업데이트
    const handleCompanyChange = (newValue) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            companyId: newValue,
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post(COMMON_API.LOGIN_API, formData);
            // 서버로부터 토큰과 권한 정보를 받아옴
            const { token, permission, isAdmin } = response.data;
            // JWT 토큰을 쿠키에 저장 (만료 기간 1일)
            Cookies.set('jwt', token, { expires: 1 });
            Cookies.set('refreshToken', token, { expires: 7 });
            // Redux 상태 업데이트 (JWT 토큰 및 권한 정보 저장)
            dispatch(setAuth({ token, permission, isAdmin }));
            // 로그인 성공 시 메인 페이지로 이동
            navigate('/integration', { state: { login: true } });
        } catch (error) {

            notify('error', '로그인 실패', error.response.data, 'top');
        }
    };

    return (
        <>
            <Grid container style={{ height: '100vh' }}>
                {/* 왼쪽 부분 */}
                <Grid item xs={12} md={4} style={{ backgroundImage: 'url(' + background + ')', backgroundSize: 'cover', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box p={6} >
                        <Typography sx={{ fontSize: '30px' }}>Think Global, Act Local ERP 솔루션<br />
                            지역사회를 위한 지속 가능한 성장
                        </Typography>
                        <Typography>
                            개인사업자, 중소기업을 위한 소프트웨어 업무 효율 및 생산성 향상을 위한 선택
                        </Typography>
                    </Box>
                </Grid>

                {/* 오른쪽 부분 */}
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
                            <Typography variant="body2" gutterBottom color="textSecondary">
                                이메일과 비밀번호를 입력해주세요.
                            </Typography>

                            <form onSubmit={handleLogin} style={{ marginTop: '20px' }}>
                                <Box mb={2}>
                                    <DebounceSelect
                                        value={formData.companyId}
                                        placeholder="회사 선택"
                                        fetchInitialOptions={fetchInitialCompanyOptions}
                                        fetchSearchOptions={fetchSearchCompanyOptions}
                                        onChange={handleCompanyChange}
                                        style={{ width: '100%', height: '56px' }}
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                    <Typography variant="body2" mt={2}>
                                        암호를 잊으셨나요? <Link href="../pages#" onClick={() => {
                                        notification.error({
                                            message: '미구현 기능',
                                            description: (
                                                <>
                                                    이 기능은 현재 준비 중입니다.<br />
                                                    추가 정보나 업데이트는{' '}
                                                    <a href="https://github.com/wjdn154/ERPSystem" target="_blank" rel="noopener noreferrer">
                                                        여기를 클릭
                                                    </a>
                                                    에서 확인하실 수 있습니다.
                                                </>
                                            ),
                                            placement: 'top',
                                        });
                                    }}>
                                        비밀번호 찾기
                                    </Link>
                                    </Typography>
                                    <Typography variant="body2" mt={2}>
                                        계정이 없으신가요? <Link href="/register">회원가입</Link>
                                    </Typography>
                                    </Box>
                                    <Button htmlType="submit" type="primary" style={{ width: '100px', height: '45px', fontSize: '1rem' }} >
                                        로그인
                                    </Button>
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