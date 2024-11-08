import React from "react";

export const workerAssignmentColumns = [
    {
        title: <div className="title-text">작업장</div>,
        dataIndex: 'workcenterName',
        key: 'workcenterName',
        width: '20%',
        align: 'center',
        render: (text, record) => (
            <div>[{record.workcenterCode}] {text}</div>
        ),
    },
    {
        title: <div className="title-text">작업자(사번)</div>,
        dataIndex: 'workerName',
        key: 'workerName',
        width: '25%',
        align: 'center',
        render: (text, record) => (
            <div>{text} ({record.employeeNumber})</div>
        ),
    },
    {
        title: <div className="title-text">배정일자</div>,
        dataIndex: 'assignmentDate',
        key: 'assignmentDate',
        width: '15%',
        align: 'center',
        render: (text) => (
            <div>{text ? new Date(text).toLocaleDateString() : '-'}</div>
        ),
    },
    {
        title: <div className="title-text">교대유형</div>,
        dataIndex: 'shiftTypeName',
        key: 'shiftTypeName',
        width: '15%',
        align: 'center',
        render: (text) => <div>{text}</div>,
    },
    {
        title: <div className="title-text">작업지시</div>,
        dataIndex: 'productionOrderName',
        key: 'productionOrderName',
        width: '25%',
        align: 'center',
        render: (text) => <div>{text}</div>,
    },
];
