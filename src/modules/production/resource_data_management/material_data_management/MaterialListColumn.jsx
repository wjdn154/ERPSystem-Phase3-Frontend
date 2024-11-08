import React from "react";

const MaterialType = {
    "METAL" : "금속",
    "PLASTIC" : "플라스틱",
    "WOOD" : "목재",
    "CHEMICAL" : "화학물질",
    "TEXTILE" : "섬유",
    "ELECTRONIC" : "전자부품",
    "CERAMIC" : "세라믹",
    "GLASS" : "유리",
    "PAPER" : "종이",
    "RUBBER" : "고무",
    "COMPOSITE" : "복합재료",
    "OTHER" : "기타 자재",
};
// 콤마 적용
const formatNumberWithComma = (value) => {
    // value가 숫자인 경우 문자열로 변환
    const stringValue = String(value);
    return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 천 단위마다 콤마 추가
};

export const
    materialListColumn = [
        {
            title: <div className="title-text">코드</div>,
            dataIndex: 'materialCode',  // 데이터 인덱스: 이 필드는 데이터 객체의 'materialCode' 속성과 연결됩니다.
            key:'materialCode',
            width: '15%',  // 컬럼 너비 설정
            align: 'center',
        },
        {
            title: <div className="title-text">자재명</div>,
            dataIndex: 'materialName',
            key: 'materialName',
            width: '20%',
            align: 'center',
        },
        {
            title: <div className="title-text">자재유형</div>,
            dataIndex: 'materialType',
            key:'materialType',
            width: '15%',
            align: 'center',
            render: (text) => {
                return MaterialType[text] || text;  // 한글로 변환 후 표시
            }
        },
        {
            title: <div className="title-text">재고수량</div>,
            dataIndex: 'stockQuantity',
            key:'stockQuantity',
            width: '10%',
            align: 'center',
        },
        {
            title: <div className="title-text">매입가(원)</div>,
            dataIndex: 'purchasePrice',
            key:'purchasePrice',
            width: '13%',
            align: 'center',
            render: (text) => <div style={{ textAlign: 'right' }}>{formatNumberWithComma(text)}</div>,
        },
        {
            title: <div className="title-text">거래처명</div>,
            dataIndex: 'representativeName',
            key:'representativeName',
            width: '15%',
            align: 'center',
        },
        {
            title: <div className="title-text">유해물질 포함수량</div>,
            dataIndex: 'hazardousMaterialQuantity',
            key:'hazardousMaterialQuantity',
            width: '12%',
            align: 'center',
        },
    ];
