import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper, Step} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import {tabItems} from './AdjustmentProgressUtil.jsx';
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {Typography} from '@mui/material';
import {Button, Col, DatePicker, Form, Row, Table, Steps, Divider, Input, Spin, Modal} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {EMPLOYEE_API, LOGISTICS_API} from "../../../../config/apiConstants.jsx";
import dayjs from "dayjs";
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";

const {confirm} = Modal;
const {RangePicker} = DatePicker;

const AdjustmentProgressPage = () => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [isLoading, setIsLoading] = useState(false);
    const [adjustmentProgressData, setAdjustmentProgressData] = useState([]);
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [currentFieldIndex, setCurrentFieldIndex] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
    const [shipmentProductsData, setShipmentProductsData] = useState([]); // 출하 품목 데이터
    const [totalQuantity, setTotalQuantity] = useState(0); // 총 수량 데이터
    const [searchParams, setSearchParams] = useState({
        startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });
    const [displayValues, setDisplayValues] = useState({
        employee: '',
        warehouse: '',
        products: [],
    });

    const handleTabChange = (key) => {
        setActiveTabKey(key);
        setDisplayValues({});
        form.resetFields();
    };

    const fetchAdjustmentProgress = async (startDate, endDate) => {
        setIsLoading(true);
        try {
            // API 호출
            const response = await apiClient.post(LOGISTICS_API.INVENTORY_INSPECTION_LIST_API(startDate, endDate));
            const { shipmentProductListResponseDTOList, totalQuantity } = response.data;

            setShipmentProductsData(shipmentProductListResponseDTOList); // 목록 데이터 설정
            setTotalQuantity(totalQuantity); // 총 수량 설정
            notify('success', '데이터 조회 성공', '재고조정진행단계 데이터를 성공적으로 조회했습니다.', 'bottomRight');
        } catch (error) {
            // 오류 처리
            notify('error', '데이터 조회 오류', '재고조정진행단계 데이터를 조회하는 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    }

    const requestAdjustment = async (inspectionId) => {
        confirm({
            title: '재고 실사 조정 요청',
            content: '해당 실사의 조정을 요청하시겠습니까?',
            okText: '예',
            cancelText: '아니오',
            onOk: async () => {
                try {
                    const response = await apiClient.post(LOGISTICS_API.INVENTORY_INSPECTION_ADJUST_REQUEST_API(inspectionId));
                    notify('success', '조정 요청 완료', '재고 실사 조정 요청이 성공적으로 처리되었습니다.', 'bottomRight');

                    fetchAdjustmentProgress(searchParams.startDate, searchParams.endDate);
                } catch (error) {
                    notify('error', '조정 요청 실패', '재고 실사 조정 요청 중 오류가 발생했습니다.', 'top');
                }
            }
        });
    }

    const handleModalCancel = () => setIsModalVisible(false);

    const handleInputClick = (fieldName, index) => {
        setCurrentField(fieldName);
        setCurrentFieldIndex(index);
        fetchModalData(fieldName); // 모달 데이터를 가져옴
        setIsModalVisible(true);   // 모달을 보여줌
    };


    // 모달 데이터 조회 함수
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;
        if (fieldName === 'employeeName') apiPath = EMPLOYEE_API.EMPLOYEE_DATA_API;
        if (fieldName === 'warehouseName') apiPath = LOGISTICS_API.WAREHOUSE_LIST_API;
        if (fieldName === 'productCode') {
            if (!selectedWarehouseId) {
                notify('error', '창고 선택 오류', '창고를 먼저 선택해 주세요.', 'top');
                setIsLoading(false);
                return;
            }
            apiPath = LOGISTICS_API.WAREHOUSE_INVENTORY_DETAIL_API(selectedWarehouseId);
        }

        try {
            const response = await apiClient.post(apiPath);
            const data = Array.isArray(response.data) ? response.data : [response.data];
            setModalData(data);
            setInitialModalData(data);
        } catch (error) {
            notify('error', '데이터 조회 오류', '데이터를 조회하는 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };


    const handleModalSelect = (record) => {
        const prevValues = form.getFieldsValue();

        if (currentField === 'employeeName') {
            form.setFieldsValue({
                ...prevValues,
                employeeId: record.id,
                employeeName: `[${record.id}] ${record.lastName + record.firstName}`
            });
            setDisplayValues((prev) => ({
                ...prev,
                employee: `[${record.id}] ${record.lastName}${record.firstName}`,
            }));
        } else if (currentField === 'warehouseName') {
            form.setFieldsValue({
                ...prevValues,
                warehouseId: record.id,
                warehouseName: `[${record.id}] ${record.name}`,
            });
            setDisplayValues((prev) => ({
                ...prev,
                warehouse: `[${record.id}] ${record.name}`,
            }));

            setSelectedWarehouseId(record.id);
        } else if (currentField === 'productCode') {
            // 품목 선택 시 처리
            const updatedDetails = prevValues.details.map((item, index) => {
                if (index === currentFieldIndex) {
                    return {
                        ...item,
                        productCode: `[${record.id}] ${record.productName}`, // [ID] 품목명으로 표시
                        productId: record.id, // ID는 hidden 없이 전송
                        warehouseLocationId: record.warehouseLocationId,
                        inventoryId: record.id,
                        productName: record.productName,
                        standard: record.standard,
                        unit: record.unit,
                        actualQuantity: record.quantity,
                    };
                }
                return item;
            });

            form.setFieldsValue({...prevValues, details: updatedDetails});

            const updatedDisplayProducts = displayValues.products;
            updatedDisplayProducts[currentFieldIndex] = `[${record.id}] ${record.productName}`;

            setDisplayValues((prev) => ({
                ...prev,
                products: updatedDisplayProducts, // products에 대해 업데이트
            }));
        }

        setIsModalVisible(false);
    };

    const handleDateChange = (dates, dateStrings) => {
        setSearchParams({
            startDate: dateStrings[0],
            endDate: dateStrings[1],
        });
    }

    const handleFormSubmit = async (values) => {
        console.log('실사 등록 데이터:', values);
        try {
            const response = await apiClient.post(LOGISTICS_API.INVENTORY_INSPECTION_CREATE_API, values);
            notify('success', '실사 등록 성공', '실사 데이터가 성공적으로 등록되었습니다.', 'bottomRight');
            fetchAdjustmentProgress(searchParams.startDate, searchParams.endDate); // 데이터를 새로고침
            setActiveTabKey('1');
        } catch (error) {
            notify('error', '실사 등록 실패', '실사 데이터를 등록하는 중 오류가 발생했습니다.', 'top');
        }
    };

    const handleSearch = () => {
        fetchAdjustmentProgress(searchParams.startDate, searchParams.endDate);
    };

    useEffect(() => {
        fetchAdjustmentProgress(searchParams.startDate, searchParams.endDate);
    }, []);

    return (
        <Box sx={{margin: '20px'}}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="재고조정진행단계"
                        description={(
                            <Typography>
                                재고조정진행단계 페이지는 <span>재고 조정이 진행 중인 단계와 상태</span>를 확인하는 곳임. 이 페이지에서는 <span>재고 실사 또는 오류 발견 시 재고 조정의 각 단계를 관리</span>할
                                수 있으며, <span>조정 시작, 진행, 완료</span>와 같은 단계를 한눈에 파악 가능함. 이를 통해 재고 조정이 <span>정확하고 체계적으로 완료될 수 있도록</span> 지원함.
                            </Typography>
                        )}
                        tabItems={tabItems()}
                        activeTabKey={activeTabKey}
                        handleTabChange={handleTabChange}
                    />
                </Grid>
            </Grid>

            {activeTabKey === '1' && (
                <Grid sx={{padding: '0px 20px 0px 20px'}} container spacing={3}>
                    <Grid item xs={12} md={5} sx={{minWidth: '1000px !important', maxWidth: '700px !important'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{height: '100%'}}>
                                <Typography variant="h6" sx={{padding: '20px'}}>재고 조정 진행 단계 조회</Typography>
                                <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                    <Form layout="vertical">
                                        <Row gutter={16} style={{
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Col>
                                                <Form.Item
                                                    label="조회 기간"
                                                    required
                                                    tooltip="검색할 기간의 시작일과 종료일을 선택하세요"
                                                >
                                                    <RangePicker
                                                        onChange={handleDateChange}
                                                        defaultValue={[
                                                            searchParams.startDate ? dayjs(searchParams.startDate, 'YYYY-MM-DD') : null,
                                                            searchParams.endDate ? dayjs(searchParams.endDate, 'YYYY-MM-DD') : null,
                                                        ]}
                                                        format="YYYY-MM-DD"
                                                        style={{width: '300px'}}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Form.Item>
                                                    <Button style={{width: '100px'}} type="primary"
                                                            onClick={handleSearch} icon={<SearchOutlined/>} block>
                                                        검색
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Grid>

                                <Grid sx={{ margin: '20px' }}>
                                    <Table
                                        dataSource={adjustmentProgressData}
                                        columns={[
                                            {
                                                title: <div className="title-text">실사전표</div>,
                                                dataIndex: 'inspectionNumber',
                                                key: 'inspectionNumber',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>
                                            },
                                            {
                                                title: <div className="title-text">담당자</div>,
                                                dataIndex: 'employeeName',
                                                key: 'employeeName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>
                                            },
                                            {
                                                title: <div className="title-text">품목</div>,
                                                dataIndex: 'productSummary',
                                                key: 'productSummary',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>
                                            },
                                            {
                                                title: <div className="title-text">진행단계</div>,
                                                dataIndex: 'status',
                                                key: 'status',
                                                align: 'center',
                                                render: (status, record) => (
                                                    <Steps
                                                        size="small"
                                                        current={status === '조정완료' ? 1 : 0}
                                                        onChange={(current) => {
                                                            if (current === 1 && status !== '조정완료') {
                                                                requestAdjustment(record.id); // 재고 실사 ID를 API 호출에 사용
                                                            }
                                                        }}
                                                    >
                                                        <Step title="실사"/>
                                                        <Step title="조정"/>
                                                    </Steps>
                                                ),
                                            },
                                            {
                                                title: <div className="title-text">창고명</div>,
                                                dataIndex: 'warehouseName',
                                                key: 'warehouseName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>
                                            },
                                            {
                                                title: <div className="title-text">장부 수량</div>,
                                                dataIndex: 'totalBookQuantity',
                                                key: 'totalBookQuantity',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">실사 수량</div>,
                                                dataIndex: 'totalActualQuantity',
                                                key: 'totalActualQuantity',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">조정 수량</div>,
                                                dataIndex: 'totalDifferenceQuantity',
                                                key: 'totalDifferenceQuantity',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            }
                                        ]}
                                        rowKey="id"
                                        pagination={{pageSize: 10, position: ['bottomCenter']}}
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

            {activeTabKey === '2' && (
                <Grid sx={{padding: '0px 20px 0px 20px'}} container spacing={3}>
                    <Grid item xs={12} md={5} sx={{minWidth: '1000px !important', maxWidth: '700px !important'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{height: '100%'}}>
                                <Typography variant="h6" sx={{padding: '20px'}}>실사 등록</Typography>
                                <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                    <Form
                                        layout="vertical"
                                        onFinish={(values) => handleFormSubmit(values)}
                                        form={form}
                                    >
                                        <Row gutter={16}>
                                            <Col>
                                                <Typography>실사일자</Typography>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item name="inspectionDate"
                                                           rules={[{required: true, message: '실사 일자를 입력하세요.'}]}>
                                                    <DatePicker placeholder="실사 일자" format="YYYY-MM-DD"/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="warehouseName"
                                                           rules={[{required: true, message: '창고를 선택하세요.'}]}>
                                                    <Input
                                                        addonBefore="창고명"
                                                        value={displayValues.warehouse}
                                                        onClick={() => handleInputClick('warehouseName')}
                                                        onFocus={(e) => e.target.blur()}
                                                        suffix={<DownSquareOutlined/>}
                                                    />
                                                </Form.Item>
                                                <Form.Item name="warehouseId" hidden>
                                                    <Input/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="employeeName"
                                                           rules={[{required: true, message: '담당자를 선택하세요.'}]}>
                                                    <Input
                                                        addonBefore="담당자명"
                                                        value={displayValues.employee}
                                                        onClick={() => handleInputClick('employeeName')}
                                                        onFocus={(e) => e.target.blur()}
                                                        suffix={<DownSquareOutlined/>}
                                                    />
                                                </Form.Item>
                                                <Form.Item name="employeeId" hidden>
                                                    <Input/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="comment">
                                                    <Input addonBefore="비고"/>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Divider orientation={'left'} orientationMargin="0"
                                                 style={{marginTop: '0px', fontWeight: 600}}>실사 품목 정보</Divider>

                                        <Form.List name="details">
                                            {(fields, {add, remove}) => (
                                                <>
                                                    {fields.map(({key, name, ...restField}, index) => (
                                                        <Row gutter={16} key={key} style={{marginBottom: '10px'}}>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'productCode']}
                                                                    rules={[{required: true, message: '품목 코드를 입력하세요.'}]}
                                                                >
                                                                    <Input
                                                                        addonBefore="품목 코드"
                                                                        value={displayValues.products[index] || ''}
                                                                        onClick={() => handleInputClick('productCode', index)}
                                                                        onFocus={(e) => e.target.blur()}
                                                                        suffix={<DownSquareOutlined/>}
                                                                    />
                                                                </Form.Item>
                                                                <Form.Item name={[name, 'productId']} hidden>
                                                                    <Input/>
                                                                </Form.Item>
                                                                <Form.Item name={[name, 'warehouseLocationId']} hidden>
                                                                    <Input/>
                                                                </Form.Item>
                                                                <Form.Item name={[name, 'inventoryId']} hidden>
                                                                    <Input/>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'productName']}
                                                                    rules={[{required: true, message: '품목명을 입력하세요.'}]}
                                                                >
                                                                    <Input addonBefore="품목명"/>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={4}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'standard']}
                                                                >
                                                                    <Input addonBefore="규격"/>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={4}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'unit']}
                                                                >
                                                                    <Input addonBefore="단위"/>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'actualQuantity']}
                                                                    rules={[{required: true, message: '실사 수량을 입력하세요.'}]}
                                                                >
                                                                    <Input addonBefore="실사 수량"/>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={14}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'comment']}
                                                                >
                                                                    <Input addonBefore="비고"/>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={2}
                                                                 style={{display: 'flex', justifyContent: 'flex-end'}}>
                                                                <Button type="danger"
                                                                        onClick={() => remove(name)}>삭제</Button>
                                                            </Col>
                                                        </Row>
                                                    ))}
                                                    <Form.Item>
                                                        <Button
                                                            type="primary"
                                                            onClick={() => {
                                                                add();  // 품목 추가
                                                                setDisplayValues((prev) => ({
                                                                    ...prev,
                                                                    products: [...(prev.products || []), ''], // 새로운 항목 추가 시 빈 문자열로 초기화
                                                                }));
                                                            }}
                                                            block
                                                        >
                                                            실사 품목 추가
                                                        </Button>
                                                    </Form.Item>
                                                </>
                                            )}
                                        </Form.List>


                                        <Box sx={{display: 'flex', justifyContent: 'flex-end', marginBottom: '20px'}}>
                                            <Button type="primary" htmlType="submit">저장</Button>
                                        </Box>
                                        <Modal
                                            open={isModalVisible}
                                            onCancel={handleModalCancel}
                                            footer={null}
                                            width="40vw"
                                        >
                                            {isLoading ? (
                                                <Spin/>  // 로딩 스피너
                                            ) : (
                                                <>
                                                    {/* 담당자 선택 모달 */}
                                                    {currentField === 'employeeName' && (
                                                        <>
                                                            <Typography id="modal-modal-title" variant="h6"
                                                                        component="h2" sx={{marginBottom: '20px'}}>
                                                                담당자 선택
                                                            </Typography>
                                                            <Input
                                                                placeholder="검색"
                                                                prefix={<SearchOutlined/>}
                                                                onChange={(e) => {
                                                                    const value = e.target.value.toLowerCase();
                                                                    if (!value) {
                                                                        setModalData(initialModalData);
                                                                    } else {
                                                                        const filtered = initialModalData.filter((item) => {
                                                                            return (
                                                                                (item.employeeNumber && item.employeeNumber.toLowerCase().includes(value)) ||
                                                                                (`${item.lastName}${item.firstName}`.toLowerCase().includes(value))
                                                                            );
                                                                        });
                                                                        setModalData(filtered);
                                                                    }
                                                                }}
                                                                style={{marginBottom: 16}}
                                                            />
                                                            {modalData && (
                                                                <Table
                                                                    columns={[
                                                                        {
                                                                            title: <div className="title-text">사번</div>,
                                                                            dataIndex: 'employeeNumber',
                                                                            key: 'employeeNumber',
                                                                            align: 'center',
                                                                            render: (text) => <div
                                                                                className="small-text">{text}</div>,
                                                                        },
                                                                        {
                                                                            title: <div className="title-text">이름</div>,
                                                                            dataIndex: 'name',
                                                                            key: 'name',
                                                                            align: 'center',
                                                                            render: (_, record) => `${record.lastName}${record.firstName}`
                                                                        }
                                                                    ]}
                                                                    dataSource={modalData}
                                                                    rowKey="id"
                                                                    size="small"
                                                                    pagination={{
                                                                        pageSize: 15,
                                                                        position: ['bottomCenter'],
                                                                        showSizeChanger: false,
                                                                        showTotal: (total) => `총 ${total}개`
                                                                    }}
                                                                    onRow={(record) => ({
                                                                        style: {cursor: 'pointer'},
                                                                        onClick: () => handleModalSelect(record)
                                                                    })}
                                                                />
                                                            )}
                                                        </>
                                                    )}

                                                    {/* 창고 선택 모달 */}
                                                    {currentField === 'warehouseName' && (
                                                        <>
                                                            <Typography id="modal-modal-title" variant="h6"
                                                                        component="h2" sx={{marginBottom: '20px'}}>
                                                                창고 선택
                                                            </Typography>
                                                            <Input
                                                                placeholder="검색"
                                                                prefix={<SearchOutlined/>}
                                                                onChange={(e) => {
                                                                    const value = e.target.value.toLowerCase();
                                                                    if (!value) {
                                                                        setModalData(initialModalData);
                                                                    } else {
                                                                        const filtered = initialModalData.filter((item) => {
                                                                            return (
                                                                                (item.code && item.code.toLowerCase().includes(value)) ||
                                                                                (item.name && item.name.toLowerCase().includes(value))
                                                                            );
                                                                        });
                                                                        setModalData(filtered);
                                                                    }
                                                                }}
                                                                style={{marginBottom: 16}}
                                                            />
                                                            {modalData && (
                                                                <Table
                                                                    columns={[
                                                                        {
                                                                            title: <div className="title-text">창고
                                                                                코드</div>,
                                                                            dataIndex: 'code',
                                                                            key: 'code',
                                                                            align: 'center',
                                                                            render: (text) => <div
                                                                                className="small-text">{text}</div>
                                                                        },
                                                                        {
                                                                            title: <div
                                                                                className="title-text">창고명</div>,
                                                                            dataIndex: 'name',
                                                                            key: 'name',
                                                                            align: 'center',
                                                                            render: (text) => <div
                                                                                className="small-text">{text}</div>,
                                                                        },
                                                                        {
                                                                            title: <div className="title-text">창고
                                                                                유형</div>,
                                                                            dataIndex: 'warehouseType',
                                                                            key: 'warehouseType',
                                                                            align: 'center',
                                                                            render: (text) => <div
                                                                                className="small-text">{text}</div>,
                                                                        }
                                                                    ]}
                                                                    dataSource={modalData}
                                                                    rowKey="id"
                                                                    size="small"
                                                                    pagination={{
                                                                        pageSize: 15,
                                                                        position: ['bottomCenter'],
                                                                        showSizeChanger: false,
                                                                        showTotal: (total) => `총 ${total}개`
                                                                    }}
                                                                    onRow={(record) => ({
                                                                        style: {cursor: 'pointer'},
                                                                        onClick: () => handleModalSelect(record)
                                                                    })}
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                    {/* 품목 코드 선택 모달 */}
                                                    {currentField === 'productCode' && (
                                                        <>
                                                            <Typography id="modal-modal-title" variant="h6"
                                                                        component="h2" sx={{marginBottom: '20px'}}>
                                                                품목 코드 선택
                                                            </Typography>
                                                            <Input
                                                                placeholder="검색"
                                                                prefix={<SearchOutlined/>}
                                                                onChange={(e) => {
                                                                    const value = e.target.value.toLowerCase();
                                                                    if (!value) {
                                                                        setModalData(initialModalData);
                                                                    } else {
                                                                        const filtered = initialModalData.filter((item) => {
                                                                            return (
                                                                                (item.productCode && item.productCode.toLowerCase().includes(value)) ||
                                                                                (item.productName && item.productName.toLowerCase().includes(value))
                                                                            );
                                                                        });
                                                                        setModalData(filtered);
                                                                    }
                                                                }}
                                                                style={{marginBottom: 16}}
                                                            />
                                                            {modalData && (
                                                                <Table
                                                                    columns={[
                                                                        {
                                                                            title: <div className="title-text">품목
                                                                                코드</div>,
                                                                            dataIndex: 'productCode',
                                                                            key: 'productCode',
                                                                            align: 'center',
                                                                            render: (text) => <div
                                                                                className="small-text">{text}</div>,
                                                                        },
                                                                        {
                                                                            title: <div
                                                                                className="title-text">품목명</div>,
                                                                            dataIndex: 'productName',
                                                                            key: 'productName',
                                                                            align: 'center',
                                                                            render: (text) => <div
                                                                                className="small-text">{text}</div>,
                                                                        },
                                                                        {
                                                                            title: <div className="title-text">규격</div>,
                                                                            dataIndex: 'quantity',
                                                                            key: 'quantity',
                                                                            align: 'center',
                                                                            render: (text) => <div
                                                                                className="small-text">{text}</div>,
                                                                        },
                                                                        {
                                                                            title: <div
                                                                                className="title-text">창고명</div>,
                                                                            dataIndex: 'warehouseName',
                                                                            key: 'warehouseName',
                                                                            align: 'center',
                                                                            render: (text) => <div
                                                                                className="small-text">{text}</div>,
                                                                        },
                                                                        {
                                                                            title: <div className="title-text">로케이션
                                                                                위치</div>,
                                                                            dataIndex: 'warehouseLocationName',
                                                                            key: 'warehouseLocationName',
                                                                            align: 'center',
                                                                            render: (text) => <div
                                                                                className="small-text">{text}</div>,
                                                                        }
                                                                    ]}
                                                                    dataSource={modalData}
                                                                    rowKey="id"
                                                                    size="small"
                                                                    pagination={{
                                                                        pageSize: 15,
                                                                        position: ['bottomCenter'],
                                                                        showSizeChanger: false,
                                                                        showTotal: (total) => `총 ${total}개`
                                                                    }}
                                                                    onRow={(record) => ({
                                                                        style: {cursor: 'pointer'},
                                                                        onClick: () => handleModalSelect(record)
                                                                    })}
                                                                />
                                                            )}
                                                        </>
                                                    )}

                                                    <Box sx={{mt: 2, display: 'flex', justifyContent: 'flex-end'}}>
                                                        <Button onClick={handleModalCancel} variant="contained"
                                                                type="danger" sx={{mr: 1}}>
                                                            닫기
                                                        </Button>
                                                    </Box>
                                                </>
                                            )}
                                        </Modal>
                                    </Form>

                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

        </Box>
    );
};

export default AdjustmentProgressPage;