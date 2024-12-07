import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { COMMON_API } from "../../../config/apiConstants.jsx";
import apiClient from "../../../config/apiClient.jsx";
import {Box, Button, FormHelperText, MenuItem, Typography} from "@mui/material";
import { useDispatch } from "react-redux";
import { setAuth } from "../../../config/redux/authSlice.jsx";

const CompanySelection = () => {
    const navigate = useNavigate();
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [companyList, setCompanyList] = useState([]); // 회사 목록 저장
    const [error, setError] = useState(null); // 에러 상태 관리
    const dispatch = useDispatch();

    // 초기 회사 목록 API 호출
    const fetchInitialCompanyOptions = async () => {
        setError(null);
        try {
            const response = await apiClient.post(COMMON_API.COMPANY_LIST_API);
            const options = response.data.map((company) => ({
                label: company.name,
                value: company.id,
            }));
            setCompanyList(options); // 회사 목록 업데이트
        } catch (error) {
            console.error("초기 회사 목록을 불러오는 중 오류 발생", error);
            setError("회사 목록을 불러오는 중 문제가 발생했습니다.");
        }
    };

    const handleCompanySelection = async () => {
        console.log("선택 완료 버튼 클릭 시 selectedCompany 상태:", selectedCompany);
        if (!selectedCompany || typeof selectedCompany !== "object") {
            alert("회사를 선택해주세요.");
            console.error("회사 선택이 없습니다. selectedCompany:", selectedCompany);
            return;
        }

        // 구글에서 받은 ID 토큰을 가져옵니다.
        const googleIdToken = localStorage.getItem("idToken");
        if (!googleIdToken) {
            console.log("id 토큰이 없습니다.");
            alert("구글 로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        try {
            // 토큰 만료 시간 검증
            const tokenPayload = JSON.parse(atob(googleIdToken.split(".")[1]));
            const expirationTime = new Date(tokenPayload.exp * 1000);
            const currentTime = new Date();
            console.log("현재 시간:", currentTime);
            console.log("토큰 만료 시간:", expirationTime);

            if (currentTime > expirationTime) {
                alert("토큰이 만료되었습니다. 다시 로그인해주세요.");
                navigate("/login");
                return;
            }

            console.log("회사 ID:", selectedCompany.value);
            console.log("전송된 토큰:", googleIdToken);
            console.log("전송된 데이터:", {
                googleIdToken,
                companyId: selectedCompany.value,
            });

            // 회사 ID와 구글 ID 토큰을 서버로 전송
            const response = await apiClient.post(
                COMMON_API.GOOGLE_LOGIN_API,
                {
                    googleIdToken,
                    companyId: selectedCompany.value,
                },
                {
                    headers: {
                        Authorization: `Bearer ${googleIdToken}`,
                    },
                }
            );

            console.log("로그인 성공:", response.data);

            // 응답 데이터를 저장
            const { token, refreshToken, permission, isAdmin } = response.data;
            localStorage.setItem("jwt", token);
            localStorage.setItem("refreshToken", refreshToken);

            // Redux 상태 업데이트
            dispatch(setAuth({ token, permission, isAdmin }));
            console.log("Redux로 전달된 상태:", { token, permission, isAdmin });

            // 통합 페이지로 이동
            navigate("/integration");
        } catch (error) {
            console.error("서버 오류 발생:", error?.response?.data || error.message);

            // 구체적인 에러 메시지 제공
            const errorMessage =
                error?.response?.data?.message || "로그인 중 문제가 발생했습니다. 다시 시도해주세요.";
            alert(errorMessage);
        }
    };

    useEffect(() => {
        fetchInitialCompanyOptions();
    }, []);

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100vh"
            sx={{ backgroundColor: "#f5f5f5" }} // 배경 스타일

        >
            <Typography variant="h4" gutterBottom>
                회사 선택
            </Typography>
            {error && (
                <Typography variant="body1" color="error" gutterBottom>
                    {error}
                </Typography>
            )}
            <Box mb={3} width="300px">
                <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    displayEmpty
                    fullWidth
                    sx={{ backgroundColor: "#ffffff", borderRadius: "4px" }}
                >
                    <MenuItem value="" disabled>
                        회사를 선택하세요
                    </MenuItem>
                    {companyList.map((company) => (
                        <MenuItem key={company.value} value={company.value}>
                            {company.label}
                        </MenuItem>
                    ))}
                </select>
            <FormHelperText>
                {selectedCompany ? "" : "회사 목록에서 선택해주세요."}
            </FormHelperText>
        </Box>
        <Button
            variant="contained"
            color="primary"
            onClick={handleCompanySelection}
            fullWidth
            disabled={!selectedCompany}
        >
            선택 완료
        </Button>
        </Box>
    );
};

export default CompanySelection;
