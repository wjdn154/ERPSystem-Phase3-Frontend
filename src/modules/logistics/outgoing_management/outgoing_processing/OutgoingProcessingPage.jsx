import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import {tabItems} from './OutgoingProcessingUtil.jsx';
import {Typography} from '@mui/material';
import {Button, Col, DatePicker, Divider, Form, Input, InputNumber, Modal, Row, Spin, Table} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import dayjs from "dayjs";
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";
import apiClient from "../../../../config/apiClient.jsx";
import {LOGISTICS_API} from "../../../../config/apiConstants.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";

const {RangePicker} = DatePicker;
const {confirm} = Modal;

const OutgoingProcessingPage = () => {
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [form] = Form.useForm();
    const notify = useNotificationContext();
    const [isLoading, setIsLoading] = useState(false);
    const [shippingDetailList, setShippingDetailList] = useState([]);
    const [waitingProcessingList, setWaitingProcessingList] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [ShippingProcessing, setShippingProcessing] = useState(false);
    const [selectedShippingData, setSelectedShippingData] = useState(false);
    const [shippingDataParam, setShippingDataParam] = useState(false);
    const [currentField, setCurrentField] = useState(''); // 모달 분기 할 필드 상태
    const [modalData, setModalData] = useState(null); // 모달 데이터 상태
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 활성화 여부 상태
    const [displayValues, setDisplayValues] = useState({});
    const [searchParams, setSearchParams] = useState({
        startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });

    const fetchWaitingProcessingList = async (startDate, endDate) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post(LOGISTICS_API.SHIPPING_PROCESS_LIST_API(startDate, endDate));
            setWaitingProcessingList(response.data);
            notify('success', '데이터 조회 성공', '출하 목록 데이터를 성공적으로 조회했습니다.', 'bottomRight');
        } catch (error) {
            notify('error', '데이터 조회 오류', '출하 목록 데이터를 조회하는 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    }

    const fetchShippingDetailList = async (startDate, endDate) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post(LOGISTICS_API.SHIPPING_ORDER_DETAILS_API(startDate, endDate));
            setShippingDetailList(response.data);
            notify('success', '데이터 조회 성공', '출하 목록 데이터를 성공적으로 조회했습니다.', 'bottomRight');
        } catch (error) {
            notify('error', '데이터 조회 오류', '출하 목록 데이터를 조회하는 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    }

    // 모달창 열기 핸들러
    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        fetchModalData(fieldName);  // 모달 데이터 가져오기 호출
        setIsModalVisible(true);  // 모달창 열기
    };

    // 모달창 닫기 핸들러
    const handleModalCancel = () => setIsModalVisible(false);

    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;
        if (fieldName === 'inventoryId') apiPath = LOGISTICS_API.INVENTORY_API;

        try {
            const response = await apiClient.post(apiPath);
            setModalData(response.data);
            setInitialModalData(response.data);
        } catch (error) {
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    }

    const handleModalSelect = (record) => {

        switch (currentField) {
            case 'inventoryId':
                setShippingDataParam((prevParams) => ({
                    ...prevParams,
                    inventoryId: record.id,
                    shippingInventoryNumber: record.inventoryNumber,
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    inventoryNumber: `[${record.warehouseLocationName}] ${record.inventoryNumber}`,
                }));
                form.setFieldsValue({
                    inventoryId: `[${record.warehouseLocationName}] ${record.inventoryNumber}`,
                });
                break;
        }
        setIsModalVisible(false);
    }


    const handleFormSubmit = async (values) => {
        confirm({
            title: '저장 확인',
            content: '정말로 저장하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                const requestData = {
                    inventoryId: shippingDataParam.inventoryId,
                    productId: shippingDataParam.productId,
                    shippingOrderDetailId: shippingDataParam.id,
                    shippingDate: values.shippingDate.format('YYYY-MM-DD'),  // LocalDate 형식 맞추기
                    productName: shippingDataParam.productName,
                    shippingInventoryNumber: shippingDataParam.shippingInventoryNumber,
                };

                try {
                    await apiClient.post(LOGISTICS_API.SHIPPING_PROCESS_REGISTER_API, requestData);
                    notify('success', '등록 성공', '출고 대기 등록 데이터가 성공적으로 등록되었습니다.', 'bottomRight');
                    setShippingProcessing(false);
                    fetchShippingDetailList(searchParams.startDate, searchParams.endDate);
                } catch (error) {
                    const errorMessage = error.response?.data || '출하 처리 데이터 등록 중 오류가 발생했습니다.';
                    notify('error', '등록 실패', errorMessage, 'top');
                }
            }
        })
    };


        const handleProcessShipping = async () => {
            if (!selectedRowKeys.length) {
                notify('warning', '선택된 항목 없음', '출고 처리할 항목을 선택하세요.', 'top');
                return;
            }

            const shippingProcessingId = selectedRowKeys[0]; // 선택한 항목의 ID
            confirm({
                title: '출고 처리 확인',
                content: '선택한 출고 항목을 처리하시겠습니까?',
                okText: '확인',
                cancelText: '취소',
                onOk: async () => {
                    try {
                        await apiClient.post(LOGISTICS_API.SHIPPING_PROCESS_PROCESS_API(shippingProcessingId));
                        notify('success', '출고 처리 성공', '선택한 출고 항목이 성공적으로 처리되었습니다.', 'bottomRight');


                        // 리스트 재조회 및 상태 초기화
                        setShippingProcessing(false);
                        fetchWaitingProcessingList(searchParams.startDate, searchParams.endDate);
                        setSelectedRowKeys([]);
                    } catch (error) {
                        if (error.response && error.response.status === 400) {
                            notify('error', '출고 처리 실패', error.response.data, 'top');
                        } else {
                            notify('error', '출고 처리 실패', '출고 처리 중 오류가 발생했습니다.', 'top');
                        }
                    }
                }
            })
        };


        const handleSearch = () => {
            fetchShippingDetailList(searchParams.startDate, searchParams.endDate);
        };

        const handleSearchWaitingProcessing = () => {
            fetchWaitingProcessingList(searchParams.startDate, searchParams.endDate);
        }

        const handleDateChange = (dates, dateStrings) => {
            setSearchParams({
                startDate: dateStrings[0],
                endDate: dateStrings[1],
            });
        }

        const handleTabChange = (key) => {
            setActiveTabKey(key);
            setSelectedRowKeys([]);
        };

        useEffect(() => {
            fetchShippingDetailList(searchParams.startDate, searchParams.endDate);
        }, []);

        useEffect(() => {
            if (selectedShippingData) {
                form.setFieldsValue({
                    ...selectedShippingData,
                    shippingDate: selectedShippingData.shippingDate ? dayjs(selectedShippingData.shippingDate, 'YYYY-MM-DD') : null,
                    productName: `[${selectedShippingData.productCode}]${selectedShippingData.productName}`,

                });
            }
            setShippingDataParam(selectedShippingData);
            setDisplayValues((prevValues) => ({
                ...prevValues,
                inventoryNumber: '',  // 재고번호 필드를 초기화
            }));
        }, [selectedShippingData, form])

        return (
            <Box sx={{margin: '20px'}}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <WelcomeSection
                            title="출고처리"
                            description={(
                                <Typography>
                                    출고처리 페이지는 <span>출고 예정된 상품을 실제로 출고하는 과정을 기록하고 관리</span>하는 곳임. 이 페이지에서는 <span>출고 처리된 품목의 수량, 출고 날짜, 송장 번호</span> 등을
                                    입력할 수 있으며, 출고가 완료되면 해당 정보가 기록되어 <span>물류 추적</span>이 가능해짐.
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
                        <Grid item xs={12} md={5} sx={{minWidth: '1000px !important', maxWidth: '1500px !important'}}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{height: '100%'}}>
                                    <Typography variant="h6" sx={{padding: '20px'}}>출고 처리</Typography>
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
                                    <Grid sx={{margin: '20px'}}>
                                        <Table
                                            dataSource={shippingDetailList}
                                            columns={[
                                                {
                                                    title: <div className="title-text">등록일자</div>,
                                                    dataIndex: 'date',
                                                    key: 'date',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">거래처</div>,
                                                    dataIndex: 'representativeName',
                                                    key: 'representativeName',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">담당자</div>,
                                                    dataIndex: 'managerName',
                                                    key: 'managerName',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">품목명</div>,
                                                    dataIndex: 'productName',
                                                    key: 'productName',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">수량</div>,
                                                    dataIndex: 'quantity',
                                                    key: 'quantity',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">비고</div>,
                                                    dataIndex: 'remarks',
                                                    key: 'remarks',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                }
                                            ]}
                                            pagination={{
                                                pageSize: 15,
                                                position: ['bottomCenter'],
                                                showSizeChanger: false
                                            }}
                                            rowKey={(record) => record.id}
                                            size="small"
                                            rowSelection={{
                                                type: 'radio',
                                                selectedRowKeys,
                                                onChange: (newSelectedRowKeys) => {
                                                    setSelectedRowKeys(newSelectedRowKeys);
                                                }
                                            }}
                                            onRow={(record) => ({
                                                style: {cursor: 'pointer'},
                                                onClick: async () => {
                                                    setSelectedRowKeys([record.id]); // 클릭한 행의 키로 상태 업데이트
                                                    setSelectedShippingData(record);  // 선택된 데이터를 상태에 저장
                                                    setShippingProcessing(true);
                                                    form.resetFields();

                                                },
                                            })}>
                                        </Table>
                                    </Grid>
                                </Paper>
                            </Grow>
                        </Grid>
                        {ShippingProcessing && (
                            <Grid item xs={12} md={5}
                                  sx={{minWidth: '1000px !important', maxWidth: '1500px !important'}}>
                                <Grow in={true} timeout={200}>
                                    <Paper elevation={3} sx={{height: '100%'}}>
                                        <Typography variant="h6" sx={{padding: '20px'}}>출고 처리 요청</Typography>
                                        <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                            <Form
                                                form={form}
                                                onFinish={(values) => {
                                                    handleFormSubmit(values);
                                                }}
                                                layout="vertical"
                                            >
                                                <Divider orientation={'left'} orientationMargin="0"
                                                         style={{marginTop: '0px', fontWeight: 600}}>출고</Divider>
                                                <Row gutter={16}>
                                                    <Col>
                                                        <Typography>출하일자</Typography>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Form.Item
                                                            name="shippingDate"
                                                            rules={[{required: true, message: '출하 날짜를 선택하세요'}]}
                                                        >
                                                            <DatePicker format="YYYY-MM-DD" style={{width: '100%'}}/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Form.Item
                                                            name="productName"
                                                            rules={[{required: true, message: '제품명을 입력하세요'}]}
                                                        >
                                                            <Input placeholder="[품목id]품목명" addonBefore="품목명" disabled/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={7}>
                                                        <Form.Item
                                                            name="inventoryId"
                                                            rules={[{required: true, message: '재고번호를 입력하세요'}]}
                                                        >
                                                            <Input
                                                                addonBefore="재고번호"
                                                                onClick={() => handleInputClick('inventoryId')}
                                                                onFocus={(e) => e.target.blur()}
                                                                suffix={<DownSquareOutlined/>}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={5}>
                                                        <Form.Item
                                                            name="quantity"
                                                        >
                                                            <InputNumber addonBefore="수량" disabled/>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                                <Form.Item>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                    }}>
                                                        <Button type="primary" htmlType="submit">
                                                            제출
                                                        </Button>
                                                    </Box>
                                                </Form.Item>
                                                <Modal
                                                    open={isModalVisible}
                                                    onCancel={handleModalCancel}
                                                    width="40vw"
                                                    footer={null}
                                                >
                                                    {isLoading ? (
                                                        <Spin/>
                                                    ) : (
                                                        <>
                                                            {currentField === 'inventoryId' && (
                                                                <>
                                                                    <Typography id="modal-modal-title" variant="h6"
                                                                                component="h2"
                                                                                sx={{marginBottom: '20px'}}>
                                                                        재고번호 선택
                                                                    </Typography>
                                                                    <Input
                                                                        placeholder="검색"
                                                                        prefix={<SearchOutlined/>}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value.toLowerCase(); // 입력값을 소문자로 변환
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
                                                                        <>
                                                                            <Table
                                                                                columns={[
                                                                                    {
                                                                                        title: <div className="title-text">재고번호</div>,
                                                                                        dataIndex: 'inventoryNumber',
                                                                                        key: 'inventoryNumber',
                                                                                        align: 'center',
                                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                                    },
                                                                                    {
                                                                                        title: <div className="title-text">품목코드</div>,
                                                                                        dataIndex: 'productCode',
                                                                                        key: 'productCode',
                                                                                        align: 'center',
                                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                                    },
                                                                                    {
                                                                                        title: <div className="title-text">품목명</div>,
                                                                                        dataIndex: 'productName',
                                                                                        key: 'productName',
                                                                                        align: 'center',
                                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                                    },
                                                                                    {
                                                                                        title: <div className="title-text">재고위치</div>,
                                                                                        dataIndex: 'warehouseLocationName',
                                                                                        key: 'warehouseLocationName',
                                                                                        align: 'center',
                                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                                    },
                                                                                    {
                                                                                        title: <div className="title-text">재고수량</div>,
                                                                                        dataIndex: 'quantity',
                                                                                        key: 'quantity',
                                                                                        align: 'center',
                                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                                    }
                                                                                ]}
                                                                                dataSource={modalData}
                                                                                rowKey={(record) => record.id || record.inventoryNumber || record.productCode} // 고유 rowKey 설정
                                                                                size={'small'}
                                                                                pagination={{
                                                                                    pageSize: 15,
                                                                                    position: ['bottomCenter'],
                                                                                    showSizeChanger: false,
                                                                                    showTotal: (total) => `총 ${total}개`,
                                                                                }}
                                                                                onRow={(record) => ({
                                                                                    style: {cursor: 'pointer'},
                                                                                    onClick: () => handleModalSelect(record), // 선택 시 처리
                                                                                })}
                                                                            />
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                            <Box sx={{
                                                                mt: 2,
                                                                display: 'flex',
                                                                justifyContent: 'flex-end'
                                                            }}>
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
                        )}


                    </Grid>
                )}

                {activeTabKey === '2' && (
                    <Grid sx={{padding: '0px 20px 0px 20px'}} container spacing={3}>
                        <Grid item xs={12} md={5} sx={{minWidth: '1000px !important', maxWidth: '1500px !important'}}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{height: '100%'}}>
                                    <Typography variant="h6" sx={{padding: '20px'}}>출고 처리</Typography>
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
                                                                onClick={handleSearchWaitingProcessing}
                                                                icon={<SearchOutlined/>} block>
                                                            검색
                                                        </Button>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Grid>
                                    <Grid sx={{margin: '20px'}}>
                                        <Table
                                            dataSource={waitingProcessingList}
                                            columns={[
                                                {
                                                    title: <div className="title-text">출고지시번호</div>,
                                                    dataIndex: 'shippingNumber',
                                                    key: 'shippingNumber',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">재고번호</div>,
                                                    dataIndex: 'shippingInventoryNumber',
                                                    key: 'shippingInventoryNumber',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">품목명</div>,
                                                    dataIndex: 'productName',
                                                    key: 'productName',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">출고대기수량</div>,
                                                    dataIndex: 'quantity',
                                                    key: 'quantity',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">출고할 위치</div>,
                                                    dataIndex: 'warehouseLocationName',
                                                    key: 'warehouseLocationName',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                            ]}
                                            pagination={{
                                                pageSize: 15,
                                                position: ['bottomCenter'],
                                                showSizeChanger: false
                                            }}
                                            rowKey={(record) => record.id}
                                            size="small"
                                            rowSelection={{
                                                type: 'radio',
                                                selectedRowKeys,
                                                onChange: (newSelectedRowKeys) => {
                                                    setSelectedRowKeys(newSelectedRowKeys);
                                                }
                                            }}
                                            onRow={(record) => ({
                                                style: {cursor: 'pointer'},
                                                onClick: async () => {
                                                    setSelectedRowKeys([record.id]); // 클릭한 행의 키로 상태 업데이트
                                                    setShippingProcessing(true);

                                                },
                                            })}>
                                        </Table>
                                        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                            <Button type="primary" onClick={handleProcessShipping}>
                                                출고처리
                                            </Button>
                                        </div>
                                    </Grid>
                                </Paper>
                            </Grow>
                        </Grid>
                    </Grid>
                )}

            </Box>
        );
    };

    export default OutgoingProcessingPage;