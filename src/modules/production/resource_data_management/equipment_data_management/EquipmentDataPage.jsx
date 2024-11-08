import React, {useEffect, useMemo, useState} from "react";
import {Box, Grid, Grow, Paper, Typography} from "@mui/material";
import {equipmentDataHook} from './EquipmentDataHook.jsx';
import EquipmentDataListSection from "./EquipmentDataListSection.jsx";
import {equipmentDataListColumn} from "./EquipmentDataListColumn.jsx";
import EquipmentDataDetailSection from "./EquipmentDataDetailSection.jsx";
import {tabItems} from "./EquipmentDataUtil.jsx"
import WelcomeSection from "../../../../components/WelcomeSection.jsx";
import {Button, Checkbox, Col, DatePicker, Divider, Form, Input, Modal, notification, Row, Select, Space, Spin, Table, Upload} from "antd";
import dayjs from "dayjs";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {PRODUCTION_API, LOGISTICS_API} from "../../../../config/apiConstants.jsx"
import apiClient from "../../../../config/apiClient.jsx";
import moment from "moment/moment.js";
import defaultImage from "../../../../assets/img/uploads/defaultImage.png";
import {SearchOutlined} from "@ant-design/icons";
import CloudUploadIcon from "@mui/icons-material/CloudUpload.js";


