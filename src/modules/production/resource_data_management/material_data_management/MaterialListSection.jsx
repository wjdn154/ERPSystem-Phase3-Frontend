import React, {useRef} from 'react';
import {Grid,Paper,Typography}  from "@mui/material";
import {Button, Table as AntTable, Modal as AntModal, Input, Select, DatePicker} from "antd";
import {materialListColumn} from "./MaterialListColumn.jsx";
const {Option} = Select;


    const MaterialListSection = ({
                                     data,
                                     materialDataDetail,
                                     selectedRow,
                                     handleRowSelection,
                                     handleSelectedRow,
                                     handleInputChange,
                                 }) => {
        return (
            <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
                {/* 자재 목록 테이블 */}
                <AntTable
                    style={{ padding: '20px' }}
                    columns={materialListColumn}  // materialListColumn은 외부에서 정의된 자재 목록의 컬럼 배열입니다.
                    dataSource={data}  // 자재 목록 데이터
                    pagination={{ pageSize: 10, position: ['bottomCenter'], showSizeChanger: false }}  // 페이지네이션 설정
                    rowSelection={handleRowSelection}  // 행 선택 옵션
                    size="small"
                    rowKey="id"  // 각 행에 고유한 키 값
                    onRow={(record) => ({
                        onClick: () => handleSelectedRow(record),  // 행을 클릭하면 해당 행의 데이터를 선택
                        style: { cursor: 'pointer' },  // 마우스 커서 스타일 설정
                    })}
                />

            </Paper>
        );
    };

    export default MaterialListSection;