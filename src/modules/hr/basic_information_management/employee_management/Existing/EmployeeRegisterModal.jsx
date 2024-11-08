import React from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { EMPLOYEE_API } from '../../../../../../config/apiConstants.jsx';
import apiClient from "../../../../../../config/apiClient.jsx";

const EmployeeRegisterModal = ({ visible, onCancel, newEmployee, setNewEmployee, setData }) => {

    // 입력 필드 값 변경 핸들러
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee((prev) => ({ ...prev, [name]: value }));
    };

    // 사원 등록 처리 핸들러
    const handleRegisterEmployee = async () => {
        try {
            // 신규 사원 데이터를 API로 전송
            await apiClient.post(EMPLOYEE_API.SAVE_EMPLOYEE_DATA_API, newEmployee);

            // 성공 메시지
            message.success('사원이 성공적으로 등록되었습니다.');

            // 입력 필드 초기화
            setNewEmployee({ name: '', age: '', department: '' });

            // 서버에서 업데이트된 사원 리스트를 가져와 상태 갱신
            const updatedData = await apiClient.get(EMPLOYEE_API.EMPLOYEE_DATA_API);
            setData(updatedData.data); // 상태 업데이트

            // 모달 닫기
            onCancel();
        } catch (error) {
            console.error('사원 등록 중 오류 발생:', error);
            message.error('사원 등록 중 오류가 발생했습니다.');
        }
    };

    return (
        <Modal
            title="사원 등록"
            visible={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    취소
                </Button>,
                <Button key="submit" type="primary" onClick={handleRegisterEmployee}>
                    등록
                </Button>
            ]}
        >
            <Form layout="vertical">
                <Form.Item label="이름" required>
                    <Input
                        name="name"
                        value={newEmployee.name}
                        onChange={handleInputChange}
                        placeholder="이름을 입력하세요"
                    />
                </Form.Item>
                <Form.Item label="나이" required>
                    <Input
                        name="age"
                        value={newEmployee.age}
                        onChange={handleInputChange}
                        placeholder="나이를 입력하세요"
                    />
                </Form.Item>
                <Form.Item label="부서" required>
                    <Input
                        name="department"
                        value={newEmployee.department}
                        onChange={handleInputChange}
                        placeholder="부서를 입력하세요"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EmployeeRegisterModal;
