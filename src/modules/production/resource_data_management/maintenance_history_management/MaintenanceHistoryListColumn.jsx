import {Tag} from "antd";
import React from "react";

const maintenanceTypeMap =  {

    "EMERGENCY_REPAIR" : "긴급수리",
    "REGULAR_INSPECTION" : "정기점검",
    "FAILURE_REPAIR" : "고장수리"
};

export const
    MaintenanceHistoryListColumn = [
        {
            title: <div className="title-text">설비번호</div>,
            dataIndex: 'equipmentNum',  // 데이터 인덱스: 이 필드는 데이터 객체의 'equipmentNum' 속성과 연결됩니다.
            key:'equipmentNum',
            width: '14%',  // 컬럼 너비 설정
            align: 'center',
        },
        {
            title: <div className="title-text">설비명</div>,
            dataIndex: 'equipmentDataName',  // 데이터 인덱스: 이 필드는 데이터 객체의 'equipmentDataName' 속성과 연결됩니다.
            key:'equipmentDataName',
            width: '14%',  // 컬럼 너비 설정
            align: 'center',
        },
        {
            title: <div className="title-text">관리담당자</div>,
            dataIndex: 'maintenanceManager',  // 데이터 인덱스: 이 필드는 데이터 객체의 'maintenanceManager' 속성과 연결됩니다.
            key:'maintenanceManager',
            width: '10%',  // 컬럼 너비 설정
            align: 'center',
        },
        {
            title: <div className="title-text">유지보수유형</div>,
            dataIndex: 'maintenanceType',  // 데이터 인덱스: 이 필드는 데이터 객체의 'maintenanceType' 속성과 연결됩니다.
            key:'maintenanceType',
            width: '12%',  // 컬럼 너비 설정
            align: 'center',
            render: (text) =>  {
                let color;
                let value;
                switch (text) {
                    case 'EMERGENCY_REPAIR':
                        color = 'red';
                        value = '긴급수리';
                        break;
                    case 'REGULAR_INSPECTION':
                        color = 'green';
                        value = '정기점검';
                        break;
                    case 'FAILURE_REPAIR':
                        color = 'orange';
                        value = '고장수리';
                        break;
                    default:
                        color = 'gray'; // 기본 색상
                }
                return <Tag style={{ marginLeft: '5px' }} color={color}>{value}</Tag>;
            }},
        {
            title: <div className="title-text">유지보수일자</div>,
            dataIndex: 'maintenanceDate',  // 데이터 인덱스: 이 필드는 데이터 객체의 'maintenanceDate' 속성과 연결됩니다.
            key:'maintenanceDate',
            width: '12%',  // 컬럼 너비 설정
            align: 'center',
        },
        {
            title: <div className="title-text">설치공장</div>,
            dataIndex: 'factoryName',  // 데이터 인덱스: 이 필드는 데이터 객체의 'factoryName' 속성과 연결됩니다.
            key:'factoryName',
            width: '13%',  // 컬럼 너비 설정
            align: 'center',
        },
        {
            title: <div className="title-text">설치작업장</div>,
            dataIndex: 'workcenterName',  // 데이터 인덱스: 이 필드는 데이터 객체의 'workcenterName' 속성과 연결됩니다.
            key:'workcenterName',
            width: '13%',  // 컬럼 너비 설정
            align: 'center',
        },
        {
            title: <div className="title-text">진행상태</div>,
            dataIndex: 'maintenanceStatus',  // 데이터 인덱스: 이 필드는 데이터 객체의 'maintenanceStatus' 속성과 연결됩니다.
            key:'maintenanceStatus',
            width: '12%',  // 컬럼 너비 설정
            align: 'center',
            render: (text) => {
                return (
                    <Tag color={text === true ? 'blue' : 'red'}>
                        {text === true ? '완료' : '작업중'}
                    </Tag>
                )
            }
        }
    ];