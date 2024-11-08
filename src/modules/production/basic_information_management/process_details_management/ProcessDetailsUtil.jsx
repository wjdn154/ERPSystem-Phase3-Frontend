import {Tag, Typography} from "antd";
import React from "react";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '공정 목록',
            children: (
                <Typography>
                    등록된 공정의 세부 정보를 조회하고, 필요한 경우 수정할 수 있음.

                </Typography>
            ),
        },
    ];
}

// getRowClassName 함수 정의
export const getRowClassName = (record) => {
    return record.isActive ? 'active-row' : 'inactive-row';
};

// 공정명 검색어로 목록 필터링
export const filterProcessDetails = (details, searchTerm) => {
    return details.filter(detail => detail.name.includes(searchTerm));
};

// 금액 포맷 함수
export const formatNumberWithComma = (value) => {
    if (!value) return '';
    const cleanValue = value.toString().replace(/[^\d]/g, ''); // 숫자 외의 모든 문자 제거
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 콤마 제거 함수
export const removeComma = (value) => {
    return value ? value.toString().replace(/,/g, '') : value;
};

export const processDetailsColumn = [
    {
        title: <div className="title-text">코드</div>,
        dataIndex: 'code',  // DTO의 code 필드에 접근
        key: 'code',
        align: 'center',
    },
    {
        title: <div className="title-text">공정명</div>,
        dataIndex: 'name',  // DTO의 name 필드에 접근
        key: 'name',
        align: 'center',
    },
    {
        title: <div className="title-text">생산구분</div>,
        dataIndex: 'isOutsourced',  // DTO의 isOutsourced 필드에 접근
        key: 'isOutsourced',
        align: 'center',
        render: (isOutsourced) => {
            return (
                <Tag color={isOutsourced ? 'yellow' : 'blue'}>
                    {isOutsourced ? '외주' : '생산'}
                </Tag>
            );
        }
    },
    {
        title: <div className="title-text">소요 시간</div>,
        dataIndex: 'duration',  // DTO의 duration 필드에 접근
        key: 'duration',
        align: 'right',
        render: (duration) => `${duration}시간`,
    },
    {
        title: <div className="title-text">공정 비용</div>,
        dataIndex: 'cost',  // DTO의 cost 필드에 접근
        key: 'cost',
        align: 'right',
        render: (cost) => formatNumberWithComma(cost),
    },
    {
        title: <div className="title-text">불량률(%)</div>,
        dataIndex: 'defectRate',  // DTO의 defectRate 필드에 접근
        key: 'defectRate',
        align: 'center',
        render: (defectRate) => {
            if (defectRate != null) {
                const value = defectRate * 100;
                return `${value}%`;
            }
            return '기록없음';
        }
    },
    {
        title: <div className="title-text">사용여부</div>,
        dataIndex: 'isUsed',  // DTO의 isUsed 필드에 접근
        key: 'isUsed',
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
