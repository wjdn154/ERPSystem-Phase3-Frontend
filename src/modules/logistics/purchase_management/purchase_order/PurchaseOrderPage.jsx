import React, {useMemo, useEffect, useState} from 'react';
import {Box, Grid, Grow, Paper, Typography} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './PurchaseOrderUtil.jsx';
import {
    Space,
    Tag,
    Form,
    Table,
    Button,
    Col,
    Input,
    Row,
    Checkbox,
    Modal,
    DatePicker,
    Spin,
    Select,
    InputNumber,
    notification,
    Upload,
    Divider,
    Tooltip
} from 'antd';
import dayjs from 'dayjs';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import {DownSquareOutlined, SearchOutlined, PlusOutlined, CheckOutlined} from "@ant-design/icons";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {EMPLOYEE_API, FINANCIAL_API, LOGISTICS_API} from "../../../../config/apiConstants.jsx";
import apiClient from "../../../../config/apiClient.jsx";
const { confirm } = Modal;

const { RangePicker } = DatePicker;

const PurchaseOrderPage = ({initialData}) => {
    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [purchaseOrderList, setPurchaseOrderList] = useState(initialData)
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [currentField, setCurrentField] = useState('');
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [status, setStatus] = useState({});
    const [editPurchaseOrder, setEditPurchaseOrder] = useState(false);
    const [detailPurchaseOrder, setDetailPurchaseOrder] = useState(false);
    const [purchaseOrderParam, setPurchaseOrderParam] = useState({
        purchaseOrderDetails: [], });
    const [form] = Form.useForm();
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [displayValues, setDisplayValues] = useState({});
    const [purchaseOrderDetails, setPurchaseOrderDetails] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [selectedDetailRowKeys, setSelectedDetailRowKeys] = useState([]); // 발주 요청 상세 항목의 선택된 키
    const [clientSearch, setClientSearch] = useState(
        {
            clientId: null,
            clientName: null
        }
    );

    const [searchParams, setSearchParams] = useState({
        startDate: null,
        endDate: null,
        clientId: null,
        state: null,
    });

    const [searchData, setSearchData] = useState(null);

    // 필드 값 변경 시 호출되는 함수
    const handleFieldChange = (value, index, field) => {
        const updatedDetails = [...purchaseOrderParam.purchaseOrderDetails];

        setEditingRow(index);

        updatedDetails[index][field] = value;

        if (field === 'quantity') {
            const quantity = value;

            const price = updatedDetails[index].price;

            updatedDetails[index].supplyPrice = quantity * price; // 공급가액 = 수량 * 단가

            updateSupplyAndVat(quantity, price, index);



        }


        setPurchaseOrderDetails(updatedDetails); // 상태 업데이트
        setPurchaseOrderParam( {
            ...purchaseOrderParam,
            purchaseOrderDetails: updatedDetails, // 최종 상태에 수정된 배열 반영
        });
        setEditingRow(null);
    };

    const calculateSupplyPrice = (quantity, price) => {
        return quantity * price;
    };
    

    // 수량 또는 단가 변경 시 공급가액과 부가세를 자동 계산하는 함수
    const updateSupplyAndVat = (quantity, price, recordKey) => {

        const supplyPrice = calculateSupplyPrice(quantity, price);

        const vat = calculateVat(supplyPrice);

        updateField('supplyPrice', supplyPrice, recordKey);
        updateField('vat', vat, recordKey);
        console.log('vat', vat)
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

    // 입력 일자 변경 핸들러
    const handleRegiDateChange = (date) => {
        setPurchaseOrderParam((prevState) => ({
            ...prevState,
            date: date ? dayjs(date).format('YYYY-MM-DD') : null,
        }));
    };

    // 납기 일자 변경 핸들러
    const handleDeliveryDateChange = (date) => {
        setPurchaseOrderParam((prevState) => ({
            ...prevState,
            deliveryDate: date ? dayjs(date).format('YYYY-MM-DD') : null,
        }));
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

    useEffect(() => {
        setSearchData(purchaseOrderList);
    }, [purchaseOrderList]);

    useEffect(() => {

        if(!detailPurchaseOrder) return;

        form.setFieldsValue(detailPurchaseOrder);
        form.setFieldsValue({
            purchaseOrderDetails: purchaseOrderDetails,
        })
        setPurchaseOrderParam((prevParam) => ({
            ...prevParam,
            ...detailPurchaseOrder,
        }));

        setDisplayValues({
            managerName: detailPurchaseOrder.managerCode ? `[${detailPurchaseOrder.managerCode}] ${detailPurchaseOrder.managerName}` : null,
            warehouseName:  detailPurchaseOrder.warehouseCode ? `[${detailPurchaseOrder.warehouseCode}] ${detailPurchaseOrder.warehouseName}` : null,
            client: detailPurchaseOrder.clientId ?`[${detailPurchaseOrder.clientId}] ${detailPurchaseOrder.clientName}` : null,
            clientSearch: clientSearch.clientId ?`[${clientSearch.clientCode}] ${clientSearch.clientName}` : null,
            vatType: detailPurchaseOrder.vatCode ? `[${detailPurchaseOrder.vatCode}] ${detailPurchaseOrder.vatName}` : null

        });

    }, [detailPurchaseOrder], form);

    const handleStatusChange = (value) => {
        setStatus(value);
        setSearchParams((prevParams) => ({
            ...prevParams,
            state: value,  // 선택된 상태 값 반영
        }));
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

    // 모달에서 선택한 값 searchParams에 반영
    const handleModalSelect = (record) => {

        switch (currentField) {
            case 'managerName':
                setPurchaseOrderParam((prevParams) => ({
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
                setPurchaseOrderParam((prevParams) => ({
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
            case 'client':
                setPurchaseOrderParam((prevParams) => ({
                    ...prevParams,
                    client: {
                        id: record.id,
                        name: record.printClientName,
                    },
                }));
                setSearchParams((prevParams) => ({
                    ...prevParams,
                    clientId: record.id,
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    client: `[${record.id}] ${record.printClientName}`,
                }));
                break;

            case 'product':
                // 제품 선택 시 해당 제품을 상태에 반영
                const updatedDetails = [...purchaseOrderParam.purchaseOrderDetails];

                console.log(editingRow)

                // 해당 품목 코드와 이름을 업데이트
                updatedDetails[editingRow].client.clientName = record.clientName;
                updatedDetails[editingRow].client.clientId = record.clientId;
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

                setPurchaseOrderParam((prevParams) => ({
                    ...prevParams,
                    purchaseOrderDetails: updatedDetails,
                }));
                setEditingRow(null);
                break;

            case 'vatType':
                setPurchaseOrderParam((prevParams) => ({
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

    const handleSearch = async () => {
        const { startDate, endDate, clientCode, state } = searchParams;

        try {
            const response = await apiClient.post(LOGISTICS_API.PURCHASE_ORDER_LIST_API, searchParams);
            const data = response.data;
            setSearchData(data);
            console.log(data)

            notify('success', '조회 성공', '발주서 조회 성공.', 'bottomRight');
        } catch (error) {
            notify('error', '조회 오류', '발주서 조회 중 오류가 발생했습니다.', 'top');
        }
    };

    const handleRowSelectionChange = (selectedRowKeys) => {
        setSelectedDetailRowKeys(selectedRowKeys);  // 선택된 행의 키 상태 업데이트
        console.log('선택된 행 키:', selectedRowKeys);  // 선택된 키 출력

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

    const handleTabChange = (key) => {
        setActiveTabKey(key);
        setEditPurchaseOrder(false);
        setEditingRow(null);
        setPurchaseOrderParam({
            purchaseOrderDetails: [],
            date: dayjs().format('YYYY-MM-DD'),
            deliveryDate: dayjs().format('YYYY-MM-DD'),
        });
        setSearchParams({
            startDate: null,
            endDate: null,
            clientId: null,
            state: null,
        });
        setDetailPurchaseOrder(purchaseOrderParam.purchaseOrderDetails || [])
        setSelectedRowKeys(null)
        form.resetFields();
        registrationForm.resetFields();
        registrationForm.setFieldValue('isActive', true);


    };

    const handleAddRow = () => {
        const newRow = {
            productCode: '',
            productName: '',
            client: {
                clientId: '',
                clientName: '',
            },
            quantity: 0,
            price: 0,
            supplyPrice: 0,
            vat: 0,
            remarks: '',
        };

        // 기존 항목에 새로운 항목 추가
        setPurchaseOrderParam((prev) => ({
            ...prev,
            purchaseOrderDetails: [...prev.purchaseOrderDetails, newRow],
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
                    const updatedDetails = [...purchaseOrderParam.purchaseOrderDetails]; // 배열을 복사
                    updatedDetails.splice(index, 1); // 인덱스에 해당하는 항목 삭제

                    setPurchaseOrderDetails(updatedDetails); // 상태 업데이트
                    setPurchaseOrderParam((prev) => ({
                            ...prev,
                            purchaseOrderDetails: updatedDetails, // 최종 상태에 수정된 배열 반영
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
        console.log('detailPurchaseOrder', detailPurchaseOrder)
        console.log('purchaseOrderParam: ', purchaseOrderParam)
        confirm({
            title: '저장 확인',
            content: '정말로 저장하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                try {
                    const purchaseOrderData = {
                        clientId: purchaseOrderParam.client ? purchaseOrderParam.client.id : purchaseOrderParam.clientId,
                        managerId: purchaseOrderParam.manager ? purchaseOrderParam.manager.id : purchaseOrderParam.managerId,
                        warehouseId: purchaseOrderParam.warehouse ? purchaseOrderParam.warehouse.id : purchaseOrderParam.warehouseId,
                        currencyId: purchaseOrderParam.currencyId,
                        date: purchaseOrderParam.date,
                        deliveryDate: purchaseOrderParam.deliveryDate,
                        vatId: purchaseOrderParam.vatType ? Number(purchaseOrderParam.vatType.code) : Number(purchaseOrderParam.vatCode),
                        journalEntryCode: purchaseOrderParam.journalEntryCode,
                        electronicTaxInvoiceStatus: purchaseOrderParam.electronicTaxInvoiceStatus,
                        items: Array.isArray(purchaseOrderParam.purchaseOrderDetails
                        ) ? purchaseOrderParam.purchaseOrderDetails.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            remarks: item.remarks,
                        })) : [],  // items가 존재할 경우에만 map 실행, 없으면 빈 배열로 설정
                        remarks: values.remarks
                    };

                    console.log('Sending data to API:', purchaseOrderData); // API로 전송할 데이터 확인

                    const API_PATH = type === 'update' ? LOGISTICS_API.PURCHASE_ORDER_UPDATE_API(purchaseOrderParam.id) : LOGISTICS_API.PURCHASE_ORDER_CREATE_API;
                    const method = type === 'update' ? 'put' : 'post';

                    const response = await apiClient[method](API_PATH, purchaseOrderData, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    const updatedData = response.data;

                    if (type === 'update') {
                        setPurchaseOrderList((prevList) =>
                            prevList.map((order) => (order.id === updatedData.id ? updatedData : order))
                        );
                    } else {
                        setPurchaseOrderList((prevList) => [...prevList, updatedData]);
                        registrationForm.resetFields();
                    }

                    handleSearch()

                    setSearchParams({
                        startDate: null,
                        endDate: null,
                        clientId: null,
                        state: null,
                    });

                    setEditPurchaseOrder(false);
                    setPurchaseOrderParam({
                            purchaseOrderDetails: []
                        }
                    );
                    setDetailPurchaseOrder(purchaseOrderParam.purchaseOrderDetails || []);
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


        const updatedDetails = [...purchaseOrderParam.purchaseOrderDetails];

        console.log('editingRow: ', editingRow)

        updatedDetails[index][fieldName] = value;

        console.log('updatedDetails: ', updatedDetails)

        setPurchaseOrderParam((prevParams) => ({
            ...prevParams,
            purchaseOrderDetails: updatedDetails,
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

            console.log(purchaseOrderParam)
            // quotationDetails가 배열인지 확인하고, index가 유효한지 확인


            const supplyPrice = purchaseOrderParam.purchaseOrderDetails[index].supplyPrice = quantity * price;
            console.log(supplyPrice)
            const vat = purchaseOrderParam.purchaseOrderDetails[index].vat = vatAmount;


            updateField('supplyPrice', supplyPrice, index)
            updateField('vat', vat, index)

            setPurchaseOrderDetails(purchaseOrderParam);

        } catch (error) {
            console.error("부가세 계산 중 오류 발생:", error);
        }
    };

    const handleQuantityChange = (value, index) => {
        setEditingRow(index)
        const updatedDetails = [...purchaseOrderParam.purchaseOrderDetails];
        updatedDetails[index].quantity = value;

        setPurchaseOrderParam((prevParam) => ({
            ...prevParam,
            purchaseOrderDetails: updatedDetails,
        }));
        setEditingRow(null);

    };

    const saveEdit = async (id, event, index) => {
        event.stopPropagation();

        console.log(id);


        const record = purchaseOrderParam.purchaseOrderDetails[id];
        console.log(record)

        const quantity = Number(record.quantity);
        const price = record.price;

        const vatTypeId = purchaseOrderParam.vatType ? purchaseOrderParam.vatType.code : purchaseOrderParam.vatCode;

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
            render: (text, record) => {
                let color;
                let value;
                switch (text) {
                    case 'WAITING_FOR_PURCHASE':
                        color = 'orange';
                        value = '발주대기';
                        break;
                    case 'PURCHASE_COMPLETED':
                        color = 'green';
                        value = '발주완료';
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
            title: <div className="title-text">납기 일자</div>,
            dataIndex: 'deliveryDate',
            key: 'deliveryDate',
            align: 'center',
            render: (text) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
            width: '10%',
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
                        title="발주서"
                        description={(
                            <Typography>
                                발주서 페이지는 <span>구매 결정을 내린 후 공급업체에 발주를 요청하는 문서</span>를 관리함. 이 페이지에서는 <span>발주서를 생성, 수정, 삭제</span>할 수 있으며, 발주 내용에는 <span>물품명, 수량, 가격</span> 등이 포함됨. 발주서는 <span>공급업체와 계약</span>을 진행하기 위한 중요한 문서임.
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
                                <Typography variant="h6" sx={{ padding: '20px' }}>발주서 목록</Typography>
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
                                                        <Select.Option value="WAITING_FOR_PURCHASE">발주 대기</Select.Option>
                                                        <Select.Option value="PURCHASE_COMPLETED">발주 완료</Select.Option>
                                                        <Select.Option value="WAITING_FOR_RECEIPT">입고 예정</Select.Option>
                                                        <Select.Option value="RECEIPT_COMPLETED">입고 완료</Select.Option>
                                                        <Select.Option value="CANCELED">취소</Select.Option>
                                                        <Select.Option value="ACCOUNTED">회계 반영 완료</Select.Option>
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
                                        dataSource={searchData} // 발주서 리스트 데이터
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
                                                    const response = await apiClient.post(LOGISTICS_API.PURCHASE_ORDER_DETAIL_API(id));
                                                    setDetailPurchaseOrder(response.data);
                                                    console.log(response.data)
                                                    setPurchaseOrderDetails(detailPurchaseOrder.purchaseOrderDetails)
                                                    setEditPurchaseOrder(true);

                                                    notify('success', '발주서 조회', '발주서 정보 조회 성공.', 'bottomRight')
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

                    {editPurchaseOrder && (
                        <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{ height: '100%' }}>
                                    <Typography variant="h6" sx={{ padding: '20px' }}>발주서 상세정보 및 수정</Typography>
                                    <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                        <Form
                                            initialValues={detailPurchaseOrder}
                                            form={form}
                                            onFinish={(values) => { handleFormSubmit(values, 'update') }}
                                        >
                                            {/* 발주서 정보 */}
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>발주서 정보</Divider>
                                            <Row align="middle" gutter={16} style={{ marginBottom: '16px' }}>
                                                <Col>
                                                    <Typography>입력 일자</Typography>
                                                </Col>
                                                <Col>
                                                    <Form.Item style={{ marginBottom: 0 }} rules={[{ required: true, message: '입력 일자를 입력하세요.' }]}>
                                                        <DatePicker
                                                            disabledDate={(current) => current && current.year() !== 2024}
                                                            value={dayjs(purchaseOrderParam.date)}
                                                            onChange={handleRegiDateChange}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col>
                                                    <Typography>납기 일자</Typography>
                                                </Col>
                                                <Col>
                                                    <Form.Item style={{ marginBottom: 0 }} rules={[{ required: true, message: '출하예정일자를 입력하세요.' }]}>
                                                        <DatePicker
                                                            disabledDate={(current) => current && current.year() !== 2024}
                                                            value={dayjs(purchaseOrderParam.deliveryDate)}
                                                            onChange={handleDeliveryDateChange}
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
                                                                value={purchaseOrderParam.journalEntryCode}
                                                                onChange={(value) => {
                                                                    setPurchaseOrderParam((prevState) => ({
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
                                                    <Form.Item name="electronicTaxInvoiceStatus" valuePropName="checked">
                                                        <Checkbox>세금계산서 발행 여부</Checkbox>
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
                                                                value={purchaseOrderParam.currency}
                                                                onChange={(value) => {
                                                                    const currencyIdMapping = {
                                                                        KRW: 6,
                                                                        USD: 1,
                                                                        EUR: 2,
                                                                        JPY: 3,
                                                                        CNY: 4,
                                                                        GBP: 5,
                                                                    };

                                                                    setPurchaseOrderParam((prevState) => ({
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


                                                {(purchaseOrderParam.currency !== '한국 [원]' && purchaseOrderParam.currency !== 'KRW') && (
                                                    <Col span={6}>
                                                        <Form.Item  style={{ marginBottom: 0 }} >
                                                            <Input
                                                                addonBefore="환율"
                                                                value={purchaseOrderParam.exchangeRate}
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

                                            {/* 발주서 상세 항목 */}
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>발주서 상세 항목</Divider>
                                            <Table
                                                dataSource={purchaseOrderParam?.purchaseOrderDetails || []}
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
                                                        title: '거래처',
                                                        key: 'client',
                                                        align: 'center',
                                                        render: (text, record) => {
                                                            const clientId = record?.client?.clientId || ''; // 거래처 코드
                                                            const clientName = record?.client?.clientName || ''; // 거래처명
                                                            return (
                                                                <Input
                                                                    value={`[${clientId}] ${clientName}`}
                                                                    onChange={(e) => handleFieldChange(e.target.value, record.key, 'client')}
                                                                    className="small-text"
                                                                />
                                                            );
                                                        },
                                                        width: '15%'
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

            {activeTabKey === '2' && (
                <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                    <Grow in={true} timeout={200}>
                        <Paper elevation={3} sx={{ height: '100%' }}>
                            <Typography variant="h6" sx={{ padding: '20px' }}>발주서 상세정보 및 수정</Typography>
                            <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                <Form
                                    initialValues={detailPurchaseOrder}
                                    form={registrationForm}
                                    onFinish={(values) => { handleFormSubmit(values, 'register') }}
                                >
                                    {/* 발주서 정보 */}
                                    <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>구매서 정보</Divider>
                                    <Row align="middle" gutter={16} style={{ marginBottom: '16px' }}>
                                        <Col>
                                            <Typography>입력 일자</Typography>
                                        </Col>
                                        <Col>
                                            <Form.Item style={{ marginBottom: 0 }} rules={[{ required: true, message: '입력 일자를 입력하세요.' }]}>
                                                <DatePicker
                                                    disabledDate={(current) => current && current.year() !== 2024}
                                                    value={dayjs(purchaseOrderParam.date)}
                                                    onChange={handleRegiDateChange}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col>
                                            <Typography>납기 일자</Typography>
                                        </Col>
                                        <Col>
                                            <Form.Item style={{ marginBottom: 0 }} rules={[{ required: true, message: '출하예정일자를 입력하세요.' }]}>
                                                <DatePicker
                                                    disabledDate={(current) => current && current.year() !== 2024}
                                                    value={dayjs(purchaseOrderParam.deliveryDate)}
                                                    onChange={handleDeliveryDateChange}
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
                                                        value={purchaseOrderParam.journalEntryCode}
                                                        onChange={(value) => {
                                                            setPurchaseOrderParam((prevState) => ({
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
                                            <Form.Item name="electronicTaxInvoiceStatus" valuePropName="checked">
                                                <Checkbox>세금계산서 발행 여부</Checkbox>
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
                                                        value={purchaseOrderParam.currency}
                                                        onChange={(value) => {
                                                            const currencyIdMapping = {
                                                                KRW: 6,
                                                                USD: 1,
                                                                EUR: 2,
                                                                JPY: 3,
                                                                CNY: 4,
                                                                GBP: 5,
                                                            };

                                                            setPurchaseOrderParam((prevState) => ({
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


                                        {(purchaseOrderParam.currency !== '한국 [원]' && purchaseOrderParam.currency !== 'KRW') && (
                                            <Col span={6}>
                                                <Form.Item  style={{ marginBottom: 0 }} >
                                                    <Input
                                                        addonBefore="환율"
                                                        value={purchaseOrderParam.exchangeRate}
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

                                    {/* 발주서 상세 항목 */}
                                    <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>발주서 상세 항목</Divider>
                                    <Table
                                        dataSource={purchaseOrderParam?.purchaseOrderDetails || []}
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
                                                title: '거래처',
                                                key: 'client',
                                                align: 'center',
                                                render: (text, record) => {
                                                    const clientId = record?.client?.clientId || ''; // 거래처 코드
                                                    const clientName = record?.client?.clientName || ''; // 거래처명
                                                    return (
                                                        <Input
                                                            value={`[${clientId}] ${clientName}`}
                                                            onChange={(e) => handleFieldChange(e.target.value, record.key, 'client')}
                                                            className="small-text"
                                                        />
                                                    );
                                                },
                                                width: '15%'
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
                        {/* 과세 유형 선택 모달 */}
                        {currentField === 'vatType' && (
                        <>ㄴ
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

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={handleModalCancel} variant="contained" type="danger" sx={{ mr: 1 }}>
                                닫기
                            </Button>
                        </Box>
                    </>
                )}
            </Modal>
        </Box>
    );
};

export default PurchaseOrderPage;