import React, {useRef} from 'react';
import {Grid,Paper,Typography}  from "@mui/material";
import {Button, Table as AntTable, Modal, Input, Select, DatePicker, Col, Form, Row} from "antd";
import moment from "moment";
import {workerAttendanceListColumn} from "./WorkerAttendanceListColumn.jsx";
const {Option} = Select;

const mergeAttendanceAndAssignment = (attendanceList, assignmentList) => {
    //날짜를 기준으로 근태와 작업배치를 병합
    const mergedList = attendanceList.map(attendance => {
        const matchingAssigment = assignmentList.find(
            assignment => assignment.assignmentDate === attendance.attendanceDate
        );
        return {
            ...attendance,
            workcenterName: matchingAssigment ? matchingAssigment.workcenterName : '미 배치',
            assignmentDate: matchingAssigment ? matchingAssigment.assignmentDate : '미 배치'
        };
    });
    return mergedList;
}

const WorkerAttendanceListSection = ({columns,
                                      data,
                                      handleRowSelection,
                                      handleSelectedAttendanceRow,
                                      workerAttendanceListColumn,
                                      workerAttendanceDetail
                                  }) => {
    if(!data) return null;

    //workerAttendance와 workerAssignment가 있다면 이를 병합
    const mergedData = workerAttendanceDetail ? mergeAttendanceAndAssignment(
        workerAttendanceDetail.workerAttendance || [],
        workerAttendanceDetail.workerAssignment || []
        ) : [];

    console.log('workerAttendanceDetail : '+workerAttendanceDetail);
    console.log('병합된 데이터 ' , mergedData);
    return (
        <Grid container spacing={2}>
            {/* 왼쪽 작업자 목록 */}
            <Grid item xs={5}>
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
                            onClick: () => handleSelectedAttendanceRow(record),
                            style: { cursor: 'pointer' },
                        })}
                    />
                </Paper>
            </Grid>

            {/* 오른쪽 선택된 작업자 근태 및 작업 배치 목록 */}
            <Grid item xs={7}>
                {workerAttendanceDetail && (
                <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
                    <Typography variant="h6" marginBottom="20px">
                        작업배치 및 근태 목록
                    </Typography>

                        <div>
                            <div style={{ display: 'flex', marginBottom: '20px', justifyContent:'center'}}>
                                <Row gutter={16} justify="center">
                                    <Col span={12} >
                                        <Form.Item>
                                            <Input addonBefore="사원번호" value={workerAttendanceDetail?.employeeNumber} readOnly />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Input
                                            addonBefore="성명"
                                            value={
                                                workerAttendanceDetail?.employeeLastName +
                                                workerAttendanceDetail?.employeeFirstName
                                            }
                                            readOnly
                                        />
                                    </Col>
                                </Row>
                            </div>

                            <AntTable
                                style={{ padding: '20px' }}
                                columns={workerAttendanceListColumn}
                                dataSource={mergedData}
                                pagination={{
                                    pageSize: 10,
                                    position: ['bottomCenter'],
                                    showSizeChanger: false,
                                }}
                                size="small"
                                rowKey="id"
                            />
                        </div>
                </Paper>
                )}
            </Grid>
        </Grid>
)
}

export default WorkerAttendanceListSection;