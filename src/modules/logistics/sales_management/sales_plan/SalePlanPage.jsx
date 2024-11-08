import React, {useMemo, useEffect, useState} from 'react';
import {Box, Grid, Grow, Paper, Typography} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './SalePlanUtil.jsx';
import {Space, Tag, Form, Table, Button, Col, Input, Row, Checkbox, Modal, DatePicker, Spin, Select, InputNumber, notification, Upload, Divider, Tooltip} from 'antd';
import dayjs from 'dayjs';
import {DownSquareOutlined, SearchOutlined, PlusOutlined} from "@ant-design/icons";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {EMPLOYEE_API, FINANCIAL_API, LOGISTICS_API} from "../../../../config/apiConstants.jsx";
import apiClient from "../../../../config/apiClient.jsx";
const { confirm } = Modal;

const { RangePicker } = DatePicker;

const SalePlanPage = ({initialData}) => {
    const [activeTabKey, setActiveTabKey] = useState('1');
    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [salePlanList, setSalePlanList] = useState(initialData)
    const [displayValues, setDisplayValues] = useState({});
    const [status, setStatus] = useState({});
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [currentField, setCurrentField] = useState('');
    const [editingRow, setEditingRow] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [detailSalePlan, setDetailSalePlan] = useState(false);
    const [salePlanDetails, setSalePlanDetails] = useState(detailSalePlan?.salePlanDetails || []);
    const [salePlanParam, setSalePlanParam] = useState({
        salePlanDetails: [],
    });
    const [form] = Form.useForm();
    const [editSalePlan, setEditSalePlan] = useState(false);
    const [selectedDetailRowKeys, setSelectedDetailRowKeys] = useState([]); // 발주 요청 상세 항목의 선택된 키
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [clientSearch, setClientSearch] = useState(
        {
            clientId: null,
            clientName: null
        }
    );

    useEffect(() => {
        setSearchData(salePlanList);
    }, [salePlanList]);

    useEffect(() => {

        if(!detailSalePlan) return;


        form.setFieldsValue(detailSalePlan);
        form.setFieldsValue({
            salePlanDetails: salePlanDetails,
        })

        setSalePlanParam((prevParam) => ({
            ...prevParam,
            ...detailSalePlan,
        }));

        console.log('SalePlanParam', salePlanParam)

        setDisplayValues({
            managerName: detailSalePlan.managerCode ? `[${detailSalePlan.managerCode}] ${detailSalePlan.managerName}` : null,
            warehouseName:  detailSalePlan.warehouseCode ? `[${detailSalePlan.warehouseCode}] ${detailSalePlan.warehouseName}` : null,
            client: detailSalePlan.clientId ?`[${detailSalePlan.clientId}] ${detailSalePlan.clientName}` : null,
            clientSearch: clientSearch.clientId ?`[${clientSearch.clientCode}] ${clientSearch.clientName}` : null,

        });

    }, [detailSalePlan], form);

    const [searchParams, setSearchParams] = useState({
        startDate: null,
        endDate: null,
        clientId: null,
        state: null,
    });

    const [searchData, setSearchData] = useState(null);


    const handleTabChange = (key) => {

        setActiveTabKey(key);
        setEditSalePlan(false);
        setEditingRow(null);
        setSalePlanParam({
            salePlanDetails: [],
            date: dayjs().format('YYYY-MM-DD'),
            expectedSalesDate: dayjs().format('YYYY-MM-DD'),
        });
        setSearchParams({
            startDate: null,
            endDate: null,
            clientId: null,
            state: null,
        })
        setDetailSalePlan(salePlanParam.salePlanDetails || [])
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
        return stringValue.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ','); // 천 단위마다 콤마 추가
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
        const { startDate, endDate, clientId, state } = searchParams;

        try {
            const response = await apiClient.post(LOGISTICS_API.SALE_PLAN_LIST_API, searchParams);
            const data = response.data;
            setSearchData(data);
            console.log(data)

            notify('success', '조회 성공', '판매계획 조회 성공.', 'bottomRight');
            return response.data;
        } catch (error) {
            notify('error', '조회 오류', '판매계획 조회 중 오류가 발생했습니다.', 'top');
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
                setSalePlanParam((prevParams) => ({
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
                setSalePlanParam((prevParams) => ({
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
                setSalePlanParam((prevParams) => ({
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
                const updatedDetails = [...salePlanParam.salePlanDetails];

                console.log(editingRow)

                // 해당 품목 코드와 이름을 업데이트
                updateField('productId', record.id, editingRow);
                updateField('productCode', record.code, editingRow);
                updateField('productName', record.name, editingRow);
                updateField('price', record.salesPrice, editingRow);

                const { quantity } = updatedDetails[editingRow].quantity;
                const expectedSales = calculateExpectedSales(quantity, (record.salesPrice));



                setSalePlanParam((prevParams) => ({
                    ...prevParams,
                    salePlanDetails: updatedDetails,
                }));
                console.log('salePlanParam:', salePlanParam)
                setEditingRow(null);
                break;
        }

        // 모달창 닫기
        setIsModalVisible(false);
    };

    const handleRegiDateChange = (date) => {
        setSalePlanParam((prevState) => ({
            ...prevState,
            date: date ? dayjs(date).format('YYYY-MM-DD') : null,
        }));
        console.log(salePlanParam.date)
    };

    const handleExpectedDateChange = (date) => {
        setSalePlanParam((prevState) => ({
            ...prevState,
            expectedSalesDate: date ? dayjs(date).format('YYYY-MM-DD') : null,
        }));
        console.log(salePlanParam.date)
    };

    // 필드 값 변경 시 호출되는 함수
    const handleFieldChange = (value, index, field) => {
        const updatedDetails = [...salePlanParam.salePlanDetails];

        setEditingRow(index);

        updatedDetails[index][field] = value;

        if (field === 'quantity') {
            const quantity = value;
            const price = removeComma(updatedDetails[index].price);
            updatedDetails[index].expectedSales = quantity * price; // 공급가액 = 수량 * 단가
        }
        if (field === 'price') {
            const quantity = updatedDetails[index].quantity;
            const price = removeComma(value);
            updatedDetails[index].expectedSales = quantity * price; // 공급가액 = 수량 * 단가
        }


        setSalePlanDetails(updatedDetails); // 상태 업데이트
        setSalePlanParam( {
            ...salePlanParam,
            salePlanDetails: updatedDetails, // 최종 상태에 수정된 배열 반영
        });
        setEditingRow(null);
    };

    const calculateExpectedSales = (quantity, price) => {
        return quantity * price;
    };

    const updateField = (fieldName, value) => {
        const updatedDetails = [...salePlanParam.salePlanDetails];

        console.log('editingRow: ', editingRow)

        updatedDetails[editingRow][fieldName] = value;

        console.log('updatedDetails: ', updatedDetails)

        // 수량이나 단가가 변경되면 공급가액을 재계산
        if (fieldName === 'quantity' || fieldName === 'price') {
            const { quantity, price } = updatedDetails[editingRow];
            const expectedSales = calculateExpectedSales(quantity, price);

            updatedDetails[editingRow].expectedSales = expectedSales;
        }

        setSalePlanParam((prevParams) => ({
            ...prevParams,
            salePlanDetails: updatedDetails,
        }));
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
        setSalePlanParam((prev) => ({
            ...prev,
            salePlanDetails: [...prev.salePlanDetails, newRow],
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
                    const updatedDetails = [...salePlanParam.salePlanDetails]; // 배열을 복사
                    updatedDetails.splice(index, 1); // 인덱스에 해당하는 항목 삭제

                    setSalePlanDetails(updatedDetails); // 상태 업데이트
                    setSalePlanParam((prev) => ({
                            ...prev,
                            salePlanDetails: updatedDetails, // 최종 상태에 수정된 배열 반영
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
        console.log('detailSalePlan', detailSalePlan)
        console.log('salePlanParam: ', salePlanParam)
        confirm({
            title: '저장 확인',
            content: '정말로 저장하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                console.log(salePlanParam.salePlanDetails)
                try {
                    const salePlanData = {
                        clientId: salePlanParam.client ? salePlanParam.client.id : salePlanParam.clientId,
                        managerId: salePlanParam.manager ? salePlanParam.manager.id : salePlanParam.managerId,
                        warehouseId: salePlanParam.warehouse ? salePlanParam.warehouse.id : salePlanParam.warehouseId,
                        date: dayjs(salePlanParam.date).format('YYYY-MM-DD'),
                        expectedSalesDate: salePlanParam.expectedSalesDate,
                        items: Array.isArray(salePlanParam.salePlanDetails
                        ) ? salePlanParam.salePlanDetails.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity ? item.quantity : 0,
                            expectedSales: Number(item.expectedSales),
                            remarks: item.remarks,
                        })) : [],  // items가 존재할 경우에만 map 실행, 없으면 빈 배열로 설정
                        remarks: values.remarks
                    };

                    console.log('Sending data to API:', salePlanData); // API로 전송할 데이터 확인

                    const API_PATH = type === 'update' ? LOGISTICS_API.SALE_PLAN_UPDATE_API(salePlanParam.id) : LOGISTICS_API.SALE_PLAN_CREATE_API;
                    const method = type === 'update' ? 'put' : 'post';

                    const response = await apiClient[method](API_PATH, salePlanData, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    const updatedData = response.data;

                    console.log('updateData: ', updatedData)

                    if (type === 'update') {
                        setSalePlanList((prevList) =>
                            prevList.map((order) => (order.id === updatedData.id ? updatedData : order))
                        );
                    } else {
                        setSalePlanList((prevList) => [...prevList, updatedData]);
                        registrationForm.resetFields();
                        console.log("일로옴??")
                        console.log('salePlanList: ', salePlanList)
                    }

                    console.log('searchParams:', searchParams)
                    handleSearch()

                    setSearchParams({
                        startDate: null,
                        endDate: null,
                        clientId: null,
                        state: null,
                    });

                    setEditSalePlan(false);
                    setSalePlanParam({
                        salePlanDetails: [],
                    });
                    setDetailSalePlan(salePlanParam.salePlanDetails || []);
                    setDisplayValues({});

                    type === 'update'
                        ? notify('success', '판매계획 수정', '판매계획 정보 수정 성공.', 'bottomRight')
                        : notify('success', '판매계획 저장', '판매계획 정보 저장 성공.', 'bottomRight');
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

    const columns = [
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
            width: '20%',
        },
        {
            title: <div className="title-text">담당자명</div>,
            dataIndex: 'managerName',
            key: 'managerName',
            align: 'center',
            width: '10%',
        },

        {
            title: <div className="title-text">품목명</div>,
            dataIndex: 'productName',
            key: 'productName',
            align: 'center',
            width: '25%',
        },
        {
            title: <div className="title-text">예상매출일자</div>,
            dataIndex: 'expectedSaleDate',
            key: 'expectedSaleDate',
            align: 'center',
            render: (text) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
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
            title: <div className="title-text">총 예상매출액</div>,
            dataIndex: 'totalExpectedSales',
            key: 'totalExpectedSales',
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
                        title="판매계획"
                        description={(
                            <Typography>
                                판매계획 페이지는 <span>완료된 거래와 관련된 판매계획 기록을 관리</span>하는 곳임. 이 페이지에서는 <span>판매계획 내역을 조회, 수정, 삭제</span>할 수 있으며, <span>납품 완료 상태</span>와 <span>매출 정보</span>를 확인할 수 있음.
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
                                <Typography variant="h6" sx={{ padding: '20px' }}>판매계획 목록</Typography>
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
                                                        <Select.Option value="WAITING_FOR_SHIPMENT">출하 대기</Select.Option>
                                                        <Select.Option value="SHIPMENT_COMPLETED">출하 완료</Select.Option>
                                                        <Select.Option value="IN_PROGRESS">진행중</Select.Option>
                                                        <Select.Option value="COMPLETED">진행완료</Select.Option>
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
                                        dataSource={searchData} // 판매계획 리스트 데이터
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
                                                    const response = await apiClient.post(LOGISTICS_API.SALE_PLAN_DETAIL_API(id));
                                                    setDetailSalePlan(response.data);
                                                    console.log('detailSalePlan: ', response.data)
                                                    setSalePlanParam(response.data)

                                                    setSalePlanDetails(detailSalePlan)
                                                    setEditSalePlan(true);

                                                    notify('success', '판매계획 조회', '판매계획 정보 조회 성공.', 'bottomRight')
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
                    {editSalePlan && (
                        <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{ height: '100%' }}>
                                    <Typography variant="h6" sx={{ padding: '20px' }}>판매계획 상세정보 및 수정</Typography>
                                    <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                        <Form
                                            initialValues={detailSalePlan}
                                            form={form}
                                            onFinish={(values) => { handleFormSubmit(values, 'update') }}
                                        >
                                            {/* 판매계획 정보 */}
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>판매계획 정보</Divider>
                                            <Row align="middle" gutter={16} style={{ marginBottom: '16px' }}>
                                                <Col>
                                                    <Typography>입력 일자</Typography>
                                                </Col>
                                                <Col>
                                                    <Form.Item style={{ marginBottom: 0 }} rules={[{ required: true, message: '입력 일자를 입력하세요.' }]}>
                                                        <DatePicker
                                                            disabledDate={(current) => current && current.year() !== 2024}
                                                            value={salePlanParam.date ? dayjs(salePlanParam.date) : null}
                                                            onChange={handleRegiDateChange}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col>
                                                    <Typography>예상매출일자</Typography>
                                                </Col>
                                                <Col>
                                                    <Form.Item style={{ marginBottom: 0 }} rules={[{ required: true, message: '예상매출일자를 입력하세요.' }]}>
                                                        <DatePicker
                                                            disabledDate={(current) => current && current.year() !== 2024}
                                                            value={salePlanParam.expectedSalesDate ? dayjs(salePlanParam.expectedSalesDate) : null}
                                                            onChange={handleExpectedDateChange}
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

                                            <Row gutter={16}>

                                                <Col span={6}>
                                                    <Form.Item style={{ marginBottom: 0 }} >
                                                        <Input
                                                            addonBefore="출하창고"
                                                            value={displayValues.warehouseName}
                                                            onClick={() => handleInputClick('warehouseName')}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={16}>
                                                    <Form.Item name="remarks">
                                                        <Input addonBefore="비고" />
                                                    </Form.Item>
                                                </Col>

                                            </Row>

                                            {/* 판매계획 상세 항목 */}
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>판매계획 상세 항목</Divider>
                                            <Table
                                                dataSource={salePlanParam?.salePlanDetails || []}
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

                                                            <Input
                                                                value={text}
                                                                onChange={(e) => handleFieldChange(e.target.value, index, 'quantity')}
                                                                className="small-text"
                                                            />
                                                        ),
                                                        width: '6%'
                                                    },
                                                    {
                                                        title: '단가',
                                                        dataIndex: 'price',
                                                        key: 'price',
                                                        align: 'center',
                                                        render: (text, record, index) => (

                                                            <Input
                                                                value={formatNumberWithComma(text)}
                                                                onChange={(e) => handleFieldChange(removeComma(e.target.value), index, 'price')}
                                                                className="small-text"
                                                            />
                                                        ),

                                                    },
                                                    {
                                                        title: '예상매출액',
                                                        dataIndex: 'expectedSales',
                                                        key: 'expectedSales',
                                                        align: 'center',
                                                        render: (text, record, index) => (

                                                            <Input
                                                                value={formatNumberWithComma(text)}
                                                                onChange={(e) => handleFieldChange(removeComma(e.target.value), index, 'expectedSales')}
                                                                className="small-text"
                                                            />
                                                        ),
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
                            <Typography variant="h6" sx={{ padding: '20px' }}>판매계획 입력</Typography>
                            <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                <Form
                                    initialValues={detailSalePlan}
                                    form={registrationForm}
                                    onFinish={(values) => { handleFormSubmit(values, 'register') }}
                                >
                                    {/* 판매계획 정보 */}
                                    <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>판매계획 정보</Divider>
                                    <Row align="middle" gutter={16} style={{ marginBottom: '16px' }}>
                                        <Col>
                                            <Typography>입력 일자</Typography>
                                        </Col>
                                        <Col>
                                            <Form.Item style={{ marginBottom: 0 }} rules={[{ required: true, message: '입력 일자를 입력하세요.' }]}>
                                                <DatePicker
                                                    disabledDate={(current) => current && current.year() !== 2024}
                                                    value={dayjs(salePlanParam.date)}
                                                    onChange={handleRegiDateChange}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col>
                                            <Typography>예상매출일자</Typography>
                                        </Col>
                                        <Col>
                                            <Form.Item style={{ marginBottom: 0 }} rules={[{ required: true, message: '예상매출일자를 입력하세요.' }]}>
                                                <DatePicker
                                                    disabledDate={(current) => current && current.year() !== 2024}
                                                    value={dayjs(salePlanParam.expectedSalesDate)}
                                                    onChange={handleExpectedDateChange}
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

                                    <Row gutter={16}>

                                        <Col span={6}>
                                            <Form.Item style={{ marginBottom: 0 }} >
                                                <Input
                                                    addonBefore="출하창고"
                                                    value={displayValues.warehouseName}
                                                    onClick={() => handleInputClick('warehouseName')}
                                                    onFocus={(e) => e.target.blur()}
                                                    suffix={<DownSquareOutlined />}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={16}>
                                            <Form.Item name="remarks">
                                                <Input addonBefore="비고" />
                                            </Form.Item>
                                        </Col>

                                    </Row>

                                    {/* 판매계획 상세 항목 */}
                                    <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>판매계획 상세 항목</Divider>
                                    <Table
                                        dataSource={salePlanParam?.salePlanDetails || []}
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

                                                    <Input
                                                        value={text}
                                                        onChange={(e) => handleFieldChange(e.target.value, index, 'quantity')}
                                                        className="small-text"
                                                    />
                                                ),
                                                width: '6%'
                                            },
                                            {
                                                title: '단가',
                                                dataIndex: 'price',
                                                key: 'price',
                                                align: 'center',
                                                render: (text, record, index) => (

                                                    <Input
                                                        value={formatNumberWithComma(text)}
                                                        onChange={(e) => handleFieldChange(removeComma(e.target.value), index, 'price')}
                                                        className="small-text"
                                                    />
                                                ),

                                            },
                                            {
                                                title: '예상매출액',
                                                dataIndex: 'expectedSales',
                                                key: 'expectedSales',
                                                align: 'center',
                                                render: (text, record, index) => (

                                                    <Input
                                                        value={formatNumberWithComma(text)}
                                                        onChange={(e) => handleFieldChange(removeComma(e.target.value), index, 'expectedSales')}
                                                        className="small-text"
                                                    />
                                                ),
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

export default SalePlanPage;