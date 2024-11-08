import React, { useState } from 'react';
import { Form, Input, Button, notification } from 'antd';
import { createDepartment } from './DepartmentDataApi.jsx'; // 부서 등록 API

const DepartmentRegistrationForm = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true); // 로딩 시작
        try {
            await createDepartment(values); // 부서 등록 API 호출
            notification.success({
                message: '등록 성공',
                description: '부서가 성공적으로 등록되었습니다.',
            });
            onSuccess(); // 등록 후 성공 콜백 호출 (부서 목록 갱신)
        } catch (error) {
            notification.error({
                message: '등록 실패',
                description: '부서를 등록하는 중 오류가 발생했습니다.',
            });
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    return (
        <Form onFinish={onFinish} layout="vertical">
            <Form.Item
                name="departmentCode"
                label="부서 코드"
                rules={[{ required: true, message: '부서 코드를 입력하세요.' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="departmentName"
                label="부서 이름"
                rules={[{ required: true, message: '부서 이름을 입력하세요.' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="location"
                label="부서 위치"
                rules={[{ required: true, message: '부서 위치를 입력하세요.' }]}
            >
                <Input />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading}>
                등록
            </Button>
        </Form>
    );
};

export default DepartmentRegistrationForm;
