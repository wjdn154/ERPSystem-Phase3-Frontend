import {useEffect, useMemo, useState} from 'react';
import {
    fetchAccountSubject,
    fetchAccountSubjectDetail,
    updateAccountSubjectDetail
} from './AccountSubjectApi.jsx';
import {Modal, notification} from "antd";

const { confirm } = Modal;

// 계정과목 관련 커스텀 훅
export const accountSubjectHook = (initialData) => {
    // 선택된 행과 계정과목 상세 정보를 관리하는 상태
    const [data, setData] = useState(initialData);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [accountSubjectDetail, setAccountSubjectDetail] = useState(initialData.accountSubjectDetail);
    const [isFinancialStatementModalVisible, setIsFinancialStatementModalVisible] = useState(false);
    const [isRelationCodeModalVisible, setIsRelationCodeModalVisible] = useState(false);
    const [isNatureModalVisible, setIsNatureModalVisible] = useState(false);
    const [activeTabKey, setActiveTabKey] = useState('1'); // tabs state

    const memoizedData = useMemo(() => data, [data]);

    useEffect(() => {
        if (accountSubjectDetail) {
            setShowDetail(false); // 기존 컴포넌트를 사라지게 함
            setTimeout(() => {
                setShowDetail(true); // 새 컴포넌트를 나타나게 함
            }, 0); // 0ms의 지연 시간 후에 나타나도록 설정
        }
    }, [accountSubjectDetail]);

    // 행 선택 핸들러 설정
    const handleRowSelection = {
        type: 'radio',
        selectedRowKeys: selectedRow ? [selectedRow.id] : [],
        onChange: (selectedRowKeys, selectedRows) => {
            if (selectedRows.length > 0) {
                handleSelectedRow(selectedRows[0]);
            }
        },
    };

    // 행 선택 시 계정과목 상세 정보를 가져오는 로직
    const handleSelectedRow = async (selectedRow) => {
        setSelectedRow(selectedRow);
        try {
            const detail = await fetchAccountSubjectDetail(selectedRow.code);
            setAccountSubjectDetail(detail);
        } catch (error) {
            console.error("API에서 데이터를 가져오는 중 오류 발생:", error);
        }
    };

    // 필드의 값이 변경될 때 호출되는 함수
    const handleInputChange = (e, key) => {
        const value = e.target.value;

        // 영어만 입력가능하도록 정규식 검사.
        if (key === 'englishName' && /[^a-zA-Z\s\-\'\.\,]/.test(value)) {
            alert('영어, 공백, 하이픈(-), 작은따옴표(\'), 점(.) 및 쉼표(,)만 입력 가능합니다.');
            return;
        }

        setAccountSubjectDetail(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    // 특정 적요 필드의 내용을 수정하는 함수
    const handleInputChange2 = (e, field, index) => {
        const currentField = accountSubjectDetail[field] || []; // 필드가 없을 경우 빈 배열로 초기화

        if (currentField[index]) {
            currentField[index].content = e.target.value; // 특정 인덱스의 항목 내용 수정
        }

        setAccountSubjectDetail({
            ...accountSubjectDetail,
            [field]: currentField, // 업데이트된 필드를 상태에 반영
        });
    };

    // 새로운 항목 추가와 항목 삭제를 처리하는 로직
    const handleAddNewMemo = (field) => {
        setAccountSubjectDetail(prevState => {
            const currentField = prevState[field] || [];

            // 기존 필드에서 가장 큰 code 값을 찾음
            const maxCode = Math.max(...currentField.map(memo => memo.code)) > 0 ? Math.max(...currentField.map(memo => memo.code)) : 0;
            const newCode = maxCode + 1;  // 가장 큰 code 값에 1을 더함

            const newMemo = { code: newCode, content: '' };
            return {
                ...prevState,
                [field]: [...currentField, newMemo]
            };
        });
    };

    // 특정 적요 삭제 로직
    const handleDeleteMemo = (field, code) => {
        setAccountSubjectDetail((prevState) => {
            const updatedMemos = prevState[field].filter((memo) => memo.code !== code);

            // ID 재정렬 로직: 삭제 후 남은 항목의 ID를 1부터 연속적으로 할당
            const reindexedMemos = updatedMemos.map((memo, index) => ({
                ...memo,
                code: index + 1, // code를 1부터 시작하도록 재설정
            }));

            return {
                ...prevState,
                [field]: reindexedMemos,
            };
        });
    };


// 팝업 클릭 시 실행되는 함수
    const handlePopupClick = (field) => {
        if (field === "표준재무제표") showModal(field);
        if (field === "관계코드") showModal(field);
        if (field === "성격") showModal(field);
    };

    const showModal = (field) => {
        if (field === "표준재무제표") setIsFinancialStatementModalVisible(true);
        if (field === "관계코드") setIsRelationCodeModalVisible(true);
        if (field === "성격") setIsNatureModalVisible(true);
    }

    const handleClose = (e) => {
        setIsFinancialStatementModalVisible(false);
        setIsRelationCodeModalVisible(false);
        setIsNatureModalVisible(false);
    };

    const selectFinancialStatement = (item) => {
        setAccountSubjectDetail(prevState => {
            return {
                ...prevState,
                standardFinancialStatementCode: item.code,
                standardFinancialStatementName: item.name
            };
        });
    };

    // 성격코드 선택 시 실행되는 함수
    const selectNature = (item) => {
        setAccountSubjectDetail(prevState => {
            return {
                ...prevState,
                natureCode: item.code,
                natureName: item.name
            };
        });
    };


    // 관계코드 선택 시 실행되는 함수
    const selectRelationCode = (item) => {
        setAccountSubjectDetail(prevState => {
            return {
                ...prevState,
                parentCode: item.code,
                parentName: item.name
            };
        });
    };

    // 관계코드 삭제 버튼 선택 클릭 시 실행되는 함수
    const deleteRelationCode = () => {
        setAccountSubjectDetail(prevState => {
            return {
                ...prevState,
                parentCode: null,
                parentName: null
            };
        });
        setIsRelationCodeModalVisible(false);
    };

    // 저장 버튼 클릭 시 실행되는 함수
    const handleSave = () => {
        confirm({
            title: '저장 확인',
            content: '정말로 저장하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            async onOk() {
                try {
                    await updateAccountSubjectDetail(accountSubjectDetail.code, accountSubjectDetail);
                    const updatedData = await fetchAccountSubject();
                    setData(updatedData);

                    // 성공 알림 표시
                    notification.success({
                        message: '저장 성공',
                        description: '변경 사항이 성공적으로 저장되었습니다.',
                        placement: 'bottomRight',
                    });
                } catch (error) {
                    console.error("API에서 데이터를 가져오는 중 오류 발생:", error);

                    // 실패 알림 표시
                    notification.error({
                        message: '저장 실패',
                        description: '저장 중 오류가 발생했습니다. 다시 시도해주세요.',
                        placement: 'top',
                    });
                }
            },
            onCancel() {
                notification.warning({
                    message: '저장이 취소',
                    description: '저장이 취소되었습니다.',
                    placement: 'bottomRight',
                });
            },
        });
    };

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    return {
        data,
        accountSubjectDetail,
        setAccountSubjectDetail,
        handleRowSelection,
        handleInputChange,
        handleInputChange2,
        handleAddNewMemo,
        handleDeleteMemo,
        handleSelectedRow,
        handlePopupClick,
        isFinancialStatementModalVisible,
        isRelationCodeModalVisible,
        isNatureModalVisible,
        showModal,
        handleClose,
        selectFinancialStatement,
        selectRelationCode,
        selectNature,
        handleSave,
        showDetail,
        deleteRelationCode,
        handleTabChange,
        activeTabKey,
    };
};