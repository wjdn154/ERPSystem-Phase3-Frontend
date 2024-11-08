import React from "react";
import {Tag} from "antd";



export const
    workerListSecondColumn = [
        {
            title: <div className="title-text">사원번호</div>,
            dataIndex: 'employeeNumber',  // 데이터 인덱스: 이 필드는 데이터 객체의 'employeeNumber' 속성과 연결됩니다.
            key:'employeeNumber',
            width: '35%',  // 컬럼 너비 설정
            align: 'center',
        },
        {
            title: <div className="title-text">성명</div>,
            dataIndex: 'fullName', // 데이터 인덱스는 생략 가능
            key: 'fullName',
            width: '30%', // 컬럼 너비 설정
            align: 'center',
            render: (text, record) => `${record.employeeLastName}${record.employeeFirstName}`, // 성과 이름을 합침
        },
        {
            title: <div className="title-text">직책</div>,
            dataIndex: 'jobTitleName',  // 데이터 인덱스: 이 필드는 데이터 객체의 'jobTitleName' 속성과 연결됩니다.
            key:'jobTitleName',
            width: '35%',  // 컬럼 너비 설정
            align: 'center',
        },

    ];
