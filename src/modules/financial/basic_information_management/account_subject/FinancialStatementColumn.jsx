import React from 'react';

export const FinancialStatementColumn = () => {
    return [
        {
            title: <div className="title-text">코드</div>,
            dataIndex: 'code',
            key: 'code',
            align: 'center',
            width: '30%',
            render: (text) => <div className="small-text">{text}</div>,
        },
        {
            title: <div className="title-text">이름</div>,
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            width: '70%',
            render: (text) => <div className="small-text">{text}</div>,
        }
    ];
};