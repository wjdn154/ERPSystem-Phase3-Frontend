import React, {useRef} from 'react';
import {Grid,Paper,Typography}  from "@mui/material";
import {Button, Table as AntTable, Modal as AntModal, Input, Select, DatePicker} from "antd";
import moment from "moment";
const {Option} = Select;


const EquipmentDataListSection = ({columns,
                                      data,
                                      handleRowSelection,
                                      handleSelectedRow,
                                      handleSave,
                                      insertEquipmentModal,
                                      handleInsertOk,
                                      handleInsertCancel,
                                      isInsertModalVisible,
                                      equipmentDataDetail,
                                      setEquipmentDataDetail,
                                      handleInputChange,
                                      handleOpenInsertModal,
                                      handleCostInput
                                  }) => {
    if(!data) return null;

    const workcenterCodeRef = useRef(null);
    const factoryCodeRef = useRef(null);
    const equipmentNumRef = useRef(null);
    const equipmentNameRef = useRef(null);
    const modelNameRef = useRef(null);
    const manufacturerRef = useRef(null);
    const equipmentTypeRef = useRef(null);
    const installDateRef = useRef(null);
    const purchaseDateRef = useRef(null);
    const equipmentImgRef = useRef(null);

    return (
        <Paper elevation={3} sx={{height: '100%', p: 2}}>
            <Typography variant="h6" marginBottom={'20px'}>설비 정보 목록</Typography>
            <AntTable
                style={{padding: '20px'}}
                columns={columns}
                dataSource={data}
                pagination={{pageSize: 10, position: ['bottomCenter'], showSizeChanger: false}} //페지이 크기변경옵션 숨김
                rowSelection={handleRowSelection}  //행선택 옵션
                size="small"
                rowKey="id"   //각행에 고유한 키로 id 사용
                onRow={(record) => ({
                    onClick: () => handleSelectedRow(record),   //행 클릭 시 이벤트
                    style: {cursor: 'pointer'},           //커서 스타일 변경
                })}
            />
        </Paper>
)
}

export default EquipmentDataListSection;