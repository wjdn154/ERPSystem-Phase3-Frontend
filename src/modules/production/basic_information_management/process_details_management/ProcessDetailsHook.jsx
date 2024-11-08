import { useState, useEffect, useMemo } from 'react';
import {
    fetchProcessDetails,
    fetchProcessDetail,
    updateProcessDetail,
    deleteProcessDetail,
    createProcessDetail,
    searchProcessDetails,
} from './ProcessDetailsApi.jsx';
import { filterProcessDetails  } from './ProcessDetailsUtil.jsx';

import {Form, Modal} from "antd";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";


export const useProcessDetails = (initialData) => {
    const [data, setData] = useState(initialData || []);
    const [processDetail, setProcessDetail] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isProcessModalVisible, setIsProcessModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchData, setSearchData] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [activeTabKey, setActiveTabKey] = useState('1');
    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [form] = Form.useForm(); // 폼 인스턴스 생성
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태

    // 초기 데이터 로딩
    useEffect(() => {
        const loadProcessDetails = async () => {
            try {
                if (!initialData || initialData.length === 0) {
                    const fetchedData = await fetchProcessDetails();
                    console.log("로드된 데이터:", fetchedData);
                    setData(fetchedData);
                } else {
                    console.log("이미 제공된 initialData:", initialData);
                }
            } catch (error) {
                console.error("데이터 로드 중 오류 발생:", error);
            }
        };

        loadProcessDetails();
    }, [initialData]);

    // 특정 공정 세부사항 삭제 로직
    const handleDeleteProcessDetail = async (code) => {

        try {
            await deleteProcessDetail(code);

            // 성공적으로 삭제되었을 경우, 사용자에게 알리고 화면을 업데이트합니다.
            Modal.success({
                content: '삭제가 완료되었습니다.',
            });

            // 선택된 공정 세부사항이 삭제된 경우, 상세 보기 초기화
            if (processDetail && processDetail.code === code) {
                setProcessDetail(null);
            }

            // 리스트 새로고침
            const updatedDetails = await fetchProcessDetails();
            setData(updatedDetails);

        } catch (error) {
            // 백엔드에서 받은 메시지를 사용자에게 알림
            Modal.error({
                content: error.message.includes('사용 중이므로 삭제할 수 없습니다')
                    ? '해당 공정은 현재 사용 중이므로 삭제할 수 없습니다.'
                    : '삭제 중 오류가 발생했습니다. 다시 시도해주세요.',
            });
        }
    };


    // 행 선택 핸들러 설정
    const handleRowSelection = {
        type: 'radio',
        onSelect: (record) => {
            handleSelectedRow(record); // 선택된 행의 데이터를 설정하는 함수 호출
        },
    };

    // 행 선택 시 상세정보 설정
    const handleSelectedRow = async (record) => {
        try {
            const detail = await fetchProcessDetail(record.code); // API 호출
            console.log("handleSelectedRow 선택된 공정 데이터:", detail);

            if (detail) {
                setSelectedRow(detail); // 상태에 데이터 저장
                form.setFieldsValue(detail); // 폼 필드에 데이터 설정
            }
        } catch (error) {
            console.error("handleSelectedRow에서 데이터를 가져오는 중 오류 발생:", error);
        }
    };


    // Input 수정
    const handleInputChange = (e, key) => {
        let value = e.target.value;  // let을 사용하여 값 재할당 가능하도록 변경

        // 숫자 double 등 타입 처리해야 하는 필드 유효성 검사
        if (key === 'duration' || key === 'cost' || key === 'defectRate') {
            if (isNaN(value)) {
                console.error("숫자를 입력해주세요.")
                return;
            } else {
                value = parseFloat(value);
            }
        }

        // if (key === 'isOutsourced' || key === 'isUsed') {
        //     value = value === 'Y' ? true : false;
        // }


        setProcessDetail({
            ...processDetail,
            [key]: value,
        })
    }

    // handleClose
    const handleClose = (e) => {
        setIsProcessModalVisible(false);
    }

    // 새 공정 추가 핸들러
    const handleAddProcess = () => {
        setProcessDetail({
            code: '',
            name: '',
            isOutsourced: 'false',
            duration: '',
            cost: '',
            defectRate: 'false',
            isUsed: ''
        });
        setIsEditing(true);
        setIsProcessModalVisible(true);
    };

    // 클라이언트에서 필터링
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (term) => {
        try {
            setIsSearchActive(true);
            const filteredData = filterProcessDetails(data, term);
            setSearchData(filteredData);
        } catch (error) {
            console.error("검색 중 오류 발생:", error);
            setSearchData([]); // 검색 오류 시 빈 결과로 설정
        }
    };




    return {
        data,
        setData,
        processDetail,
        setProcessDetail,
        isProcessModalVisible,
        handleDeleteProcessDetail,
        handleSelectedRow,
        handleInputChange,
        handleClose,
        handleAddProcess,
        handleSearch,
        searchData,
        isSearchActive,
        setIsSearchActive,
        setSearchData,
    };
};
