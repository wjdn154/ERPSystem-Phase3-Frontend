import {Select, Tag} from 'antd';
import React, {useEffect, useState} from "react";

// 전체 조회 컬럼 (기존 컬럼 유지)
export const workcenterColumns = [
    {
        title: <div className="title-text">코드</div>,
        dataIndex: 'code',  // DTO의 code 필드에 접근
        key: 'code',
        align: 'center',
    },
    {
        title: <div className="title-text">유형</div>,
        dataIndex: 'workcenterType',  // DTO의 workcenterType 필드에 접근
        key: 'workcenterType',
        align: 'center',

        render: (workcenterType) => {
            const typeToKorean = {
                "Press": "프레스",
                "Welding": "용접",
                "Paint": "도장",
                "Machining": "정밀 가공",
                "Assembly": "조립",
                "Quality Inspection": "품질 검사",
                "Casting": "주조",
                "Forging": "단조",
                "Heat Treatment": "열처리",
                "Plastic Molding": "플라스틱 성형"
            };

            const typeToColor = {
                "Press": "blue",
                "Welding": "green",
                "Paint": "orange",
                "Machining": "volcano",
                "Assembly": "purple",
                "Quality Inspection": "geekblue",
                "Casting": "red",
                "Forging": "gold",
                "Heat Treatment": "cyan",
                "Plastic Molding": "lime"
            };

            // workcenterType 값이 typeToKorean에 없으면 기본 '-'
            const label = typeToKorean[workcenterType] || '기타';
            const color = typeToColor[workcenterType] || 'gray';

            return (
                <Tag color={color}>
                    {label}
                </Tag>
            );
        }
    },
    {
        title: <div className="title-text">이름</div>,
        dataIndex: 'name',  // DTO의 name 필드에 접근
        key: 'name',
        align: 'center',

    },
    {
        title: <div className="title-text">공장</div>,
        key: 'factory',
        render: (text, record) => {
            const { factoryCode, factoryName } = record;

            // 코드와 공장명 둘 다 있는 경우 조합
            if (factoryCode && factoryName) {
                return `[${factoryCode}] ${factoryName}`;
            }

            // 값이 없는 경우 대체 텍스트
            return '-';
        },
        align: 'center',
    },
    {
        title: <div className="title-text">생산공정</div>,
        key: 'process',
        render: (text, record) => {
            const processCode = record.processCode;
            const processName = record.processName;

            // 코드와 공장명 둘 다 있는 경우 조합
            if (processCode && processName) {
                return `[${processCode}] ${processName}`;
            }

            // 값이 없는 경우 대체 텍스트
            return '공정 미등록';
        },
        align: 'center',
    },
    {
        title: <div className="title-text">작업자</div>,
        dataIndex: 'todayWorkers',  // JSON의 todayWorkers 배열에 맞게 수정
        key: 'todayWorkers',
        align: 'center',
        render: (workers) => {
            if (!Array.isArray(workers) || workers.length === 0) {
                return '배정없음'; // 작업자 없을 때
            }

            const workerCount = workers.length;

            if (workerCount === 1) {
                return workers[0]; // 모델명이 하나일 때
            } else {
                // 여러 개일 경우 첫 번째 모델명 + 외 N건
                return `${workers[0]} 외 ${workerCount - 1}명`;
            }
        }
    },
    {
        title: <div className="title-text">설비 모델</div>,
        dataIndex: 'modelNames',  // 설비 ID 리스트 접근
        key: 'modelNames',
        width: '20%',
        align: 'center',
        render: (modelNames) => {
            if (!Array.isArray(modelNames) || modelNames.length === 0) {
                return '미등록'; // 모델명이 없을 때
            }

            const modelCount = modelNames.length;

            if (modelCount === 1) {
                return modelNames[0]; // 모델명이 하나일 때
            } else {
                // 여러 개일 경우 첫 번째 모델명 + 외 N건
                return `${modelNames[0]} 외 ${modelCount - 1}대`;
            }
        }
    },
    {
        title: <div className="title-text">사용</div>,
        dataIndex: 'isActive',  // DTO의 isActive 필드에 접근
        key: 'isActive',
        width: '5%',
        align: 'center',
        render: (isActive) => {
            return (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? '사용중' : '미사용'}
                </Tag>
            );
        }
    },
];



