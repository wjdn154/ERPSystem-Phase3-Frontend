import React from 'react';
import { Paper, Typography } from '@mui/material';
import { Table as AntTable } from "antd";

const EmployeeDataListSection = ({ columns, data, handleRowSelection, handleSelectedRow }) => {
    if (!data) return null; // 데이터가 없을 경우 null 반환

    return (
        <Paper elevation={3} sx={{ height: '100%', padding: '20px' }}>
            <Typography variant="h6" marginBottom="20px">
                사원 목록
            </Typography>
            <AntTable
                columns={columns}
                dataSource={data}
                pagination={{ pageSize: 15, position: ['bottomCenter'], showSizeChanger: false }}
                rowSelection={handleRowSelection}
                size="small"
                rowKey="id"
                onRow={(record) => ({
                    onClick: () => handleSelectedRow(record), // 행 클릭 시 이벤트 처리
                    style: { cursor: 'pointer' },
                })}
            />
        </Paper>
    );
};

export default EmployeeDataListSection;
