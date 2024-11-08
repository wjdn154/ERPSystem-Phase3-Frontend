// import React from 'react';
// import { Paper, Typography} from '@mui/material';
// import {Button, Table as AntTable} from "antd";
//
// const UsersDataListSection = ({ columns=[], data, handleRowSelection, handleSelectedRow, onShowPermissions }) => {
//     if (!data) return null;
//
//     const extendedColumns = [
//         ...columns,
//         {
//             title: '권한 내역',
//             key: 'permissions',
//             render: (text, record) => (
//                 <Button onClick={() => onShowPermissions(record)}>
//                     권한 내역
//                 </Button>
//             ),
//         },
//     ];
//
//
//     return (
//         <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
//             <Typography variant="h6" marginBottom={'20px'}>사용자 목록</Typography>
//             <AntTable
//                 style={{ padding: '20px' }}
//                 columns={columns}
//                 dataSource={data}
//                 pagination={{ pageSize: 15, position: ['bottomCenter'], showSizeChanger: false }}
//                 rowSelection={handleRowSelection}
//                 size="small"
//                 rowKey={(record) => record.id}
//                 onRow={(record) => ({
//                     onClick: () => handleSelectedRow(record),
//                     style: { cursor: 'pointer' },
//                 })}
//             />
//         </Paper>
//     )
// }
//
// export default UsersDataListSection;

import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { Table as AntTable } from "antd";

// extendedColumns 정의
const extendedColumns = [
    {
        title: '사용자 아이디',
        dataIndex: 'usersId',
        key: 'usersId',  // 고유한 key 값 설정
    },
    {
        title: '사용자 이름',
        dataIndex: 'userName',
        key: 'userName',  // 고유한 key 값 설정
    },
    {
        title: '사원 번호',
        dataIndex: 'employeeNumber',
        key: 'employeeNumber',  // 고유한 key 값 설정
    },
    {
        title: '권한',
        dataIndex: 'permission',
        key: 'permission',  // 고유한 key 값 설정
    },
];

// UsersDataListSection 컴포넌트 정의
const UsersDataListSection = ({ data, handleRowSelection, handleSelectedRow, rowClassName }) => {
    if (!data) return null;

    return (
        <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
            <Typography variant="h6" marginBottom={'20px'}>사용자 목록</Typography>
            <AntTable
                style={{ padding: '20px' }}
                columns={extendedColumns}
                dataSource={data}
                pagination={{ pageSize: 15, position: ['bottomCenter'], showSizeChanger: false }}
                rowSelection={handleRowSelection}
                size="small"
                rowKey="id"
                onRow={(record) => ({
                    onClick: () => handleSelectedRow(record),
                    style: { cursor: 'pointer' },
                })}
            />
        </Paper>
    );
}

export default UsersDataListSection;
