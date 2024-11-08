import {useEffect, useMemo, useState, useRef} from "react";
import axios from "axios";
const { confirm } = Modal;
import {
    fetchEquipmentData,
    fetchEquipmentDataDetail,
    updateEquipmentDataDetail,
    saveEquipmentDataDetail,
    deleteEquipmentDataDetail
} from "./EquipmentDataApi.jsx";
import {deleteMaterialData, fetchMaterialDataList} from "../material_data_management/MaterialDataApi.jsx";
import {Modal} from "antd";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";

export const equipmentDataHook = (initialData) => {

    const [data, setData] = useState(initialData);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);    //선택된 행
    const [equipmentDataDetail, setEquipmentDataDetail] = useState(null);   //상세정보
    const [isInsertModalVisible, setIsInsertModalVisible] = useState(false); //삭제 모달 상태
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false); //수정 모달 상태
    const notify = useNotificationContext(); // 알림 컨텍스트 사용


    const equipmentMemoizedData = useMemo(() => data, [data]);

    //데이터가 변경될 때마다 컴포넌트를 새로 렌더링
    useEffect(() => {
        if (equipmentDataDetail) {
            setShowDetail(true);
        } else {
            setShowDetail(false);
        }
    }, [equipmentDataDetail]);

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

    // 행 선택 시 설비정보 상세 정보를 가져오는 로직
    const handleSelectedRow = async (selectedRow) => {
        
        if(!selectedRow) return;
        setSelectedRow(selectedRow);
        setShowDetail(false);   //상세정보 로딩중일때 기존 상세정보 숨기기

        try {
            const detail = await fetchEquipmentDataDetail(selectedRow.id);     //비동기 api 호출
            // 원래 설비 번호를 따로 저장 (originalEquipmentNum)
            setEquipmentDataDetail({
                ...detail,
                originalEquipmentNum: detail.equipmentNum  // 원래 설비번호 저장
            });

        } catch (error) {
            notify('error', '조회 실패', 'API에서 데이터를 가져오는 중 오류 발생', 'top');
        }
    };

    //필드의 값이 변경될 때 호출되는 함수
    const handleInputChange = (e, key) => {
        const value = e.target.value;

        setEquipmentDataDetail(prevState => ({
            ...prevState,
            [key] : value,
        }));

    }
    //등록 버튼 누를 시 값 초기화되는 함수
    const handleOpenInsertModal=() => {
        setIsInsertModalVisible(true);
        setEquipmentDataDetail({  // 모든 필드를 초기화
            workcenterCode: '',
            factoryCode: '',
            equipmentNum: '',
            equipmentName: '',
            modelName: '',
            equipmentType: '',
            manufacturer: '',
            purchaseDate: null,
            installDate: null,
            operationStatus: '',
            cost: '',
            imagePath: ''
        });
    };

    // 저장 버튼 클릭 시 실행되는 함수
    const handleSave = async () => {
        try {
            
            await saveEquipmentDataDetail(equipmentDataDetail);
            const savedData = await fetchEquipmentData();
            notify('success', '설비 등록', '설비 등록 성공', 'bottomRight')
            setData(savedData);
        } catch (error) {
            notify('error', '등록 실패', '데이터 등록 중 오류가 발생했습니다.', 'top');
        }
    };

    // 비용 입력 시 숫자만 허용
    const handleCostInput = (e) => {
        const regex = /^[0-9\b]+$/; // 숫자와 백스페이스만 허용
        if (!regex.test(e.key)) {
            window.alert("비용 입력시 숫자만 입력하세요");
            setTimeout(() => costRef.current.focus(), 0);
        }
    };


    //삭제 버튼 선택 클릭 시 실행되는 함수
    const handleDelete = async () => {
        confirm({
            title: '삭제 확인',
            content: '정말로 삭제하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                try{
                    await deleteEquipmentDataDetail(equipmentDataDetail.id);
                    const deletedData = await fetchEquipmentData();
                    notify('success', '삭제 성공', '설비 정보 삭제 성공', 'bottomRight');
                    setData(deletedData);
                    // 선택된 행 초기화 및 상세보기 숨기기
                    setSelectedRow(null);
                }catch (error){
                    notify('error', '삭제 실패', '데이터 삭제 중 오류가 발생했습니다.', 'top');
                }
            }
        })
    }

    return {
        data,
        showDetail,
        setShowDetail,
        selectedRow,
        handleSelectedRow,
        handleRowSelection,
        equipmentDataDetail,
        setEquipmentDataDetail,
        handleInputChange,
        handleSave,
        handleDelete,
        isInsertModalVisible,
        isUpdateModalVisible,
        handleOpenInsertModal,
        handleCostInput,
        setData
    };

};




