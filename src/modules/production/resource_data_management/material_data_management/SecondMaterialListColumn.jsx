import React from "react";

const HazardLevel = {
    "HIGH":"높음",
    "MEDIUM":"보통",
    "LOW":"낮음"
};


export const
    secondMaterialListColumn = [
        {
            title: <div className="title-text">코드</div>,
            dataIndex: 'materialCode',  // 데이터 인덱스: 이 필드는 데이터 객체의 'materialCode' 속성과 연결됩니다.
            key:'materialCode',
            width: '40%',  // 컬럼 너비 설정
            align: 'center',
        },
        {
            title: <div className="title-text">자재명</div>,
            dataIndex: 'materialName',
            key: 'materialName',
            width: '60%',
            align: 'center',
        }

    ];


export const
    materialHazardousListColumn = [
        {
            title: <div className="title-text">유해물질코드</div>,
            dataIndex: 'hazardousMaterialCode',  // 데이터 인덱스: 이 필드는 데이터 객체의 'hazardousMaterialCode' 속성과 연결됩니다.
            key:'hazardousMaterialCode',
            width: '30%',  // 컬럼 너비 설정
            align: 'center',
        },
        {
            title: <div className="title-text">유해물질명</div>,
            dataIndex: 'hazardousMaterialName',
            key: 'hazardousMaterialName',
            width: '40%',
            align: 'center',
        },
        {
            title: <div className="title-text">위험등급</div>,
            dataIndex: 'hazardLevel',
            key:'hazardLevel',
            width: '30%',
            align: 'center',
            render: (text) => {
                return HazardLevel[text] || text;  // 한글로 변환 후 표시
            }
        },
    ];

export const
    materialProductListColumn = [
        {
            title: <div className="title-text">품목코드</div>,
            dataIndex: 'productCode',  // 데이터 인덱스: 이 필드는 데이터 객체의 'productCode' 속성과 연결됩니다.
            key:'productCode',
            width: '30%',  // 컬럼 너비 설정
            align: 'center',

        },
        {
            title: <div className="title-text">품목명</div>,
            dataIndex: 'productName',
            key: 'productName',
            width: '40%',
            align: 'center',
        },
        {
            title: <div className="title-text">그룹명</div>,
            dataIndex: 'productGroupName',
            key: 'productGroupName',
            width: '30%',
            align: 'center',
        },
    ];
export const productCodeColumn = [

    {
        title: <div className="title-text">품목코드</div>,
        dataIndex: 'productCode',  // 데이터 인덱스: 이 필드는 데이터 객체의 'productCode' 속성과 연결됩니다.
        key:'productCode',
        width: '30%',  // 컬럼 너비 설정
        align: 'center',
    },
    {
        title: <div className="title-text">품목명</div>,
        dataIndex: 'productName',
        key: 'productName',
        width: '40%',
        align: 'center',
    }

]