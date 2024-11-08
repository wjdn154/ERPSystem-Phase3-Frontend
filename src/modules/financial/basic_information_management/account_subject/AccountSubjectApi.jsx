import axios from 'axios';
import { FINANCIAL_API } from '../../../../config/apiConstants.jsx';
import apiClient from "../../../../config/apiClient.jsx";

// 계정과목 기본 정보 호출 함수
export const fetchAccountSubject = async () => {
    try {
        const response = await apiClient.post(FINANCIAL_API.ACCOUNT_SUBJECTS_API);
        return response.data;
    } catch (error) {
        console.error("계정과목 정보를 가져오는 중 오류 발생:", error);
        throw error;
    }
};

// 계정과목 상세 호출 함수
export const fetchAccountSubjectDetail = async (code) => {
    try {
        const response = await apiClient.post(FINANCIAL_API.ACCOUNT_SUBJECT_DETAIL_API(code));
        return response.data;
    } catch (error) {
        console.error("계정과목 상세 정보를 가져오는 중 오류 발생:", error);
        throw error;
    }
};

// 계정과목 수정 함수
export const updateAccountSubjectDetail = async (code, accountSubjectDetail) => {
    try {
        await apiClient.put(FINANCIAL_API.UPDATE_ACCOUNT_SUBJECT_API(code),
            accountSubjectDetail
        );
    } catch (error) {
        console.error("계정과목 정보를 업데이트 하는 중 오류 발생:", error);
        throw error;
    }
};

// 적요 수정 함수
export const updateAccountSubjectMemo = async (code, accountSubjectDetail) => {
    try {
        await apiClient.put(FINANCIAL_API.UPDATE_ACCOUNT_SUBJECT_API(code),
            accountSubjectDetail
        );
    } catch (error) {
        console.error("계정과목 정보를 업데이트 하는 중 오류 발생:", error);
        throw error;
    }
};