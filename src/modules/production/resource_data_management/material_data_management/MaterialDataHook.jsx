import {useEffect, useMemo, useState, useRef} from "react";
import axios from "axios";
const { confirm } = Modal;
import {
    fetchMaterialDetail,
    fetchMaterialDataList,
    updateMaterialData,
    saveMaterialData,
    deleteMaterialData,
    fetchProductMaterialList,
    updateMaterialProductList,
    deleteMaterialProduct,
    fetchHazardousMaterialList,
    updateMaterialHazardousList
} from "./MaterialDataApi.jsx";
import {Modal, notification} from "antd";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";

export const materialDataHook = (initialData) => {

    const [data, setData] = useState(initialData);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);    //선택된 행
    const [materialDataDetail, setMaterialDataDetail] = useState({product:[], hazardousMaterial:[]});   //상세정보
    const [isInsertModalVisible, setIsInsertModalVisible] = useState(false); //삭제 모달 상태
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false); //수정 모달 상태
    const [activeTabKey, setActiveTabKey] = useState('1'); // tabs state


    const hazardousMaterialMemoizedData = useMemo(() => data, [data]);
    const [selectedMaterialId, setSelectedMaterialId] = useState(null);
    const [filteredProductData, setFilteredProductData] = useState([]);
    const [filterHazardousData, setFilterHazardousData] = useState([]);
    const [selectedProductCode, setSelectedProductCode] = useState(null);
    const notify = useNotificationContext(); // 알림 컨텍스트 사용

    //데이터가 변경될 때마다 컴포넌트를 새로 렌더링
    useEffect(() => {
        if (materialDataDetail) {
            setShowDetail(true);
        } else {
            setShowDetail(false);
        }
    }, [materialDataDetail]);

    useEffect(() => {
        if(materialDataDetail && materialDataDetail.product && materialDataDetail.hazardousMaterial){
            setFilteredProductData(materialDataDetail.product);
            setFilterHazardousData(materialDataDetail.hazardousMaterial);
        }
    }, [materialDataDetail]);

    // 행 선택 핸들러 설정
    const handleRowSelection =  {
        type:'radio',
        selectedRowKeys: selectedRow ? [selectedRow.id] : [],
        onChange: (selectedRowKeys, selectedRows) => {
            if (selectedRows.length > 0) {
                handleSelectedRow(selectedRows[0]);
            } else{
                console.warn("비어있음.");
            }
        },
    };

    // 행 선택 시 자재 상세 정보를 가져오는 로직
    const handleSelectedRow = async (selectedRow) => {

        if(!selectedRow) return;
        setSelectedRow(selectedRow);
        setShowDetail(false);   //상세정보 로딩중일때 기존 상세정보 숨기기

        try {
            const detail = await fetchMaterialDetail(selectedRow.id);     //비동기 api 호출
            //'detail'이 제대로 받아졌는지 확인하기
            if(!detail) {
                notify('error', '조회 실패', 'api로부터 유효한 상세정보를 받지 못했습니다.', 'top');
                return;
            }
            // 원래 유해물질 코드 따로 저장
            setMaterialDataDetail({
                ...detail,
                originMaterialCode: detail.materialCode  // 원래 유해물질 코드 저장
            });

        } catch (error) {
            notify('error', '조회 실패', 'api로부터 유효한 상세정보를 받지 못했습니다.', 'top');
        }
    };

    //자재 리스트에서 행을 클릭할 때 호출되는 함수
    const onMaterialRowClick = (record) => {
        setSelectedMaterialId(record.id);
        handleSelectedRow(record);  //비동기 데이터 가져오기 작업 수행
    }

    //필드의 값이 변경될 때 호출되는 함수
    const handleInputChange = (e, key) => {
        const value = e.target.value;

        setMaterialDataDetail(prevState => ({
            ...prevState,
            [key] : value,
        }));

    }
    //등록 버튼 누를 시 값 초기화되는 함수
    const handleOpenInsertModal=() => {
        setIsInsertModalVisible(true);
        setMaterialDataDetail({  // 모든 필드를 초기화
            materialCode: '',
            materialName: '',
            materialType: '',
            stockQuantity: '',
            purchasePrice: '',
            representativeCode: '',
            representativeName: '',
            hazardousMaterialQuantity: ''
        });
    };

    // 저장 버튼 클릭 시 실행되는 함수
    const handleSave = async () => {
        try {
            await saveMaterialData(materialDataDetail);
            const savedData = await fetchMaterialDataList();  //등록 후 새로운 리스트 반환
            notify('success', '자재 등록', '자재 등록 성공', 'bottomRight')
            setIsInsertModalVisible(false);
            setData(savedData);
        } catch (error) {
            notify('error', '등록 실패', '데이터 등록 중 오류가 발생했습니다.', 'top');
        }
    };


    // 수정 버튼 클릭 시 실행되는 함수
    const handleUpdate = async () => {
        try {
            const updateData = {
                ...materialDataDetail,
                product: filteredProductData,
                hazardousMaterial: filterHazardousData,
            };

            await updateMaterialData(updateData.id, updateData);
            const updatedData = await fetchMaterialDataList();
            notify('success', '자재 수정', '자재 수정 성공', 'bottomRight')
            setData(updatedData);
            setShowDetail(false);
        } catch (error) {
            notify('error', '수정 실패', '데이터 수정 중 오류가 발생했습니다.', 'top');
        }
    }


    //삭제 버튼 선택 클릭 시 실행되는 함수
    const handleDelete = async () => {

        confirm({
            title: '삭제 확인',
            content: '정말로 삭제하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                if(materialDataDetail && materialDataDetail.id){
                    try{
                       await deleteMaterialData(materialDataDetail.id);
                        const deletedData = await fetchMaterialDataList();
                        notify('success', '삭제 성공', '자재 삭제 성공.', 'bottomRight');
                        setData(deletedData);
                        // 선택된 행 초기화 및 상세보기 숨기기
                        setSelectedRow(null);
                    }catch (error){
                        notify('error', '삭제 실패', '데이터 삭제 중 오류가 발생했습니다.', 'top');
                    }
                }
            }
        })

    }

    //탭 누를 시 화면 전환
    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    // 품목 리스트에서 행을 클릭할 때 호출되는 함수
    const onProductRowClick = (record) => {
        setSelectedProductCode(record.productCode);
    };


    return {
        data,
        showDetail,
        selectedRow,
        handleSelectedRow,
        handleRowSelection,
        materialDataDetail,
        setMaterialDataDetail,
        handleInputChange,
        handleSave,
        handleUpdate,
        handleDelete,
        isInsertModalVisible,
        isUpdateModalVisible,
        handleOpenInsertModal,
        activeTabKey,
        handleTabChange,
        filteredProductData,
        setFilteredProductData,
        filterHazardousData,
        setFilterHazardousData,
        onMaterialRowClick,
        onProductRowClick,

    };

};




