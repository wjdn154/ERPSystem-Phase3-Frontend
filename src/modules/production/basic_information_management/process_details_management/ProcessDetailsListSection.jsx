import React, {useState} from 'react';
import { Table, Button, Space, Modal } from 'antd';

const { confirm } = Modal;

const ProcessDetailsListSection = ({ columns, data, handleRowSelection, handleSelectedRow, rowClassName }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);



    if (!data) {
        console.log("Table data:", data);

        return null;
    }

    return (
        <Table
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 15, position: ['bottomCenter'], showSizeChanger: false }}
            size="small"
            rowKey="code"
            // rowSelection={{
            //     type: 'radio', // 선택 방식 (radio or checkbox)
            //     selectedRowKeys: selectedRowKeys, // 선택된 행의 키들
            //     onChange: (newSelectedRowKeys) => {
            //         console.log('새로운 Row Keys:', newSelectedRowKeys); // 디버그용 로그
            //         setSelectedRowKeys(newSelectedRowKeys); // 선택된 행의 키 업데이트
            //     },
            // }}
            onRow={(record) => ({
                onClick: () => handleSelectedRow(record), // 행 클릭 시 해당 공정 선택
                style: { cursor: 'pointer' },
            })}
            rowClassName={rowClassName}
        />
    );
};

export default ProcessDetailsListSection;
