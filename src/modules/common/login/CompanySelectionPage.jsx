import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DebounceSelect from "../../../components/DebounceSelect.jsx"; // 경로에 맞게 수정
import { COMMON_API } from "../../../config/apiConstants.jsx";
import apiClient from "../../../config/apiClient.jsx";
import { Box, Button, Typography } from "@mui/material";
import { useDispatch ,useSelector} from "react-redux";
import { setAuth } from "../../../config/redux/authSlice.jsx";
import Cookies from "js-cookie";
import {useNotificationContext} from "../../../config/NotificationContext.jsx";



const CompanySelectionPage = () => {
    const notify = useNotificationContext();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState(null); // 에러 상태 관리

    const [formData, setFormData] = useState({
        companyId: null,
    });

    // 로컬 스토리지에서 인증 코드 가져오기
    const code = localStorage.getItem("authCode");

    if(!code){
        console.log("인증 코드가 없습니다.");
        navigate("/error");
    }

    //회사 목록 불러오기
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

    // 회사 선택 시 상태 업데이트
    const handleCompanyChange = (newValue) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            companyId: newValue,
        }));
    };

        const handleCompanySelection = async () => {

            if (!formData.companyId) {
                alert("회사를 선택해주세요.");
                return;
            }

            try {
                console.log("백엔드 요청 데이터:", formData);
                // 회사 ID와 사용자 정보를 백엔드로 전송
                const response = await apiClient.post(COMMON_API.GOOGLE_LOGIN_API, {
                    code,
                    companyId: formData.companyId,
                });

                console.log("백엔드 응답 데이터:", response.data);

                const { token, permission, isAdmin } = response.data;

                // JWT 토큰을 쿠키에 저장 (만료 기간 1일)
                Cookies.set('jwt', token, { expires: 1 });
                Cookies.set('refreshToken', token, { expires: 7 });
                // Redux 상태 업데이트 (JWT 토큰 및 권한 정보 저장)
                dispatch(setAuth({ token, permission, isAdmin }));

                // 구글 로그인 성공 시 메인 페이지로 이동
                navigate('/integration', { state: { login: true } });
            } catch (error) {
                console.error('회사 선택 중 오류 발생:', error);
                notify('error', '구글 로그인 실패', error.response.data, 'top');
            }
        };


        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
                <Typography variant="h5">회사를 선택하세요</Typography>
                {error && (
                    <Typography variant="body1" color="error" gutterBottom>
                        {error}
                    </Typography>
                )}
                <Box mb={2}  width="300px">
                    <DebounceSelect
                        value={formData.companyId}
                        placeholder="회사 선택"
                        fetchInitialOptions={fetchInitialCompanyOptions}
                        fetchSearchOptions={fetchSearchCompanyOptions}
                        onChange={handleCompanyChange}
                        style={{ width: '100%', height: '56px' }}
                    />
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCompanySelection}
                    sx={{mt: 4, width: '100%', maxWidth: '300px'}}
                >
                    선택완료
                </Button>
            </Box>
        );
};
export default CompanySelectionPage;