import React from 'react';

export const RelationCodeColumn = () => {
    return [
        {
            title: <span>코드번호</span>,  // 컬럼 제목
            dataIndex: 'code',  // 데이터 인덱스: 이 필드는 데이터 객체의 'code' 속성과 연결됩니다.
            align: 'center',  // 컬럼 내용을 중앙 정렬
            width: '20%',  // 컬럼 너비 설정
        },
        {
            title: <span>계정과목명</span>,  // 컬럼 제목
            dataIndex: 'name',  // 데이터 인덱스: 이 필드는 데이터 객체의 'name' 속성과 연결됩니다.
            align: 'center',  // 컬럼 내용을 중앙 정렬
            width: '40%',  // 컬럼 너비 설정
        },
        {
            title: <span>성격</span>,  // 컬럼 제목
            dataIndex: 'natureName',  // 데이터 인덱스: 이 필드는 데이터 객체의 'natureCode' 속성과 연결됩니다.
            align: 'center',  // 컬럼 내용을 중앙 정렬
            width: '20%',  // 컬럼 너비 설정
        }
    ];
};