import React, {useState, useEffect} from "react";
import {Modal, Input, Select} from "antd";
import apiClient from "../../../../config/apiClient.jsx";
import {LOGISTICS_API} from "../../../../config/apiConstants.jsx";

const {Option} = Select;

const ProductAddModal = ({visible, onCancel, onOk})=> {
    const [productCode, setProductCode] = useState('');
    const [productName, setProductName] = useState('');
    const [productList, setProductList] = useState('');

    //api로부터 품목 데이터를 가져오는 함수
    useEffect(() => {
        const fetchProductList = async () => {
            try {
                const response = await apiClient.post(LOGISTICS_API.PRODUCT_LIST_API);
            }catch (error){
                console.error("자재 리스트를 가져오는 중 오류 발생 : " + error);
                throw error;
            }
            setProductList(fetchProductList);
        };
        fetchProductList();
    }, []);
}