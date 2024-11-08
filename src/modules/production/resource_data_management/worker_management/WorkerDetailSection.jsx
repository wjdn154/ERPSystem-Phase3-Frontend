import React, { useState } from 'react';
import {Form, Input, Select, Button, Divider, Row, Col, Upload, Space} from 'antd';
import { Typography, Paper, Box, Grid } from '@mui/material';
import defaultImage from "../../../../assets/img/uploads/defaultImage.png";
import {employmentStatusMap, employmentTypeMap} from "./WorkerListColumn.jsx";
import CloudUploadIcon from "@mui/icons-material/CloudUpload.js";

const { Option } = Select;

const WorkerDetailSection = ({
                                 workerDetail,
                                 handleUpdate,
                                 handleInputChange,
                             }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    return (
        <Paper elevation={3} sx={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 리스트 아래에 작업자 세부 정보 표시 */}
            {workerDetail && (

                <div style={{ marginTop: '20px' }}>
                    <Typography variant="h6" marginBottom="20px">
                        작업자 정보
                    </Typography>
                    <Grid sx={{ padding: '20px 20px 0px 20px' }}>
                        <Form layout="vertical">
                            <Row gutter={16} >
                                <Col span={7}>
                                    <Form.Item>
                                        <Input addonBefore="사원번호" value={workerDetail?.employeeNumber} readOnly />
                                    </Form.Item>
                                </Col>
                                <Col span={7}>
                                        <Input
                                            addonBefore="성명" value={workerDetail?.employeeLastName + workerDetail?.employeeFirstName}
                                            readOnly
                                        />
                                </Col>
                                <Col span={7}>
                                    <Input addonBefore="부서" value={workerDetail?.departmentName} readOnly />
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={7}>
                                    <Form.Item>
                                        <Input addonBefore="직위" value={workerDetail?.positionName} readOnly />
                                    </Form.Item>
                                </Col>
                                <Col span={7}>
                                    <Input addonBefore="직책" value={workerDetail?.jobTitleName} readOnly />
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={7}>
                                    <Input addonBefore="고용상태" value={employmentStatusMap[workerDetail?.employmentStatus]} readOnly />
                                </Col>
                                <Col span={7}>
                                    <Form.Item>
                                        <Input addonBefore="고용유형" value={employmentTypeMap[workerDetail?.employmentType]} readOnly />
                                    </Form.Item>
                                </Col>
                                <Col span={7}>
                                    <Input addonBefore="고용일" value={workerDetail?.hireDate} readOnly />
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={7}>
                                    <Form.Item>
                                        <Input addonBefore="배치된 작업장" value={workerDetail?.workcenterName || '미 배치'} readOnly />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                        <Space.Compact>
                                            <Input style={{ width: '60%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="안전교육 이수 여부" disabled />
                                            <Select
                                                style={{ width: '40%' }}
                                                value={workerDetail?.trainingStatus}
                                                onChange={(value) =>
                                                    handleInputChange({ target: { value: value } }, 'trainingStatus')
                                                }
                                            >
                                                <Option value={true}>이수</Option>
                                                <Option value={false}>미이수</Option>
                                            </Select>
                                        </Space.Compact>
                                </Col>
                            </Row>

                            {/* 이미지 업로드 */}
                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>
                                이미지 업로드
                            </Divider>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item>
                                        <div style={{ marginBottom: '1px' }}>
                                            <img
                                                src={selectedFile
                                                    ? URL.createObjectURL(selectedFile)
                                                    : workerDetail?.profilePicture
                                                        ? workerDetail?.profilePicture
                                                        : '/src/assets/img/uploads/defaultImage.png'}
                                                alt="미리보기 이미지"
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    </Form.Item>

                                </Col>
                            </Row>
                        </Form>
                    </Grid>
                </div>
            )}
            <Box style={{ display: 'flex', justifyContent: 'flex-end'}}>
                <Button type="primary" onClick={handleUpdate} style={{ marginRight: '8px' }}>
                    수정
                </Button>
            </Box>
        </Paper>
    );
};

export default WorkerDetailSection;