const EquipmentDataPage = ({initialData}) => {

    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [form] = Form.useForm(); // 폼 인스턴스 생성
    const [equipmentForm] = Form.useForm(); // 폼 인스턴스 생성
    const [fetchEquipmentData, setFetchEquipmentData] = useState(false); // 설비 조회한 정보 상태
    const [equipmentParam, setEquipmentParam] = useState(false); // 수정 할 설비 정보 상태
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const [equipmentField, setEquipmentField] = useState(''); // 모달 분기 할 필드 상태
    const [modalData, setModalData] = useState(null); // 모달 데이터 상태
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 활성화 여부 상태
    const [displayValues, setDisplayValues] = useState({});
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [selectedFile, setSelectedFile] = useState(null);

    const {
        data,
        showDetail,
        handleSelectedRow,
        handleRowSelection,
        equipmentDataDetail = {},
        setEquipmentDataDetail,
        handleInputChange,
        handleDelete,
        handleUpdate,
        handleSave,
        showModal,
        handleInsertOk,
        handleUpdateCancel,
        insertEquipmentModal,
        handleUpdateOk,
        isInsertModalVisible,
        isUpdateModalVisible,
        handleInsertCancel,
        handleOpenInsertModal,
        handleCostInput,
        setData,
        setShowDetail


    } = equipmentDataHook(initialData);

// 등록 탭으로 이동할 때 materialDataDetail 초기화
    const handleTabChangeWithReset = (key) => {
        setActiveTabKey(key);
        if (key === '2') {   // '2'는 등록 탭이라고 가정
            setEquipmentDataDetail({

            });  // 등록 탭으로 이동할 때 빈 값으로 초기화
        }
    };
    //모달창 열기 핸들러
    const handleInputClick = (fieldName) => {
        setEquipmentField(fieldName);
        setModalData(null);   //모달 열기 전에 데이터를 초괴화
        fetchModalData(fieldName);   //모달 데이터 가져오기 호출
        setIsModalVisible(true);  //모달창 열기
    };

    //모달창 닫기 햄들러
    const handleModalCancel = () => setIsModalVisible(false);

    //모달창 데이터 가져오기 함수
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;
        if(fieldName === 'workcenter') apiPath = PRODUCTION_API.WORKCENTER_LIST_API;
        if(fieldName === 'factory') apiPath = LOGISTICS_API.WAREHOUSE_LIST_API;
        try{
            const response = await apiClient.post(apiPath);
            setModalData(response.data);
        }catch (error){
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        }finally {
            setIsLoading(false);
        }
    };

    //모달창 선택 핸들러
    const handleModalSelect = (record) => {

        switch (equipmentField) {
            case 'workcenter':
                setEquipmentDataDetail((prevState) => ({
                    ...prevState,
                    workcenterCode: record.code,
                    workcenterName: record.name,
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    workcenter: `[${record.code}] ${record.name}`,
                }));
            break;
            case 'factory':
                setEquipmentDataDetail((prevState) => ({
                    ...prevState,
                    factoryCode: record.code,
                    factoryName: record.name,
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    factory: `[${record.code}] ${record.name}`,
                }));
                break;
        }
        //모달창 닫기
        setIsModalVisible(false);
    };
    const formatNumberWithComma = (value) => {
        if (value === undefined || value === null) {
            return '';  // 값이 없으면 빈 문자열 반환
        }
        // value가 숫자인 경우 문자열로 변환
        const stringValue = String(value);
        return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 천 단위마다 콤마 추가
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="설비 정보 관리"
                        description={(
                            <Typography>
                                설비 정보 관리 페이지는 <span>생산에 사용되는 각종 설비의 정보를 관리</span>하는 곳임. 이 페이지에서는 <span>설비 추가, 수정, 삭제</span>가 가능하며, 설비의 <span>모델명, 위치, 사용 가능 상태</span> 등을 관리할 수 있음. 또한, 설비별 <span>정비 일정</span>을 설정하여 설비의 효율성을 유지하고 <span>생산 공정의 안정성</span>을 높일 수 있음.
                            </Typography>
                        )}
                        tabItems={tabItems()}
                        activeTabKey={activeTabKey}
                        handleTabChange={handleTabChangeWithReset}
                    />
                </Grid>
            </Grid>
            {/* 설비정보 리스트 영역 */}
            {activeTabKey === '1' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                        <Grow in={true} timeout={200}>
                            <div>
                                <EquipmentDataListSection
                                    columns={equipmentDataListColumn}
                                    data={data}
                                    equipmentDataDetail={equipmentDataDetail}
                                    setEquipmentDataDetail={setEquipmentDataDetail}
                                    handleRowSelection={handleRowSelection}
                                    handleSelectedRow={handleSelectedRow}
                                    insertEquipmentModal={insertEquipmentModal}
                                    handleInsertOk={handleInsertOk}
                                    handleInsertCancel={handleInsertCancel}
                                    isInsertModalVisible={isInsertModalVisible}
                                    handleInputChange={handleInputChange}
                                    handleOpenInsertModal={handleOpenInsertModal}

                                />
                            </div>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                        {equipmentDataDetail && (
                            <Grow in={showDetail} timeout={200} key={equipmentDataDetail.id}>
                                <div>
                                    <EquipmentDataDetailSection
                                        data={data}
                                        equipmentDataDetail={equipmentDataDetail}
                                        handleInputChange={handleInputChange}
                                        setEquipmentDataDetail={setEquipmentDataDetail}
                                        handleDelete={handleDelete}
                                        isUpdateModalVisible={isUpdateModalVisible}
                                        showModal={showModal}
                                        handleUpdateOk={handleUpdateOk}
                                        handleUpdateCancel={handleUpdateCancel}
                                        handleCostInput={handleCostInput}
                                        handleUpdate={handleUpdate}
                                        setShowDetail={setShowDetail}
                                        setData={setData}
                                    />

                                </div>
                            </Grow>
                        )}
                        </Grid>
                    </Grid>
            )}
            {activeTabKey === '2' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={8} md={8} sx={{ minWidth: '500px !important', maxWidth: '1500px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{p: 2}}>
                                <Typography variant="h6" marginBottom={'20px'}>설비 상세 정보 등록</Typography>
                                    <Form layout="vertical">
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>설비 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item rules={[{ required: true, message: '설비 번호를 입력하세요.' }]}>
                                                    <Input
                                                        addonBefore="설비 번호"
                                                        value={equipmentDataDetail.equipmentNum}
                                                        onChange={(e) => handleInputChange(e, 'equipmentNum')}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item rules={[{ required: true, message: '설비 명을 입력하세요.' }]}>
                                                    <Input
                                                        addonBefore="설비 명"
                                                        value={equipmentDataDetail.equipmentName}
                                                        onChange={(e) => handleInputChange(e, 'equipmentName')}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item rules={[{ required: true, message: '모델명을 입력하세요.' }]}>
                                                    <Input
                                                        addonBefore="모델 명"
                                                        value={equipmentDataDetail.modelName}
                                                        onChange={(e) => handleInputChange(e, 'modelName')}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="제조사"
                                                        value={equipmentDataDetail.manufacturer}
                                                        onChange={(e) => handleInputChange(e, 'manufacturer')}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="구매 비용"
                                                        value={equipmentDataDetail.cost }
                                                        onChange={(e) => handleInputChange(e, 'cost')}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col span={8}>
                                                <Form.Item>
                                                    <Space.Compact>
                                                        <Input style={{ width: '30%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="유형" disabled />
                                                        <Select
                                                            style={{ width: '70%' }}
                                                            value={equipmentDataDetail.equipmentType}
                                                            onChange={(value) =>
                                                                handleInputChange({ target: { value: value } }, 'equipmentType')
                                                            }
                                                        >
                                                            <Option value={"ASSEMBLY"}>조립 설비</Option>
                                                            <Option value={"MACHINING"}>가공 설비</Option>
                                                            <Option value={"INSPECTION"}>검사 설비</Option>
                                                            <Option value={"PACKAGING"}>포장 설비</Option>
                                                        </Select>
                                                    </Space.Compact>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item>
                                                    <Input.Group compact>
                                                        <Input
                                                            style={{ width: '30%' }}
                                                            value="구매 날짜"
                                                            readOnly
                                                        />
                                                        <DatePicker
                                                            disabledDate={(current) => current && current.year() !== 2024}
                                                            value={equipmentDataDetail.purchaseDate ? moment(equipmentDataDetail.purchaseDate, 'YYYY-MM-DD') : null}
                                                            onChange={(date, dateString) => handleInputChange({ target: { value: dateString } }, 'purchaseDate')}
                                                            format="YYYY-MM-DD"
                                                            style={{ width: '70%' }}
                                                        />
                                                    </Input.Group>
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Input.Group compact>
                                                    <Input
                                                        style={{ width: '30%',align:'center'}}
                                                        value="설치 날짜"
                                                        readOnly
                                                    />
                                                    <DatePicker
                                                        disabledDate={(current) => current && current.year() !== 2024}
                                                        value={equipmentDataDetail.installDate ? moment(equipmentDataDetail.installDate, 'YYYY-MM-DD') : null}
                                                        onChange={(date, dateString) => handleInputChange({ target: { value: dateString } }, 'installDate')}
                                                        format="YYYY-MM-DD"
                                                        style={{ width: '70%' }}
                                                    />
                                                </Input.Group>
                                            </Col>
                                            <Col span={8}>
                                                <Space.Compact>
                                                    <Input style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="가동 상태" disabled />
                                                    <Select
                                                        style={{ width: '60%' }}
                                                        value={equipmentDataDetail.operationStatus}
                                                        onChange={(value) =>
                                                            handleInputChange({ target: { value: value } }, 'operationStatus')
                                                        }
                                                    >
                                                        <Option value={"BEFORE_OPERATION"}>가동 전</Option>
                                                        <Option value={"OPERATING"}>가동 중</Option>
                                                        <Option value={"MAINTENANCE"}>유지보수 중</Option>
                                                        <Option value={"FAILURE"}>고장</Option>
                                                        <Option value={"REPAIRING"}>수리 중</Option>
                                                    </Select>
                                                </Space.Compact>
                                            </Col>
                                        </Row>
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>추가 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="설치된 작업장"
                                                        onClick={() => handleInputClick('workcenter')}
                                                        value={equipmentDataDetail.workcenterName}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="설치된 공장"
                                                        onClick={() => handleInputClick('factory')}
                                                        value={equipmentDataDetail.factoryName}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>
                                            이미지 업로드
                                        </Divider>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item label="설비 이미지">
                                                    {/* 이미지 미리보기 */}
                                                    <div style={{ marginBottom: '20px' }}>
                                                        <img
                                                            src={selectedFile ? URL.createObjectURL(selectedFile) : defaultImage}
                                                            alt="프로필 사진"
                                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <Upload
                                                        beforeUpload={() => false} // 실제 업로드를 막기 위해 false 반환
                                                        onChange={(info) => {
                                                            const file = info.fileList[info.fileList.length - 1]?.originFileObj; // fileList의 마지막 파일 객체 사용
                                                            setSelectedFile(file); // 선택된 파일을 상태로 설정
                                                        }}
                                                        fileList={
                                                            selectedFile
                                                                ? [{ uid: '-1', name: selectedFile.name, status: 'done', url: selectedFile.url }]
                                                                : []
                                                        } // 파일 리스트 설정
                                                    >
                                                        <Button icon={<CloudUploadIcon />}>파일 선택</Button>
                                                    </Upload>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        {/* 저장 버튼 */}
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                            <Button onClick={handleSave} type="primary" style={{marginRight: '10px'}}>등록</Button>
                                        </Box>
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
                                                    {equipmentField === 'workcenter' && (
                                                        <>
                                                            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                                작업장 선택
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
                                                                                (item.code && item.name.toString().toLowerCase().includes(value)) ||
                                                                                (item.name && item.name.toLowerCase().includes(value))
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
                                                                        { title: '코드', dataIndex: 'code', key: 'code', align: 'center' },
                                                                        { title: '작업장 명', dataIndex: 'name', key: 'name', align: 'center' }
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
                                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                                        <Button onClick={handleModalCancel} variant="contained" type="danger" sx={{ mr: 1 }}>
                                                            닫기
                                                        </Button>
                                                    </Box>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                            {/* 공장 선택 모달 */}
                                            {equipmentField === 'factory' && (
                                                <>
                                                    <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                        공장 선택
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
                                                                        (item.code && item.name.toString().toLowerCase().includes(value)) ||
                                                                        (item.name && item.name.toLowerCase().includes(value))
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
                                                                { title: '코드', dataIndex: 'code', key: 'code', align: 'center' },
                                                                { title: '이름', dataIndex: 'name', key: 'name', align: 'center' }
                                                            ]}
                                                            dataSource={modalData}
                                                            rowKey="id"
                                                            size="small"
                                                            pagination={{ pageSize: 15, position: ['bottomCenter'], showSizeChanger: false }}
                                                            onRow={(record) => ({
                                                                style: { cursor: 'pointer' },
                                                                onClick: () => handleModalSelect(record) // 선택 시 처리
                                                            })}
                                                        />
                                                    )}
                                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                                    <Button onClick={handleModalCancel} variant="contained" type="danger" sx={{ mr: 1 }}>
                                                        닫기
                                                    </Button>
                                                </Box>
                                                </>
                                            )}
                                        </Modal>
                                    </Form>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
                )}
        </Box>
    )};




export default EquipmentDataPage;