import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './ClientRegistrationUtil.jsx';
import { Typography } from '@mui/material';
import { Space, Tag, Form, Table, Button, Col, Input, Row, Checkbox, Modal, DatePicker, Spin, Select, notification } from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {EMPLOYEE_API, FINANCIAL_API} from "../../../../config/apiConstants.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import dayjs from 'dayjs';
import { Divider } from 'antd';
import {setAuth} from "../../../../config/redux/authSlice.jsx";
import {jwtDecode} from "jwt-decode";
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";
const { Option } = Select;
const { confirm } = Modal;

const ClientRegistrationPage = ( {initialData} ) => {
    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [form] = Form.useForm(); // 폼 인스턴스 생성
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [clientList, setClientList] = useState(initialData);
    const [activeTabKey, setActiveTabKey] = useState('1'); // 활성 탭 키 상태
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 선택된 행 키 상태
    const [editClient, setEditClient] = useState(false); // 거래처 등록 수정 탭 활성화 여부 상태
    const [fetchClientData, setFetchClientData] = useState(false); // 거래처 조회한 정보 상태
    const [clientParam, setClientParam] = useState(false); // 수정 할 거래처 정보 상태
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const [currentField, setCurrentField] = useState(''); // 모달 분기 할 필드 상태
    const [modalData, setModalData] = useState(null); // 모달 데이터 상태
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 활성화 여부 상태
    const [isEndDateDisable, setIsEndDateDisable] = useState(false); // 거래 종료일 비활성화 여부 상태
    const [displayValues, setDisplayValues] = useState({});

    // 거래처 조회 데이터가 있을 경우 폼에 데이터 셋팅
    useEffect(() => {
        if (!fetchClientData) return;

        form.setFieldsValue(fetchClientData);
        setClientParam(fetchClientData);

        setDisplayValues({
            bank: `[${fetchClientData.bankAccount.bank.code.toString().padStart(5, '0')}] ${fetchClientData.bankAccount.bank.name}`,
            employee: `[${fetchClientData.employee.employeeNumber.toString().padStart(5, '0')}] ${fetchClientData.employee.lastName}${fetchClientData.employee.firstName}`,
            liquor: `[${fetchClientData.liquor.id.toString().padStart(5, '0')}] ${fetchClientData.liquor.name}`,
            category: `[${fetchClientData.category.code.toString().padStart(5, '0')}] ${fetchClientData.category.name}`,
        });

    }, [fetchClientData, form]);

    // 모달창 열기 핸들러
    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setModalData(null);
        setInitialModalData(null);
        fetchModalData(fieldName);  // 모달 데이터 가져오기 호출
        setIsModalVisible(true);  // 모달창 열기
    };

    // 모달창 닫기 핸들러
    const handleModalCancel = () => setIsModalVisible(false);

    // 모달창 데이터 가져오기 함수
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;
        if(fieldName === 'bank') apiPath = FINANCIAL_API.FETCH_BANK_LIST_API;
        if(fieldName === 'employee') apiPath = EMPLOYEE_API.EMPLOYEE_DATA_API;
        if(fieldName === 'liquor') apiPath = FINANCIAL_API.FETCH_LIQUOR_LIST_API;
        if(fieldName === 'category') apiPath = FINANCIAL_API.FETCH_CATEGORY_LIST_API;

        try {
            const response = await apiClient.post(apiPath);
            setModalData(response.data);
            setInitialModalData(response.data);
        } catch (error) {
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };

    // 모달창 선택 핸들러
    const handleModalSelect = (record) => {

        // 모달 창 마다가 formattedvalue, setclient param 설정 값이 다름
        switch (currentField) {
            case 'bank':
                setClientParam((prevParams) => ({
                    ...prevParams,
                    bankAccount: {
                        bank: {
                            id: record.id,
                            code: record.code,
                            name: record.name,
                            businessNumber: record.businessNumber,
                        },
                    },
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    bank: `[${record.code.toString().padStart(5, '0')}] ${record.name}`,
                }));
            break;
            case 'employee':
                setClientParam((prevParams) => ({
                    ...prevParams,
                    employee: {
                        id: record.id,
                        firstName: record.firstName,
                        lastName: record.lastName,
                        employeeNumber: record.employeeNumber,
                    },
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    employee: `[${record.employeeNumber.toString().padStart(5, '0')}] ${record.lastName}${record.firstName}`,
                }));
            break;
            case 'liquor':
                setClientParam((prevParams) => ({
                    ...prevParams,
                    liquor: {
                        id: record.id,
                        code: record.code,
                        name: record.name,
                    },
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    liquor: `[${record.id.toString().padStart(5, '0')}] ${record.name}`,
                }));
            break;
            case 'category':
                setClientParam((prevParams) => ({
                    ...prevParams,
                    category: {
                        id: record.id,
                        code: record.code,
                        name: record.name,
                    },
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    category: `[${record.id.toString().padStart(5, '0')}] ${record.name}`,
                }));
            break;
        }
        // 모달창 닫기
        setIsModalVisible(false);
    };

    // 폼 제출 핸들러
    const handleFormSubmit = async (values, type) => {
        confirm({
            title: '저장 확인',
            content: '정말로 저장하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                // 확인 버튼 클릭 시 실행되는 저장 로직
                values.id = clientParam.id;
                values.code = fetchClientData ? fetchClientData.code : null;
                values.transactionStartDate = dayjs(clientParam.transactionStartDate).format('YYYY-MM-DD');
                values.transactionEndDate = dayjs(clientParam.transactionEndDate).format('YYYY-MM-DD');
                values.financialInfo.creditLimit =  removeComma(values.financialInfo.creditLimit);
                values.financialInfo.collateralAmount = removeComma(values.financialInfo.collateralAmount);
                values.transactionType = clientParam.transactionType;
                values.bankAccount.bank = {
                    id: clientParam.bankAccount.bank.id,
                    code: clientParam.bankAccount.bank.code,
                    name: clientParam.bankAccount.bank.name,
                    businessNumber: clientParam.bankAccount.bank.businessNumber,
                };
                values.employee = {
                    id: clientParam.employee.id,
                    firstName: clientParam.employee.firstName,
                    lastName: clientParam.employee.lastName,
                    employeeNumber: clientParam.employee.employeeNumber,
                };
                values.liquor = {
                    id: clientParam.liquor.id,
                    code: clientParam.liquor.code,
                    name: clientParam.liquor.name,
                };
                values.category = {
                    id: clientParam.category.id,
                    code: clientParam.category.code,
                    name: clientParam.category.name,
                };

                try {
                    const API_PATH = type === 'update' ? FINANCIAL_API.UPDATE_CLIENT_API : FINANCIAL_API.SAVE_CLIENT_API;
                    const response = await apiClient.post(API_PATH, values);
                    const updatedData = response.data;
                    setClientList((prevClientList) =>
                        prevClientList.map((client) =>
                            client.id === updatedData.id
                                ? {
                                    ...client,
                                    id: values.id,
                                    representativeName: values.representativeName,
                                    printClientName: values.printClientName,
                                    roadAddress: values.address.roadAddress,
                                    detailedAddress: values.address.detailedAddress,
                                    phoneNumber: values.contactInfo.phoneNumber,
                                    businessType: values.businessInfo.businessType,
                                    transactionStartDate: values.transactionStartDate,
                                    transactionEndDate: values.transactionEndDate,
                                    remarks: values.remarks,
                                }
                                : client
                        )
                    );
                    setEditClient(false);
                    setFetchClientData(null);
                    setClientParam({
                        transactionStartDate: dayjs(),  // 현재 날짜로 설정
                        transactionEndDate: "9999-12-31",  // 종료일을 9999-12-31로 설정
                        transactionType: 'BOTH',
                    });
                    setDisplayValues({});
                    type === 'update'
                        ? notify('success', '거래처 수정', '거래처 정보 수정 성공.', 'bottomRight')
                        : (notify('success', '거래처 저장', '거래처 정보 저장 성공.', 'bottomRight'), registrationForm.resetFields());

                } catch (error) {
                    notify('error', '저장 실패', '데이터 저장 중 오류가 발생했습니다.', 'top');
                }
            },
            onCancel() {
                notification.warning({
                    message: '저장 취소',
                    description: '저장이 취소되었습니다.',
                    placement: 'bottomRight',
                });
            },
        });
    };

    // 사업자등록번호, 주민등록번호, 전화번호, 팩스번호 포맷 함수
    const formatPhoneNumber = (value) => {
        if (!value) return '';
        const cleanValue = value.replace(/[^\d]/g, ''); // 숫자 외의 모든 문자 제거
        if (cleanValue.length <= 3) return cleanValue;
        if (cleanValue.length <= 7) return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
        return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 7)}-${cleanValue.slice(7)}`;
    };

    // 금액 포맷 함수
    const formatNumberWithComma = (value) => {
        if (!value) return '';
        const cleanValue = value.toString().replace(/[^\d]/g, ''); // 숫자 외의 모든 문자 제거
        return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // 콤마 제거 함수
    const removeComma = (value) => {
        return value ? value.toString().replace(/,/g, '') : value;
    };

    // 사업자등록번호 포맷 함수
    const formatBusinessRegistrationNumber = (value) => {
        if (!value) return '';
        const cleanValue = value.replace(/[^\d]/g, ''); // 숫자 외의 모든 문자 제거
        if (cleanValue.length <= 3) return cleanValue;
        if (cleanValue.length <= 5) return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
        return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 5)}-${cleanValue.slice(5)}`;
    };

    // 주민등록번호 포맷 함수
    const formatIdNumber = (value) => {
        if (!value) return '';
        const cleanValue = value.replace(/[^\d]/g, ''); // 숫자 외의 모든 문자 제거
        if (cleanValue.length <= 6) return cleanValue;
        return `${cleanValue.slice(0, 6)}-${cleanValue.slice(6)}`;
    };

    // 거래 시작일 변경 핸들러
    const handleStartDateChange = (date) => {
        setClientParam((prevState) => ({
            ...prevState,
            transactionStartDate: dayjs(date),
        }));
    };

    // 거래 종료일 변경 핸들러
    const handleEndDateChange = (date) => {
        setClientParam((prevState) => ({
            ...prevState,
            transactionEndDate: dayjs(date),
        }));
    };

    const handleEndDateDisableChange = (e) => {
        if (e.target.checked) {
            setIsEndDateDisable(true);
            setClientParam((prevState) => ({
                ...prevState,
                transactionEndDate: "9999-12-31",
            }));
        }else {
            setIsEndDateDisable(false);
            setClientParam((prevState) => ({
                ...prevState,
                transactionEndDate: dayjs(),
            }));
        }
    }

    // 탭 변경 핸들러
    const handleTabChange = (key) => {
        setEditClient(false);
        setFetchClientData(null);
        setClientParam({
            transactionStartDate: dayjs(),  // 현재 날짜로 설정
            transactionEndDate: "9999-12-31",  // 종료일을 9999-12-31로 설정
            transactionType: 'BOTH',
        });
        setDisplayValues({});

        form.resetFields(); // 1탭 폼 초기화
        registrationForm.resetFields(); // 2탭 폼 초기화
        registrationForm.setFieldValue('isActive', true);

        setActiveTabKey(key);
    };

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="거래처 관리"
                        description={(
                            <Typography>
                                거래처관리 페이지는 <span>기업의 거래처 정보를 등록하고 관리</span>하는 기능을 제공함.<br/>
                                거래처의 기본 정보와 <span>계좌 정보를 등록하여</span> 효율적으로 거래처를 관리할 수 있음.<br/>
                                거래처를 분류하고 필요한 정보를 빠르게 검색할 수 있도록 설정 가능함. <span>정확한 거래처 정보 관리</span>는 재무 처리와 거래 내역 기록에 중요한 역할을 함.
                            </Typography>
                        )}
                        tabItems={tabItems()}
                        activeTabKey={activeTabKey}
                        handleTabChange={handleTabChange}
                    />
                </Grid>
            </Grid>

            {activeTabKey === '1' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >거래처 목록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Table
                                        dataSource={clientList}
                                        columns={[
                                            {
                                                title: <div className="title-text">대표자명</div>,
                                                dataIndex: 'representativeName',
                                                key: 'representativeName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                                width: '10%'
                                            },
                                            {
                                                title: <div className="title-text">상호명</div>,
                                                dataIndex: 'printClientName',
                                                key: 'printClientName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                                width: '15%'
                                            },
                                            {
                                                title: <div className="title-text">주소</div>,
                                                key: 'address',
                                                align: 'center',
                                                render: (_, record) => <div className="small-text">{`${record.roadAddress}, ${record.detailedAddress}`}</div>,
                                                width: '20%'
                                            },
                                            {
                                                title: <div className="title-text">전화번호</div>,
                                                dataIndex: 'phoneNumber',
                                                key: 'phoneNumber',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                                width: '10%'
                                            },
                                            {
                                                title: <div className="title-text">사업종류</div>,
                                                dataIndex: 'businessType',
                                                key: 'businessType',
                                                align: 'center',
                                                render: (text, record) => {
                                                    let color;
                                                    switch (text) {
                                                        case '제조업':
                                                            color = 'red';
                                                            break;
                                                        case '도매업':
                                                            color = 'green';
                                                            break;
                                                        case '서비스업':
                                                            color = 'blue';
                                                            break;
                                                        default:
                                                            color = 'gray'; // 기본 색상
                                                    }
                                                    return <Tag style={{marginLeft: '5px'}} color={color}>{text}</Tag>;
                                                },
                                                width: '10%'
                                            },
                                            {
                                                title: <div className="title-text">거래 시작일</div>,
                                                dataIndex: 'transactionStartDate',
                                                key: 'transactionStartDate',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                                width: '10%'
                                            },
                                            {
                                                title: <div className="title-text">거래 종료일</div>,
                                                dataIndex: 'transactionEndDate',
                                                key: 'transactionEndDate',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                                width: '10%'
                                            },
                                            {
                                                title: <div className="title-text">비고</div>,
                                                dataIndex: 'remarks',
                                                key: 'remarks',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                                width: '20%'
                                            }
                                        ]}
                                        rowKey={(record) => record.id}
                                        pagination={{ pageSize: 15, position: ['bottomCenter'], showSizeChanger: false }}
                                        size="small"
                                        rowSelection={{
                                            type: 'radio',
                                            selectedRowKeys,
                                            onChange: async (newSelectedRowKeys) => {
                                                setSelectedRowKeys(newSelectedRowKeys);
                                                const id = newSelectedRowKeys[0];
                                                try {
                                                    const response = await apiClient.post(FINANCIAL_API.FETCH_CLIENT_API(id));
                                                    setFetchClientData(response.data);
                                                    setEditClient(true);

                                                    notify('success', '거래처 조회', '거래처 정보 조회 성공.', 'bottomRight')
                                                } catch (error) {
                                                    notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
                                                }
                                            }
                                        }}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: async () => {
                                                setSelectedRowKeys([record.id]); // 클릭한 행의 키로 상태 업데이트
                                                const id = record.id;
                                                try {
                                                    const response = await apiClient.post(FINANCIAL_API.FETCH_CLIENT_API(id));
                                                    setFetchClientData(response.data);
                                                    setEditClient(true);

                                                    notify('success', '거래처 조회', '거래처 정보 조회 성공.', 'bottomRight')
                                                } catch (error) {
                                                    notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
                                                }
                                            },
                                        })}
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                    {editClient && (
                    <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >거래처 등록 및 수정</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form
                                        initialValues={fetchClientData}
                                        form={form}
                                        onFinish={(values) => { handleFormSubmit(values, 'update') }}
                                    >
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight:600 }}>기초 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item name="representativeName" rules={[{ required: true, message: '대표자 이름을 입력하세요.' }]}>
                                                    <Input addonBefore="대표자 이름" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="businessRegistrationNumber" rules={[{ required: true, message: '사업자 등록번호를 입력하세요.' }]}>
                                                    <Input addonBefore="사업자 등록번호" maxLength={12} onChange={(e) => form.setFieldValue('businessRegistrationNumber', formatBusinessRegistrationNumber(e.target.value))} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="idNumber" rules={[{ required: true, message: '주민등록번호를 입력하세요.' }]}>
                                                    <Input addonBefore="주민등록번호" maxLength={14} onChange={(e) => form.setFieldValue('idNumber', formatIdNumber(e.target.value))} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="printClientName" rules={[{ required: true, message: '거래처 인쇄명을 입력하세요.' }]}>
                                                    <Input addonBefore="거래처 인쇄명" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item name={['address', 'postalCode']} rules={[{ required: true, message: '우편번호를 입력하세요.' }]}>
                                                    <Input addonBefore="우편번호" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name={['address', 'roadAddress']} rules={[{ required: true, message: '도로명 주소를 입력하세요.' }]}>
                                                    <Input addonBefore="도로명 주소" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name={['address', 'detailedAddress']} rules={[{ required: true, message: '상세 주소를 입력하세요.' }]}>
                                                    <Input addonBefore="상세 주소" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item name={['contactInfo', 'phoneNumber']} rules={[{ required: true, message: '전화번호를 입력하세요.' }]}>
                                                    <Input addonBefore="전화번호" onChange={(e) => form.setFieldValue(['contactInfo', 'phoneNumber'], formatPhoneNumber(e.target.value))} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name={['contactInfo', 'faxNumber']} rules={[{ required: true, message: '팩스번호를 입력하세요.' }]}>
                                                    <Input addonBefore="팩스번호" onChange={(e) => form.setFieldValue(['contactInfo', 'faxNumber'], formatPhoneNumber(e.target.value))} />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        {/* 사업 정보 */}
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight:600 }}>사업 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item name={['businessInfo', 'businessType']} rules={[{ required: true, message: '업태를 입력하세요.' }]}>
                                                    <Input addonBefore="업태" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name={['businessInfo', 'businessItem']} rules={[{ required: true, message: '종목을 입력하세요.' }]}>
                                                    <Input addonBefore="종목" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight:600 }}>금융 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={4}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="은행명"
                                                        value={displayValues.bank}
                                                        onClick={() => handleInputClick('bank')}
                                                        onFocus={(e) => e.target.blur()}
                                                        suffix={<DownSquareOutlined />}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name={['bankAccount', 'accountNumber']} rules={[{ required: true, message: '계좌번호를 입력하세요.' }]}>
                                                    <Input addonBefore="계좌번호" placeholder="123-4567-890123" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name={['bankAccount', 'accountHolder']} rules={[{ required: true, message: '예금주를 입력하세요.' }]}>
                                                    <Input addonBefore="예금주" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name={['financialInfo', 'collateralAmount']} rules={[{ required: true, message: '담보 금액을 입력하세요.' }]}>
                                                    <Input addonBefore="담보 금액" onChange={(e) => form.setFieldValue(['financialInfo', 'collateralAmount'], formatNumberWithComma(e.target.value))} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name={['financialInfo', 'creditLimit']} rules={[{ required: true, message: '신용 한도를 입력하세요.' }]}>
                                                    <Input addonBefore="신용 한도" onChange={(e) => form.setFieldValue(['financialInfo', 'creditLimit'], formatNumberWithComma(e.target.value))} />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight:600 }}>담당자 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item name={['managerInfo', 'clientManagerPhoneNumber']} rules={[{ required: true, message: '거래처 담당자 전화번호를 입력하세요.' }]}>
                                                    <Input addonBefore="거래처 담당자 전화번호" onChange={(e) => form.setFieldValue(['managerInfo', 'clientManagerPhoneNumber'], formatPhoneNumber(e.target.value))} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item name={['managerInfo', 'clientManagerEmail']} rules={[{ required: true, message: '거래처 담당자 이메일을 입력하세요.' }]}>
                                                    <Input type="email" addonBefore="거래처 담당자 이메일" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="자사 담당자 정보"
                                                        onClick={() => handleInputClick('employee')}
                                                        value={displayValues.employee}
                                                        onFocus={(e) => e.target.blur()}
                                                        suffix={<DownSquareOutlined />}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight:600 }}>추가 정보</Divider>
                                        <Row align="middle" gutter={16} style={{ marginBottom: '16px' }}>
                                            <Col>
                                                <Typography>거래시작일</Typography>
                                            </Col>
                                            <Col>
                                                <Form.Item style={{ marginBottom: 0 }} rules={[{ required: true, message: '거래 시작일을 입력하세요.' }]}>
                                                    <DatePicker
                                                        disabledDate={(current) => current && current.year() !== 2024}
                                                        value={clientParam.transactionStartDate && dayjs(clientParam.transactionStartDate).isValid() ? dayjs(clientParam.transactionStartDate) : null}
                                                        onChange={(date) => {
                                                            if (date) {
                                                                handleStartDateChange();
                                                            } else {
                                                                handleStartDateChange(null);
                                                            }
                                                        }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Typography>거래종료일</Typography>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item style={{ marginBottom: 0 }} rules={[{ required: true, message: '거래 종료일을 입력하세요.' }]}>
                                                    <DatePicker
                                                        disabledDate={(current) => current && current.year() !== 2024}
                                                        value={clientParam.transactionEndDate && dayjs(clientParam.transactionEndDate).isValid() ? dayjs(clientParam.transactionEndDate) : null}
                                                        onChange={handleEndDateChange}
                                                        disabled={isEndDateDisable}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Checkbox onChange={handleEndDateDisableChange}>
                                                    거래종료일 비활성화
                                                </Checkbox>
                                            </Col>
                                        </Row>

                                        {/* 주류 및 카테고리 정보 (모달 선택) */}
                                        <Row gutter={16}>
                                            <Col span={5}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="주류코드"
                                                        onClick={() => handleInputClick('liquor')}
                                                        value={displayValues.liquor}
                                                        onFocus={(e) => e.target.blur()}
                                                        suffix={<DownSquareOutlined />}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="카테고리"
                                                        onClick={() => handleInputClick('category')}
                                                        value={displayValues.category}
                                                        onFocus={(e) => e.target.blur()}
                                                        suffix={<DownSquareOutlined />}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name="remarks">
                                                    <Input addonBefore="비고" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name="transactionType">
                                                    <Space.Compact>
                                                        <Input style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="거래유형" disabled />
                                                        <Select
                                                            style={{ width: '60%' }}
                                                            value={clientParam.transactionType}
                                                            onChange={(value) => {
                                                                setClientParam((prevState) => ({
                                                                    ...prevState,
                                                                    transactionType: value, // 선택된 값을 transactionType에 반영
                                                                }));
                                                            }}
                                                        >
                                                        <Option value="SALES">매출</Option>
                                                            <Option value="PURCHASE">매입</Option>
                                                            <Option value="BOTH">동시</Option>
                                                        </Select>
                                                    </Space.Compact>
                                                </Form.Item>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item name="isActive" valuePropName="checked">
                                                    <Checkbox>거래처 활성화 여부</Checkbox>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Divider />

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                            <Button type="primary" htmlType="submit">
                                                저장
                                            </Button>
                                        </Box>

                                        {/* 모달창 */}
                                        <Modal
                                               open={isModalVisible}
                                               onCancel={handleModalCancel}
                                               width="40vw"
                                               footer={null}
                                        >{isLoading ? (
                                            <Spin />  // 로딩 스피너
                                        ) : (
                                            <>
                                                {currentField === 'bank' && (
                                                    <>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                            은행 선택
                                                        </Typography>
                                                        <Input
                                                            placeholder="검색"
                                                            prefix={<SearchOutlined />}
                                                            onChange={(e) => {
                                                                const value = e.target.value.toLowerCase(); // 입력값을 소문자로 변환
                                                                if (!value) {
                                                                    setModalData(initialModalData);
                                                                } else {
                                                                    const filtered = initialModalData.filter((item) => {
                                                                        return (
                                                                            (item.code && item.code.toLowerCase().includes(value)) ||
                                                                            (item.name && item.name.toLowerCase().includes(value)) ||
                                                                            (item.businessNumber && item.businessNumber.toLowerCase().includes(value))
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
                                                                    {
                                                                        title: <div className="title-text">코드</div>,
                                                                        dataIndex: 'code',
                                                                        key: 'code',
                                                                        align: 'center',
                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                    },
                                                                    {
                                                                        title: <div className="title-text">은행명</div>,
                                                                        dataIndex: 'name',
                                                                        key: 'name',
                                                                        align: 'center',
                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                    },
                                                                    {
                                                                        title: <div className="title-text">사업자번호</div>,
                                                                        dataIndex: 'businessNumber',
                                                                        key: 'businessNumber',
                                                                        align: 'center',
                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                    },
                                                                ]}
                                                                dataSource={modalData}
                                                                rowKey="code"
                                                                size={'small'}
                                                                 pagination={{
                                                                     pageSize: 15,
                                                                     position: ['bottomCenter'],
                                                                     showSizeChanger: false,
                                                                     showTotal: (total) => `총 ${total}개`,
                                                                 }}
                                                                onRow={(record) => ({
                                                                    style: { cursor: 'pointer' },
                                                                    onClick: () => handleModalSelect(record), // 선택 시 처리
                                                                })}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                                {currentField === 'employee' && (
                                                    <>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                            자사 담당자 선택
                                                        </Typography>
                                                        <Input
                                                            placeholder="검색"
                                                            prefix={<SearchOutlined />}
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
                                                            style={{ marginBottom: 16 }}
                                                        />
                                                        {modalData && (
                                                            <Table
                                                                columns={[
                                                                    {
                                                                        title: <div className="title-text">사원번호</div>,
                                                                        dataIndex: 'employeeNumber',
                                                                        key: 'employeeNumber',
                                                                        align: 'center',
                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                    },
                                                                    {
                                                                        title: <div className="title-text">이름</div>,
                                                                        key: 'name',
                                                                        align: 'center',
                                                                        render: (text, record) => <div className="small-text">{record.lastName}{record.firstName}</div>,
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
                                                                    style: { cursor: 'pointer' },
                                                                    onClick: () => handleModalSelect(record), // 선택 시 처리
                                                                })}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                                {currentField === 'liquor' && (
                                                    <>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                            주류코드 선택
                                                        </Typography>
                                                        <Input
                                                            placeholder="검색"
                                                            prefix={<SearchOutlined />}
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
                                                            style={{ marginBottom: 16 }}
                                                        />
                                                        {modalData && (
                                                            <Table
                                                                columns={[
                                                                    {
                                                                        title: <div className="title-text">코드</div>,
                                                                        dataIndex: 'code',
                                                                        key: 'code',
                                                                        align: 'center',
                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                    },
                                                                    {
                                                                        title: <div className="title-text">이름</div>,
                                                                        dataIndex: 'name',
                                                                        key: 'name',
                                                                        align: 'center',
                                                                        render: (text) => <div className="small-text">{text}</div>
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
                                                                    style: { cursor: 'pointer' },
                                                                    onClick: () => handleModalSelect(record), // 선택 시 처리
                                                                })}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                                {currentField === 'category' && (
                                                    <>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                            카테고리 선택
                                                        </Typography>
                                                        <Input
                                                            placeholder="검색"
                                                            prefix={<SearchOutlined />}
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
                                                            style={{ marginBottom: 16 }}
                                                        />
                                                        {modalData && (
                                                            <Table
                                                                columns={[
                                                                    {
                                                                        title: <div className="title-text">코드</div>,
                                                                        dataIndex: 'code',
                                                                        key: 'code',
                                                                        align: 'center',
                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                    },
                                                                    {
                                                                        title: <div className="title-text">이름</div>,
                                                                        dataIndex: 'name',
                                                                        key: 'name',
                                                                        align: 'center',
                                                                        render: (text) => <div className="small-text">{text}</div>
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
                                                                    style: { cursor: 'pointer' },
                                                                    onClick: () => handleModalSelect(record), // 선택 시 처리
                                                                })}
                                                            />
                                                        )}
                                                    </>
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
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                    )}
                </Grid>
            )}

            {activeTabKey === '2' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={12} sx={{ minWidth: '500px !important', maxWidth: '1500px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }}>거래처 등록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form
                                        layout="vertical"
                                        onFinish={(values) => { handleFormSubmit(values, 'register') }}
                                        form={registrationForm}
                                    >
                                        {/* 기본 정보 */}
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>기초 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item name="representativeName" rules={[{ required: true, message: '대표자 이름을 입력하세요.' }]}>
                                                    <Input addonBefore="대표자 이름" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="businessRegistrationNumber" rules={[{ required: true, message: '사업자 등록번호를 입력하세요.' }]}>
                                                    <Input addonBefore="사업자 등록번호" maxLength={12} onChange={(e) => registrationForm.setFieldValue('businessRegistrationNumber', formatBusinessRegistrationNumber(e.target.value))} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="idNumber" rules={[{ required: true, message: '주민등록번호를 입력하세요.' }]}>
                                                    <Input addonBefore="주민등록번호" maxLength={14} onChange={(e) => registrationForm.setFieldValue('idNumber', formatIdNumber(e.target.value))} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="printClientName" rules={[{ required: true, message: '거래처 인쇄명을 입력하세요.' }]}>
                                                    <Input addonBefore="거래처 인쇄명" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        {/* 주소 정보 */}
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item name={['address', 'postalCode']} rules={[{ required: true, message: '우편번호를 입력하세요.' }]}>
                                                    <Input addonBefore="우편번호" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name={['address', 'roadAddress']} rules={[{ required: true, message: '도로명 주소를 입력하세요.' }]}>
                                                    <Input addonBefore="도로명 주소" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name={['address', 'detailedAddress']} rules={[{ required: true, message: '상세 주소를 입력하세요.' }]}>
                                                    <Input addonBefore="상세 주소" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        {/* 연락처 정보 */}
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item name={['contactInfo', 'phoneNumber']} rules={[{ required: true, message: '전화번호를 입력하세요.' }]}>
                                                    <Input addonBefore="전화번호" onChange={(e) => registrationForm.setFieldValue(['contactInfo', 'phoneNumber'], formatPhoneNumber(e.target.value))} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name={['contactInfo', 'faxNumber']} rules={[{ required: true, message: '팩스번호를 입력하세요.' }]}>
                                                    <Input addonBefore="팩스번호" onChange={(e) => registrationForm.setFieldValue(['contactInfo', 'faxNumber'], formatPhoneNumber(e.target.value))} />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        {/* 사업 정보 */}
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight:600 }}>사업 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item name={['businessInfo', 'businessType']} rules={[{ required: true, message: '업태를 입력하세요.' }]}>
                                                    <Input addonBefore="업태" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name={['businessInfo', 'businessItem']} rules={[{ required: true, message: '종목을 입력하세요.' }]}>
                                                    <Input addonBefore="종목" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        {/* 금융 정보 */}
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight:600 }}>금융 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={4}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="은행명"
                                                        value={displayValues.bank}
                                                        onClick={() => handleInputClick('bank')}
                                                        onFocus={(e) => e.target.blur()}
                                                        suffix={<DownSquareOutlined />}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name={['bankAccount', 'accountNumber']} rules={[{ required: true, message: '계좌번호를 입력하세요.' }]}>
                                                    <Input addonBefore="계좌번호" placeholder="123-4567-890123" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name={['bankAccount', 'accountHolder']} rules={[{ required: true, message: '예금주를 입력하세요.' }]}>
                                                    <Input addonBefore="예금주" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name={['financialInfo', 'collateralAmount']} rules={[{ required: true, message: '담보 금액을 입력하세요.' }]}>
                                                    <Input addonBefore="담보 금액" onChange={(e) => registrationForm.setFieldValue(['financialInfo', 'collateralAmount'], formatNumberWithComma(e.target.value))} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name={['financialInfo', 'creditLimit']} rules={[{ required: true, message: '신용 한도를 입력하세요.' }]}>
                                                    <Input addonBefore="신용 한도" onChange={(e) => registrationForm.setFieldValue(['financialInfo', 'creditLimit'], formatNumberWithComma(e.target.value))} />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        {/* 담당자 정보 */}
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight:600 }}>담당자 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item name={['managerInfo', 'clientManagerPhoneNumber']} rules={[{ required: true, message: '거래처 담당자 전화번호를 입력하세요.' }]}>
                                                    <Input addonBefore="거래처 담당자 전화번호" onChange={(e) => registrationForm.setFieldValue(['managerInfo', 'clientManagerPhoneNumber'], formatPhoneNumber(e.target.value))} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item name={['managerInfo', 'clientManagerEmail']} rules={[{ required: true, message: '거래처 담당자 이메일을 입력하세요.' }]}>
                                                    <Input type="email" addonBefore="거래처 담당자 이메일" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="자사 담당자 정보"
                                                        onClick={() => handleInputClick('employee')}
                                                        value={displayValues.employee}
                                                        onFocus={(e) => e.target.blur()}
                                                        suffix={<DownSquareOutlined />}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        {/* 거래 정보 */}
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight:600 }}>추가 정보</Divider>
                                        <Row align="middle" gutter={16} style={{ marginBottom: '16px' }}>
                                            <Col>
                                                <Typography>거래시작일</Typography>
                                            </Col>
                                            <Col>
                                                <Form.Item style={{ marginBottom: 0 }} rules={[{ required: true, message: '거래 시작일을 입력하세요.' }]}>
                                                    <DatePicker
                                                        disabledDate={(current) => current && current.year() !== 2024}
                                                        value={dayjs(clientParam.transactionStartDate)}
                                                        onChange={handleStartDateChange}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Typography>거래종료일</Typography>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item style={{ marginBottom: 0 }} rules={[{ required: true, message: '거래 종료일을 입력하세요.' }]}>
                                                    <DatePicker
                                                        disabledDate={(current) => current && current.year() !== 2024}
                                                        value={dayjs(clientParam.transactionEndDate)}
                                                        onChange={handleEndDateChange}
                                                        disabled={isEndDateDisable}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Checkbox onChange={handleEndDateDisableChange}>
                                                    거래종료일 비활성화
                                                </Checkbox>
                                            </Col>
                                        </Row>

                                        {/* 카테고리 및 주류코드 정보 */}
                                        <Row gutter={16}>
                                            <Col span={5}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="주류코드"
                                                        onClick={() => handleInputClick('liquor')}
                                                        value={displayValues.liquor}
                                                        onFocus={(e) => e.target.blur()}
                                                        suffix={<DownSquareOutlined />}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="카테고리"
                                                        onClick={() => handleInputClick('category')}
                                                        value={displayValues.category}
                                                        onFocus={(e) => e.target.blur()}
                                                        suffix={<DownSquareOutlined />}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name="remarks">
                                                    <Input addonBefore="비고" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name="transactionType">
                                                    <Space.Compact>
                                                        <Input style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="거래유형" disabled />
                                                        <Select
                                                            style={{ width: '60%' }}
                                                            value={clientParam.transactionType}
                                                            onChange={(value) => {
                                                                setClientParam((prevState) => ({
                                                                    ...prevState,
                                                                    transactionType: value, // 선택된 값을 transactionType에 반영
                                                                }));
                                                            }}
                                                        >
                                                            <Option value="SALES">매출</Option>
                                                            <Option value="PURCHASE">매입</Option>
                                                            <Option value="BOTH">동시</Option>
                                                        </Select>
                                                    </Space.Compact>
                                                </Form.Item>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item name="isActive" valuePropName="checked">
                                                    <Checkbox>거래처 활성화 여부</Checkbox>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Divider />

                                        {/* 저장 버튼 */}
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                            <Button type="primary" htmlType="submit">
                                                저장
                                            </Button>
                                        </Box>
                                        {/* 모달창 */}
                                        <Modal
                                            open={isModalVisible}
                                            onCancel={handleModalCancel}
                                            width="40vw"
                                            footer={null}
                                        >{isLoading ? (
                                            <Spin />  // 로딩 스피너
                                        ) : (
                                            <>
                                                {currentField === 'bank' && (
                                                    <>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                            은행 선택
                                                        </Typography>
                                                        <Input
                                                            placeholder="검색"
                                                            prefix={<SearchOutlined />}
                                                            onChange={(e) => {
                                                                const value = e.target.value.toLowerCase(); // 입력값을 소문자로 변환
                                                                if (!value) {
                                                                    setModalData(initialModalData);
                                                                } else {
                                                                    const filtered = initialModalData.filter((item) => {
                                                                        return (
                                                                            (item.code && item.code.toLowerCase().includes(value)) ||
                                                                            (item.name && item.name.toLowerCase().includes(value)) ||
                                                                            (item.businessNumber && item.businessNumber.toLowerCase().includes(value))
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
                                                                    {
                                                                        title: <div className="title-text">코드</div>,
                                                                        dataIndex: 'code',
                                                                        key: 'code',
                                                                        align: 'center'
                                                                    },
                                                                    {
                                                                        title: <div className="title-text">은행명</div>,
                                                                        dataIndex: 'name',
                                                                        key: 'name',
                                                                        align: 'center'
                                                                    },
                                                                    {
                                                                        title: <div className="title-text">사업자번호</div>,
                                                                        dataIndex: 'businessNumber',
                                                                        key: 'businessNumber',
                                                                        align: 'center'
                                                                    },
                                                                ]}
                                                                dataSource={modalData}
                                                                rowKey="code"
                                                                size={'small'}
                                                                pagination={{
                                                                    pageSize: 15,
                                                                    position: ['bottomCenter'],
                                                                    showSizeChanger: false,
                                                                    showTotal: (total) => `총 ${total}개`,
                                                                }}
                                                                onRow={(record) => ({
                                                                    style: { cursor: 'pointer' },
                                                                    onClick: () => handleModalSelect(record), // 선택 시 처리
                                                                })}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                                {currentField === 'employee' && (
                                                    <>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                            자사 담당자 선택
                                                        </Typography>
                                                        <Input
                                                            placeholder="검색"
                                                            prefix={<SearchOutlined />}
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
                                                            style={{ marginBottom: 16 }}
                                                        />
                                                        {modalData && (
                                                            <Table
                                                                columns={[
                                                                    {
                                                                        title: <div className="title-text">사원번호</div>,
                                                                        dataIndex: 'employeeNumber',
                                                                        key: 'employeeNumber',
                                                                        align: 'center'
                                                                    },
                                                                    {
                                                                        title: <div className="title-text">이름</div>,
                                                                        key: 'name',
                                                                        align: 'center',
                                                                        render: (text, record) => `${record.lastName}${record.firstName}`, // firstName과 lastName을 합쳐서 출력
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
                                                                    style: { cursor: 'pointer' },
                                                                    onClick: () => handleModalSelect(record), // 선택 시 처리
                                                                })}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                                {currentField === 'liquor' && (
                                                    <>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                            주류코드 선택
                                                        </Typography>
                                                        <Input
                                                            placeholder="검색"
                                                            prefix={<SearchOutlined />}
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
                                                            style={{ marginBottom: 16 }}
                                                        />
                                                        {modalData && (
                                                            <Table
                                                                columns={[
                                                                    {
                                                                        title: <div className="title-text">코드</div>,
                                                                        dataIndex: 'code',
                                                                        key: 'code',
                                                                        align: 'center',
                                                                        render: (text) => <div className="small-text">{text}</div>,
                                                                    },
                                                                    {
                                                                        title: <div className="title-text">이름</div>,
                                                                        dataIndex: 'name',
                                                                        key: 'name',
                                                                        align: 'center',
                                                                        render: (text) => <div className="small-text">{text}</div>,
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
                                                                    style: { cursor: 'pointer' },
                                                                    onClick: () => handleModalSelect(record), // 선택 시 처리
                                                                })}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                                {currentField === 'category' && (
                                                    <>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                            카테고리 선택
                                                        </Typography>
                                                        <Input
                                                            placeholder="검색"
                                                            prefix={<SearchOutlined />}
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
                                                            style={{ marginBottom: 16 }}
                                                        />
                                                        {modalData && (
                                                            <Table
                                                                columns={[
                                                                    { title: '코드', dataIndex: 'code', key: 'code', align: 'center' },
                                                                    { title: '이름', dataIndex: 'name', key: 'name', align: 'center' },
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
                                                                    style: { cursor: 'pointer' },
                                                                    onClick: () => handleModalSelect(record), // 선택 시 처리
                                                                })}
                                                            />
                                                        )}
                                                    </>
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
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

        </Box>
    );
};

export default ClientRegistrationPage;