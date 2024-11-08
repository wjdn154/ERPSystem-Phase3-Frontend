import React, {useMemo, useState} from 'react';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { materialTabItems } from './MaterialDataUtil.jsx';
import { Typography, Paper, Box, Grid ,Grow} from '@mui/material';
import {Form, Input, Select, Button, Divider, Row, Col, Upload, Space, Spin, Table, Modal, Tag} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import MaterialListSection from "./MaterialListSection.jsx"
import SecondMaterialListSection from "./SecondMaterialListSection.jsx";
import {materialDataHook} from "./MaterialDataHook.jsx"
import {materialListColumn} from "./MaterialListColumn.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {FINANCIAL_API, PRODUCTION_API} from "../../../../config/apiConstants.jsx";
import {DownSquareOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";

const MaterialDataPage = ({initialData}) => {

    const {data,
        showDetail,
        selectedRow,
        handleSelectedRow,
        handleRowSelection,
        materialDataDetail = {},
        setMaterialDataDetail,
        handleInputChange,
        handleDelete,
        handleUpdate,
        handleSave,
        handleTabChange,
        activeTabKey,
        filteredProductData,
        setFilteredProductData,
        filterHazardousData,
        setFilterHazardousData,
        onMaterialRowClick,
        onProductRowClick,
        handleDeleteProduct,
        handleProductRowSelection,
        handleProductInsertOk,
        handleProductSave,
        handleHazardousInsertOk,
        handleHazardousSave
    } = materialDataHook(initialData);

    const [isLoading, setIsLoading] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [displayValues, setDisplayValues] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [newGroup, setNewGroup] = useState({ code: '', name: '' });
    const [selectedDetailRowKeys, setSelectedDetailRowKeys] = useState([]); // 품목 상세 항목의 선택된 키
    const [isNewRow, setIsNewRow] = useState(false);  // 새로운 항목이 추가되었는지 여부
    const [newRowData, setNewRowData] = useState({
        hazardousMaterialCode: '',
        hazardousMaterialName: '',
        hazardLevel: ''
    });
    const notify = useNotificationContext(); // 알림 컨텍스트 사용

    // 등록 탭으로 이동할 때 materialDataDetail 초기화
    const handleTabChangeWithReset = (key) => {
        handleTabChange(key);
        if (key === '2') {   // '2'는 등록 탭이라고 가정
            setMaterialDataDetail({
                materialCode: '',
                materialName: '',
                stockQuantity: '',
                purchasePrice: '',
                materialType: '',
                representativeCode: '',  // 거래처 코드를 빈 문자열로 초기화
                representativeName: '',  // 거래처 이름을 빈 문자열로 초기화
            });  // 등록 탭으로 이동할 때 빈 값으로 초기화
        }
    };

    // handleHazardousAddRow 함수: 새로운 항목 추가 시 빈 입력 필드를 가진 행 생성
    const handleHazardousAddRow = () => {
        setIsNewRow(true);
        setNewRowData({
            hazardousMaterialCode: '',
            hazardousMaterialName: '',
            hazardLevel: ''
        });
        //setFilterHazardousData((prev) => (Array.isArray(prev) ? [...prev, newRow] : [newRow]));
    };

// 입력값 변경 핸들러
    const handleHazardousInputChange = (index, field, value) => {
        setFilterHazardousData((prevData) => {
            const updatedData = [...prevData];
            updatedData[index][field] = value;
            return updatedData;
        });
    };
    // 입력값 변경 핸들러 (새 행에서만)
    const handleNewRowInputChange = (field, value) => {
        setNewRowData((prevData) => ({
            ...prevData,
            [field]: value
        }));
    };

    const handleHazardousDeleteRow = (index) => {
        setFilterHazardousData((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRowSelectionChange = (selectedRowKeys) => {
        setSelectedDetailRowKeys(selectedRowKeys);  // 선택된 행의 키 상태 업데이트
        console.log('선택된 행 키:', selectedRowKeys);  // 선택된 키 출력

    };
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

        if(fieldName === 'client') apiPath = FINANCIAL_API.FETCH_CLIENT_LIST_API;
        if(fieldName === 'hazardousMaterial') apiPath = PRODUCTION_API.HAZARDOUS_MATERIAL_LIST_API;

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
            case 'client':
                setMaterialDataDetail((prevState) => ({
                    ...prevState,
                    representativeCode: record.id,
                    representativeName: record.printClientName,
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    client: `[${record.id}] ${record.printClientName}`,
                }));
                break;
            case 'hazardousMaterial':
                const newRow = {
                    hazardousMaterialCode: record.hazardousMaterialCode,
                    hazardousMaterialName: record.hazardousMaterialName,
                    hazardLevel: record.hazardLevel
                };
                setFilterHazardousData((prev) =>
                    (Array.isArray(prev) ? [...prev, newRow] : [newRow]));
                break;

        }
        setIsModalVisible(false);
    };

    const formatNumberWithComma = (value) => {
        // value가 숫자인 경우 문자열로 변환
        const stringValue = String(value);
        return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 천 단위마다 콤마 추가
    };

    // 유해물질 테이블 설정
    const columns = [
        {
            title: '유해물질 코드',
            dataIndex: 'hazardousMaterialCode',
            key: 'hazardousMaterialCode',
            width: '30%',
            align: 'center',
            render: (text, record, index) =>
                isNewRow && index === filterHazardousData.length ? (
                    <Input
                        value={newRowData.hazardousMaterialCode}
                        onClick={() => {
                            handleInputClick('hazardousMaterial');
                        }}
                        onChange={(e) => handleNewRowInputChange('hazardousMaterialCode', e.target.value)}
                        placeholder="코드 입력"
                    />
                ) : (
                    <span>{text}</span>
                ),
        },
        {
            title: '유해물질 명',
            dataIndex: 'hazardousMaterialName',
            key: 'hazardousMaterialName',
            width: '30%',
            align: 'center',
            render: (text) => <span>{text || newRowData.hazardousMaterialName}</span>,
        },
        {
            title: '위험등급',
            dataIndex: 'hazardLevel',
            key: 'hazardLevel',
            width: '30%',
            align: 'center',
            render: (text) => (
                text ? (
                    <Tag color={text === 'HIGH' ? 'red' : text === 'MEDIUM' ? 'yellow' : 'blue'}>
                        {text === 'HIGH' ? '높음' : text === 'MEDIUM' ? '보통' : '낮음'}
                    </Tag>
                ) : null // 값이 없으면 아무것도 렌더링하지 않음
            ),
        },
        {
            key: 'action',
            render: (text, record, index) =>
                isNewRow && index === filterHazardousData.length ? null : (
                    <Button type="danger" onClick={() => handleHazardousDeleteRow(index)}>
                        삭제
                    </Button>
                ),

        },
    ];
    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="자재 정보 관리"
                        description={(
                            <Typography>
                                자재 정보 관리 페이지는 <span>생산에 필요한 자재의 기본 정보</span>를 관리하며, 자재의 <span>재고 및 자재 흐름</span>을 체계적으로 관리할 수 있음.
                            </Typography>
                        )}
                        tabItems={materialTabItems()}
                        activeTabKey={activeTabKey}
                        handleTabChange={handleTabChangeWithReset}
                    />
                </Grid>
            </Grid>

            {activeTabKey === '1' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1200px !important' }}>
                        <Grow in={true} timeout={200} >
                            <div>
                                <MaterialListSection
                                    data={data}
                                    materialDataDetail={materialDataDetail}
                                    setMaterialDataDetail={setMaterialDataDetail}
                                    handleRowSelection={handleRowSelection}
                                    handleSelectedRow={handleSelectedRow}/>
                            </div>
                        </Grow>
                    </Grid>
                    {materialDataDetail && selectedRow &&(
                        <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1200px !important' }}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h6" marginBottom="20px">
                                        자재 상세 정보
                                    </Typography>

                                    <Row gutter={16}>
                                        <Col span={7}>
                                            <Form.Item>
                                                <Input
                                                    addonBefore="자재 코드"
                                                    value={materialDataDetail?.materialCode || ''}
                                                    onChange={(e) => handleInputChange(e, 'materialCode')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item>
                                                <Input
                                                    addonBefore="자재 명"
                                                    value={materialDataDetail?.materialName || ''}
                                                    onChange={(e) => handleInputChange(e, 'materialName')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item>
                                                <Input
                                                    addonBefore="유해물질 포함수량"
                                                    value={materialDataDetail?.hazardousMaterial?.length}
                                                    readOnly
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={7}>
                                            <Form.Item>
                                                <Input
                                                    addonBefore="자재 수량"
                                                    value={materialDataDetail?.stockQuantity || ''}
                                                    onChange={(e) => handleInputChange(e, 'stockQuantity')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Form.Item>
                                                <Input
                                                    addonBefore="매입가(원)"
                                                    value={formatNumberWithComma(materialDataDetail?.purchasePrice) || ''}
                                                    onChange={(e) => handleInputChange(e, 'purchasePrice')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={7}>
                                            <Space.Compact>
                                                <Input style={{ width: '60%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="자재 유형" disabled />
                                                <Select
                                                    style={{ width: '80%' }}
                                                    value={materialDataDetail?.materialType}
                                                    onChange={(value) =>
                                                        handleInputChange({ target: { value: value } }, 'materialType')
                                                    }
                                                >
                                                    <Option value="METAL">금속</Option>
                                                    <Option value="PLASTIC">플라스틱</Option>
                                                    <Option value="WOOD">목재</Option>
                                                    <Option value="CHEMICAL">화학물질</Option>
                                                    <Option value="TEXTILE">섬유</Option>
                                                    <Option value="ELECTRONIC">전자부품</Option>
                                                    <Option value="CERAMIC">세라믹</Option>
                                                    <Option value="GLASS">유리</Option>
                                                    <Option value="PAPER">종이</Option>
                                                    <Option value="RUBBER">고무</Option>
                                                    <Option value="COMPOSITE">복합재료</Option>
                                                    <Option value="OTHER">기타 자재</Option>
                                                </Select>
                                            </Space.Compact>
                                        </Col>
                                    </Row>

                                    <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>추가 정보</Divider>
                                    <Row gutter={16}>
                                        <Col span={7}>
                                            <Form.Item>
                                                <Input
                                                    addonBefore="거래처"
                                                    value={"["+materialDataDetail?.representativeCode+ "] " + materialDataDetail?.representativeName || ''}
                                                    onClick={() => {
                                                        handleInputClick('client');
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>유해물질 정보</Divider>
                                {/* 품목 목록 항목 */}
                                <Table
                                    dataSource={isNewRow ? [...filterHazardousData, newRowData] : filterHazardousData}
                                    columns={columns}
                                    rowKey={(record, index) => index}
                                    pagination={false}
                                    size={'small'}
                                />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', marginBottom: '20px' }}>
                                    <Button type="default" onClick={handleHazardousAddRow} style={{ marginRight: '4px' }}>
                                        <PlusOutlined /> 항목 추가
                                    </Button>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                    <Button type="primary" onClick={handleUpdate} style={{ marginRight: '10px' }}>
                                        수정
                                    </Button>
                                    <Button type="danger" onClick={handleDelete}>
                                        삭제
                                    </Button>
                                </Box>
                                    {/* 모달창 */}
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
                                                {/* 거래처 선택 모달 */}
                                                {currentField === 'client' && (
                                                    <>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                            거래처 선택
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
                                                                            (item.id && item.id.toString().toLowerCase().includes(value)) ||
                                                                            (item.printClientName && item.printClientName.toLowerCase().includes(value))
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
                                                                    { title: '코드', dataIndex: 'id', key: 'id', align: 'center' },
                                                                    { title: '거래처명', dataIndex: 'printClientName', key: 'printClientName', align: 'center' }
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
                                                {/* 거래처 선택 모달 */}
                                                {currentField === 'hazardousMaterial' && (
                                                    <>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                            유해물질 선택
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
                                                                            (item.hazardousMaterialCode && item.hazardousMaterialCode.toString().toLowerCase().includes(value)) ||
                                                                            (item.hazardousMaterialName && item.hazardousMaterialName.toLowerCase().includes(value))
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
                                                                    { title: '코드', dataIndex: 'id', key: 'id', align: 'center' },
                                                                    { title: '유해물질 명', dataIndex: 'hazardousMaterialName', key: 'hazardousMaterialName', align: 'center' }
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
                    )}

                </Grid>
            )}
            {activeTabKey === '2' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={7} md={7} >
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h6" marginBottom="20px">
                                    자재 상세 등록
                                </Typography>

                                {/* 자재 필드들 - 초기 로드시 빈값으로 표시 */}
                                <Row gutter={16}>
                                    <Col span={7}>
                                        <Form.Item>
                                            <Input
                                                addonBefore="자재 코드"
                                                value={materialDataDetail?.materialCode || ''} // 비어있는 값을 표시
                                                onChange={(e) => handleInputChange(e, 'materialCode')}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={7}>
                                        <Form.Item>
                                            <Input
                                                addonBefore="자재 명"
                                                value={materialDataDetail?.materialName || ''} // 비어있는 값을 표시
                                                onChange={(e) => handleInputChange(e, 'materialName')}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* 추가 자재 정보들 */}
                                <Row gutter={16}>
                                    <Col span={7}>
                                        <Form.Item>
                                            <Input
                                                addonBefore="자재 수량"
                                                value={materialDataDetail?.stockQuantity || ''} // 비어있는 값을 표시
                                                onChange={(e) => handleInputChange(e, 'stockQuantity')}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={7}>
                                        <Form.Item>
                                            <Input
                                                addonBefore="구매 가격"
                                                value={materialDataDetail?.purchasePrice || ''} // 비어있는 값을 표시
                                                onChange={(e) => handleInputChange(e, 'purchasePrice')}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={7}>
                                        <Space.Compact>
                                            <Input style={{ width: '60%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="자재 유형" disabled />
                                            <Select
                                                style={{ width: '80%' }}
                                                value={materialDataDetail?.materialType || ''}
                                                onChange={(value) =>
                                                    handleInputChange({ target: { value: value } }, 'materialType')
                                                }
                                            >
                                                <Option value="METAL">금속</Option>
                                                <Option value="PLASTIC">플라스틱</Option>
                                                <Option value="WOOD">목재</Option>
                                                <Option value="CHEMICAL">화학물질</Option>
                                                <Option value="TEXTILE">섬유</Option>
                                                <Option value="ELECTRONIC">전자부품</Option>
                                                <Option value="CERAMIC">세라믹</Option>
                                                <Option value="GLASS">유리</Option>
                                                <Option value="PAPER">종이</Option>
                                                <Option value="RUBBER">고무</Option>
                                                <Option value="COMPOSITE">복합재료</Option>
                                                <Option value="OTHER">기타 자재</Option>
                                            </Select>
                                        </Space.Compact>
                                    </Col>
                                </Row>

                                {/* 거래처 정보 */}
                                <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>추가 정보</Divider>
                                <Row gutter={16}>
                                    <Col span={7}>
                                        <Form.Item>
                                            <Input
                                                addonBefore="거래처"
                                                value={"["+materialDataDetail?.representativeCode+ "] " + materialDataDetail?.representativeName || ''}
                                                onClick={() => {
                                                    handleInputClick('client');
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* 등록 버튼 */}
                                <Box style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                    <Button type="primary" onClick={handleSave} style={{ marginRight: '10px' }}>
                                        등록
                                    </Button>

                                    {/* 모달창 */}
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
                                                {/* 거래처 선택 모달 */}
                                                {currentField === 'client' && (
                                                    <>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                            거래처 선택
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
                                                                            (item.id && item.id.toString().toLowerCase().includes(value)) ||
                                                                            (item.printClientName && item.printClientName.toLowerCase().includes(value))
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
                                                                    { title: '코드', dataIndex: 'id', key: 'id', align: 'center' },
                                                                    { title: '거래처명', dataIndex: 'printClientName', key: 'printClientName', align: 'center' }
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
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default MaterialDataPage;
