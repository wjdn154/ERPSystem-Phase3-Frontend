import React, {useRef} from 'react';
import {Grid,Paper,Typography}  from "@mui/material";
import {Button, Table as AntTable, Modal, Input, Select, DatePicker} from "antd";
import moment from "moment";
const {Option} = Select;


const WorkerListSection = ({columns,
                                      data,
                                      handleRowSelection,
                                      handleSelectedRow,
                                      handleUpdateOk,
                                      handleUpdateCancel,
                                      isUpdateModalVisible,
                                      workerDetail,
                                      setWorkerDetail,
                                      handleInputChange,
                                      showUpdateModal,
                                  }) => {
    if(!data) return null;

    console.log('workerDetail : '+workerDetail);
    return (
        <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
            <Typography variant="h6" marginBottom="20px">
                작업자 목록
            </Typography>
            <AntTable
                style={{ padding: '20px' }}
                columns={columns}
                dataSource={data}
                pagination={{
                    pageSize: 10,
                    position: ['bottomCenter'],
                    showSizeChanger: false,
                }}
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

export default WorkerListSection;