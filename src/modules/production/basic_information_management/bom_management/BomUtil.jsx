import React from "react";
import {Tag, Typography} from "antd";

export const sbomColumns = [
    {
        title: <div className="title-text">버전</div>,
        dataIndex: 'version',
        key: 'version',
        align: 'center',
        render: (version) => `${version} ver.`
    },
    {
        title: <div className="title-text">생성일자</div>,
        dataIndex: 'createdDate',
        key: 'createdDate',
        align: 'center',
        render: (createdDate) => {
            if (!createdDate) return ''; // 날짜 값이 없을 경우 빈 문자열 반환

            const date = new Date(createdDate);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
            const dd = String(date.getDate()).padStart(2, '0');

            return `${yyyy}-${mm}-${dd}`;
        },
    },

    {
        title: <div className="title-text">손실율</div>,
        dataIndex: 'lossRate',
        key: 'lossRate',
        align: 'center',
        render: (lossRate) => {
            if (lossRate == null) return '기록없음'; // 값이 없을 경우 '-' 표시

            const formattedRate = (lossRate * 100).toFixed(2); // 100을 곱하고 소수점 두 자리로 고정
            return `${formattedRate}%`; // 퍼센트 기호 붙이기
        }
    },
    {
        title: <div className="title-text">외주 구분</div>,
        dataIndex: 'outsourcingType',
        key: 'outsourcingType',
        align: 'center',
        render: (outsourcingType) => {
            const typeToKorean = {
                'FULL_OUTSOURCING': '전체 외주',
                'PARTIAL_OUTSOURCING': '부분 외주',
                'SUBCONTRACTING': '하청',
                'JOINT_PRODUCTION': '공동 생산',
                'CONSULTING_OUTSOURCING': '컨설팅 외주',
                'QUALITY_INSPECTION_OUTSOURCING': '품질 검사 외주',
            };

            const typeToColor = {
                'FULL_OUTSOURCING': 'blue',
                'PARTIAL_OUTSOURCING': 'green',
                'SUBCONTRACTING': 'orange',
                'JOINT_PRODUCTION': 'volcano',
                'CONSULTING_OUTSOURCING': 'purple',
                'QUALITY_INSPECTION_OUTSOURCING': 'geekblue',
            };

            // outsourcingType 값이 typeToKorean에 없으면 기본값 '기타'와 'gray' 사용
            const label = typeToKorean[outsourcingType] || '기타';
            const color = typeToColor[outsourcingType] || 'gray';

            return (
                <Tag color={color}>
                    {label}
                </Tag>
            );
        }
    },

    {
        title: <div className="title-text">유효 시작일</div>,
        dataIndex: 'startDate',
        key: 'startDate',
        align: 'center',
    },
    {
        title: <div className="title-text">유효 종료일</div>,
        dataIndex: 'expiredDate',
        key: 'expiredDate',
        align: 'center',
    },
    {
        title: <div className="title-text">비고</div>,
        dataIndex: 'remarks',
        key: 'remarks',
        align: 'center',
    },
    {
        title: <div className="title-text">사용 여부</div>,
        dataIndex: 'isActive',
        key: 'isActive',
        align: 'center',
        render: (isActive) => (
            <Tag color={isActive ? 'green' : 'red'}>
                {isActive ? '사용중' : '미사용'}
            </Tag>
        ),
    },
];

export const greenBomColumns = [
    {
        title: <div className="title-text">유해 물질</div>,
        dataIndex: 'hazardousMaterials',
        key: 'hazardousMaterials',
        align: 'center',
        render: (materials) => (
            <span>{materials.join(', ')}</span>
        ),
    },
    {
        title: <div className="title-text">재활용</div>,
        dataIndex: 'recyclable',
        key: 'recyclable',
        align: 'center',
        render: (recyclable) => (
            <Tag color={recyclable ? 'green' : 'red'}>
                {recyclable ? '가능' : '불가'}
            </Tag>
        ),
    },
    {
        title: <div className="title-text">재사용</div>,
        dataIndex: 'reusable',
        key: 'reusable',
        align: 'center',
        render: (reusable) => (
            <Tag color={reusable ? 'green' : 'red'}>
                {reusable ? '가능' : '불가'}
            </Tag>
        ),
    },
    {
        title: <div className="title-text">에너지 소비량</div>,
        dataIndex: 'energyConsumption',
        key: 'energyConsumption',
        align: 'center',
    },
    {
        title: <div className="title-text">탄소발자국</div>,
        dataIndex: 'carbonFootprint',
        key: 'carbonFootprint',
        align: 'center',
    },
    {
        title: <div className="title-text">친환경 인증</div>,
        dataIndex: 'ecoCertification',
        key: 'ecoCertification',
        align: 'center',
    },
];

export const tabItems = () => {
    return [
        {
            key: '1',
            label: 'S-BOM',
            children: (
                <Typography>
                    표준 자재명세서를 조회하고, 필요한 경우 수정 및 삭제할 수 있음.
                </Typography>
            ),
        },
        // {
        //     key: '2',
        //     label: 'Green BOM',
        //     children: (
        //         <Typography>
        //             친환경 자재명세서를 조회하고, 필요한 경우 수정 및 삭제할 수 있음.
        //         </Typography>
        //     ),
        // },
    ];
}