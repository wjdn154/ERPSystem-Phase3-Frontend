import React from 'react';
import { Button, Input } from 'antd';

export const cashMemoColumn = (
    handleInputChange2, // 현금적요 내용 변경 핸들러
    handleDeleteMemo,   // 적요 삭제 핸들러
    handleAddNewMemo,   // 새 적요 추가 핸들러
    setAccountSubjectDetail, // 계정 상세 정보 업데이트 함수
    accountSubjectDetail // 계정 상세 정보 데이터
) => {
    // 기본 컬럼 설정
    const columns = [
        {
            title: <span>적요번호</span>, // 적요의 고유 번호를 표시하는 컬럼
            dataIndex: 'code', // 각 행에서 'code' 데이터 필드를 참조
            align: 'center', // 텍스트를 가운데 정렬
            width: '20%', // 컬럼 너비를 20%로 설정
        },
        {
            title: <span>내용</span>, // 현금 적요 내용을 입력하는 컬럼
            dataIndex: 'content', // 각 행에서 'content' 데이터 필드를 참조
            align: 'center', // 텍스트를 가운데 정렬
            width: accountSubjectDetail.modificationType ? '60%' : '80%', // 컬럼의 너비 설정 (생성/삭제 버튼에 따라 조정)
            render: (text, record, index) => (
                accountSubjectDetail.modificationType ? (
                    <Input
                        value={text}
                        onChange={(e) => handleInputChange2(e, 'cashMemos', index)} // 입력 변경 시 핸들러 호출
                    />
                ) : (
                    <span>{text}</span> // 수정 불가능한 경우 텍스트만 표시
                )
            ),
        }
    ];

    // 수정 가능할 때만 추가할 컬럼
    if (accountSubjectDetail.modificationType) {
        columns.push({
            title:
                <Button style={{ height: '30px' }} type="primary" onClick={() => handleAddNewMemo('cashMemos')}>
                    생성
                </Button>,
            dataIndex: 'code', // 각 행에서 'code' 데이터 필드를 참조
            align: 'center', // 텍스트를 가운데 정렬
            width: '20%', // 컬럼 너비를 20%로 설정
            render: (_, record) => (
                <Button
                    style={{ height: '30px' }}
                    type="danger"
                    onClick={() => handleDeleteMemo('cashMemos', record.code, setAccountSubjectDetail, accountSubjectDetail)} // 삭제 버튼 클릭 시 핸들러 호출
                >
                    삭제
                </Button>
            ),
        });
    }

    return columns;
};