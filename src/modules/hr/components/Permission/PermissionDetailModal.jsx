import React, { useState } from 'react';
import { Modal, Checkbox, Button, Form } from 'antd';

const PermissionsModal = ({ visible, onCancel, onSave, permissions, userPermissions }) => {
    const [selectedPermissions, setSelectedPermissions] = useState(userPermissions || []);

    const handleCheckboxChange = (checkedValues) => {
        setSelectedPermissions(checkedValues);
    };

    const handleSave = () => {
        onSave(selectedPermissions);
    };

    return (
        <Modal
            title="권한 내역"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    닫기
                </Button>,
                <Button key="save" type="primary" onClick={handleSave}>
                    저장
                </Button>,
            ]}
        >
            <Form>
                <Checkbox.Group
                    options={permissions}
                    value={selectedPermissions}
                    onChange={handleCheckboxChange}
                />
            </Form>
        </Modal>
    );
};

export default PermissionsModal;
