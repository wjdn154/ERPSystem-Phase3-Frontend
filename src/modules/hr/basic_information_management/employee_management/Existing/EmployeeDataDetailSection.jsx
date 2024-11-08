import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Modal,
    TableContainer,
    Table as MuiTable,
    TableBody,
    TableRow,
    TableCell,
    Grid
}  from "@mui/material";

import {Button, Col, Form, Row, Input,Table as AntTable, Switch, Select} from "antd";
const { Option } = Select;
import {employeeDataDetailColumn} from "./EmployeeDataDetailColumn.jsx";
const EmployeeDataDetailSection = ({
      data,
      employeeDataDetail,
      handlePopupClick,
      isFinancialStatementModalVisible,
      isRelationCodeModalVisible,
      handleClose,
      selectHrStatement,
      handleInputChange,
      handleInputChange2,
      handleDeleteMemo,
      handleAddNewMemo,
      setEmployeeDataDetail,
      selectRelationCode,
      handleSave,
      deleteRelationCode
}) => {
    // <Paper elevation={3} sx={{ p: 2 }}>
    //     <Typography variant="h6" marginBottom={'20px'}>사원 상세 내용</Typography>
    //     <Box sx={{ padding: '20px' }}>
    //         <Form layout="vertical">
    //             <Row gutter={16}>
    //                 <Col span={12}>
    //                     <Form.Item
    //                         label="성"
    //                         onClick={employeeDataDetail.modificationType ? () => handlePopupClick('성') : undefined}
    //                         style={{ marginBottom: '4px' }}
    //                     >
    //                         <div style={{ display: 'flex', alignItems: 'center' }}>
    //                             <Input value={employeeDataDetail.code} style={{ marginRight: '10px', flex: 1, backgroundColor: '#f6a6a6 !important' }} readOnly />
    //                             <Input value={employeeDataDetail.name} style={{ flex: 1 }} onChange={(e) => handleInputChange(e, 'name')} readOnly={!employeeDataDetail.modificationType} />
    //                         </div>
    //                     </Form.Item>
    //                 </Col>
    //         </Form>
    // 모달 열기 상태 관리
    const [isModalVisible, setIsModalVisible] = useState(false);

    // 폼 데이터 상태 관리
    const [formData, setFormData] = useState({
        code: '',
        name: '',
    });

    // 모달 열기
    const showModal = () => {
        setIsModalVisible(true);
    };

    // 모달 닫기
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // 폼 제출 핸들러
    const handleFormSubmit = () => {
        // 제출 로직 추가
        handleClose();
        setIsModalVisible(false); // 모달 닫기
    };

    // 입력값 변경 핸들러
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div>
            {/* 사원 등록 버튼 */}
            <Box display="flex" justifyContent="flex-end" p={2}>
            <Button type="primary" onClick={showModal}>
                사원 등록
            </Button>
            </Box>

            <Modal
                open={isModalVisible}
                onClose={handleCancel}
                aria-labelledby="employee-registration-modal"
                aria-describedby="employee-registration-form"
            >
                <Paper elevation={3} style={{ padding: '20px', width: '400px', margin: 'auto', marginTop: '10%' }}>
                    <Typography variant="h6" marginBottom={'20px'}>사원 등록</Typography>
                    <Form layout="vertical" onFinish={handleFormSubmit}>
                        <Form.Item label="사원 코드" required>
                            <Input
                                name="code"
                                value={formData.code}
                                onChange={handleFormChange}
                            />
                        </Form.Item>
                        <Form.Item label="사원 이름" required>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                            />
                        </Form.Item>
                        <Grid container spacing={2} justifyContent="flex-end">
                            <Grid item>
                                <Button type="default" onClick={handleCancel}>
                                    취소
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button type="primary" htmlType="submit">
                                    저장
                                </Button>
                            </Grid>
                        </Grid>
                    </Form>
                </Paper>
            </Modal>
        </div>
    );
}
export default EmployeeDataDetailSection;