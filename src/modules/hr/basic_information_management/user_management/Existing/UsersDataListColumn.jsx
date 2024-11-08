import React from "react";

export const usersDataListColumn = (handleRowClick) => [
    {
        title: '사용자 아이디',
        dataIndex: 'usersId',
        key: 'usersId',
        render: (text, record) => (
            <a onClick={() => handleRowClick(record)}>{text}</a> // 클릭 시 상세 정보 표시
        )
    },
    {
        title: '사용자 이름',
        dataIndex: 'userName',
        key: 'userName',
        render: (text, record) => (
            <a onClick={() => handleRowClick(record)}>{text}</a> // 클릭 시 상세 정보 표시
        )
    },
    {
        title: <span>사원 번호</span>, // 컬럼 제목
        dataIndex: 'employeeNumber', // 데이터 인덱스: 이 필드는 데이터 객체의 'employeeNumber' 속성과 연결됩니다.
        width: '15%', // 컬럼 너비 설정
    },
    {
        title: <span>사원 이름</span>, // 컬럼 제목
        dataIndex: 'fullName', // 데이터 인덱스는 생략 가능
        key: 'fullName',
        width: '20%', // 컬럼 너비 설정
        render: (text, record) => `${record.lastName}${record.firstName}`, // 성과 이름을 합침
    },
    {
        title: <span>권한</span>, // 컬럼 제목
        dataIndex: 'permissionId', // 데이터 인덱스: 이 필드는 데이터 객체의 'employeeNumber' 속성과 연결됩니다.
        width: '20%', // 컬럼 너비 설정
    }
]