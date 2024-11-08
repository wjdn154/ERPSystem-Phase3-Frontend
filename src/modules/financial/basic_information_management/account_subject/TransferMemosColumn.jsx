import React from 'react';
import { Button, Input } from 'antd';

export const transferMemosColumn = (
    handleInputChange2, // 대체적요 입력 필드 변경을 처리하는 함수
    handleDeleteMemo,   // 대체적요 항목을 삭제하는 함수
    handleAddNewMemo,   // 새 대체적요 항목을 추가하는 함수
    setAccountSubjectDetail, // 계정 상세 정보를 업데이트하는 함수
    accountSubjectDetail // 현재 계정 상세 정보 상태
) => {
    // 기본 컬럼 정의
    const columns = [
        {
            title: <span>적요번호</span>, // '적요번호' 컬럼 제목
            dataIndex: 'code', // 데이터의 'code' 필드와 매핑, 각 행의 고유 식별자를 표시
            align: 'center', // 셀 내용을 가운데 정렬
            width: '20%', // 컬럼의 너비 설정
        },
        {
            title: <span>내용</span>, // '대체적요' 컬럼 제목
            dataIndex: 'content', // 데이터의 'content' 필드와 매핑, 대체적요 내용을 표시
            align: 'center', // 셀 내용을 가운데 정렬
            width: accountSubjectDetail.modificationType ? '60%' : '80%', // 컬럼의 너비 설정 (생성/삭제 버튼에 따라 조정)
            render: (text, record, index) => (
                accountSubjectDetail.modificationType ? (
                    <Input
                        value={text}
                        onChange={(e) => handleInputChange2(e, 'transferMemos', index)} // 입력 변경 시 핸들러 호출
                    />
                ) : (
                    <span>{text}</span> // 수정 불가능한 경우 텍스트만 표시
                )
            ),
        }
    ];

    // 수정 가능할 때만 '생성' 및 '삭제' 버튼을 추가
    if (accountSubjectDetail.modificationType) {
        columns.push({
            title:
                <Button style={{ height: '30px' }} type="primary" onClick={() => handleAddNewMemo('transferMemos')}>
                    생성
                </Button>, // '생성' 버튼 컬럼
            dataIndex: 'action',
            align: 'center', // 셀 내용을 가운데 정렬
            width: '20%', // 컬럼의 너비 설정
            render: (_, record) => (
                <Button
                    style={{ height: '30px' }}
                    type="danger"
                    onClick={() => handleDeleteMemo('transferMemos', record.code, setAccountSubjectDetail, accountSubjectDetail)} // '삭제' 버튼 클릭 시 처리 로직
                >
                    삭제
                </Button>
            ),
        });
    }

    return columns;
};