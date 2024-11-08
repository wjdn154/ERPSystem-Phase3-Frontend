import {useEffect, useMemo, useState, useRef} from "react";
import axios from "axios";
import {
    fetchWorkerList,
    fetchWorkerDetail,
    updateWorkerDetail,
    fetchWorkerAttendanceAssignmentList
} from "./WorkerApi.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";

export const workerHook = (initialData) => {

    const [data, setData] = useState(initialData);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);    //선택된 행
    const [workerDetail, setWorkerDetail] = useState(null);   //상세정보
    const [workerAttendanceDetail, setWorkerAttendanceDetail] = useState(null);   //작업배치, 근태 목록
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false); //수정 모달 상태
    const [activeTabKey, setActiveTabKey] = useState('1'); // tabs state
    const notify = useNotificationContext(); // 알림 컨텍스트 사용

    const workerMemoizedData = useMemo(() => data, [data]);

    console.log(initialData);
    console.log(workerDetail);

    //데이터가 변경될 때마다 컴포넌트를 새로 렌더링
    useEffect(() => {
        if (workerDetail || workerAttendanceDetail) {
            setShowDetail(true);
        } else {
            console.log("workerDetail이 null입니다.");
            setShowDetail(false);
        }
    }, [workerDetail, workerAttendanceDetail]);


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
    
    //탭 누를 시 화면 전환
    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };
    
    // 행 선택 시 작업자 상세 정보를 가져오는 로직
    const handleSelectedRow = async (selectedRow) => {

        if(!selectedRow) return;

        setSelectedRow(selectedRow);
        setShowDetail(false);   //상세정보 로딩중일때 기존 상세정보 숨기기

        try {
            const detail = await fetchWorkerDetail(selectedRow.id);     //비동기 api 호출
            setWorkerDetail({
                ...detail,
                originalEmployeeNumber: detail.employeeNumber  // 원래 사원번호 저장
            });
            showUpdateModal();
        } catch (error) {
            notify('error', '수정 실패', 'API에서 데이터를 가져오는 중 오류 발생.', 'top');
        }
    };

    // 행 선택 시 작업배치 및 근태 목록을 가져오는 로직
    const handleSelectedAttendanceRow = async (selectedRow) => {

        if(!selectedRow) return;

        setSelectedRow(selectedRow);
        setShowDetail(false);   //상세정보 로딩중일때 기존 상세정보 숨기기

        try {
            const detail = await fetchWorkerAttendanceAssignmentList(selectedRow.id);     //비동기 api 호출
            setWorkerAttendanceDetail({
                ...detail
            });
            showUpdateModal();
        } catch (error) {
            notify('error', '수정 실패', 'API에서 데이터를 가져오는 중 오류 발생.', 'top');
        }
    };

    //필드의 값이 변경될 때 호출되는 함수
    const handleInputChange = (e, key) => {
        const value = e.target.value;

        setWorkerDetail(prevState => ({
            ...prevState,
            [key] : value,
        }));

    }

    //수정 버튼 클릭 시 모달창 띄우는 함수
    const showUpdateModal = () => {
        setIsUpdateModalVisible(true);
    };

    const handleUpdateCancel = () => {
        setIsUpdateModalVisible(false);
    };

    // 수정 버튼 클릭 시 실행되는 함수
    const handleUpdate = async () => {
        try {

            await updateWorkerDetail(workerDetail.id, workerDetail);
            const updatedData = await fetchWorkerList();
            notify('success', '안전교육 이수 여부 수정', '안전교육 이수 여부 수정 성공', 'bottomRight')
            setData(updatedData);
            setShowDetail(false);
        } catch (error) {
            notify('error', '수정 실패', '데이터 수정 중 오류가 발생했습니다.', 'top');
        }
    };


    return {
        data,
        showDetail,
        selectedRow,
        handleSelectedRow,
        handleRowSelection,
        workerDetail,
        setWorkerDetail,
        handleInputChange,
        showUpdateModal,
        handleUpdateCancel,
        isUpdateModalVisible,
        activeTabKey,
        handleTabChange,
        handleSelectedAttendanceRow,
        setWorkerAttendanceDetail,
        workerAttendanceDetail,
        handleUpdate,

    };

};




