import axios from "axios";
import {EMPLOYEE_API} from "../../../../../config/apiConstants.jsx";
import apiClient from "../../../../../../config/apiClient.jsx";

// 사용자 기본 호출 함수
export const fetchUsersData = async () => {
    try{
        const response = await apiClient.post(EMPLOYEE_API.USERS_DATA_API);
        return response.data;
    } catch(error){
        console.error("사용자 정보를 가져오는 중 오류 발생 : " + error);
        throw error;
    }
}

export const fetchUsersDataDetail = async (id) => {}