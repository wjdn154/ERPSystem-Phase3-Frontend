import { useDispatch } from "react-redux";
import {logout, setAuth} from "../../../config/redux/authSlice.jsx";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginPage from "./LoginPage.jsx";


const CompanySelectionPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [companyOptions, setCompanyOptions] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        const fetchCompanyOptions = async () => {
            try {
                const response = await axios.post(COMMON_API.COMPANY_LIST_API);
                setCompanyOptions(response.data.map((company) => ({
                    label: company.name,
                    value: company.id,
                })));
            } catch (error) {
                console.error('회사 목록을 불러오는 중 오류 발생:', error);
            }
        };

        fetchCompanyOptions();
    }, []);

    const handleCompanySelection = async () => {
        if (!selectedCompany) {
            alert("회사를 선택해주세요.");
            return;
        }

        try {
            // Redux 상태 업데이트
            dispatch(setAuth({ companyId: selectedCompany.value }));

            // 메인 페이지로 이동
            navigate('/integration');
        } catch (error) {
            console.error('회사 선택 중 오류 발생:', error);
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
            <Typography variant="h5">회사를 선택하세요</Typography>
            <Box mt={4} width="100%" maxWidth="400px">
                <DebounceSelect
                    value={selectedCompany}
                    placeholder="회사 선택"
                    fetchInitialOptions={companyOptions}
                    onChange={(value) => setSelectedCompany(value)}
                    style={{ width: '100%', height: '56px' }}
                />
            </Box>
            <Button
                variant="contained"
                color="primary"
                onClick={handleCompanySelection}
                sx={{ mt: 4, width: '100%', maxWidth: '400px' }}
            >
                다음
            </Button>
        </Box>
    );
};
export default CompanySelectionPage;