import React, {useMemo, useState} from "react";
import {Box, Grid, Grow, Paper, Typography} from "@mui/material";
import {MaintenanceHistoryListColumn} from "./MaintenanceHistoryListColumn.jsx";
import MaintenanceHistoryListSection from "./MaintenanceHistoryListSection.jsx"
import WelcomeSection from "../../../../components/WelcomeSection.jsx";
import {maintenanceTabItems} from "./MaintenanceHistoryUtil.jsx"
import {maintenanceHistoryHook} from "./MaintenanceHistoryHook.jsx";
import MaintenanceHistoryDetailSection from "./MaintenanceHistoryDetailSection.jsx";
import EquipmentDataDetailSection from "./MaintenanceHistoryDetailSection.jsx";
import TemporarySection from "../../../../components/TemporarySection.jsx";
import {Button, Col, DatePicker, Divider, Form, Input, Row, Select, Space, Spin, Table,Modal} from "antd";
import moment from "moment/moment.js";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {LOGISTICS_API, PRODUCTION_API} from "../../../../config/apiConstants.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {SearchOutlined} from "@ant-design/icons";

const MaintenanceHistoryPage = ({initialData}) => {

    const maintenanceMemoizedData = useMemo(() => initialData, [initialData]);
    const [activeTabKey, setActiveTabKey] = useState('1');

// 등록 탭으로 이동할 때 materialDataDetail 초기화
    const handleTabChangeWithReset = (key) => {
        setActiveTabKey(key);
        if (key === '2') {   // '2'는 등록 탭이라고 가정
            setMaintenanceDataDetail({

            });  // 등록 탭으로 이동할 때 빈 값으로 초기화
        }
    };

    const {
        data,
        showDetail,
        handleSelectedRow,
        handleRowSelection,
        maintenanceDataDetail = {},
        setMaintenanceDataDetail,
        handleInputChange,
        handleSave,
        handleDelete,
        showModal,
        handleInsertOk,
        handleUpdateCancel,
        insertMaintenanceModal,
        handleUpdateOk,
        isInsertModalVisible,
        isUpdateModalVisible,
        handleInsertCancel,
        handleOpenInsertModal,
        handleCostInput,
        handleUpdate
        // activeTabKey

    } = maintenanceHistoryHook(initialData);


    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [displayValues, setDisplayValues] = useState({});
    const notify = useNotificationContext(); // 알림 컨텍스트 사용

    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setModalData(null);
        setInitialModalData(null);
        fetchModalData(fieldName);
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;

        if(fieldName === 'equipment') apiPath = PRODUCTION_API.EQUIPMENT_DATA_API;

        try {
            const response = await apiClient.post(apiPath);
            let data = response.data;
            if (typeof data === 'string' && data.startsWith('[') && data.endsWith(']')) {
                data = JSON.parse(data);
            }

            const modalData = Array.isArray(data) ? data : [data];
            setModalData(modalData);
            setInitialModalData(modalData);
        } catch (error) {
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };

    const handleModalSelect = (record) => {
        console.log('selected recod' , record);
        switch (currentField) {
            case 'equipment':
                setMaintenanceDataDetail((prevState) => ({
                    ...prevState,
                    equipmentNum: record.equipmentNum,
                    equipmentName: record.equipmentName,
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    equipment: `[${record.equipmentNum}] ${record.equipmentName}`,
                }));
                break;
        }
        setIsModalVisible(false);
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Grid container spacing={3}
                  // sx={{ marginTop: 2 }}
                  // justifyContent="center"  // 수평 중앙 정렬
                  // alignItems="center"      // 수직 중앙 정렬
            >
                <Grid item xs={12} md={10}>
                    <WelcomeSection
                        title="유지보수 이력 관리"
                        description={(
                            <Typography>
                                유지보수 이력 관리 페이지는 <span>설비와 자재의 유지보수 내역을 기록하고 관리</span>하는 곳임. 이 페이지에서는 <span>유지보수 작업의 기록</span>을 남기고, 설비별 <span>정비 이력</span>을 조회할 수 있음. 유지보수 이력을 통해 <span>정기 정비 일정</span>을 설정하고, <span>장비의 가동률</span>을 높이는 데 도움을 줌.
                            </Typography>
                        )}
                        tabItems={maintenanceTabItems()}
                        activeTabKey={activeTabKey}
                        handleTabChange={handleTabChangeWithReset}
                    />
                </Grid>
            </Grid>
            {/* 설비정보 리스트 영역 */}
            {activeTabKey === '1' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Grow in={true} timeout={200}>
                            <div>
                                <MaintenanceHistoryListSection
                                    columns={MaintenanceHistoryListColumn}
                                    data={data}
                                    maintenanceDataDetail={maintenanceDataDetail}
                                    setMaintenanceDataDetail={setMaintenanceDataDetail}
                                    handleRowSelection={handleRowSelection}
                                    handleSelectedRow={handleSelectedRow}
                                    insertMaintenanceModal={insertMaintenanceModal}
                                    handleInsertOk={handleInsertOk}
                                    handleInsertCancel={handleInsertCancel}
                                    isInsertModalVisible={isInsertModalVisible}
                                    handleInputChange={handleInputChange}
                                    handleOpenInsertModal={handleOpenInsertModal}

                                />
                            </div>
                        </Grow>
                    </Grid>
                        <Grid item xs={12} md={12} >
                            {maintenanceDataDetail && (
                                <Grow in={showDetail} timeout={200} key={maintenanceDataDetail.id}>
                                    <div>
                                        <MaintenanceHistoryDetailSection
                                            data={data}
                                            maintenanceDataDetail={maintenanceDataDetail}
                                            handleInputChange={handleInputChange}
                                            setMaintenanceDataDetail={setMaintenanceDataDetail}
                                            handleDelete={handleDelete}
                                            isUpdateModalVisible={isUpdateModalVisible}
                                            showModal={showModal}
                                            handleUpdateOk={handleUpdateOk}
                                            handleUpdateCancel={handleUpdateCancel}
                                            handleCostInput={handleCostInput}
                                            handleUpdate={handleUpdate}
                                        />
                                    </div>
                                </Grow>
                            )}
                        </Grid>
                    </Grid>
            )}
            {activeTabKey === '2' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={10} md={10} sx={{ minWidth: '500px !important', maxWidth: '1500px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{p: 2}}>
                                <Typography variant="h6" marginBottom={'20px'}>설비 유지보수 정보 등록</Typography>
                                    <Form layout="vertical">
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>설비 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="설비"
                                                        value={maintenanceDataDetail.equipmentName}
                                                        onClick={() => handleInputClick('equipment')}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>유지보수 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="관리 담당자"
                                                        value={maintenanceDataDetail.maintenanceManager}
                                                        onChange={(e) => handleInputChange(e, 'maintenanceManager')}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="유지보수 비용"
                                                        value={maintenanceDataDetail.maintenanceCost}
                                                        onChange={(e) => handleInputChange(e, 'maintenanceCost')}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Space.Compact>
                                                    <Input style={{ width: '30%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="유형" disabled />
                                                    <Select
                                                        style={{ width: '80%' }}
                                                        value={maintenanceDataDetail.maintenanceType}
                                                        onChange={(value) =>
                                                            handleInputChange({ target: { value: value } }, 'maintenanceType')
                                                        }
                                                    >
                                                        <Option value={"EMERGENCY_REPAIR"}>긴급 수리</Option>
                                                        <Option value={"REGULAR_INSPECTION"}>정기점검</Option>
                                                        <Option value={"FAILURE_REPAIR"}>고장 수리</Option>
                                                    </Select>
                                                </Space.Compact>
                                            </Col>
                                            <Col span={6}>
                                                <Space.Compact>
                                                    <Input style={{ width: '50%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="진행 상태" disabled />
                                                    <Select
                                                        style={{ width: '80%' }}
                                                        value={maintenanceDataDetail.maintenanceStatus}
                                                        onChange={(value) =>
                                                            handleInputChange({ target: { value: value } }, 'maintenanceStatus')
                                                        }
                                                    >
                                                        <Option value={true}>완료</Option>
                                                        <Option value={false}>작업 중</Option>
                                                    </Select>
                                                </Space.Compact>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item>
                                                    <Input.Group compact>
                                                        <Input
                                                            style={{ width: '40%' }}
                                                            value="유지보수 일자"
                                                            readOnly
                                                        />
                                                        <DatePicker
                                                            disabledDate={(current) => current && current.year() !== 2024}
                                                            value={maintenanceDataDetail?.maintenanceDate ? moment(maintenanceDataDetail.maintenanceDate, 'YYYY-MM-DD') : null}
                                                            onChange={(date, dateString) => handleInputChange({ target: { value: dateString } }, 'maintenanceDate')}
                                                            format="YYYY-MM-DD"
                                                            style={{ width: '60%' }}
                                                        />
                                                    </Input.Group>
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Input.Group compact>
                                                    <Input
                                                        style={{ width: '55%' }}
                                                        value="다음 유지보수 예정일"
                                                        readOnly
                                                    />
                                                    <DatePicker
                                                        disabledDate={(current) => current && current.year() !== 2024}
                                                        value={maintenanceDataDetail?.nextScheduleDate ? moment(maintenanceDataDetail.nextScheduleDate, 'YYYY-MM-DD') : null}
                                                        onChange={(date, dateString) => handleInputChange({ target: { value: dateString } }, 'nextScheduleDate')}
                                                        format="YYYY-MM-DD"
                                                        style={{ width: '45%' }}
                                                    />
                                                </Input.Group>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="제목"
                                                        value={maintenanceDataDetail.title}
                                                        onChange={(e) => handleInputChange(e, 'title')}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={18}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="상세 내용"
                                                        value={maintenanceDataDetail.maintenanceDetail}
                                                        onChange={(e) => handleInputChange(e, 'maintenanceDetail')}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '20px'}}>
                                    <Button onClick={handleSave} type="primary" style={{marginRight: '10px'}}>등록</Button>
                                </div>
                                <Modal
                                    open={isModalVisible}
                                    onCancel={handleModalCancel}
                                    width="40vw"
                                    footer={null}
                                >
                                    {isLoading ? (
                                        <Spin />  // 로딩 스피너
                                    ) : (
                                        <>
                                            {/* 작업장 선택 모달 */}
                                            {currentField === 'equipment' && (
                                                <>
                                                    <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                        설비 선택
                                                    </Typography>
                                                    <Input
                                                        placeholder="검색"
                                                        prefix={<SearchOutlined />}
                                                        onChange={(e) => {
                                                            const value = e.target.value.toLowerCase();
                                                            if (!value) {
                                                                setModalData(initialModalData);
                                                            } else {
                                                                const filtered = initialModalData.filter((item) => {
                                                                    return (
                                                                        (item.equipmentNum && item.equipmentNum.toString().toLowerCase().includes(value)) ||
                                                                        (item.equipmentName && item.equipmentName.toLowerCase().includes(value))
                                                                    );
                                                                });
                                                                setModalData(filtered);
                                                            }
                                                        }}
                                                        style={{ marginBottom: 16 }}
                                                    />
                                                    {modalData && (
                                                        <Table
                                                            columns={[
                                                                { title: '설비 번호', dataIndex: 'equipmentNum', key: 'equipmentNum', align: 'center' },
                                                                { title: '설비 명', dataIndex: 'equipmentName', key: 'equipmentName', align: 'center' }
                                                            ]}
                                                            dataSource={modalData}
                                                            rowKey="id"
                                                            size="small"
                                                            pagination={{
                                                                pageSize: 15,
                                                                position: ['bottomCenter'],
                                                                showSizeChanger: false,
                                                                showTotal: (total) => `총 ${total}개`,
                                                            }}
                                                            onRow={(record) => ({
                                                                style: { cursor: 'pointer' },
                                                                onClick: () => handleModalSelect(record)
                                                            })}
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </Modal>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}
        </Box>
    )
}




export default MaintenanceHistoryPage;