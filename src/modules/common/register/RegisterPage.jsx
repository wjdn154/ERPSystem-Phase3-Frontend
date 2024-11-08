import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Box, TextField, Typography, Grid, Paper, Link, CircularProgress } from "@mui/material";
import {Alert, Button} from "antd";
import { COMMON_API } from "../../../config/apiConstants.jsx";
import background from "../../../assets/img/background3.png";
import DebounceSelect from '../../../components/DebounceSelect.jsx';
import {useNotificationContext} from "../../../config/NotificationContext.jsx";
import apiClient from "../../../config/apiClient.jsx"; // DebounceSelect 컴포넌트 import

const Register = () => {
    const notify = useNotificationContext();
    const [registerError, setRegisterError] = useState('');  // 에러 메시지를 저장할 상태
    const navigate = useNavigate();

    // 하나의 state로 관리
    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        userNickname: '',
        companyId: null,
    });

    useEffect(() => {
        if(registerError) {
            // notify('error', '회원가입 실패', registerError, 'top');
            notify('warning', '회원가입 실패', '사용자를 등록한 후 회원가입 할 수 있습니다.', 'bottomRight');
            setRegisterError('');
        }
    }, [registerError]);

    // 초기값 API 호출
    const fetchInitialCompanyOptions = async () => {
        try {
            const response = await apiClient.post(COMMON_API.COMPANY_LIST_API);  // 초기값 API
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
            const response = await apiClient.post(COMMON_API.COMPANY_SEARCH_API, { searchText });  // 검색 API
            return response.data.map((company) => ({
                label: company.name,
                value: company.id
            }));
        } catch (error) {
            console.error('회사 검색 중 오류 발생', error);
            return [];
        }
    };

    // 입력값 업데이트 함수
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    // 회사 선택 시 업데이트
    const handleCompanyChange = (newValue) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            companyId: newValue,
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await apiClient.post(COMMON_API.REGISTER_API, formData);
            navigate('/login', { state: { registered: true} });
        } catch (error) {
            setRegisterError(error.response.data);
        }
    };

    return (
        <Grid container style={{ height: '100vh' }}>
            {/* 왼쪽 부분 */}
            <Grid item xs={12} md={4} style={{ backgroundImage: 'url(' + background + ')', backgroundSize: 'cover', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box p={6}>
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
                        <Typography variant="h4" gutterBottom>회원가입</Typography>
                        <Typography variant="body2" gutterBottom color="textSecondary">
                            필요한 정보를 입력해주세요.
                        </Typography>

                        <form onSubmit={handleRegister} style={{ marginTop: '20px' }}>
                            <Box mb={2}>
                                <DebounceSelect
                                    value={formData.companyId}
                                    placeholder="회사 선택"
                                    fetchInitialOptions={fetchInitialCompanyOptions}  // 초기값 호출 API
                                    fetchSearchOptions={fetchSearchCompanyOptions}    // 검색 API
                                    onChange={handleCompanyChange}
                                    style={{ width: '100%', height: '56px' }}
                                />
                            </Box>
                            <Box mb={2}>
                                <TextField
                                    label="닉네임"
                                    name="userNickname"
                                    value={formData.userNickname}
                                    variant="outlined"
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
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
                            <Box mb={2}>
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
                                <Typography variant="body2" mt={2}>
                                    계정이 있으신가요? <Link href="/login">로그인</Link>
                                </Typography>
                                <Button htmlType="submit" type="primary" style={{ width: '100px', height: '45px', fontSize: '1rem' }} >
                                    회원가입
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};

export default Register;