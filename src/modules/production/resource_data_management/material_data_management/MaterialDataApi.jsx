import axios from "axios";
import {PRODUCTION_API} from "../../../../config/apiConstants.jsx";
import apiClient from "../../../../config/apiClient.jsx";

//자재 리스트 호출 함수
export const fetchMaterialDataList = async () => {
    try {
        const response = await apiClient.post(PRODUCTION_API.MATERIAL_LIST_API);
        return response.data;
    }catch (error){
        console.error("자재 리스트를 가져오는 중 오류 발생 : " + error);
        throw error;
    }
};

//특정 자제 조회 함수
export const fetchMaterialDetail = async (id) => {
    try {
        const response = await apiClient.post(PRODUCTION_API.MATERIAL_DETAIL_API(id));

        console.log('response.data : ', response.data);
        return response.data;
    } catch (error) {
        console.error("해당 자재 정보를 가져오는 중 오류 발생 : " + error);
        throw error;
    }
};


//자재 정보 등록 함수
export const saveMaterialData = async (materialDataDetail) => {
    try {
        await apiClient.post(PRODUCTION_API.SAVE_MATERIAL_DETAIL_API, materialDataDetail);
    }catch (error){
        if (error.response) {
            // 서버 응답 오류 처리
            console.error("서버 응답 오류:", error.response.status, error.response.data);
        } else if (error.request) {
            // 요청이 만들어졌으나 응답을 받지 못한 경우
            console.error("요청에 대한 응답이 없습니다:", error.request);
        } else {
            // 요청 설정 중 오류 발생
            console.error("자재 정보를 등록하는 중 오류 발생:", error.message);
        }
        throw error;
    }
};

//자재 정보 수정 함수
export const updateMaterialData= async (id , materialDataDetail) => {
    console.log('api 정보 : ',id,materialDataDetail);
    try {
        // axios 요청의 결과를 response에 저장
        const response = await apiClient.put(PRODUCTION_API.UPDATE_MATERIAL_API(id), materialDataDetail);

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

//자재 정보 삭제 함수
export const deleteMaterialData = async (id) => {
    try {
        await apiClient.delete(PRODUCTION_API.DELETE_MATERIAL_API(id));
    }catch (error){
        console.error("자재 정보를 삭제하는 중 오류 발생 : " + error);
        throw error;
    }
};

//해당 자재 유해물질 목록 조회 함수
export const fetchHazardousMaterialList = async (id) => {
    try {
        const response = await apiClient.post(PRODUCTION_API.MATERIAL_HAZARDOUS_LIST_API(id));
        return response.data;
    }catch (error){
        console.error("해당 자재의 유해물질 정보를 가져오는 중 오류 발생 : " + error);
        throw error;
    }
};

//해당 자재 유해물질 리스트 추가(수정) 함수
export const updateMaterialHazardousList= async (id , materialHazardousDetail) => {
    console.log('api 정보 : ',id, materialHazardousDetail);
    try {
        // axios 요청의 결과를 response에 저장
        const response = await apiClient.post(
            PRODUCTION_API.SAVE_MATERIAL_HAZARDOUS_LIST_API(id), materialHazardousDetail
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

//해당 자재 품목 목록 조회 함수
export const fetchProductMaterialList = async (id) => {
    try {
        const response = await apiClient.post(PRODUCTION_API.MATERIAL_PRODUCT_LIST_API(id));
        return response.data;
    }catch (error){
        console.error("해당 자재의 품목 정보를 가져오는 중 오류 발생 : " + error);
        throw error;
    }
};

//해당 자재 품목 목록 추가(수정) 함수
export const updateMaterialProductList= async (id , materialProductDetail) => {
    console.log('api 정보 : ',id, materialProductDetail);
    try {
        // axios 요청의 결과를 response에 저장
        const response = await apiClient.post(
            PRODUCTION_API.SAVE_MATERIAL_PRODUCT_LIST_API(id), materialProductDetail
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

//해당 자재 품목 제거
export const deleteMaterialProduct = async (materialId, productCode) => {
    try {
        await apiClient.delete(PRODUCTION_API.DELETE_MATERIAL_PRODUCT_API(materialId, productCode));
    }catch (error){
        console.error("해당 자재 품목 정보를 제거하는 중 오류 발생 : " + error);
        throw error;
    }
};