import React from 'react';

export const NatureColumn = () => {
    return [
        {
            title: <span>성격코드</span>,
            dataIndex: 'code',
            align: 'center',
            width: '20%',
        },
        {
            title: <span>성격명</span>,
            dataIndex: 'name',
            align: 'center',
            width: '80%',
        }
    ];
};