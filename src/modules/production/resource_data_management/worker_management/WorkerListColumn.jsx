import React from "react";
import {Tag} from "antd";

export const employmentStatusMap = {
    "ACTIVE" : "재직 중",
    "ON_LEAVE" : "휴직 중",
    "RESIGNED" : "퇴직"
};

export const employmentTypeMap = {
    "FULL_TIME" : "정규직",
    "CONTRACT" : "계약직",
    "PART_TIME" : "파트타임",
    "TEMPORARY" : "임시직",
    "INTERN" : "인턴",
    "CASUAL" : "일용직",
    "FREELANCE" : "프리랜서"
};

export const
    workerListColumn = [
    {
        title: <div className="title-text">사원번호</div>,
        dataIndex: 'employeeNumber',  // 데이터 인덱스: 이 필드는 데이터 객체의 'employeeNumber' 속성과 연결됩니다.
        key:'employeeNumber',
        width: '15%',  // 컬럼 너비 설정
        align: 'center',
        //render: (text) => <span style={{ fontSize: '0.7rem' }}>{text}</span>,
    },
    {
        title: <div className="title-text">성명</div>,
        dataIndex: 'fullName', // 데이터 인덱스는 생략 가능
        key: 'fullName',
        width: '11%', // 컬럼 너비 설정
        align: 'center',
        render: (text, record) => `${record.employeeLastName}${record.employeeFirstName}` , // 성과 이름을 합침

    },
    {
        title: <div className="title-text">부서명</div>,
        dataIndex: 'departmentName',  // 데이터 인덱스: 이 필드는 데이터 객체의 'departmentName' 속성과 연결됩니다.
        key:'departmentName',
        width: '11%',  // 컬럼 너비 설정
        align: 'center',
        //render: (text) => <span style={{ fontSize: '0.7rem' }}>{text}</span>,
    },
    {
        title: <div className="title-text">직위</div>,
        dataIndex: 'positionName',  // 데이터 인덱스: 이 필드는 데이터 객체의 'positionName' 속성과 연결됩니다.
        key:'positionName',
        width: '11%',  // 컬럼 너비 설정
        align: 'center',
       // render: (text) => <span style={{ fontSize: '0.7rem' }}>{text}</span>,
    },
    {
        title: <div className="title-text">직책</div>,
        dataIndex: 'jobTitleName',  // 데이터 인덱스: 이 필드는 데이터 객체의 'jobTitleName' 속성과 연결됩니다.
        key:'jobTitleName',
        width: '15%',  // 컬럼 너비 설정
        align: 'center',
        //render: (text) => <span style={{ fontSize: '0.7rem' }}>{text}</span>,
    },
    {
        title: <div className="title-text">고용상태</div>,
        dataIndex: 'employmentStatus',  // 데이터 인덱스: 이 필드는 데이터 객체의 'employmentStatus' 속성과 연결됩니다.
        key:'employmentStatus',
        width: '11%',  // 컬럼 너비 설정
        align: 'center',
        render: (text) => {
            let color;
            let value;
            switch (text) {
                case 'ACTIVE':
                    color = 'blue';
                    value = '재직중';
                    break;
                case 'ON_LEAVE':
                    color = 'green';
                    value = '휴직중';
                    break;
                case 'RESIGNED':
                    color = 'orange';
                    value = '퇴직';
                    break;
                default:
                    color = 'gray'; // 기본 색상
            }
            return <Tag style={{marginLeft: '5px'}} color={color}>{value}</Tag>;
        }},
    {
        title: <div className="title-text">고용유형</div>,
        dataIndex: 'employmentType',  // 데이터 인덱스: 이 필드는 데이터 객체의 'employmentType' 속성과 연결됩니다.
        key:'employmentType',
        width: '11%',  // 컬럼 너비 설정
        align: 'center',
        render: (text) => {
            return employmentTypeMap[text] || text;  // 한글로 변환 후 표시
        }
    },
    {
        title: <div className="title-text">안전교육 이수</div>,
        dataIndex: 'trainingStatus',  // 데이터 인덱스: 이 필드는 데이터 객체의 'trainingStatus' 속성과 연결됩니다.
        key:'trainingStatus',
        width: '15%',  // 컬럼 너비 설정
        align: 'center',
        render: (text) => {
            return (
            <Tag color={text === 'true' ? 'blue' : 'red'}>
                {text === 'true' ? '이수' : '미이수'}
            </Tag>
            )
        }

    },
    ];
