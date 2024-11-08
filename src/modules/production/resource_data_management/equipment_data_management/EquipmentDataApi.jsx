import axios from "axios";
import {PRODUCTION_API} from "../../../../config/apiConstants.jsx";
import apiClient from "../../../../config/apiClient.jsx";

//설비정보 기본 호출 함수
export const fetchEquipmentData = async () => {
    try {
        const response = await apiClient.post(PRODUCTION_API.EQUIPMENT_DATA_API);
        console.log("설비 호출 성공",response.data);
        return response.data;
    }catch (error){
        console.error("설비 정보를 가져오는 중 오류 발생 : " + error);
        throw error;
    }
};

//설비정보 상세 호출 함수
export const fetchEquipmentDataDetail = async (id) => {
    try {
        const response = await apiClient.post(PRODUCTION_API.EQUIPMENT_DATA_DETAIL_API(id));
        return response.data;
    } catch (error){
        console.error("설비 상세 정보를 가져오는 중 오류 발생 : " + error);
        throw error;
    }
};

//설비정보 등록 함수
export const saveEquipmentDataDetail = async (equipmentDataDetail) => {
    try {
        await apiClient.post(PRODUCTION_API.SAVE_EQUIPMENT_DATA_API, equipmentDataDetail);
    }catch (error){
        if (error.response) {
            // 서버 응답 오류 처리
            console.error("서버 응답 오류:", error.response.status, error.response.data);
        } else if (error.request) {
            // 요청이 만들어졌으나 응답을 받지 못한 경우
            console.error("요청에 대한 응답이 없습니다:", error.request);
        } else {
            // 요청 설정 중 오류 발생
            console.error("설비정보를 등록하는 중 오류 발생:", error.message);
        }
        throw error;
    }
}

//설비정보 수정 함수
export const updateEquipmentDataDetail = async (id , formData) => {
    console.log('api 정보 : ',id,formData);
    try {
        // axios 요청의 결과를 response에 저장
        const response = await apiClient.put(
            PRODUCTION_API.UPDATE_EQUIPMENT_DATA_API(id),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
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

//설비정보 삭제 함수
export const deleteEquipmentDataDetail = async (id) => {
    try {
        await apiClient.delete(PRODUCTION_API.DELETE_EQUIPMENT_DATA_API(id));
    }catch (error){
        console.error("설비정보를 삭제하는 중 오류 발생 : " + error);
        throw error;
    }
}