import axios from "axios";
import {PRODUCTION_API} from "../../../../config/apiConstants.jsx";
import apiClient from "../../../../config/apiClient.jsx";

//작업자 정보 기본 호출 함수
export const fetchWorkerList = async () => {
    try {
        const response = await apiClient.post(PRODUCTION_API.WORKER_LIST_API);
        return response.data;
    }catch (error){
        console.error("작업자 목록을 가져오는 중 오류 발생 : " + error);
        throw error;
    }
};

//작업자 정보 상세 호출 함수
export const fetchWorkerDetail = async (id) => {
    try {
        const response = await apiClient.post(PRODUCTION_API.WORKER_DETAIL_API(id));
        console.log(response);
        return response.data;
    } catch (error){
        console.error("작업자 상세 정보를 가져오는 중 오류 발생 : " + error);
        throw error;
    }
};

//작업자 정보 수정 함수
export const updateWorkerDetail = async (id , workerDetail) => {
    console.log('api 정보 : ',id,workerDetail);
    try {
        // axios 요청의 결과를 response에 저장
        const response = await apiClient.put(
            PRODUCTION_API.UPDATE_WORKER_DETAIL_API(id),
            workerDetail
        );

        // 응답 데이터 출력
        console.log('응답 데이터:', response.data);
    } catch (error) {
        console.error('API에서 데이터를 수정하는 중 오류 발생:', error);
        if (error.response) {
            console.error('서버 응답 오류:', error.response.status);
            console.error('서버 응답 데이터:', error.response.data);
        } else if (error.request) {
            console.error('응답이 없습니다. 요청 정보:', error.request);
        } else {
            console.error('오류 메시지:', error.message);
        }
        throw error;
    }
};

//작업자 작업배치 및 근태 목록 조회
export const fetchWorkerAttendanceAssignmentList = async (id) => {
    try {
        const response = await apiClient.post(PRODUCTION_API.WORKER_ATTENDANCE_ASSIGNMENT_LIST_API(id));
        return response.data;
    }catch (error){
        console.error("작업자 작업배치 및 근태 목록을 가져오는 중 오류 발생 : " + error);
        throw error;
    }
};

