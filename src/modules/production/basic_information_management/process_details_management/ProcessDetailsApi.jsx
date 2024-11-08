import axios from 'axios';
import { PRODUCTION_API } from '../../../../config/apiConstants.jsx';
import apiClient from "../../../../config/apiClient.jsx";

// 공정 상세 정보 목록 조회 함수
export const fetchProcessDetails = async () => {
    console.log("fetchProcessDetails 호출됨"); // 추가된 로그
    try {
        const response = await apiClient.post(PRODUCTION_API.PROCESS_LIST_API);
        console.log("응답 데이터:", response.data); // 응답 데이터 확인용 로그
        return response.data;
    } catch (error) {
        console.error("공정 정보를 가져오는 중 오류 발생:", error);
        throw error;
    }
};


// 특정 코드로 공정 상세 정보 조회 함수
export const fetchProcessDetail = async (code) => {
    try {
        const response = await apiClient.post(PRODUCTION_API.PROCESS_DETAILS_API(code));
        console.log("코드로 상세 정보 조회 데이터 로그: ", response.data)
        return response.data;
    } catch (error) {
        console.error("공정 상세 정보를 가져오는 중 오류 발생:", error);
        throw error;
    }
};

// 공정 정보 생성 함수
export const createProcessDetail = async (processDetail) => {
    try {
        const response = await apiClient.post(PRODUCTION_API.SAVE_PROCESS_API, processDetail);
        return response.data;
    } catch (error) {
        console.error("공정 정보를 생성하는 중 오류 발생:", error);
        throw error;
    }
};

// 공정 정보 수정 함수
export const updateProcessDetail = async (code, processDetail) => {
    try {
        const response = await apiClient.post(PRODUCTION_API.UPDATE_PROCESS_API(code), processDetail);
        return response.data;
    } catch (error) {
        console.error("공정 정보를 업데이트 하는 중 오류 발생:", error);
        throw error;
    }
};

// 공정 정보 삭제 함수
export const deleteProcessDetail = async (code) => {
    try {
        const response = await apiClient.post(PRODUCTION_API.DELETE_PROCESS_API(code));
        return response.data;
    } catch (error) {
        // 백엔드에서 반환된 오류 메시지 추출
        const errorMessage = error.response?.data?.message || '삭제 중 오류가 발생했습니다.';
        throw new Error(errorMessage);
    }
};

// 공정 이름으로 검색하는 함수
export const searchProcessDetails = async (name) => {
    try {
        const response = await apiClient.post(PRODUCTION_API.PROCESS_SEARCH_API(name));
        return response.data;
    } catch (error) {
        console.error("공정 정보를 검색하는 중 오류 발생:", error);
        throw error;
    }
};
