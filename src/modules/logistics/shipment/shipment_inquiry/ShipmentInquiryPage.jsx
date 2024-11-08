import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import {tabItems} from './ShipmentInquiryUtil.jsx';
import {Typography} from '@mui/material';
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {Button, Col, DatePicker, Divider, Form, Input, InputNumber, Modal, notification, Row, Spin, Table} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {EMPLOYEE_API, FINANCIAL_API, LOGISTICS_API} from "../../../../config/apiConstants.jsx";
import dayjs from "dayjs";
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";

const {RangePicker} = DatePicker;
const {confirm} = Modal;


const ShipmentInquiryPage = () => {
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [form] = Form.useForm();
    const notify = useNotificationContext();
    const [shipmentListData, setShipmentListData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [detailShipmentData, setDetailShipmentData] = useState(null);
    const [shipmentParam, setShipmentParam] = useState(false);
    const [editDetailShipmentData, setEditDetailShipmentData] = useState(false);
    const [currentField, setCurrentField] = useState(''); // 모달 분기 할 필드 상태
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 활성화 여부 상태
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [currentFieldIndex, setCurrentFieldIndex] = useState(null); // 현재 수정하려는 리스트 항목의 인덱스
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [displayValues, setDisplayValues] = useState({
        clientName: '',
        employeeName: '',
        warehouseName: '',
        contactInfo: '',
        address: '',
    });
    const [searchParams, setSearchParams] = useState({
        startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    // 출하 목록 조회 패치
    const fetchShipmentList = async (startDate, endDate) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post(LOGISTICS_API.SHIPMENT_LIST_API(startDate, endDate));
            setShipmentListData(response.data);
            notify('success', '데이터 조회 성공', '출하 목록 데이터를 성공적으로 조회했습니다.', 'bottomRight');
        } catch (error) {
            notify('error', '데이터 조회 오류', '출하 목록 데이터를 조회하는 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    }

    const handleInputClick = (fieldName, index) => {
        setCurrentField(fieldName);
        setCurrentFieldIndex(index); // 인덱스를 저장
        setModalData(null); // 모달 열기 전에 데이터를 초기화
        setInitialModalData(null); // 모달 열기 전에 데이터를 초기화
        fetchModalData(fieldName);  // 모달 데이터 가져오기 호출
        setIsModalVisible(true);  // 모달창 열기
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    }

    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;
        if (fieldName === 'clientName') apiPath = FINANCIAL_API.FETCH_CLIENT_LIST_API;
        if (fieldName === 'warehouseName') apiPath = LOGISTICS_API.WAREHOUSE_LIST_API;
        if (fieldName === 'employeeName') apiPath = EMPLOYEE_API.EMPLOYEE_DATA_API;
        if (fieldName === 'productCode') {
            if (!selectedWarehouseId) {
                notify('error', '창고 선택 오류', '창고를 먼저 선택해 주세요.', 'top');
                setLoading(false);
                return;
            }
            apiPath = LOGISTICS_API.INVENTORY_BY_WAREHOUSE_API(selectedWarehouseId);
        }

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
        const products = form.getFieldValue('products') || []; // 기존 products 배열 가져오기

        switch (currentField) {
            case 'clientName':
                setShipmentParam(prevParms => ({
                    ...prevParms,
                    clientCode: {
                        id: record,
                        name: record.printClientName
                    },
                    clientId: record.id
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
            case 'employeeName':
                setShipmentParam(prevParms => ({
                    ...prevParms,
                    employeeName: {
                        id: record,
                        name: record.lastName + record.firstName,
                        employeeNumber: record.employeeNumber,
                    },
                    employeeId: record.id
                }));
                setDisplayValues(prevValues => ({
                    ...prevValues,
                    employeeName: `[${record.employeeNumber}] ${record.lastName}${record.firstName}`,
                }));
                form.setFieldsValue({
                    employeeName: `[${record.employeeNumber}] ${record.lastName}${record.firstName}`,
                    editDetailShipmentData,
                    employeeId: record.id
                });
                break;
            case 'warehouseName':
                setShipmentParam(prevParms => ({
                    ...prevParms,
                    warehouseName: {
                        id: record,
                        name: record.name,
                        code: record.code,
                    },
                    warehouseId: record.id

                }));
                setDisplayValues(prevValues => ({
                    ...prevValues,
                    warehouseName: `[${record.code}] ${record.name}`,
                }));
                form.setFieldsValue({
                    warehouseName: `[${record.code}] ${record.name}`,
                    warehouseId: record.id
                });
                setSelectedWarehouseId(record.id);
                break;
            case 'productCode':
                // 선택한 인덱스의 데이터만 수정
                const updatedProducts = products.map((item, index) => {
                    if (index === currentFieldIndex) {
                        return {
                            ...item,
                            productId: record.id,
                            productCode: record.productCode,
                            productName: record.productName,
                            standard: record.standard,
                            unit: record.unit
                        };
                    }
                    return item; // 나머지 항목은 그대로 유지
                });

                // 업데이트된 products 배열을 폼에 설정
                form.setFieldsValue({
                    products: updatedProducts,
                });
                break;
        }
        setIsModalVisible(false);
    };

    const handleFormSubmit = async (values) => {
        confirm({
            title: '수정 확인',
            content: '정말로 수정하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                try {
                    // ShipmentRequestDTO에 맞게 데이터 가공
                    const shipmentData = {
                        warehouseId: values.warehouseId, // 창고 ID
                        employeeId: values.employeeId, // 담당자 ID
                        clientId: values.clientId, // 고객 ID
                        contactInfo: values.contactInfo, // 고객 연락처
                        address: values.address, // 창고 주소
                        shipmentDate: values.shipmentDate.format('YYYY-MM-DD'), // 출하 일자
                        comment: values.comment, // 비고
                        products: values.products.map(product => ({
                            productId: product.productId, // 제품 ID
                            productCode: product.productCode, // 제품 코드
                            productName: product.productName, // 제품명
                            standard: product.standard, // 규격
                            unit: product.unit, // 단위
                            quantity: product.quantity, // 수량
                            comment: product.comment, // 비고 (옵션)
                        })),
                    };

                    // PUT 메소드로 수정 API 호출 (id가 필요함)
                    const shipmentId = detailShipmentData.id; // 출하의 ID

                    const API_PATH = LOGISTICS_API.SHIPMENT_UPDATE_API(shipmentId); // 수정 API 경로 (id 포함)

                    const response = await apiClient.put(API_PATH, shipmentData);
                    // 서버 응답에 따른 처리
                    notify('success', '출하 수정', '출하 정보가 성공적으로 수정되었습니다.', 'bottomRight');

                    // 수정 후 데이터 다시 조회
                    fetchShipmentList(searchParams.startDate, searchParams.endDate);
                    setEditDetailShipmentData(false); // 수정 모드 해제
                } catch (error) {
                    notify('error', '수정 실패', '출하 정보를 수정하는 중 오류가 발생했습니다.', 'top');
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


    const handleDateChange = (dates, dateStrings) => {
        setSearchParams({
            startDate: dateStrings[0],
            endDate: dateStrings[1],
        });
    }

    const handleSearch = () => {
        fetchShipmentList(searchParams.startDate, searchParams.endDate);
    };

    useEffect(() => {
        fetchShipmentList(searchParams.startDate, searchParams.endDate);
    }, []);

    // 상세 조회 데이터 폼에 반영
    useEffect(() => {
        if (detailShipmentData) {
            // 상세 조회 데이터 폼에 반영
            form.setFieldsValue({
                ...detailShipmentData,
                clientName: `[${detailShipmentData.clientCode}] ${detailShipmentData.clientName}`,
                employeeName: `[${detailShipmentData.employeeNumber}] ${detailShipmentData.employeeName}`,
                warehouseName: `[${detailShipmentData.warehouseCode}] ${detailShipmentData.warehouseName}`,
                shipmentDate: detailShipmentData.shipmentDate ? dayjs(detailShipmentData.shipmentDate, 'YYYY-MM-DD') : null,
            });

            // 거래처, 담당자, 창고명 데이터를 원하는 형식으로 displayValues 설정
            setDisplayValues({
                clientName: `[${detailShipmentData.clientCode}] ${detailShipmentData.clientName}`,
                employeeName: `[${detailShipmentData.employeeNumber}] ${detailShipmentData.employeeName}`,
                warehouseName: `[${detailShipmentData.warehouseCode}] ${detailShipmentData.warehouseName}`,
                contactInfo: detailShipmentData.contactInfo,
                address: detailShipmentData.clientAddress,
                comment: detailShipmentData.comment || '',
            });
            setSelectedWarehouseId(detailShipmentData.warehouseId);
            setSelectedEmployeeId(detailShipmentData.employeeId);
            setSelectedClientId(detailShipmentData.clientId);
            setSelectedProductId(detailShipmentData.productId);
        }
    }, [detailShipmentData, form]);

    return (
        <Box sx={{margin: '20px'}}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="출하조회"
                        description={(
                            <Typography>
                                출하조회 페이지는 <span>완료된 출하 내역을 확인하고 각 출하 과정의 세부 정보를 조회</span>하는 곳임. 이 페이지에서는 <span>출하된 품목, 출하일</span> 등을
                                확인할 수 있으며, 출하 기록을 통해 <span>재고와 물류 상태</span>를 관리할 수 있음.
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
                    <Grid item xs={12} md={12} sx={{minWidth: '1000px !important', maxWidth: '1500px !important'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{height: '100%'}}>
                                <Typography variant="h6" sx={{padding: '20px'}}>출하 조회</Typography>
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
                                        dataSource={shipmentListData}
                                        columns={[
                                            {
                                                title: <div className="title-text">일자-No</div>,
                                                dataIndex: 'shipmentNumber',
                                                key: 'shipmentNumber',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">창고명</div>,
                                                dataIndex: 'warehouseName',
                                                key: 'warehouseName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">품목명</div>,
                                                dataIndex: 'firstProductName',
                                                key: 'firstProductName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">수량합계</div>,
                                                dataIndex: 'totalQuantity',
                                                key: 'totalQuantity',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">거래처명</div>,
                                                dataIndex: 'clientName',
                                                key: 'clientName',
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
                                                    const response = await apiClient.post(LOGISTICS_API.SHIPMENT_DETAIL_API(id));
                                                    setDetailShipmentData(response.data);
                                                    setEditDetailShipmentData(true);
                                                    notify('success', '품목 조회', '출하 정보 조회 성공.', 'bottomRight')
                                                } catch (error) {
                                                    notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
                                                }
                                            },
                                        })}>
                                    </Table>
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                    {editDetailShipmentData && (
                        <Grid item xs={12} md={12} sx={{minWidth: '1000px !important', maxWidth: '1500px !important'}}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{height: '100%'}}>
                                    <Typography variant="h6" sx={{padding: '20px'}}>품목 상세정보 및 수정</Typography>
                                    <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                        <Form
                                            form={form}
                                            onFinish={(values) => {
                                                handleFormSubmit(values)
                                            }}
                                        >
                                            {/* 기초 정보 */}
                                            <Divider orientation={'left'} orientationMargin="0"
                                                     style={{marginTop: '0px', fontWeight: 600}}>기초 정보</Divider>
                                            <Row gutter={16}>
                                                <Col>
                                                    <Typography>출하일자</Typography>
                                                </Col>
                                                <Col span={3}>
                                                    <Form.Item
                                                        name="shipmentDate"
                                                        required
                                                        tooltip="출하일을 선택하세요"
                                                    >
                                                        <DatePicker format="YYYY-MM-DD"/>
                                                    </Form.Item>
                                                </Col>
                                                <Col>
                                                    <Typography>-</Typography>
                                                </Col>
                                                <Col span={1}>
                                                    <Form.Item
                                                        name="shipmentNumber"
                                                    >
                                                        <Input disabled/>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        name="clientName"
                                                        required
                                                        tooltip="거래처명을 입력하세요"
                                                    >
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
                                                    <Form.Item
                                                        name="employeeName"
                                                        required
                                                        tooltip="담당자를 입력하세요"
                                                    >
                                                        <Input
                                                            addonBefore="담당자"
                                                            value={displayValues.employeeName}
                                                            onClick={() => handleInputClick('employeeName')}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined/>}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        name="warehouseName"
                                                        required
                                                        tooltip="출하 창고를 선택하세요"
                                                    >
                                                        <Input
                                                            addonBefore="출하창고"
                                                            value={displayValues.warehouseName}
                                                            onClick={() => handleInputClick('warehouseName')}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined/>}/>
                                                    </Form.Item>
                                                    <Form.Item name="warehouseId" hidden >
                                                        <Input/>
                                                    </Form.Item>
                                                    <Form.Item name="employeeId" hidden >
                                                        <Input/>
                                                    </Form.Item>
                                                    <Form.Item name="clientId" hidden >
                                                        <Input/>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={5}>
                                                    <Form.Item name="contactInfo">
                                                        <Input addonBefore="연락처" value={displayValues.contactInfo}/>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={8}>
                                                    <Form.Item name="address">
                                                        <Input addonBefore="주소" value={displayValues.address}/>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={11}>
                                                    <Form.Item name="comment">
                                                        <Input
                                                            addonBefore="비고"
                                                            value={displayValues.comment}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Divider orientation={'left'} orientationMargin="0"
                                                     style={{marginTop: '0px', fontWeight: 600}}>출하 품목 정보</Divider>
                                            <Form.List name="products">
                                                {(fields, {add, remove}) => (
                                                    <>
                                                        {fields.map(({key, name, ...restField}, index) => (
                                                            <Row gutter={16} key={key}
                                                                 style={{marginBottom: '10px'}}>
                                                                <Col span={6}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'productCode']}
                                                                        required
                                                                        tooltip="품목 코드를 입력하세요"
                                                                    >
                                                                        <Input
                                                                            addonBefore="품목 코드"
                                                                            value={detailShipmentData?.products?.[index]?.productCode || ''}
                                                                            onClick={() => handleInputClick('productCode', index)}
                                                                            onFocus={(e) => e.target.blur()}
                                                                            suffix={<DownSquareOutlined/>}
                                                                        />
                                                                    </Form.Item>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'productId']}
                                                                        hidden
                                                                    >
                                                                        <Input/>
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={6}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'productName']}
                                                                        required
                                                                        tooltip="품목명을 입력하세요"
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
                                                                <Col span={3}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'unit']}
                                                                    >
                                                                        <Input addonBefore="단위"/>
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={4}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'quantity']}
                                                                        required
                                                                        tooltip="수량을 입력하세요"
                                                                    >
                                                                        <InputNumber addonBefore="수량"/>
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

                                                        {currentField === 'employeeName' && (
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
                                                                                title: <div
                                                                                    className="title-text">규격</div>,
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
                    )}
                </Grid>
            )}

            {activeTabKey === '2' && (
                <Grid sx={{padding: '0px 20px 0px 20px'}} container spacing={3}>
                    <Grid item xs={12} md={5} sx={{minWidth: '500px !important', maxWidth: '700px !important'}}>
                        <Grow in={true} timeout={200}>
                            <div>
                                <TemporarySection/>
                            </div>
                        </Grow>
                    </Grid>
                </Grid>
            )}

        </Box>
    );
};

export default ShipmentInquiryPage;