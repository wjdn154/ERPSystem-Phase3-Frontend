import React, { useEffect } from 'react';
import { Modal, Button, Form, Input, Row, Col } from 'antd';

const EmployeeDetailModal = ({ visible, onCancel, employee, onSave }) => {
    const [form] = Form.useForm();  // Ant Design Form Hook

    // 모달이 열릴 때 선택된 사원의 데이터를 폼 필드에 채워 넣음
    useEffect(() => {
        if (employee) {
            form.setFieldsValue({
                employeeNumber: employee.employeeNumber,
                firstName: employee.firstName,
                lastName: employee.lastName,
                dateOfBirth: employee.dateOfBirth,
                phoneNumber: employee.phoneNumber,
                employmentStatus: employee.employmentStatus,
                employmentType: employee.employmentType,
                email: employee.email,
                address: employee.address,
                hireDate: employee.hireDate,
                departmentName: employee.departmentName,
                positionName: employee.positionName,
                jobTitleName: employee.jobTitleName,
                bankAccountNumber: employee.bankAccountNumber,
                profilePicture: employee.profilePicture,
                isHouseHoldHead: employee.isHouseHoldHead,
            });
        }
    }, [employee, form]);  // employee가 변경될 때마다 폼 필드에 값을 채움

    //저장 핸들러
    const handleSave = () => {
        form.validateFields().then((values) => {
            // 사원 번호를 유지하면서 수정된 데이터를 부모 컴포넌트로 전달
            const updatedEmployee = {
                ...employee,  // 기존 employee 정보 유지
                ...values,    // 수정된 값 덮어쓰기
            };
            onSave(updatedEmployee);  // 부모 컴포넌트로 수정된 데이터 전달
        }).catch((info) => {
            console.log('Validate Failed:', info);
        });
    };

    return (
        <Modal
            title="사원 상세 정보"
            open={visible}
            onCancel={onCancel}
            width={800}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    닫기
                </Button>,
                <Button key="save" type="primary" onClick={handleSave}>
                    저장
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>  {/* 필드 간의 공간을 추가 */}
                    <Col span={12}>  {/* 첫 번째 열에 두 개의 필드를 배치 */}
                        <Form.Item label="사원 번호" name="employeeNumber">
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="성" name="firstName">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="이름" name="lastName">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="생년월일" name="dateOfBirth">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="휴대폰 번호" name="phoneNumber">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="고용 상태" name="employmentStatus">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="고용 유형" name="employmentType">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="이메일" name="email">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="주소" name="address">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="입사일자" name="hireDate">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="부서명" name="departmentName">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="직위" name="positionName">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="직책" name="jobTitleName">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="계좌 번호" name="bankAccountNumber">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="프로필 사진" name="profilePicture">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="세대주 여부" name="isHouseholdHead">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default EmployeeDetailModal;
