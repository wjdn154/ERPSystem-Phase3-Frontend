import React, {useMemo, useEffect, useState} from 'react';

import {Box, Grid, Grow, Paper, Typography} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './PurchaseUtil.jsx';
import {Space, Tag, Form, Table, Button, Col, Input, Row, Checkbox, Modal, DatePicker, Spin, Select, InputNumber, notification, Upload, Divider, Tooltip} from 'antd';
import dayjs from 'dayjs';
import {DownSquareOutlined, SearchOutlined, PlusOutlined, CheckOutlined} from "@ant-design/icons";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {EMPLOYEE_API, FINANCIAL_API, LOGISTICS_API} from "../../../../config/apiConstants.jsx";
import apiClient from "../../../../config/apiClient.jsx";
const { confirm } = Modal;

const { RangePicker } = DatePicker;


const PurchasePage = ({initialData}) => {
    const [activeTabKey, setActiveTabKey] = useState('1');
    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [purchaseList, setPurchaseList] = useState(initialData)
    const [displayValues, setDisplayValues] = useState({});
    const [status, setStatus] = useState({});
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [currentField, setCurrentField] = useState('');
    const [editingRow, setEditingRow] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [purchaseParam, setPurchaseParam] = useState({
        purchaseDetails: [], });
    const [detailPurchase, setDetailPurchase] = useState(false);
    const [form] = Form.useForm();
    const [purchaseDetails, setPurchaseDetails] = useState(detailPurchase.purchaseDetails || []);
    const [editPurchase, setEditPurchase] = useState(false);
    const [selectedDetailRowKeys, setSelectedDetailRowKeys] = useState([]); // 발주 요청 상세 항목의 선택된 키
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [clientSearch, setClientSearch] = useState(
        {
            clientId: null,
            clientName: null
        }
    );
    const [vat, setVat] = useState({});


    useEffect(() => {
        setSearchData(purchaseList);
    }, [purchaseList]);


    useEffect(() => {

        if(!detailPurchase) return;

        form.setFieldsValue(detailPurchase);
        form.setFieldsValue({
            purchaseDetails: purchaseDetails,
        })

        setPurchaseParam((prevParam) => ({
            ...prevParam,
            ...detailPurchase,
        }));


        setDisplayValues({
            managerName: detailPurchase.managerCode ? `[${detailPurchase.managerCode}] ${detailPurchase.managerName}` : null,
            warehouseName:  detailPurchase.warehouseCode ? `[${detailPurchase.warehouseCode}] ${detailPurchase.warehouseName}` : null,
            client: detailPurchase.clientId ?`[${detailPurchase.clientId}] ${detailPurchase.clientName}` : null,
            clientSearch: clientSearch.clientId ?`[${clientSearch.clientCode}] ${clientSearch.clientName}` : null,
            vatType: detailPurchase.vatCode ? `[${detailPurchase.vatCode}] ${detailPurchase.vatName}` : null

        }, [detailPurchase, form, purchaseDetails]);

    }, [detailPurchase], form);

    const [searchParams, setSearchParams] = useState({
        startDate: null,
        endDate: null,
        clientId: null,
        state: null,
    });

    const [searchData, setSearchData] = useState(null);


    const handleTabChange = (key) => {

        setActiveTabKey(key);
        setEditPurchase(false);
        setEditingRow(null);
        setPurchaseParam({
            purchaseDetails: [],
            date: dayjs().format('YYYY-MM-DD'),
        });
        setSearchParams({
            startDate: null,
            endDate: null,
            clientId: null,
            state: null,
        })
        setDetailPurchase(purchaseParam.purchaseDetails || [])
        setSelectedRowKeys(null)
        form.resetFields();
        registrationForm.resetFields();
        registrationForm.setFieldValue('isActive', true);

    };

    // 날짜 선택 처리
    const handleDateChange = (dates) => {
        if (dates) {
            setSearchParams({
                ...searchParams,
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD'),
            });
        }
    };

    // 콤마 적용
    const formatNumberWithComma = (value) => {
        // value가 숫자인 경우 문자열로 변환
        const stringValue = String(value);
        return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 천 단위마다 콤마 추가
    };

    // 콤마 제거 함수
    const removeComma = (value) => {
        return value ? value.toString().replace(/,/g, '') : value;
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        setSearchParams((prevParams) => ({
            ...prevParams,
            state: value,  // 선택된 상태 값 반영
        }));
    };

    const handleSearch = async () => {
        const { startDate, endDate, clientCode, state } = searchParams;

        try {
            const response = await apiClient.post(LOGISTICS_API.PURCHASE_LIST_API, searchParams);
            const data = response.data;
            setSearchData(data);
            console.log(data)

            notify('success', '조회 성공', '구매서 조회 성공.', 'bottomRight');
        } catch (error) {
            notify('error', '조회 오류', '구매서 조회 중 오류가 발생했습니다.', 'top');
        }
    };

    // 입력 필드 클릭 시 모달 열기
    const handleInputClick = (fieldName, index) => {
        setCurrentField(fieldName);
        setEditingRow(index);
        setModalData(null); // 모달 열기 전에 데이터를 초기화
        setInitialModalData(null); // 모달 열기 전에 데이터를 초기화
        fetchModalData(fieldName);  // 모달 데이터 가져오기 호출
        setIsModalVisible(true);  // 모달창 열기
    };

    // 모달 데이터 가져오기
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;

        if((fieldName === 'client') || (fieldName === 'clientSearch')) apiPath = FINANCIAL_API.FETCH_CLIENT_LIST_API;
        if(fieldName === 'managerName') apiPath = EMPLOYEE_API.EMPLOYEE_DATA_API;
        if(fieldName === 'warehouseName') apiPath = LOGISTICS_API.WAREHOUSE_LIST_API;
        if(fieldName === 'product') apiPath = LOGISTICS_API.PRODUCT_LIST_API;
        if(fieldName === 'vatType') apiPath = FINANCIAL_API.VAT_TYPE_SEARCH_API;

        try {
            const response = await apiClient.post(apiPath);

            // 데이터가 문자열이고 JSON 배열 형식일 경우 파싱, 아니면 그대로 배열로 처리
            let data = response.data;
            console.log(data);
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

    const handleModalCancel = () => {
        if((currentField === 'client') || (currentField === 'clientSearch')){
            setSearchParams({
                clientId: null,
            })
            setDisplayValues((prevValues) => ({
                ...prevValues,
                client: null,
                clientSearch: null
            }));
        }
        setCurrentField(null);
        setIsModalVisible(false);  // 모달창 닫기
    };

    const handleModalSelect = (record) => {

        switch (currentField) {
            case 'managerName':
                setPurchaseParam((prevParams) => ({
                    ...prevParams,
                    manager: {
                        id: record.id,
                        code: record.employeeNumber,
                        name: `${record.lastName}${record.firstName}`,
                    },
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    managerName: `[${record.employeeNumber}] ${record.lastName}${record.firstName}`,
                }));
                break;

            case 'warehouseName':
                setPurchaseParam((prevParams) => ({
                    ...prevParams,
                    warehouse: {
                        id: record.id,
                        code: record.code,
                        name: record.name,
                    },
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    warehouseName: `[${record.code}] ${record.name}`,
                }));
                break;

            case 'client':
                setPurchaseParam((prevParams) => ({
                    ...prevParams,
                    client: {
                        id: record.id,
                        name: record.printClientName,
                    },
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    client: `[${record.id}] ${record.printClientName}`,
                }));
                break;

            case 'clientSearch':

                setSearchParams((prevParams) => ({
                    ...prevParams,
                    clientId: record.id,

                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    clientSearch: `[${record.id}] ${record.printClientName}`,
                }));
                break;

            case 'product':
                // 제품 선택 시 해당 제품을 상태에 반영
                const updatedDetails = [...purchaseParam.purchaseDetails];

                console.log(editingRow)

                // 해당 품목 코드와 이름을 업데이트
                updateField('productId', record.id, editingRow);
                updateField('productCode', record.code, editingRow);
                updateField('productName', record.name, editingRow);
                updateField('price', record.purchasePrice, editingRow);
                updateField('remarks', record.remarks, editingRow)
                

                const { quantity } = updatedDetails[editingRow].quantity;
                const supplyPrice = calculateSupplyPrice(quantity, (record.purchasePrice));
                console.log(supplyPrice)
                const vat = calculateVat(supplyPrice);

                updatedDetails[editingRow].supplyPrice = supplyPrice;
                updatedDetails[editingRow].vat = vat;

                setPurchaseParam((prevParams) => ({
                    ...prevParams,
                    purchaseDetails: updatedDetails,
                }));
                setEditingRow(null);
                break;

            case 'vatType':
                setPurchaseParam((prevParams) => ({
                    ...prevParams,
                    vatType: {
                        code: record.vatTypeCode,
                        name: record.vatTypeName,
                    },
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    vatType: `[${record.vatTypeCode}] ${record.vatTypeName}`,
                }));
                break;
        }

        // 모달창 닫기
        setIsModalVisible(false);
    };

    // 입력 일자 변경 핸들러
    const handleRegiDateChange = (date) => {
        setPurchaseParam((prevState) => ({
            ...prevState,
            date: date ? dayjs(date).format('YYYY-MM-DD') : null,
        }));
    };

    // 필드 값 변경 시 호출되는 함수
    const handleFieldChange = (value, index, field) => {
        const updatedDetails = [...purchaseParam.purchaseDetails];

        setEditingRow(index);

        updatedDetails[index][field] = value;

        if (field === 'quantity') {
            const quantity = value;

            const price = updatedDetails[index].price;

            updatedDetails[index].supplyPrice = quantity * price; // 공급가액 = 수량 * 단가

            setTimeout(() => updateSupplyAndVat(quantity, price, index), 500);

        }


        setPurchaseDetails(updatedDetails); // 상태 업데이트
        setPurchaseParam( {
            ...purchaseParam,
            purchaseDetails: updatedDetails, // 최종 상태에 수정된 배열 반영
        });
        setEditingRow(null);
    };

    const calculateSupplyPrice = (quantity, price) => {
        return quantity * price;
    };

    const handleRowSelectionChange = (selectedRowKeys) => {
        setSelectedDetailRowKeys(selectedRowKeys);  // 선택된 행의 키 상태 업데이트
        console.log('선택된 행 키:', selectedRowKeys);  // 선택된 키 출력

    };

    const handleAddRow = () => {
        const newRow = {
            productCode: '',
            productName: '',
            quantity: 0,
            price: 0,
            supplyPrice: 0,
            vat: 0,
            remarks: '',
        };

        // 기존 항목에 새로운 항목 추가
        setPurchaseParam((prev) => ({
            ...prev,
            purchaseDetails: [...prev.purchaseDetails, newRow],
        }));
    };

    const handleDeleteRow = (index) => {
        console.log(index)
        confirm({
            title: '삭제 확인',
            content: '정말로 삭제하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                try {
                    // 삭제 API 호출해서 해야함 (수정)
                    const updatedDetails = [...purchaseParam.purchaseDetails]; // 배열을 복사
                    updatedDetails.splice(index, 1); // 인덱스에 해당하는 항목 삭제

                    setPurchaseDetails(updatedDetails); // 상태 업데이트
                    setPurchaseParam((prev) => ({
                            ...prev,
                            purchaseDetails: updatedDetails, // 최종 상태에 수정된 배열 반영
                        })
                    );

                } catch (error) {
                    notify('error', '삭제 실패', '데이터 삭제 중 오류가 발생했습니다.', 'top');
                }
            },
        });
    };

    // 폼 제출 핸들러
    const handleFormSubmit = async (values, type) => {
        console.log('Form values:', values); // 폼 값 확인
        console.log('detailPurchase', detailPurchase)
        console.log('purchaseParam: ', purchaseParam)
        confirm({
            title: '저장 확인',
            content: '정말로 저장하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                try {
                    const purchaseData = {
                        clientId: purchaseParam.client ? purchaseParam.client.id : purchaseParam.clientId,
                        managerId: purchaseParam.manager ? purchaseParam.manager.id : purchaseParam.managerId,
                        warehouseId: purchaseParam.warehouse ? purchaseParam.warehouse.id : purchaseParam.warehouseId,
                        currencyId: purchaseParam.currencyId,
                        date: purchaseParam.date,
                        vatId: purchaseParam.vatType ? purchaseParam.vatType.code : purchaseParam.vatCode,
                        journalEntryCode: purchaseParam.journalEntryCode,
                        electronicTaxInvoiceStatus: purchaseParam.electronicTaxInvoiceStatus ?  purchaseParam.electronicTaxInvoiceStatus: null,
                        items: Array.isArray(purchaseParam.purchaseDetails
                        ) ? purchaseParam.purchaseDetails.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            remarks: item.remarks,
                            supplyPrice: item.supplyPrice,
                            vat: item.vat,
                        })) : [],  // items가 존재할 경우에만 map 실행, 없으면 빈 배열로 설정
                        remarks: values.remarks
                    };

                    console.log('Sending data to API:', purchaseData); // API로 전송할 데이터 확인

                    const API_PATH = type === 'update' ? LOGISTICS_API.PURCHASE_UPDATE_API(purchaseParam.id) : LOGISTICS_API.PURCHASE_CREATE_API;
                    const method = type === 'update' ? 'put' : 'post';

                    const response = await apiClient[method](API_PATH, purchaseData, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    const updatedData = response.data;

                    if (type === 'update') {
                        setPurchaseList((prevList) =>
                            prevList.map((order) => (order.id === updatedData.id ? updatedData : order))
                        );
                    } else {
                        setPurchaseList((prevList) => [...prevList, updatedData]);
                        registrationForm.resetFields();
                    }
                    handleSearch()

                    setSearchParams({
                        startDate: null,
                        endDate: null,
                        clientId: null,
                        state: null,
                    });

                    setEditPurchase(false);
                    setPurchaseParam({
                        purchaseDetails: [],
                    });
                    setDetailPurchase(purchaseParam.purchaseDetails || []);
                    setDisplayValues({});

                    type === 'update'
                        ? notify('success', '발주서 수정', '발주서 정보 수정 성공.', 'bottomRight')
                        : notify('success', '발주서 저장', '발주서 정보 저장 성공.', 'bottomRight');
                } catch (error) {
                    console.error('Error saving data:', error); // 오류 로그 출력
                    notify('error', '저장 실패', '데이터 저장 중 오류가 발생했습니다.', 'top');
                }
            },
            onCancel() {
                notification.warning({
                    message: '저장 취소',
                    description: '저장이 취소되었습니다.',
                    placement: 'bottomLeft',
                });
            },
        });
    };

    const updateField = (fieldName, value, index) => {


        const updatedDetails = [...purchaseParam.purchaseDetails];

        console.log('editingRow: ', editingRow)

        updatedDetails[index][fieldName] = value;

        console.log('updatedDetails: ', updatedDetails)

        setPurchaseParam((prevParams) => ({
            ...prevParams,
            purchaseDetails: updatedDetails,
        }));
    };

    // API를 사용해 부가세 계산
    const calculateVat = async (quantity, price, vatTypeId, index) => {
        try {

            const response = await apiClient.post(FINANCIAL_API.VAT_AMOUNT_QUANTITY_PRICE_API, {
                vatTypeId,
                quantity,
                price,
            });
            const vatAmount = response.data;

            console.log('vatAmount: ', vatAmount);

            console.log(purchaseParam)
            // quotationDetails가 배열인지 확인하고, index가 유효한지 확인


            const supplyPrice = purchaseParam.purchaseDetails[index].supplyPrice = quantity * price;
            console.log(supplyPrice)
            const vat = purchaseParam.purchaseDetails[index].vat = vatAmount;


            updateField('supplyPrice', supplyPrice, index)
            updateField('vat', vat, index)

            setPurchaseDetails(purchaseParam);

        } catch (error) {
            console.error("부가세 계산 중 오류 발생:", error);
        }
    };

    const handleQuantityChange = (value, index) => {
        setEditingRow(index)
        const updatedDetails = [...purchaseParam.purchaseDetails];
        updatedDetails[index].quantity = value;

        setPurchaseParam((prevParam) => ({
            ...prevParam,
            purchaseDetails: updatedDetails,
        }));
        setEditingRow(null);

    };

    const saveEdit = async (id, event, index) => {
        event.stopPropagation();

        console.log(id);


        const record = purchaseParam.purchaseDetails[id];
        console.log(record)

        const quantity = Number(record.quantity);
        const price = record.price;

        const vatTypeId = purchaseParam.vatType ? purchaseParam.vatType.code : purchaseParam.vatCode;

        if (quantity && price && vatTypeId) {
            await calculateVat(quantity, price, vatTypeId, id); // 필요한 데이터로 부가세 계산 API 호출
        } else {
            console.error("필수 데이터가 부족합니다: 수량, 단가, 과세 유형을 입력해주세요.");
        }

    };

    const columns = [
        {
            title: <div className="title-text">상태</div>,
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (text) => {
                let color;
                let value;
                switch (text) {
                    case 'WAITING_FOR_RECEIPT':
                        color = 'orange';
                        value = '입고 예정';
                        break;
                    case 'RECEIPT_COMPLETED':
                        color = 'green';
                        value = '입고 완료';
                        break;
                    case 'CANCELED':
                        color = 'red';
                        value = '취소';
                        break;
                    case 'INVOICED':
                        color = 'purple';
                        value = '결제중';
                        break;
                    case 'ACCOUNTED':
                        color = 'blue';
                        value = '회계 반영';
                        break;
                    default:
                        color = 'gray'; // 기본 색상
                        value = '미확인';
                }
                return <Tag style={{ marginLeft: '5px' }} color={color}>{value}</Tag>;
            },
            width: '10%',
        },
        {
            title: <div className="title-text">입력 일자-No</div>,
            dataIndex: 'date',
            key: 'date',
            align: 'center',

            render: (text, record) => (text ? dayjs(text).format('YYYY-MM-DD') + " -" + record.id : ''),
            width: '10%',
        },
        {
            title: <div className="title-text">거래처명</div>,
            dataIndex: 'clientName',
            key: 'clientName',
            align: 'center',
            width: '15%',
        },
        {
            title: <div className="title-text">품목명</div>,
            dataIndex: 'productName',
            key: 'productName',
            align: 'center',
            width: '25%',
        },
        {
            title: <div className="title-text">과세 유형</div>,
            dataIndex: 'vatName',
            key: 'vatName',
            align: 'center',
            width: '10%',
        },
        {
            title: <div className="title-text">총 수량</div>,
            dataIndex: 'totalQuantity',
            key: 'totalQuantity',
            align: 'center',
            width: '10%',
        },
        {
            title: <div className="title-text">총 가격</div>,
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            align: 'center',
            render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{formatNumberWithComma(text)}</div>,
            width: '15%',
        },
    ];



    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="구매"
                        description={(
                            <Typography>
                                구매 페이지는 <span>발주서에 따라 실제로 물품을 구매</span>하는 과정을 관리함. 이 페이지에서는 <span>구매 진행 상황</span>을 확인하고, 물품이 <span>입고될 때까지의 모든 과정을 기록</span>함. 또한, <span>지불 조건, 납기 상태</span> 등을 확인할 수 있음.
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
                            <Paper elevation={3} sx={{ height: '100%'}}>
                                <Typography variant="h6" sx={{ padding: '20px' }}>구매서 목록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form layout="vertical">
                                        <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <Col flex="0 0 300px">
                                                <Form.Item
                                                    label="조회 기간"
                                                    required
                                                    tooltip="검색할 기간의 시작일과 종료일을 선택하세요"
                                                >
                                                    <RangePicker
                                                        disabledDate={(current) => current && current.year() !== 2024}
                                                        onChange={handleDateChange}
                                                        defaultValue={[
                                                            searchParams.startDate ? dayjs(searchParams.startDate, 'YYYY-MM-DD') : null,
                                                            searchParams.endDate ? dayjs(searchParams.endDate, 'YYYY-MM-DD') : null,
                                                        ]}
                                                        format="YYYY-MM-DD"
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col flex="0 0 200px">
                                                <Form.Item
                                                    label="거래처"
                                                    required
                                                    tooltip="검색할 거래처를 선택하세요"
                                                >
                                                    <Form.Item
                                                        noStyle
                                                        rules={[{ required: true, message: '거래처를 선택하세요' }]}
                                                    >
                                                        <Input
                                                            placeholder="거래처"
                                                            value={displayValues.clientSearch}
                                                            onClick={() => handleInputClick('clientSearch')}
                                                            className="search-input"
                                                            style={{ width: '100%' }}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Form.Item>
                                            </Col>
                                            <Col flex="1">
                                                <Form.Item
                                                    label="상태"
                                                    required
                                                    tooltip="검색할 상태를 선택하세요"
                                                >
                                                    <Select
                                                        placeholder="상태"
                                                        style={{ width: '200px' }}
                                                        value={status.status}
                                                        onChange={handleStatusChange}
                                                    >
                                                        <Select.Option value="WAITING_FOR_RECEIPT">입고 예정</Select.Option>
                                                        <Select.Option value="RECEIPT_COMPLETED">입고 완료</Select.Option>
                                                        <Select.Option value="INVOICED">결제중</Select.Option>
                                                        <Select.Option value="ACCOUNTED">회계 반영 완료</Select.Option>
                                                        <Select.Option value="CANCELED">취소</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col >
                                                <Form.Item>
                                                    <Button style={{ width: '100px' }} type="primary" onClick={handleSearch} icon={<SearchOutlined />} block>
                                                        검색
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>

                                    <Table
                                        dataSource={searchData } // 발주서 리스트 데이터
                                        columns={columns} // 테이블 컬럼 정의
                                        rowKey={(record) => record.id}
                                        pagination={{ pageSize: 10, position: ['bottomCenter'], showSizeChanger: false }}
                                        size="small"
                                        rowSelection={{
                                            type: 'radio',
                                            selectedRowKeys,
                                            onChange: (newSelectedRowKeys) => {
                                                setSelectedRowKeys(newSelectedRowKeys);
                                            }
                                        }}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: async () => {
                                                setSelectedRowKeys([record.id]); // 클릭한 행의 키로 상태 업데이트
                                                const id = record.id;
                                                try {
                                                    const response = await apiClient.post(LOGISTICS_API.PURCHASE_DETAIL_API(id));
                                                    setDetailPurchase(response.data);
                                                    console.log('detailPurchase: ', response.data)
                                                    setPurchaseDetails(detailPurchase)
                                                    setEditPurchase(true);

                                                    notify('success', '구매 조회', '구매 정보 조회 성공.', 'bottomRight')
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
                    {editPurchase && (
                        <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{ height: '100%' }}>
                                    <Typography variant="h6" sx={{ padding: '20px' }}>구매 상세정보 및 수정</Typography>
                                    <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                        <Form
                                            initialValues={detailPurchase}
                                            form={form}
                                            onFinish={(values) => { handleFormSubmit(values, 'update') }}
                                        >
                                            {/* 구매 정보 */}
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>구매서 정보</Divider>
                                            <Row align="middle" gutter={16} style={{ marginBottom: '16px' }}>
                                                <Col>
                                                    <Typography>입력 일자</Typography>
                                                </Col>
                                                <Col>
                                                    <Form.Item style={{ marginBottom: 0 }} rules={[{ required: true, message: '등록 일자를 입력하세요.' }]}>
                                                        <DatePicker
                                                            disabledDate={(current) => current && current.year() !== 2024}
                                                            value={dayjs(purchaseParam.date)}
                                                            onChange={handleRegiDateChange}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Row gutter={16} style={{ marginBottom: '16px' }}>
                                                <Col span={6}>
                                                    <Form.Item style={{ marginBottom: 0 }} >
                                                        <Input
                                                            addonBefore="담당자"
                                                            value={displayValues.managerName}
                                                            onClick={() => handleInputClick('managerName')}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={8}>
                                                    <Form.Item style={{ marginBottom: 0 }} >
                                                        <Input
                                                            addonBefore="입고창고"
                                                            value={displayValues.warehouseName}
                                                            onClick={() => handleInputClick('warehouseName')}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item style={{ marginBottom: 0 }} >
                                                        <Input
                                                            addonBefore="거래처"
                                                            value={displayValues.client}
                                                            onClick={() => handleInputClick('client')}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Row gutter={16} >
                                                <Col span={6}>
                                                    <Form.Item style={{ marginBottom: 0 }} >
                                                        <Input
                                                            addonBefore="과세 유형"
                                                            value={displayValues.vatType}
                                                            onClick={() => handleInputClick('vatType')}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={6}>
                                                <Form.Item name="journalEntry">
                                                    <Space.Compact>
                                                        <Input style={{ width: '60%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="분개유형" disabled />
                                                        <Select
                                                            style={{ width: '70%' }}
                                                            value={purchaseParam.journalEntryCode}
                                                            onChange={(value) => {
                                                                setPurchaseParam((prevState) => ({
                                                                    ...prevState,
                                                                    journalEntryCode: value,
                                                                }));
                                                            }}
                                                        >
                                                            <Select.Option value="1">현금</Select.Option>
                                                            <Select.Option value="2">외상</Select.Option>
                                                            <Select.Option value="3">카드</Select.Option>

                                                        </Select>
                                                        </Space.Compact>
                                                    </Form.Item>
                                                </Col>

                                                <Col span={6}>
                                                    <Form.Item name="electronicTaxInvoiceStatus">
                                                        <Checkbox
                                                            onChange={(e) => {
                                                                setPurchaseParam((prevState) => ({
                                                                    ...prevState,
                                                                    electronicTaxInvoiceStatus: e.target.checked ? "PUBLISHED" : "UNPUBLISHED",
                                                                }));
                                                            }}
                                                        >
                                                            세금계산서 발행 여부
                                                        </Checkbox>
                                                    </Form.Item>
                                                </Col>

                                            </Row>

                                            <Row gutter={16}>

                                                <Col span={6}>
                                                    <Form.Item name="currency">
                                                        <Space.Compact>
                                                            <Input style={{ width: '60%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="통화 종류" disabled />
                                                            <Select
                                                                style={{ width: '70%' }}
                                                                value={purchaseParam.currency}
                                                                onChange={(value) => {
                                                                    const currencyIdMapping = {
                                                                        KRW: 6,
                                                                        USD: 1,
                                                                        EUR: 2,
                                                                        JPY: 3,
                                                                        CNY: 4,
                                                                        GBP: 5,
                                                                    };

                                                                    setPurchaseParam((prevState) => ({
                                                                        ...prevState,
                                                                        currency: value,
                                                                        currencyId: currencyIdMapping[value],
                                                                    }));
                                                                }}
                                                            >
                                                                <Select.Option value="KRW">한국 [원]</Select.Option>
                                                                <Select.Option value="USD">미국 [달러]</Select.Option>
                                                                <Select.Option value="EUR">유럽 [유로]</Select.Option>
                                                                <Select.Option value="JPY">일본 [엔]</Select.Option>
                                                                <Select.Option value="CNY">중국 [위안]</Select.Option>
                                                                <Select.Option value="GBP">영국 [파운드]</Select.Option>
                                                            </Select>
                                                        </Space.Compact>
                                                    </Form.Item>
                                                </Col>


                                                {(purchaseParam.currency !== '한국 [원]' && purchaseParam.currency !== 'KRW') && (
                                                    <Col span={6}>
                                                        <Form.Item  style={{ marginBottom: 0 }} >
                                                            <Input
                                                                addonBefore="환율"
                                                                value={purchaseParam.exchangeRate}
                                                                onClick={() => handleInputClick('exchangeRate')}
                                                                onFocus={(e) => e.target.blur()}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                )}


                                                <Col span={12}>
                                                    <Form.Item name="remarks">
                                                        <Input addonBefore="비고" />
                                                    </Form.Item>
                                                </Col>

                                            </Row>

                                            {/* 구매 상세 항목 */}
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>구매 상세 항목</Divider>
                                            <Table
                                                dataSource={purchaseParam?.purchaseDetails || []}
                                                columns={[
                                                    {
                                                        title: '품목',
                                                        key: 'product',
                                                        align: 'center',
                                                        render: (text, record, index) => {
                                                            const productCode = record?.productCode || ''; // 품목 코드
                                                            const productName = record?.productName || ''; // 품목명
                                                            return (
                                                                <Input
                                                                    value={`[${productCode}] ${productName}`} // 두 필드를 결합한 형태
                                                                    onClick={() => handleInputClick('product', index)} // 클릭 시 동작
                                                                    onFocus={(e) => e.target.blur()} // 포커스 제거
                                                                    className="small-text"
                                                                    suffix={<DownSquareOutlined />}
                                                                />
                                                            );
                                                        },
                                                        width: '20%'
                                                    },
                                                    {
                                                        title: '수량',
                                                        dataIndex: 'quantity',
                                                        key: 'quantity',
                                                        align: 'center',
                                                        render: (text, record, index) => (
                                                            <div style={{ display: 'flex', alignItems: 'center', padding: '4px', position: 'relative' }}>
                                                                <Input
                                                                    value={record.quantity}
                                                                    onChange={(e) => handleQuantityChange(e.target.value, index)}
                                                                    className="small-text"
                                                                    style={{ flex: 1 }}
                                                                />
                                                                <Tooltip title="저장">
                                                                    <CheckOutlined
                                                                        style={{ cursor: 'pointer', color: 'blue', position: 'absolute', right: '10px' }}
                                                                        onClick={(event) => saveEdit(index, event)} // 수정 내용 저장
                                                                    />
                                                                </Tooltip>
                                                            </div>
                                                        ),
                                                        width: '10%',
                                                    },
                                                    {
                                                        title: '단가',
                                                        dataIndex: 'price',
                                                        key: 'price',
                                                        align: 'center',
                                                        render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{formatNumberWithComma(text)}</div>,

                                                    },
                                                    {
                                                        title: '공급가액',
                                                        dataIndex: 'supplyPrice',
                                                        key: 'supplyPrice',
                                                        align: 'center',
                                                        render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{formatNumberWithComma(text)}</div>,

                                                    },
                                                    {
                                                        title: '부가세',
                                                        dataIndex: 'vat',
                                                        key: 'vat',
                                                        align: 'center',
                                                        render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{formatNumberWithComma(text)}</div>,

                                                    },
                                                    {
                                                        title: '비고',
                                                        dataIndex: 'remarks',
                                                        key: 'remarks',
                                                        align: 'center',
                                                        render: (text, record, index) => (
                                                            <Input
                                                                value={text}
                                                                onChange={(e) => handleFieldChange(e.target.value, index, 'remarks')}
                                                                className="small-text"
                                                            />
                                                        ),

                                                    },
                                                ]}
                                                rowKey={(record, index) => index}
                                                pagination={false}
                                                rowSelection={{
                                                    type: 'radio', // 행을 선택할 때 체크박스 사용

                                                    onChange: handleRowSelectionChange,
                                                }}
                                                onRow={(record) => ({
                                                    // onClick: () => setEditingRow(record.id),  // 행 클릭 시 해당 행의 id를 상태로 저장
                                                })}

                                            />

                                            <Divider style={{ marginBottom: '10px'}} />
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                                <Button type="default" onClick={handleAddRow} style={{ marginRight: '10px' }}>
                                                    <PlusOutlined /> 항목 추가
                                                </Button>

                                                <Button type="danger" onClick={() => handleDeleteRow(selectedDetailRowKeys)} style={{ marginRight: '10px'}} >
                                                    삭제
                                                </Button>

                                                <Button type="primary" htmlType="submit">
                                                    저장
                                                </Button>
                                            </Box>
                                        </Form>


                                    </Grid>
                                </Paper>
                            </Grow>
                        </Grid>
                    )}
                </Grid>
            )}
            {/* 모달창 */}
            <Modal
                open={isModalVisible}
                onCancel={handleModalCancel}
                footer={null}
                width="40vw"
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
                                            onClick: () => handleModalSelect(record) // 선택 시 처리
                                        })}
                                    />
                                )}
                            </>
                        )}

                        {/* 거래처 검색 선택 모달 */}
                        {currentField === 'clientSearch' && (
                            <>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                    거래처 선택
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
                                            onClick: () => handleModalSelect(record) // 선택 시 처리
                                        })}
                                    />
                                )}
                            </>
                        )}

                        {/* 담당자 선택 모달 */}
                        {currentField === 'managerName' && (
                            <>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                    담당자 선택
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
                                                    (item.firstName && item.lastName &&
                                                        `${item.lastName}${item.firstName}`.toLowerCase().includes(value.toLowerCase()))
                                                );
                                            });
                                            setModalData(filtered);
                                        }
                                    }}
                                    style={{ marginBottom: 16 }}
                                />
                                {modalData &&(
                                    <>
                                        <Table
                                            columns={[
                                                {
                                                    title: <div className="title-text">코드</div>,
                                                    dataIndex: 'employeeNumber',
                                                    key: 'employeeNumber',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>
                                                },
                                                {
                                                    title: <div className="title-text">이름</div>,
                                                    key: 'name',
                                                    align: 'center',
                                                    render: (_, record) => (
                                                        <div className="small-text">{`${record.lastName}${record.firstName}`}</div>
                                                    ),
                                                },
                                            ]}
                                            dataSource={modalData}
                                            rowKey="id"
                                            size={'small'}
                                            pagination={{
                                                pageSize: 15,
                                                position: ['bottomCenter'],
                                                showSizeChanger: false,
                                                showTotal: (total) => `총 ${total}개`,  // 총 개수 표시
                                            }}
                                            onRow={(record) => ({
                                                style: { cursor: 'pointer' },
                                                onClick: () => handleModalSelect(record), // 선택 시 처리
                                            })}
                                        />
                                    </>
                                )}
                            </>
                        )}
                        {currentField === 'warehouseName' && (
                            <>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                    창고 선택
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
                                                    (item.warehouseName && item.warehouseName.toLowerCase().includes(value.toLowerCase()))
                                                );
                                            });
                                            setModalData(filtered);
                                        }
                                    }}
                                    style={{ marginBottom: 16 }}
                                />
                                {modalData &&(
                                    <>
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
                                                    render: (text) => (<div className="small-text">{text}</div>
                                                    ),
                                                },
                                            ]}
                                            dataSource={modalData}
                                            rowKey="id"
                                            size={'small'}
                                            pagination={{
                                                pageSize: 15,
                                                position: ['bottomCenter'],
                                                showSizeChanger: false,
                                                showTotal: (total) => `총 ${total}개`,  // 총 개수 표시
                                            }}
                                            onRow={(record) => ({
                                                style: { cursor: 'pointer' },
                                                onClick: () => handleModalSelect(record), // 선택 시 처리
                                            })}
                                        />
                                    </>
                                )}
                            </>
                        )}
                        {/* 과세 유형 선택 모달 */}
                        {currentField === 'vatType' && (
                            <>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                    과세 유형 선택
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
                                                    (item.code && item.code.toString().toLowerCase().includes(value)) ||
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
                                                title: '코드',
                                                dataIndex: 'vatTypeCode',
                                                key: 'vatTypeCode',
                                                align: 'center'
                                            },
                                            {
                                                title: '과세명',
                                                dataIndex: 'vatTypeName',
                                                key: 'vatTypeName',
                                                align: 'center',
                                                render: (text, record) => (
                                                    <Tooltip title={record.description}>
                                                        <span>{text}</span>
                                                    </Tooltip>
                                                )
                                            }
                                        ]}
                                        dataSource={modalData[0].salesVatTypeShowDTO}
                                        rowKey="code"
                                        size="small"
                                        pagination={{
                                            pageSize: 15,
                                            position: ['bottomCenter'],
                                            showSizeChanger: false,
                                            showTotal: (total) => `총 ${total}개`,
                                        }}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: () => handleModalSelect(record) // 선택 시 처리
                                        })}
                                    />
                                )}
                            </>
                        )}

                        {/* 품목 선택 모달 */}
                        {currentField === 'product' && (
                            <>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                    품목 선택
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
                                                    (item.name && item.name.toLowerCase().includes(value.toLowerCase()))
                                                );
                                            });
                                            setModalData(filtered);
                                        }
                                    }}
                                    style={{ marginBottom: 16 }}
                                />
                                {modalData &&(
                                    <>
                                        <Table
                                            columns={[
                                                {
                                                    title: <div className="title-text">품목 코드</div>,
                                                    dataIndex: 'code',
                                                    key: 'code',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>
                                                },
                                                {
                                                    title: <div className="title-text">품목명</div>,
                                                    dataIndex: 'name',
                                                    key: 'name',
                                                    align: 'center',
                                                    render: (text) => (<div className="small-text">{text}</div>
                                                    ),
                                                },
                                            ]}
                                            dataSource={modalData}
                                            rowKey="id"
                                            size={'small'}
                                            pagination={{
                                                pageSize: 15,
                                                position: ['bottomCenter'],
                                                showSizeChanger: false,
                                                showTotal: (total) => `총 ${total}개`,  // 총 개수 표시
                                            }}
                                            onRow={(record) => ({
                                                style: { cursor: 'pointer' },
                                                onClick: () => handleModalSelect(record), // 선택 시 처리
                                            })}
                                        />
                                    </>
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

            {activeTabKey === '2' && (
                <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                    <Grow in={true} timeout={200}>
                        <Paper elevation={3} sx={{ height: '100%' }}>
                            <Typography variant="h6" sx={{ padding: '20px' }}>구매 상세정보 및 수정</Typography>
                            <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                <Form
                                    initialValues={detailPurchase}
                                    form={registrationForm}
                                    onFinish={(values) => { handleFormSubmit(values, 'register') }}
                                >
                                    {/* 구매 정보 */}
                                    <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>구매서 정보</Divider>
                                    <Row align="middle" gutter={16} style={{ marginBottom: '16px' }}>
                                        <Col>
                                            <Typography>입력 일자</Typography>
                                        </Col>
                                        <Col>
                                            <Form.Item style={{ marginBottom: 0 }} rules={[{ required: true, message: '등록 일자를 입력하세요.' }]}>
                                                <DatePicker
                                                    disabledDate={(current) => current && current.year() !== 2024}
                                                    value={dayjs(purchaseParam.date)}
                                                    onChange={handleRegiDateChange}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16} style={{ marginBottom: '16px' }}>
                                        <Col span={6}>
                                            <Form.Item style={{ marginBottom: 0 }} >
                                                <Input
                                                    addonBefore="담당자"
                                                    value={displayValues.managerName}
                                                    onClick={() => handleInputClick('managerName')}
                                                    onFocus={(e) => e.target.blur()}
                                                    suffix={<DownSquareOutlined />}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item style={{ marginBottom: 0 }} >
                                                <Input
                                                    addonBefore="입고창고"
                                                    value={displayValues.warehouseName}
                                                    onClick={() => handleInputClick('warehouseName')}
                                                    onFocus={(e) => e.target.blur()}
                                                    suffix={<DownSquareOutlined />}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item style={{ marginBottom: 0 }} >
                                                <Input
                                                    addonBefore="거래처"
                                                    value={displayValues.client}
                                                    onClick={() => handleInputClick('client')}
                                                    onFocus={(e) => e.target.blur()}
                                                    suffix={<DownSquareOutlined />}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16} >
                                        <Col span={6}>
                                            <Form.Item style={{ marginBottom: 0 }} >
                                                <Input
                                                    addonBefore="과세 유형"
                                                    value={displayValues.vatType}
                                                    onClick={() => handleInputClick('vatType')}
                                                    onFocus={(e) => e.target.blur()}
                                                    suffix={<DownSquareOutlined />}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={6}>
                                            <Form.Item name="journalEntry">
                                                <Space.Compact>
                                                    <Input style={{ width: '60%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="분개유형" disabled />
                                                    <Select
                                                        style={{ width: '70%' }}
                                                        value={purchaseParam.journalEntryCode}
                                                        onChange={(value) => {
                                                            setPurchaseParam((prevState) => ({
                                                                ...prevState,
                                                                journalEntryCode: value,
                                                            }));
                                                        }}
                                                    >
                                                        <Select.Option value="1">현금</Select.Option>
                                                        <Select.Option value="2">외상</Select.Option>
                                                        <Select.Option value="3">카드</Select.Option>

                                                    </Select>
                                                </Space.Compact>
                                            </Form.Item>
                                        </Col>

                                        <Col span={6}>
                                            <Form.Item name="electronicTaxInvoiceStatus">
                                                <Checkbox
                                                    onChange={(e) => {
                                                        setPurchaseParam((prevState) => ({
                                                            ...prevState,
                                                            electronicTaxInvoiceStatus: e.target.checked ? "PUBLISHED" : "UNPUBLISHED",
                                                        }));
                                                    }}
                                                >
                                                    세금계산서 발행 여부
                                                </Checkbox>
                                            </Form.Item>
                                        </Col>

                                    </Row>

                                    <Row gutter={16}>

                                        <Col span={6}>
                                            <Form.Item name="currency">
                                                <Space.Compact>
                                                    <Input style={{ width: '60%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="통화 종류" disabled />
                                                    <Select
                                                        style={{ width: '70%' }}
                                                        value={purchaseParam.currency}
                                                        onChange={(value) => {
                                                            const currencyIdMapping = {
                                                                KRW: 6,
                                                                USD: 1,
                                                                EUR: 2,
                                                                JPY: 3,
                                                                CNY: 4,
                                                                GBP: 5,
                                                            };

                                                            setPurchaseParam((prevState) => ({
                                                                ...prevState,
                                                                currency: value,
                                                                currencyId: currencyIdMapping[value],
                                                            }));
                                                        }}
                                                    >
                                                        <Select.Option value="KRW">한국 [원]</Select.Option>
                                                        <Select.Option value="USD">미국 [달러]</Select.Option>
                                                        <Select.Option value="EUR">유럽 [유로]</Select.Option>
                                                        <Select.Option value="JPY">일본 [엔]</Select.Option>
                                                        <Select.Option value="CNY">중국 [위안]</Select.Option>
                                                        <Select.Option value="GBP">영국 [파운드]</Select.Option>
                                                    </Select>
                                                </Space.Compact>
                                            </Form.Item>
                                        </Col>


                                        {(purchaseParam.currency !== '한국 [원]' && purchaseParam.currency !== 'KRW') && (
                                            <Col span={6}>
                                                <Form.Item  style={{ marginBottom: 0 }} >
                                                    <Input
                                                        addonBefore="환율"
                                                        value={purchaseParam.exchangeRate}
                                                        onClick={() => handleInputClick('exchangeRate')}
                                                        onFocus={(e) => e.target.blur()}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        )}


                                        <Col span={12}>
                                            <Form.Item name="remarks">
                                                <Input addonBefore="비고" />
                                            </Form.Item>
                                        </Col>

                                    </Row>

                                    {/* 구매 상세 항목 */}
                                    <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>구매 상세 항목</Divider>
                                    <Table
                                        dataSource={purchaseParam?.purchaseDetails || []}
                                        columns={[
                                            {
                                                title: '품목',
                                                key: 'product',
                                                align: 'center',
                                                render: (text, record, index) => {
                                                    const productCode = record?.productCode || ''; // 품목 코드
                                                    const productName = record?.productName || ''; // 품목명
                                                    return (
                                                        <Input
                                                            value={`[${productCode}] ${productName}`} // 두 필드를 결합한 형태
                                                            onClick={() => handleInputClick('product', index)} // 클릭 시 동작
                                                            onFocus={(e) => e.target.blur()} // 포커스 제거
                                                            className="small-text"
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    );
                                                },
                                                width: '20%'
                                            },
                                            {
                                                title: '수량',
                                                dataIndex: 'quantity',
                                                key: 'quantity',
                                                align: 'center',
                                                render: (text, record, index) => (
                                                    <div style={{ display: 'flex', alignItems: 'center', padding: '4px', position: 'relative' }}>
                                                        <Input
                                                            value={record.quantity}
                                                            onChange={(e) => handleQuantityChange(e.target.value, index)}
                                                            className="small-text"
                                                            style={{ flex: 1 }}
                                                        />
                                                        <Tooltip title="저장">
                                                            <CheckOutlined
                                                                style={{ cursor: 'pointer', color: 'blue', position: 'absolute', right: '10px' }}
                                                                onClick={(event) => saveEdit(index, event)} // 수정 내용 저장
                                                            />
                                                        </Tooltip>
                                                    </div>
                                                ),
                                                width: '10%',
                                            },
                                            {
                                                title: '단가',
                                                dataIndex: 'price',
                                                key: 'price',
                                                align: 'center',
                                                render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{formatNumberWithComma(text)}</div>,

                                            },
                                            {
                                                title: '공급가액',
                                                dataIndex: 'supplyPrice',
                                                key: 'supplyPrice',
                                                align: 'center',
                                                render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{formatNumberWithComma(text)}</div>,

                                            },
                                            {
                                                title: '부가세',
                                                dataIndex: 'vat',
                                                key: 'vat',
                                                align: 'center',
                                                render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{formatNumberWithComma(text)}</div>,

                                            },
                                            {
                                                title: '비고',
                                                dataIndex: 'remarks',
                                                key: 'remarks',
                                                align: 'center',
                                                render: (text, record, index) => (
                                                    <Input
                                                        value={text}
                                                        onChange={(e) => handleFieldChange(e.target.value, index, 'remarks')}
                                                        className="small-text"
                                                    />
                                                ),

                                            },
                                        ]}
                                        rowKey={(record, index) => index}
                                        pagination={false}
                                        rowSelection={{
                                            type: 'radio', // 행을 선택할 때 체크박스 사용

                                            onChange: handleRowSelectionChange,
                                        }}
                                        onRow={(record) => ({
                                            // onClick: () => setEditingRow(record.id),  // 행 클릭 시 해당 행의 id를 상태로 저장
                                        })}

                                    />

                                    <Divider style={{ marginBottom: '10px'}} />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                        <Button type="default" onClick={handleAddRow} style={{ marginRight: '10px' }}>
                                            <PlusOutlined /> 항목 추가
                                        </Button>

                                        <Button type="danger" onClick={() => handleDeleteRow(selectedDetailRowKeys)} style={{ marginRight: '10px'}} >
                                            삭제
                                        </Button>

                                        <Button type="primary" htmlType="submit">
                                            저장
                                        </Button>
                                    </Box>
                                </Form>


                            </Grid>
                        </Paper>
                    </Grow>
                </Grid>
            )}
        </Box>
    );
};

export default PurchasePage;