import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import {tabItems} from './IncomingProcessingUtil.jsx';
import {Typography} from '@mui/material';
import {
    Button,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    Modal,
    Row,
    Select,
    Spin,
    Table,
    Tag,
    Space,
    notification,
    InputNumber
} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import dayjs from "dayjs";
import {EMPLOYEE_API, FINANCIAL_API, LOGISTICS_API} from "../../../../config/apiConstants.jsx";
import defaultImage from "../../../../assets/img/uploads/defaultImage.png";
import {DownSquareOutlined, MinusCircleOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";

const {RangePicker} = DatePicker;
const {Option} = Select;
const {confirm} = Modal;

const IncomingProcessingPage = () => {
    const notify = useNotificationContext();
    const [form] = Form.useForm();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [receivingOrderListData, setReceivingOrderListData] = useState([]);
    const [waitingProcessListData, setWaitingProcessListData] = useState([]);
    const [receivingOrderDetailData, setReceivingOrderDetailData] = useState(false);
    const [editReceivingOrder, setEditReceivingOrder] = useState(false);
    const [requestReceivingProcess, setRequestReceivingProcess] = useState(false);
    const [requestProcessParam, setRequestProcessParam] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 활성화 여부 상태
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [initialModalRequests, setInitialModalRequests] = useState([]);
    const [displayValues, setDisplayValues] = useState({});
    const [currentField, setCurrentField] = useState(''); // 모달 분기 할 필드 상태
    const [currentFieldIndex, setCurrentFieldIndex] = useState(null); // 현재 수정하려는 리스트 항목의 인덱스
    const [receivingOrderDetailParam, setReceivingOrderDetailParam] = useState(false);

    const [searchParams, setSearchParams] = useState({
        startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });


    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    const fetchWaitingProcessListData = async (startDate, endDate) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post(LOGISTICS_API.RECEIVING_SCHEDULE_WAITING_API(startDate, endDate));
            setWaitingProcessListData(response.data);
            notify('success', '데이터 조회 성공', '입고 대기 데이터를 성공적으로 조회했습니다.', 'bottomRight');
        } catch (error) {
            notify('error', '데이터 조회 오류', '출하 목록 데이터를 조회하는 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    }

    // 입고 목록 조회 패치
    const fetchReceivingOrderListData = async (startDate, endDate) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post(LOGISTICS_API.RECEIVING_SCHEDULE_WAITING_RECEIPT_API(startDate, endDate));
            setReceivingOrderListData(response.data);
            notify('success', '데이터 조회 성공', '출하 목록 데이터를 성공적으로 조회했습니다.', 'bottomRight');
        } catch (error) {
            notify('error', '데이터 조회 오류', '출하 목록 데이터를 조회하는 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    }

    const handleDateChange = (dates, dateStrings) => {
        setSearchParams({
            startDate: dateStrings[0],
            endDate: dateStrings[1],
        });
    }

    const handleSearch = () => {
        fetchReceivingOrderListData(searchParams.startDate, searchParams.endDate);
        fetchWaitingProcessListData(searchParams.startDate, searchParams.endDate);
    };

    const handleInputClick = (fieldName, index) => {
        setCurrentField(fieldName);
        setCurrentFieldIndex(index); // 인덱스를 저장
        setModalData(null); // 모달 열기 전에 데이터를 초기화
        setInitialModalData(null); // 모달 열기 전에 데이터를 초기화
        fetchModalData(fieldName);  // 모달 데이터 가져오기 호출
        setIsModalVisible(true);  // 모달창 열기
    };

    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;
        if (fieldName === 'clientName') apiPath = FINANCIAL_API.FETCH_CLIENT_LIST_API;
        if (fieldName === 'warehouseName') apiPath = LOGISTICS_API.WAREHOUSE_LIST_API;
        if (fieldName === 'managerName') apiPath = EMPLOYEE_API.EMPLOYEE_DATA_API;
        if (fieldName === 'productCode') apiPath = LOGISTICS_API.PRODUCT_LIST_API;
        if (fieldName === 'warehouseLocationId') apiPath = LOGISTICS_API.LOCATION_DETAIL_API(receivingOrderDetailParam.warehouseId); // 창고 위치 ID 사용

        try {
            const response = await apiClient.post(apiPath);
            // 데이터가 문자열이고 JSON 배열 형식일 경우 파싱, 아니면 그대로 배열로 처리
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
    }

    const handleModalSelect = (record) => {
        const receivingOrderDetails = form.getFieldValue('receivingOrderDetails') || []; // 기존 products 배열 가져오기

        switch (currentField) {
            case 'clientName':
                setReceivingOrderDetailParam(prevParms => ({
                    ...prevParms,
                    clientCode: {
                        id: record.id,
                        name: record.printClientName
                    },
                    clientId: record.id,
                }));
                setDisplayValues(prevValues => ({
                    ...prevValues,
                    clientName: `[${record.id}] ${record.printClientName}`,
                    contactInfo: record.phoneNumber,
                    address: record.roadAddress
                }));
                form.setFieldsValue({
                    clientName: `[${record.id}] ${record.printClientName}`,
                    contactInfo: record.phoneNumber,
                    address: record.roadAddress,
                    clientId: record.id
                });
                break;
            case 'managerName':
                setReceivingOrderDetailParam(prevParms => ({
                    ...prevParms,
                    managerName: {
                        id: record.id,
                        name: record.lastName + record.firstName,
                        employeeNumber: record.employeeNumber,
                    },
                    managerId: record.id
                }));
                setDisplayValues(prevValues => ({
                    ...prevValues,
                    managerName: `[${record.employeeNumber}] ${record.lastName}${record.firstName}`,
                }));
                form.setFieldsValue({
                    managerName: `[${record.employeeNumber}] ${record.lastName}${record.firstName}`,
                    editReceivingOrder,
                });
                break;
            case 'warehouseName':
                setReceivingOrderDetailParam(prevParms => ({
                    ...prevParms,
                    warehouseName: {
                        id: record.id,
                        name: record.name,
                        code: record.code,
                    },
                    warehouseId: record.id,

                }));
                setDisplayValues(prevValues => ({
                    ...prevValues,
                    warehouseName: `[${record.code}] ${record.name}`,
                }));
                form.setFieldsValue({
                    warehouseName: `[${record.code}] ${record.name}`,
                    warehouseId: record.id
                });
                break;
            case 'productCode':
                // 현재 선택된 인덱스의 항목만 수정하여 receivingOrderDetailParam 업데이트
                const updatedProducts = receivingOrderDetails.map((item, index) => {
                    if (index === currentFieldIndex) {
                        return {
                            ...item,
                            productId: record.id,
                            productCode: record.code,
                            productName: record.name,
                            standard: record.standard,
                        };
                    }
                    return item; // 나머지 항목은 그대로 유지
                });

                // receivingOrderDetailParam 상태와 form 필드에 업데이트된 항목 적용
                setReceivingOrderDetailParam(prevParams => ({
                    ...prevParams,
                    receivingOrderDetails: updatedProducts
                }));

                form.setFieldsValue({
                    receivingOrderDetails: updatedProducts,
                });
                break;
            case 'warehouseLocationId':
                // 선택한 위치 ID와 이름을 [id] 로케이션명 형식으로 설정
                const updatedRequests = form.getFieldValue('requests').map((item, index) => {
                    if (index === currentFieldIndex) {
                        return {
                            ...item,
                            warehouseLocationId: `[${record.id}] ${record.locationName}`,
                            locationId: record.id,
                        };
                    }
                    return item;
                });

                setRequestProcessParam((prevParams) => ({
                    ...prevParams,
                    locationId: record.locationId,
                    requests: updatedRequests,
                }));

                form.setFieldsValue({
                    requests: updatedRequests,
                });
                break;


        }
        setIsModalVisible(false);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    }

    const handleFormSubmit = async (values) => {
        confirm({
            title: '수정 확인',
            content: '정말로 수정하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                try {
                    // 상세 조회에서 사용된 id 값 설정
                    const receivingOrderId = receivingOrderDetailParam.id;

                    // ReceivingOrderCreateDto에 맞게 데이터 가공
                    const receivingOrderData = {
                        clientId: receivingOrderDetailParam.clientId,
                        managerId: receivingOrderDetailParam.managerId,
                        warehouseId: receivingOrderDetailParam.warehouseId,
                        date: values.date.format('YYYY-MM-DD'), // 등록 일자
                        deliveryDate: values.deliveryDate.format('YYYY-MM-DD'), // 입고 예정 일자
                        remarks: values.remarks,
                        items: values.receivingOrderDetails.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            remarks: item.remarks
                        }))
                    };


                    // 수정 API 호출
                    const API_PATH = LOGISTICS_API.RECEIVING_ORDER_UPDATE_API(receivingOrderId);
                    const response = await apiClient.put(API_PATH, receivingOrderData);

                    // 서버 응답에 따른 처리
                    notify('success', '입고 지시서 수정', '입고 지시서가 성공적으로 수정되었습니다.', 'bottomRight');

                    // 수정 후 필요한 추가 작업
                    fetchReceivingOrderListData(searchParams.startDate, searchParams.endDate);
                    setEditReceivingOrder(false);
                } catch (error) {
                    notify('error', '수정 실패', '입고 지시서를 수정하는 중 오류가 발생했습니다.', 'top');
                }
            },
            onCancel() {
                notification.warning({
                    message: '수정 취소',
                    description: '수정이 취소되었습니다.',
                    placement: 'bottomRight',
                });
            },
        });
    };

    const handleInventoryNumberClick = async (index) => {
        try {
            const response = await apiClient.post(LOGISTICS_API.NEXT_INVENTORY_NUMBER_API);
            const nextInventoryNumber = response.data;

            // 폼의 현재 상태 가져와서 업데이트
            const currentRequests = form.getFieldValue('requests') || [];
            currentRequests[index] = {
                ...currentRequests[index],
                pendingInventoryNumber: nextInventoryNumber,
            };

            form.setFieldsValue({requests: currentRequests});
        } catch (error) {
            notify('error', '재고 번호 오류', '재고 번호를 가져오는 중 오류가 발생했습니다.', 'top');
        }
    };


    const handleInstructionQuantityChange = (value, index) => {
        // receivingOrderListData 배열 복사
        const updatedData = [...receivingOrderListData];

        // 선택한 index에 해당하는 객체의 receivingInstructionQuantity 값을 업데이트
        updatedData[index] = {
            ...updatedData[index],
            receivingInstructionQuantity: value
        };

        // 상태 업데이트
        setReceivingOrderListData(updatedData);
    };

    // 입고처리 버튼 클릭 핸들러
    const handleReceivingProcess = () => {
        if (!selectedRowKeys.length) {
            alert("입고 지시서를 선택하세요.");
            return;
        }

        // 선택된 행 데이터 가져오기
        const selectedRow = receivingOrderListData.find(row => row.id === selectedRowKeys[0]);

        if (selectedRow) {

            form.setFieldsValue({
                receivingOrderDetailId: selectedRow.id,
                receivingDate: dayjs(selectedRow.deliveryDate), // 날짜를 dayjs로 변환
            });
            // 선택된 행의 `receivingInstructionQuantity` 값을 초기값으로 설정
            const initialRequest = {
                warehouseId: selectedRow.warehouseId,
                warehouseLocationId: selectedRow.warehouseLocationId, // 예시, 필요한 데이터를 입력
                productName: selectedRow.productName,
                pendingInventoryNumber: selectedRow.pendingInventoryNumber, // 예시, 필요 시 추가
                pendingQuantity: selectedRow.unreceivedQuantity, // 입고지시수량 사용
                receivingDate: dayjs(selectedRow.deliveryDate).format('YYYY-MM-DD'), // 입고 예정 날짜로 설정
            };

            setInitialModalRequests([initialRequest]);
            setRequestReceivingProcess(true); // 모달 활성화
        }
    };

    const handleProcessRequest = async () => {
        if (!selectedRowKeys.length) {
            notify('error', '선택 오류', '입고처리할 항목을 선택하세요.', 'top');
            return;
        }

        const id = selectedRowKeys[0]; // 선택된 ReceivingSchedule의 ID 사용
        try {
            const response = await apiClient.post(LOGISTICS_API.RECEIVING_SCHEDULE_PROCESS_CREATE_API(id));
            notify('success', '입고처리 성공', '선택된 항목이 입고처리되어 재고에 등록되었습니다.', 'bottomRight');
            fetchWaitingProcessListData(searchParams.startDate, searchParams.endDate); // 목록 갱신
        } catch (error) {
            notify('error', '입고처리 오류', '입고처리 중 오류가 발생했습니다.', 'top');
        }
    };

    const handleReceivingScheduleProcess = async (formData) => {
        try {
            const response = await apiClient.post(LOGISTICS_API.RECEIVING_SCHEDULE_PROCESS_API(), formData);
            notify('success', '입고 처리 성공', '입고 처리가 성공적으로 완료되었습니다.', 'bottomRight');
            setRequestReceivingProcess(false); // 모달 닫기
            fetchReceivingOrderListData(searchParams.startDate, searchParams.endDate);
        } catch (error) {
            notify('error', '입고 처리 오류', '입고 처리 중 오류가 발생했습니다.', 'top');
        }
    };


    // 데이터가 변경될 때 Form의 필드를 업데이트
    useEffect(() => {
        if (receivingOrderDetailData) {
            form.setFieldsValue({
                ...receivingOrderDetailData,
                clientName: `[${receivingOrderDetailData.clientCode}] ${receivingOrderDetailData.clientName}`,
                managerName: `[${receivingOrderDetailData.managerCode}] ${receivingOrderDetailData.managerName}`,
                warehouseName: `[${receivingOrderDetailData.warehouseCode}] ${receivingOrderDetailData.warehouseName}`,
                date: receivingOrderDetailData.date ? dayjs(receivingOrderDetailData.date, 'YYYY-MM-DD') : null,
                deliveryDate: receivingOrderDetailData.deliveryDate ? dayjs(receivingOrderDetailData.deliveryDate, 'YYYY-MM-DD') : null,
            });
            setReceivingOrderDetailParam(receivingOrderDetailData);

            setDisplayValues({
                clientName: `[${receivingOrderDetailData.clientCode}] ${receivingOrderDetailData.clientName}`,
                managerName: `[${receivingOrderDetailData.employeeNumber}] ${receivingOrderDetailData.employeeName}`,
                warehouseName: `[${receivingOrderDetailData.warehouseCode}] ${receivingOrderDetailData.warehouseName}`,
            })
        }
        if (requestReceivingProcess && initialModalRequests) {
            form.setFieldsValue({
                receivingDate: receivingOrderDetailData.deliveryDate ? dayjs(receivingOrderDetailData.deliveryDate, 'YYYY-MM-DD') : null,
                requests: initialModalRequests.map(request => ({
                    ...request,
                    receivingDate: request.receivingDate ? dayjs(request.receivingDate, 'YYYY-MM-DD') : null,
                })),
            });
        }


    }, [requestReceivingProcess, initialModalRequests, receivingOrderDetailData, form]);


    useEffect(() => {
        fetchReceivingOrderListData(searchParams.startDate, searchParams.endDate);
    }, []);


    return (
        <Box sx={{margin: '20px'}}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="입고처리"
                        description={(
                            <Typography>
                                입고처리 페이지는 <span>입고 예정된 물품이 실제로 창고에 도착한 후, 입고 과정을 기록하고 관리</span>하는 곳임. 이 페이지에서는 <span>입고 품목의 수량, 입고 날짜</span> 등을
                                입력하고, <span>입고 완료 여부</span>를 관리할 수 있음. 입고가 완료되면 재고가 자동으로 업데이트되며,
                                창고의 <span>재고 상태와 물류 흐름</span>을 효율적으로 파악할 수 있음.
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
                    <Grid item xs={12} md={12} sx={{minWidth: '1000px !important', maxWidth: '1500px !important'}}><Grow
                        in={true} timeout={200}>
                        <Paper elevation={3} sx={{height: '100%'}}>
                            <Typography variant="h6" sx={{padding: '20px'}}>입고 품목 목록</Typography>
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
                                    dataSource={receivingOrderListData}
                                    columns={[
                                        {
                                            title: <div className="title-text">등록날짜</div>,
                                            dataIndex: 'date',
                                            key: 'date',
                                            align: 'center',
                                            render: (text) => <div className="small-text">{text}</div>,
                                        },
                                        {
                                            title: <div className="title-text">보내는곳</div>,
                                            dataIndex: 'receivingWarehouseName',
                                            key: 'receivingWarehouseName',
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
                                            title: <div className="title-text">입고예정날짜</div>,
                                            dataIndex: 'deliveryDate',
                                            key: 'deliveryDate',
                                            align: 'center',
                                            render: (text) => <div className="small-text">{text}</div>,
                                        },
                                        {
                                            title: <div className="title-text">입고예정수량</div>,
                                            dataIndex: 'quantity',
                                            key: 'quantity',
                                            align: 'center',
                                            render: (text) => <div className="small-text">{text}</div>,
                                        },
                                        {
                                            title: <div className="title-text">입고대기수량</div>,
                                            dataIndex: 'totalWaitingQuantity',
                                            key: 'totalWaitingQuantity',
                                            align: 'center',
                                            render: (text) => <div className="small-text">{text}</div>,
                                        },
                                        {
                                            title: <div className="title-text">미입고수량</div>,
                                            dataIndex: 'unreceivedQuantity',
                                            key: 'unreceivedQuantity',
                                            align: 'center',
                                            render: (text) => <div className="small-text">{text}</div>,
                                        },
                                        {
                                            title: <div className="title-text">입고지시수량</div>,
                                            dataIndex: 'receivingInstructionQuantity',
                                            key: 'receivingInstructionQuantity',
                                            align: 'center',
                                            render: (_, record, index) => (
                                                <InputNumber
                                                    min={0}
                                                    defaultValue={record.unreceivedQuantity}
                                                    onChange={(value) => handleInstructionQuantityChange(value, index)}
                                                />
                                            ),
                                        },
                                        {
                                            title: <div className="title-text">적요</div>,
                                            dataIndex: 'remarks',
                                            key: 'remarks',
                                            align: 'center',
                                            render: (text) => <div className="small-text">{text}</div>,
                                        }
                                    ]}
                                    rowKey={(record) => record.id}
                                    pagination={{pageSize: 15, position: ['bottomCenter'], showSizeChanger: false}}
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
                                            const receivingOrderId = record.receivingOrderId; // 서버에서 가져온 입고지시서 ID 사용
                                            try {
                                                const response = await apiClient.post(LOGISTICS_API.RECEIVING_ORDER_DETAIL_API(receivingOrderId));
                                                setReceivingOrderDetailParam(response.data);
                                                setReceivingOrderDetailData(response.data);
                                                setEditReceivingOrder(true);

                                                notify('success', '품목 조회', '품목 정보 조회 성공.', 'bottomRight')
                                            } catch (error) {
                                                notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
                                            }
                                        },
                                    })}
                                />
                                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                    <Button type="primary" onClick={handleReceivingProcess}>
                                        입고처리
                                    </Button>
                                </div>
                            </Grid>
                        </Paper>
                    </Grow>
                    </Grid>
                    {editReceivingOrder && (
                        <Grid item xs={12} md={12} sx={{minWidth: '1000px !important', maxWidth: '1500px !important'}}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{height: '100%'}}>
                                    <Typography variant="h6" sx={{padding: '20px'}}>품목 상세정보 및 수정</Typography>
                                    <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                        <Form
                                            form={form}
                                            onFinish={(values) => {
                                                handleFormSubmit(values);
                                            }}
                                        >
                                            <Divider orientation={'left'} orientationMargin="0"
                                                     style={{marginTop: '0px', fontWeight: 600}}>
                                                기초 정보
                                            </Divider>
                                            <Row gutter={16}>
                                                <Col span={3}>
                                                    <Typography>등록일자</Typography>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item name="date">
                                                        <DatePicker format="YYYY-MM-DD"/>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="managerName">
                                                        <Input
                                                            addonBefore="담당자"
                                                            value={displayValues.managerName}
                                                            onClick={() => handleInputClick('managerName')}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined/>}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={5}>
                                                    <Form.Item name="clientName">
                                                        <Input
                                                            addonBefore="거래처"
                                                            value={displayValues.clientName}
                                                            onClick={() => handleInputClick('clientName')}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined/>}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="status">
                                                        <Space.Compact>
                                                            <Input style={{
                                                                width: '40%',
                                                                backgroundColor: '#FAFAFA',
                                                                color: '#000',
                                                                textAlign: 'center'
                                                            }} defaultValue="진행상태" disabled/>
                                                            <Select
                                                                style={{width: '60%'}}
                                                                value={receivingOrderDetailParam.status}
                                                                onChange={(value) => {
                                                                    setReceivingOrderDetailParam((prevState) => ({
                                                                        ...prevState,
                                                                        status: value,
                                                                    }));
                                                                }}
                                                            >
                                                                <Option value="WAITING_FOR_PURCHASE">발주대기</Option>
                                                                <Option value="PURCHASE_COMPLETED">발주완료</Option>
                                                                <Option value="WAITING_FOR_RECEIPT">입고예정</Option>
                                                                <Option value="RECEIPT_COMPLETED">입고완료</Option>
                                                                <Option value="CANCELED">취소</Option>
                                                                <Option value="ACCOUNTED">회계 반영 완료</Option>
                                                            </Select>
                                                        </Space.Compact>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={3}>
                                                    <Typography>입고예정일자</Typography>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item name="deliveryDate">
                                                        <DatePicker format="YYYY-MM-DD"/>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="warehouseName">
                                                        <Input
                                                            addonBefore="창고"
                                                            value={displayValues.warehouseName}
                                                            onClick={() => handleInputClick('warehouseName')}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined/>}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="managerContact">
                                                        <Input addonBefore="거래처 연락처"/>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item name="remarks">
                                                        <Input addonBefore="비고"/>
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            {/* 상세 항목 리스트 */}
                                            <Divider>상세 항목</Divider>
                                            <Form.List name="receivingOrderDetails">
                                                {(fields, {add, remove}) => (
                                                    <>
                                                        {fields.map(({key, name, ...restField}, index) => (
                                                            <Row gutter={16} key={key}
                                                                 style={{marginBottom: '10px'}}>
                                                                <Col span={5}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'productCode']}
                                                                        required
                                                                        tooltip="품목 코드를 입력하세요"
                                                                    >
                                                                        <Input
                                                                            addonBefore="품목 코드"
                                                                            value={receivingOrderDetailData?.receivingOrderDetails?.[index]?.productCode || ''}
                                                                            onClick={() => handleInputClick('productCode', index)}
                                                                            onFocus={(e) => e.target.blur()}
                                                                            suffix={<DownSquareOutlined/>}
                                                                        />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={5}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'productName']}
                                                                    >
                                                                        <Input addonBefore="품목명"/>
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={3}>
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
                                                                        name={[name, 'quantity']}
                                                                    >
                                                                        <InputNumber addonBefore="수량"/>
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={5}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'remarks']}
                                                                    >
                                                                        <Input addonBefore="비고"/>
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={2} style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'flex-end'
                                                                }}>
                                                                    <Button type="danger"
                                                                            onClick={() => remove(name)}>삭제</Button>
                                                                </Col>
                                                            </Row>
                                                        ))}
                                                        <Form.Item>
                                                            <Button type="primary" onClick={() => add()} block>
                                                                항목 추가
                                                            </Button>
                                                        </Form.Item>
                                                    </>
                                                )}
                                            </Form.List>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                marginBottom: '20px'
                                            }}>
                                                <Button type="primary" htmlType="submit">
                                                    저장
                                                </Button>
                                            </Box>
                                            <Modal
                                                open={isModalVisible}
                                                onCancel={handleModalCancel}
                                                width="40vw"
                                                footer={null}
                                            >
                                                {isLoading ? (
                                                    <Spin/>  // 로딩 스피너
                                                ) : (
                                                    <>
                                                        {currentField === 'clientName' && (
                                                            <>
                                                                <Typography id="modal-modal-title" variant="h6"
                                                                            component="h2" sx={{marginBottom: '20px'}}>
                                                                    거래처 선택
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
                                                                                    (item.id && item.id.toString().toLowerCase().includes(value)) ||
                                                                                    (item.printClientName && item.printClientName.toLowerCase().includes(value))
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
                                                                                title: '코드',
                                                                                dataIndex: 'id',
                                                                                key: 'id',
                                                                                align: 'center'
                                                                            },
                                                                            {
                                                                                title: '거래처명',
                                                                                dataIndex: 'printClientName',
                                                                                key: 'printClientName',
                                                                                align: 'center'
                                                                            }
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
                                                                            style: {cursor: 'pointer'},
                                                                            onClick: () => handleModalSelect(record) // 선택 시 처리
                                                                        })}
                                                                    />
                                                                )}
                                                            </>
                                                        )}

                                                        {currentField === 'managerName' && (
                                                            <>
                                                                <Typography id="modal-modal-title" variant="h6"
                                                                            component="h2" sx={{marginBottom: '20px'}}>
                                                                    자사 담당자 선택
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
                                                                                    (item.employeeNumber && item.employeeNumber.toLowerCase().includes(value)) ||
                                                                                    (item.firstName && item.firstName.toLowerCase().includes(value)) ||
                                                                                    (item.lastName && item.lastName.toLowerCase().includes(value))
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
                                                                                title: <div
                                                                                    className="title-text">사원번호</div>,
                                                                                dataIndex: 'employeeNumber',
                                                                                key: 'employeeNumber',
                                                                                align: 'center',
                                                                                render: (text) => <div
                                                                                    className="small-text">{text}</div>
                                                                            },
                                                                            {
                                                                                title: <div
                                                                                    className="title-text">이름</div>,
                                                                                key: 'name',
                                                                                align: 'center',
                                                                                render: (text, record) => <div
                                                                                    className="small-text">{record.lastName}{record.firstName}</div>,
                                                                            },
                                                                        ]}
                                                                        dataSource={modalData}
                                                                        rowKey="id"
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
                                                                )}
                                                            </>
                                                        )}
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
                                                                                dataIndex: 'code',
                                                                                key: 'code',
                                                                                align: 'center',
                                                                                render: (text) => <div
                                                                                    className="small-text">{text}</div>,
                                                                            },
                                                                            {
                                                                                title: <div
                                                                                    className="title-text">품목명</div>,
                                                                                dataIndex: 'name',
                                                                                key: 'name',
                                                                                align: 'center',
                                                                                render: (text) => <div
                                                                                    className="small-text">{text}</div>,
                                                                            },
                                                                            {
                                                                                title: <div
                                                                                    className="title-text">규격</div>,
                                                                                dataIndex: 'standard',
                                                                                key: 'standard',
                                                                                align: 'center',
                                                                                render: (text) => <div
                                                                                    className="small-text">{text}</div>,
                                                                            },
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

                    )}
                    {requestReceivingProcess && (
                        <Modal
                            title="입고 처리 요청"
                            open={requestReceivingProcess}
                            onOk={() => form.submit()}  // 제출 버튼 클릭 시 폼 제출
                            onCancel={() => setRequestReceivingProcess(false)} // 취소 버튼 클릭 시 모달 닫기
                            width="70vw"
                            footer={null}
                        >
                            <Form
                                form={form}
                                onFinish={(values) => {
                                    const formData = {
                                        receivingOrderDetailId: values.receivingOrderDetailId,
                                        receivingDate: values.receivingDate.format('YYYY-MM-DD'),
                                        requests: values.requests.map(request => ({
                                            warehouseLocationId: request.locationId,
                                            productName: request.productName,
                                            pendingInventoryNumber: request.pendingInventoryNumber,
                                            pendingQuantity: request.pendingQuantity,
                                        }))
                                    };
                                    handleReceivingScheduleProcess(formData); // 등록 요청
                                }}
                            >
                                <Form.Item
                                    label="입고 지시서 상세 ID"
                                    name="receivingOrderDetailId"
                                    disabled
                                    hidden
                                >
                                    <Input readOnly/>
                                </Form.Item>
                                <Form.Item
                                    label="입고 일자"
                                    name="receivingDate"
                                    rules={[{required: true, message: '입고 일자를 선택하세요.'}]}
                                >
                                    <DatePicker format="YYYY-MM-DD" style={{width: '100%'}}/>
                                </Form.Item>
                                <Form.List name="requests">
                                    {(fields, {add, remove}) => (
                                        <>
                                            {fields.map(({key, name, ...restField}, index) => (
                                                <Row gutter={16} key={key}>
                                                    <Col span={6}>
                                                        <Form.Item {...restField} name={[name, 'warehouseLocationId']}
                                                                   rules={[{required: true}]}>
                                                            <Input
                                                                addonBefore="창고위치"
                                                                value={receivingOrderDetailData?.requests?.[index]?.warehouseLocationId || ''}
                                                                onClick={() => handleInputClick('warehouseLocationId', index)}
                                                                onFocus={(e) => e.target.blur()}
                                                                suffix={<DownSquareOutlined/>}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Form.Item {...restField}
                                                                   name={[name, 'pendingInventoryNumber']}
                                                                   rules={[{required: true}]}>
                                                            <Input
                                                                addonBefore="재고 번호"
                                                                onClick={() => handleInventoryNumberClick(index)}
                                                            /> </Form.Item>
                                                    </Col>
                                                    <Col span={5}>
                                                        <Form.Item {...restField} name={[name, 'productName']}
                                                                   rules={[{required: true}]}>
                                                            <Input addonBefore="품목명"/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={5}>
                                                        <Form.Item {...restField} name={[name, 'pendingQuantity']}
                                                                   rules={[{required: true}]}>
                                                            <InputNumber min={1} addonBefore="지시 수량"
                                                                         style={{width: '100%'}}/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={2} style={{display: 'flex', justifyContent: 'flex-end'}}>
                                                        <Button type="danger" onClick={() => remove(name)}>삭제</Button>
                                                    </Col>
                                                </Row>
                                            ))}
                                            <Form.Item>
                                                <Button
                                                    type="dashed"
                                                    onClick={() => {
                                                        const currentRequests = form.getFieldValue('requests') || [];
                                                        const defaultProductName = currentRequests[0]?.productName || '';
                                                        add({productName: defaultProductName}); // 새 항목에 기본 품목명 설정
                                                    }}
                                                    icon={<PlusOutlined/>}
                                                >
                                                    항목 추가
                                                </Button>
                                            </Form.Item>
                                            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                                <Button type="primary" htmlType="submit">
                                                    입고처리
                                                </Button>
                                                <Button type="danger" onClick={() => setRequestReceivingProcess(false)}
                                                        style={{marginLeft: '10px'}}>
                                                    닫기
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form.List>
                                <Modal
                                    open={isModalVisible}
                                    onCancel={handleModalCancel}
                                    width="40vw"
                                    footer={null}
                                >
                                    {currentField === 'warehouseLocationId' && (
                                        <>
                                            <Typography id="modal-modal-title" variant="h6"
                                                        component="h2" sx={{marginBottom: '20px'}}>
                                                로케이션 선택
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
                                                            title: <div className="title-text">창고위치</div>,
                                                            dataIndex: 'locationName',
                                                            key: 'locationName',
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
                                                            title: <div className="title-text">활성화 여부</div>,
                                                            dataIndex: 'active',
                                                            key: 'active',
                                                            align: 'center',
                                                            render: (active) => (
                                                                <Tag color={active ? 'green' : 'red'}>
                                                                    {active ? '사용중' : '사용중단'}
                                                                </Tag>
                                                            ),
                                                        },
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
                                    {currentField === 'pendingInventoryNumber' && (
                                        <>
                                            <Typography id="modal-modal-title" variant="h6"
                                                        component="h2" sx={{marginBottom: '20px'}}>
                                                재고번호 선택
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

                                        </>
                                    )}
                                </Modal>
                            </Form>

                        </Modal>
                    )}

                </Grid>
            )}

            {activeTabKey === '2' && (
                <Grid sx={{padding: '0px 20px 0px 20px'}} container spacing={3}>
                    <Grid item xs={12} md={5}
                          sx={{minWidth: '1000px !important', maxWidth: '1500px !important'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{height: '100%'}}>
                                <Typography variant="h6" sx={{padding: '20px'}}>입고 대기 조회</Typography>
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
                                        dataSource={waitingProcessListData}
                                        columns={[
                                            {
                                                title: <div className="title-text">일자-No</div>,
                                                dataIndex: 'receivingDateNumber',
                                                key: 'receivingDateNumber',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">재고번호</div>,
                                                dataIndex: 'pendingInventoryNumber',
                                                key: 'pendingInventoryNumber',
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
                                                title: <div className="title-text">입고대기수량</div>,
                                                dataIndex: 'pendingQuantity',
                                                key: 'pendingQuantity',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">입고할 위치</div>,
                                                dataIndex: 'warehouseLocationName',
                                                key: 'warehouseLocationName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            }
                                        ]}
                                        pagination={{pageSize: 15, position: ['bottomCenter'], showSizeChanger: false}}
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
                                                const id = record.id;
                                                try {
                                                    notify('success', '품목 조회', '출하 정보 조회 성공.', 'bottomRight')
                                                } catch (error) {
                                                    notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
                                                }
                                            },
                                        })}>
                                    </Table>
                                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                        <Button type="primary" onClick={handleProcessRequest}>
                                            입고처리
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

export default IncomingProcessingPage;