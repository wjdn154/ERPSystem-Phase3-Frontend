import {Tag} from "antd";
import React from "react";

const equipmentTypeMap = {
    "ASSEMBLY" : "조립 설비",
    "MACHINING" : "가공 설비",
    "INSPECTION" : "검사 설비",
    "PACKAGING" : "포장 설비"
};

const operationStatusMap = {
    "BEFORE_OPERATION" : "가동 전",
    "OPERATING" : "가동 중",
    "MAINTENANCE" : "유지보수 중",
    "FAILURE" : "고장",
    "REPAIRING" : "수리 중"
};

export const
    equipmentDataListColumn = [
    {
        title: <div className="title-text">설비번호</div>,
        dataIndex: 'equipmentNum',  // 데이터 인덱스: 이 필드는 데이터 객체의 'equipmentNum' 속성과 연결됩니다.
        key:'equipmentNum',
        align: 'center',
    },
    {
        title: <div className="title-text">설비명</div>,
        dataIndex: 'equipmentName',  // 데이터 인덱스: 이 필드는 데이터 객체의 'equipmentName' 속성과 연결됩니다.
        key:'equipmentName',
        align: 'center',
    },
    {
        title: <div className="title-text">모델명</div>,
        dataIndex: 'modelName',  // 데이터 인덱스: 이 필드는 데이터 객체의 'modelName' 속성과 연결됩니다.
        key:'modelName',
        align: 'center',
    },
    {
        title: <div className="title-text">유형</div>,
        dataIndex: 'equipmentType',  // 데이터 인덱스: 이 필드는 데이터 객체의 'equipmentType' 속성과 연결됩니다.
        key:'equipmentType',
        align: 'center',
        render: (text) => {               //text 에 ASSEMBLY 같은 값이 들어옴
            return equipmentTypeMap[text] || text;  // 한글로 변환 후 표시
        }
    },
    {
        title: <div className="title-text">가동상태</div>,
        dataIndex: 'operationStatus',  // 데이터 인덱스: 이 필드는 데이터 객체의 'operationStatus' 속성과 연결됩니다.
        key:'operationStatus',
        align: 'center',
        render: (text) =>  {
            let color;
            let value;
            switch (text) {
                case 'BEFORE_OPERATION':
                    color = 'green';
                    value = '가동 전';
                    break;
                case 'OPERATING':
                    color = 'blue';
                    value = '가동 중';
                    break;
                case 'MAINTENANCE':
                    color = 'yellow';
                    value = '유지보수 중';
                    break;
                case 'FAILURE':
                    color = 'red';
                    value = '고장';
                    break;
                case 'REPAIRING':
                    color = 'orange';
                    value = '수리 중';
                    break;
                default:
                    color = 'gray'; // 기본 색상
            }
            return <Tag style={{ marginLeft: '5px' }} color={color}>{value}</Tag>;
        }},
    {
        title: <div className="title-text">공장명</div>,
        dataIndex: 'factoryName',  // 데이터 인덱스: 이 필드는 데이터 객체의 'factoryName' 속성과 연결됩니다.
        key:'factoryName',
        align: 'center',
    },
    {
        title: <div className="title-text">작업장명</div>,
        dataIndex: 'workcenterName',  // 데이터 인덱스: 이 필드는 데이터 객체의 'workcenterName' 속성과 연결됩니다.
        key:'workcenterName',
        align: 'center',
    },
    {
        title: <div className="title-text">전력소모량(Wh)</div>,
        dataIndex: 'kWh',  // 데이터 인덱스: 이 필드는 데이터 객체의 'workcenterName' 속성과 연결됩니다.
        key:'kWh',
        align: 'center',
        render: (text) => text ? `${text}kWh` : '기록없음',
    },
];
