import React from 'react';
import { Button, Modal, Space } from 'antd';

const { confirm } = Modal;

// 삭제 확인 다이얼로그 함수
export const showDeleteConfirm = (message, onDelete) => {
    confirm({
        title: '삭제하시겠습니까?',
        content: message || '이 작업은 되돌릴 수 없습니다. 정말로 삭제하시겠습니까?',
        okText: '예',
        okType: 'danger',
        cancelText: '아니오',
        onOk() {
            onDelete();
        },
        onCancel() {
            console.log('취소됨');
        },
    });
};

// 저장 및 삭제 버튼 컴포넌트
export const ActionButtons = ({ onSave, onDelete, isDeleteDisabled = false }) => (
    <Space style={{ position: 'absolute', right: 0, bottom: 0 }}>
        <Button type="primary" onClick={onSave} style={{ marginTop: '16px' }}>
            저장
        </Button>
        <Button
            type="primary"
            danger
            onClick={onDelete}
            style={{ marginTop: '16px' }}
            disabled={isDeleteDisabled}
        >
            삭제
        </Button>
    </Space>
);
