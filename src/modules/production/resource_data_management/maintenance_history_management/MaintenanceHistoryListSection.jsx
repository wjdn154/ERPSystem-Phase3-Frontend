import React, {useRef} from 'react';
import {Grid,Paper,Typography}  from "@mui/material";
import {Button, Table as AntTable, Modal, Input, Select, DatePicker} from "antd";
import moment from "moment";
const {Option} = Select;


const MaintenanceHistoryListSection = ({columns,
                                      data,
                                      handleRowSelection,
                                      handleSelectedRow,
                                      handleInsertOk,
                                      handleInsertCancel,
                                      isInsertModalVisible,
                                      maintenanceDataDetail,
                                      setMaintenanceDataDetail,
                                      handleInputChange,
                                      handleOpenInsertModal,
                                      handleCostInput
                                  }) => {
    if(!data) return null;


    return (
        <Paper elevation={3} sx={{height: '100%', p: 2}}>
            <Typography variant="h6" marginBottom={'20px'}>유지보수 이력 목록</Typography>
            <AntTable
                style={{padding: '20px'}}
                columns={columns}
                dataSource={data}
                pagination={{pageSize: 10, position: ['bottomCenter'], showSizeChanger: false}} //페지이 크기변경옵션 숨김
                rowSelection={handleRowSelection}  //행선택 옵션
                size="small"
                rowKey="id"   //각행에 고유한 키로 id 사용
                onRow={(record) => ({
                    onClick: () => handleSelectedRow(record),   //행 클릭 시 이벤트
                    style: {cursor: 'pointer'},           //커서 스타일 변경
                })}

            />
        </Paper>
    )
}

export default MaintenanceHistoryListSection;