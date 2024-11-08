import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './ProductManagementUtil.jsx';
import {Typography} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Space, Tag, Form, Table, Button, Col, Input, Row, Checkbox, Modal, DatePicker, Spin, Select, notification, Upload } from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {FINANCIAL_API, LOGISTICS_API, PRODUCTION_API} from "../../../../config/apiConstants.jsx";
import dayjs from 'dayjs';
import { Divider, Tooltip } from 'antd';
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {SearchOutlined, EditOutlined, CheckOutlined, DeleteOutlined} from "@ant-design/icons";
import defaultImage from '../../../../assets/img/uploads/defaultImage.png';

const { Option } = Select;
const { confirm } = Modal;

const ProductManagementPage = ( {initialData} ) => {
    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [productList, setProductList] = useState(initialData);
    const [form] = Form.useForm(); // 폼 인스턴스 생성
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 선택된 행 키 상태
    const [editProduct, setEditProduct] = useState(false); // 품목 등록 수정 탭 활성화 여부 상태
    const [detailProductData, setDetailProductData] = useState(false);
    const [productParam, setProductParam] = useState(false); // 수정 할 품목 정보 상태
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const [currentField, setCurrentField] = useState(''); // 모달 분기 할 필드 상태
    const [modalData, setModalData] = useState(null); // 모달 데이터 상태
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 활성화 여부 상태
    const [displayValues, setDisplayValues] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [editingRow, setEditingRow] = useState(null); // 현재 수정 중인 행의 ID를 저장
    const [editingValues, setEditingValues] = useState({}); // 수정 중인 값들을 저장
    const [isAdding, setIsAdding] = useState(false);
    const [newGroup, setNewGroup] = useState({ code: '', name: '' });


    /** 품목 그룹 관련 핸들러 - start **/

    // 수정 아이콘 클릭 핸들러
    const handleEdit = (record, event) => {
        event.stopPropagation(); // 수정 아이콘 클릭 시 행 클릭 이벤트 방지
        if (editingRow === record.id) {
            // 이미 수정 중인 행을 다시 클릭하면 수정 완료로 간주
            saveEdit(record.id);
        } else {
            // 수정 모드로 진입
            setEditingRow(record.id);
            setEditingValues({
                code: record.code,
                name: record.name
            });
        }
    };

    // 수정 완료 시 저장 핸들러
    const saveEdit = async (id, event) => {
        try{
            event.stopPropagation(); // 삭제 아이콘 클릭 시 행 클릭 이벤트 방지
            const updatedRecord = {
                ...modalData.find((item) => item.id === id),
                ...editingValues,
            };

            const response = await apiClient.put(LOGISTICS_API.PRODUCT_GROUP_UPDATE_API(id), updatedRecord);

            // 데이터 리스트에서 수정된 항목 업데이트
            setModalData((prevData) =>
                    prevData.map((item) => (item.id === id ? updatedRecord : item))
            );
            notify('success', '품목 그룹 수정', '품목 그룹 수정 성공.', 'bottomRight')

        } catch (error) {
            notify('error', '저장 실패', '데이터 저장 중 오류가 발생했습니다.', 'top');
        } finally {
            setEditingRow(null); // 수정 모드 종료
        }
    };

    // 삭제 아이콘 클릭 핸들러
    const handleDelete = async (record, event) => {
        event.stopPropagation(); // 삭제 아이콘 클릭 시 행 클릭 이벤트 방지

        confirm({
            title: '삭제 확인',
            content: '정말로 삭제하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                try {
                    // 삭제 API 호출 (DELETE 메서드)
                    const response = await apiClient.delete(LOGISTICS_API.PRODUCT_GROUP_DELETE_API(record.id));

                    // 삭제 성공 시 UI에서 해당 항목 제거
                    notify('success', '품목 그룹 삭제', '품목 그룹 삭제 성공.', 'bottomRight')
                    setModalData((prevData) => prevData.filter((item) => item.id !== record.id));
                    setInitialModalData((prevData) => prevData.filter((item) => item.id !== record.id));

                    setProductList((prevList) =>
                        prevList.map((product) =>
                            product.productGroupId === record.id
                                ? { ...product, productGroupName: '', productGroupId: null }
                                : product
                        )
                    );

                    if (detailProductData && detailProductData.productGroupId === record.id) {
                        setDetailProductData((prevData) => ({
                            ...prevData,
                            productGroupId: null,
                            productGroupCode: null,
                            productGroupName: '',
                        }));
                    }

                } catch (error) {
                    notify('error', '삭제 실패', '데이터 삭제 중 오류가 발생했습니다.', 'top');
                }
            },
        });
    };

    // 입력 필드 변경 시 값 업데이트
    const handleFieldChange = (field, value) => {
        setEditingValues((prevValues) => ({
            ...prevValues,
            [field]: value
        }));
    };

    // 추가 버튼 클릭 시 새로운 입력 필드를 테이블 마지막에 추가
    const handleAddNewRow = () => {
        setIsAdding(true);
        setNewGroup({ code: '', name: '' });
    };

    // 저장 버튼 클릭 시 처리 함수
    const handleAddGroup = async () => {

        confirm({
            title: '저장 확인',
            content: '정말로 저장하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                try {

                    if (!newGroup.code || !newGroup.name) return;

                    // 서버로 새로운 그룹 데이터 전송
                    const response = await apiClient.post(LOGISTICS_API.PRODUCT_GROUP_CREATE_API, newGroup);
                    const savedGroup = response.data;
                    notify('success', '품목 그룹 저장', '품목 그룹 저장 성공.', 'bottomRight')
                    setModalData((prevData) => [...prevData, savedGroup]);
                    setInitialModalData((prevData) => [...prevData, savedGroup]);

                    setIsAdding(false);  // 추가 모드 해제
                    setNewGroup({code: '', name: ''});  // 입력 필드 초기화

                } catch (error) {
                    notify('error', '저장 실패', '데이터 저장 중 오류가 발생했습니다.', 'top');
                }
            }
        })

    };

    /** 품목 그룹 관련 핸들러 - end **/

    // 품목 조회 데이터가 있을 경우 폼에 데이터 셋팅
    useEffect(() => {
        if(!detailProductData) return;

        form.setFieldsValue({
            ...detailProductData,
            purchasePrice: formatNumberWithComma(detailProductData.purchasePrice),
            salesPrice: formatNumberWithComma(detailProductData.salesPrice),
        });
        setProductParam(detailProductData);

        setDisplayValues({
            productGroup: detailProductData.productGroupCode
                ? `[${detailProductData.productGroupCode}] ${detailProductData.productGroupName}`
                : '선택안함',
            client: `[${detailProductData.clientId}] ${detailProductData.clientName}`,
            processRouting: detailProductData.processRoutingCode
                ? `[${detailProductData.processRoutingCode}] ${detailProductData.processRoutingName}`
                : '선택안함'
        });

    }, [detailProductData, form]);

    // 모달창 열기 핸들러
    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setModalData(null); // 모달 열기 전에 데이터를 초기화
        setInitialModalData(null); // 모달 열기 전에 데이터를 초기화
        fetchModalData(fieldName);  // 모달 데이터 가져오기 호출
        setIsModalVisible(true);  // 모달창 열기
    };

    // 모달창 닫기 핸들러
    const handleModalCancel = () => {
        setIsAdding(null);
        setNewGroup({code: '', name: ''});
        setEditingRow(null); // 수정 중인 행 초기화
        setEditingValues({}); // 수정 중인 값 초기화
        setIsModalVisible(false);
    };

    // 모달창 데이터 가져오기 함수
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;
        if(fieldName === 'productGroup') apiPath = LOGISTICS_API.PRODUCT_GROUP_LIST_API;
        if(fieldName === 'client') apiPath = FINANCIAL_API.FETCH_CLIENT_LIST_API;
        if(fieldName === 'processRouting') apiPath = PRODUCTION_API.ROUTING_LIST_API;

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

    // 모달창 선택 핸들러
    const handleModalSelect = (record) => {

        // 모달 창 마다가 formattedvalue, setclient param 설정 값이 다름
        switch (currentField) {
            case 'productGroup':
                setProductParam((prevParams) => ({
                    ...prevParams,
                    productGroup: {
                        id: record.id,
                        code: record.code,
                        name: record.name,
                    },
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    productGroup: `[${record.code}] ${record.name}`,
                }));
                break;
            case 'client':
                setProductParam((prevParams) => ({
                    ...prevParams,
                    client: {
                        id: record.id,
                        name: record.printClientName
                    },
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    client: `[${record.id}] ${record.printClientName}`,
                }));
                break;
            case 'processRouting':
                setProductParam((prevParams) => ({
                    ...prevParams,
                    processRouting: {
                        id: record.id,
                        code: record.code,
                        name: record.name,
                    },
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    processRouting : `[${record.code}] ${record.name}`,
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
                // 필요한 필드들을 `productData` 객체로 생성하고 `imageFile`은 제외
                const productData = {
                    id: values.id,
                    code: values.code,
                    name: values.name,
                    standard: values.standard,
                    unit: values.unit,
                    purchasePrice: removeComma(values.purchasePrice),
                    salesPrice: removeComma(values.salesPrice),
                    productType: productParam.productType,
                    remarks: values.remarks,
                    productGroupId: productParam.productGroup ? productParam.productGroup.id : detailProductData.productGroupId,
                    clientId: productParam.client ? productParam.client.id : detailProductData.clientId,
                    processRoutingId: productParam.processRouting
                        ? productParam.processRouting.id
                        : detailProductData
                            ? detailProductData.processRoutingId
                            : null
                    ,
                };


                // FormData 객체 생성
                const formData = new FormData();
                formData.append("productData", JSON.stringify(productData));  // JSON으로 변환 후 추가
                if (selectedFile) {  // 파일이 존재할 때만 추가
                    formData.append("imageFile", selectedFile);
                }


                try {
                    const API_PATH = type === 'update' ? LOGISTICS_API.PRODUCT_UPDATE_API(productParam.id) : LOGISTICS_API.PRODUCT_CREATE_API;
                    const method = type === 'update' ? 'put' : 'post';
                    const response = await apiClient[method](API_PATH, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    const updatedData = response.data;

                    if (type === 'update') {
                        setProductList((prevList) =>
                            prevList.map((product) => product.id === updatedData.id ? updatedData : product)
                        );
                    } else {
                        setProductList((prevList) => [...prevList, updatedData]);
                        registrationForm.resetFields();
                    }

                    setEditProduct(false);
                    setDetailProductData(null);
                    setProductParam({});
                    setSelectedFile(null);
                    setDisplayValues({});

                    type === 'update'
                        ? notify('success', '품목 수정', '품목 정보 수정 성공.', 'bottomRight')
                        : (notify('success', '품목 저장', '품목 정보 저장 성공.', 'bottomRight'), registrationForm.resetFields());
                } catch (error) {
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

    const handleTabChange = (key) => {
        setEditProduct(false);
        setDetailProductData(null);
        setProductParam({
            productType: 'GOODS',
        });
        setDisplayValues({});

        form.resetFields(); // 1탭 폼 초기화
        registrationForm.resetFields(); // 2탭 폼 초기화
        registrationForm.setFieldValue('isActive', true);

        setActiveTabKey(key);
    };

    // 단가 콤마 적용
    const formatNumberWithComma = (value) => {
        // value가 숫자인 경우 문자열로 변환
        const stringValue = String(value);
        return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 천 단위마다 콤마 추가
    };

    // 콤마 제거 함수
    const removeComma = (value) => {
        return value ? value.toString().replace(/,/g, '') : value;
    };

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="품목 등록 및 관리"
                        description={(
                            <Typography>
                                품목 관리 페이지는 <span>회사에서 사용하거나 판매하는 모든 품목의 목록을 관리</span>하는 곳임.<br/>
                                이 페이지에서는 품목을 <span>추가, 수정, 삭제</span>할 수 있으며, 각 품목에 대한 상세한 정보를 입력할 수 있음.<br/>
                                주요 기능으로는 <span>품목의 기본 정보</span>와 <span>단가, 품목 그룹</span> 등을 입력 및 수정할 수 있음.
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
                                <Typography variant="h6" sx={{ padding: '20px' }} >품목 목록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Table
                                        dataSource={productList}
                                        columns={[
                                            {
                                                title: <div className="title-text">이미지</div>,
                                                dataIndex: 'imagePath',
                                                key: 'imagePath',
                                                align: 'center',
                                                render: (text, record) => (
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        height: '100%', // 모든 행의 높이를 동일하게 고정
                                                    }}>
                                                        <img
                                                            src={record.imagePath ? record.imagePath: defaultImage}
                                                            alt="이미지"
                                                            style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                objectFit: 'cover',
                                                                borderRadius: '5px',
                                                            }}
                                                        />
                                                    </div>
                                                ),
                                                width: '15%'
                                            },
                                            {
                                                title: <div className="title-text">품목코드</div>,
                                                dataIndex: 'code',
                                                key: 'code',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                                width: '10%'
                                            },
                                            {
                                                title: <div className="title-text">품목명</div>,
                                                dataIndex: 'name',
                                                key: 'name',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                                width: '20%'
                                            },
                                            {
                                                title: <div className="title-text">그룹명</div>,
                                                dataIndex: 'productGroupName',
                                                key: 'productGroupName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                                width: '15%'
                                            },
                                            {
                                                title: <div className="title-text">규격</div>,
                                                dataIndex: 'standard',
                                                key: 'standard',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                                width: '10%'
                                            },
                                            {
                                                title: <div className="title-text">입고단가</div>,
                                                dataIndex: 'purchasePrice',
                                                key: 'purchasePrice',
                                                align: 'center',
                                                render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{formatNumberWithComma(text)}</div>,
                                                width: '10%'
                                            },
                                            {
                                                title: <div className="title-text" >출고단가</div>,
                                                dataIndex: 'salesPrice',
                                                key: 'salesPrice',
                                                align: 'center',
                                                render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{formatNumberWithComma(text)}</div>,
                                                width: '10%'
                                            },
                                            {
                                                title: <div className="title-text">품목구분</div>,
                                                dataIndex: 'productType',
                                                key: 'productType',
                                                align: 'center',
                                                render: (text, record) => {
                                                    let color;
                                                    let value;
                                                    switch (text) {
                                                        case 'PRODUCTS':
                                                            color = 'green';
                                                            value = '제품';
                                                            break;
                                                        case 'GOODS':
                                                            color = 'blue';
                                                            value = '상품';
                                                            break;
                                                        case 'SEMI_FINISHED_PRODUCT':
                                                            color = 'orange';
                                                            value = '반제품';
                                                            break;
                                                        case 'INTANGIBLE_GOODS':
                                                            color = 'gray';
                                                            value = '무형상품';
                                                            break;
                                                        default:
                                                            color = 'gray'; // 기본 색상
                                                    }
                                                    return <Tag style={{ marginLeft: '5px' }} color={color}>{value}</Tag>;
                                                },
                                                width: '15%'
                                            }
                                        ]}
                                        rowKey={(record) => record.id}
                                        pagination={{ pageSize: 15, position: ['bottomCenter'], showSizeChanger: false }}
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
                                                    const response = await apiClient.post(LOGISTICS_API.PRODUCT_DETAIL_API(id));
                                                    setDetailProductData(response.data);
                                                    setEditProduct(true);

                                                    notify('success', '품목 조회', '품목 정보 조회 성공.', 'bottomRight')
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
                    {editProduct && (
                        <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{ height: '100%' }}>
                                    <Typography variant="h6" sx={{ padding: '20px' }}>품목 상세정보 및 수정</Typography>
                                    <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                        <Form
                                            initialValues={detailProductData}
                                            form={form}
                                            onFinish={(values) => { handleFormSubmit(values, 'update') }}
                                        >
                                            {/* 기초 정보 */}
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>기초 정보</Divider>
                                            <Row gutter={16}>
                                                <Col span={6}>
                                                    <Form.Item name="code" rules={[{ required: true, message: '품목 코드를 입력하세요.' }]}>
                                                        <Input addonBefore="품목 코드" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="name" rules={[{ required: true, message: '품목명을 입력하세요.' }]}>
                                                        <Input addonBefore="품목명" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="standard" rules={[{ required: true, message: '규격을 입력하세요.' }]}>
                                                        <Input addonBefore="규격" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="unit" rules={[{ required: true, message: '단위를 입력하세요.' }]}>
                                                        <Input addonBefore="단위" />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row gutter={16}>
                                                <Col span={6}>
                                                    <Form.Item name="purchasePrice" rules={[{ required: true, message: '입고단가를 입력하세요.' }]}>
                                                        <Input
                                                            addonBefore="입고 단가"
                                                            value={form.getFieldValue('purchasePrice') ? formatNumberWithComma(form.getFieldValue('purchasePrice')) : ''}
                                                            onChange={(e) => {
                                                                const valueWithoutComma = e.target.value.replace(/,/g, ''); // 콤마 제거
                                                                if (!isNaN(valueWithoutComma)) {
                                                                    form.setFieldValue('purchasePrice', formatNumberWithComma(valueWithoutComma)); // 콤마 포함된 값으로 저장
                                                                }
                                                            }}
                                                        />

                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="salesPrice" rules={[{ required: true, message: '출고 단가를 입력하세요.' }]}>
                                                        <Input
                                                            addonBefore="출고 단가"
                                                            value={form.getFieldValue('salesPrice') ? formatNumberWithComma(form.getFieldValue('salesPrice')) : ''}
                                                            onChange={(e) => {
                                                                const valueWithoutComma = e.target.value.replace(/,/g, ''); // 콤마 제거
                                                                if (!isNaN(valueWithoutComma)) {
                                                                    form.setFieldValue('salesPrice', formatNumberWithComma(valueWithoutComma)); // 콤마 포함된 값으로 저장
                                                                }
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item>
                                                        <Input
                                                            addonBefore="품목 그룹"
                                                            value={displayValues.productGroup}
                                                            onClick={() => handleInputClick('productGroup')}
                                                            onFocus={(e) => e.target.blur()}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="productType">
                                                        <Space.Compact>
                                                            <Input style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="품목 구분" disabled />
                                                            <Select
                                                                style={{ width: '60%' }}
                                                                value={productParam.productType}
                                                                onChange={(value) => {
                                                                    setProductParam((prevState) => ({
                                                                        ...prevState,
                                                                        productType: value, // 선택된 값을 transactionType에 반영
                                                                    }));
                                                                }}
                                                            >
                                                                <Option value="PRODUCTS">제품</Option>
                                                                <Option value="SEMI_FINISHED_PRODUCT">반제품</Option>
                                                                <Option value="GOODS">상품</Option>
                                                                <Option value="INTANGIBLE_GOODS">무형상품</Option>
                                                            </Select>
                                                        </Space.Compact>

                                                    </Form.Item>
                                                </Col>
                                            </Row>


                                            {/* 추가 정보 */}
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>추가 정보</Divider>
                                            <Row gutter={16}>
                                                <Col span={6}>
                                                    <Form.Item>
                                                        <Input
                                                            addonBefore="거래처"
                                                            value={displayValues.client}
                                                            onClick={() => handleInputClick('client')}
                                                            onFocus={(e) => e.target.blur()}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item>
                                                        <Input
                                                            addonBefore="생산 경로"
                                                            value={displayValues.processRouting}
                                                            onClick={() => handleInputClick('processRouting')}
                                                            onFocus={(e) => e.target.blur()}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="remarks">
                                                        <Input addonBefore="비고" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="isActive" valuePropName="checked">
                                                        <Checkbox>품목 사용 여부</Checkbox>
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            {/* 이미지 */}
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>이미지</Divider>
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item>
                                                        <div style={{ marginBottom: '20px' }}>
                                                            <img
                                                                src={selectedFile
                                                                    ? URL.createObjectURL(selectedFile)
                                                                    : detailProductData?.imagePath
                                                                        ? detailProductData?.imagePath
                                                                        : '/src/assets/img/uploads/defaultImage.png'}
                                                                alt="미리보기 이미지"
                                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                    </Form.Item>

                                                    <Form.Item name="imageFile">
                                                        <Upload
                                                            beforeUpload={() => false}
                                                            onChange={(info) => {
                                                                const file = info.fileList[info.fileList.length - 1]?.originFileObj;
                                                                setSelectedFile(file);
                                                            }}
                                                            fileList={selectedFile ? [{ uid: '-1', name: selectedFile.name, status: 'done', url: selectedFile.url }] : []}
                                                        >
                                                            <Button icon={<CloudUploadIcon />}>파일 선택</Button>
                                                        </Upload>
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
                                            >
                                                {isLoading ? (
                                                    <Spin />  // 로딩 스피너
                                                ) : (
                                                    <>
                                                        {/* 품목 그룹 선택 모달 */}
                                                        {currentField === 'productGroup' && (
                                                            <>
                                                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                                    품목 그룹 선택
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
                                                                    <>
                                                                        <Table
                                                                            columns={[
                                                                                {
                                                                                    title: '코드',
                                                                                    dataIndex: 'code',
                                                                                    key: 'code',
                                                                                    align: 'center',
                                                                                    width: '100px',
                                                                                    render: (text, record) => {
                                                                                        return editingRow === record.id ? (
                                                                                            <Input
                                                                                                value={editingValues.code}
                                                                                                onChange={(e) => handleFieldChange('code', e.target.value)}
                                                                                            />
                                                                                        ) : (
                                                                                            text
                                                                                        );
                                                                                    },
                                                                                },
                                                                                {
                                                                                    title: '그룹명',
                                                                                    dataIndex: 'name',
                                                                                    key: 'name',
                                                                                    align: 'center',
                                                                                    render: (text, record) => (
                                                                                        <div
                                                                                            style={{
                                                                                                display: 'flex',
                                                                                                justifyContent: 'space-between',
                                                                                                alignItems: 'center',
                                                                                            }}
                                                                                            className="group-row"
                                                                                        >
                                                                                            {editingRow === record.id ? (
                                                                                                <Input
                                                                                                    value={editingValues.name}
                                                                                                    onChange={(e) => handleFieldChange('name', e.target.value)}
                                                                                                />
                                                                                            ) : (
                                                                                                <div style={{ textAlign: 'center', flex: 1 }}>{text}</div>
                                                                                            )}
                                                                                            <div
                                                                                                className="group-actions"
                                                                                                style={{ position: 'absolute', right: 5, opacity: 0, display: 'flex' }}
                                                                                            >
                                                                                                {editingRow === record.id ? (
                                                                                                    <Tooltip title="저장">
                                                                                                        <CheckOutlined
                                                                                                            style={{ marginRight: '10px', cursor: 'pointer', color: 'blue' }}
                                                                                                            onClick={(event) => saveEdit(record.id, event)} // 기존 그룹 저장
                                                                                                        />
                                                                                                    </Tooltip>
                                                                                                ) : (
                                                                                                    <>
                                                                                                        <Tooltip title="수정">
                                                                                                            <EditOutlined
                                                                                                                style={{ marginRight: '10px', cursor: 'pointer' }}
                                                                                                                onClick={(event) => handleEdit(record, event)} // 수정 핸들러 추가
                                                                                                            />
                                                                                                        </Tooltip>
                                                                                                        <Tooltip title="삭제">
                                                                                                            <DeleteOutlined
                                                                                                                style={{ cursor: 'pointer', color: 'red' }}
                                                                                                                onClick={(event) => handleDelete(record, event)} // 삭제 핸들러 추가
                                                                                                            />
                                                                                                        </Tooltip>
                                                                                                    </>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    ),
                                                                                },
                                                                            ]}
                                                                            dataSource={modalData} // 기존 데이터만 포함
                                                                            rowKey={(record) => record.id || record.key}
                                                                            size="small"
                                                                            pagination={{
                                                                                pageSize: 15,
                                                                                position: ['bottomCenter'],
                                                                                showSizeChanger: false,
                                                                                showTotal: (total) => `총 ${total}개`,
                                                                            }}
                                                                            onRow={(record) => ({
                                                                                onMouseEnter: (event) => {
                                                                                    const actionDiv = event.currentTarget.querySelector('.group-actions');
                                                                                    if (actionDiv && editingRow !== record.id) actionDiv.style.opacity = '1'; // 마우스를 올리면 아이콘을 보이게 함
                                                                                },
                                                                                onMouseLeave: (event) => {
                                                                                    const actionDiv = event.currentTarget.querySelector('.group-actions');
                                                                                    if (actionDiv && editingRow !== record.id) actionDiv.style.opacity = '0'; // 마우스가 떠나면 아이콘을 보이지 않게 함
                                                                                },
                                                                                style: { cursor: 'pointer' },
                                                                                onClick: (event) => {
                                                                                    if (editingRow === record.id) {
                                                                                        event.stopPropagation(); // 수정 모드일 때 행 클릭 방지
                                                                                    } else {
                                                                                        handleModalSelect(record); // 행 클릭 시 품목 그룹 선택
                                                                                    }
                                                                                },
                                                                            })}
                                                                        />

                                                                        {/* 추가 필드 렌더링 */}
                                                                        {isAdding && (
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                                                                {/* 코드 입력 필드 */}
                                                                                <Input
                                                                                    value={newGroup.code}
                                                                                    onChange={(e) => setNewGroup({ ...newGroup, code: e.target.value })}
                                                                                    placeholder="코드 입력"
                                                                                    style={{ width: '30%', marginRight: '10px'  }} // 너비와 높이 조절
                                                                                />

                                                                                {/* 그룹명 입력 필드 */}
                                                                                <Input
                                                                                    value={newGroup.name}
                                                                                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                                                                    placeholder="그룹명 입력"
                                                                                    style={{ width: '70%', marginRight: '10px'  }} // 너비는 코드 필드와 맞춤
                                                                                />

                                                                                {/* 저장 아이콘 */}
                                                                                <Tooltip title="저장">
                                                                                    <CheckOutlined
                                                                                        style={{ fontSize: '20px', cursor: 'pointer', color: 'blue' }}
                                                                                        onClick={handleAddGroup} // 새 그룹 저장 함수
                                                                                    />
                                                                                </Tooltip>
                                                                            </div>
                                                                        )}
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

                                                        {/* 생산 경로 선택 모달 */}
                                                        {currentField === 'processRouting' && (
                                                            <>
                                                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                                    생산 경로 선택
                                                                </Typography>
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
                                                            </>
                                                        )}

                                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                            {currentField === 'productGroup' && (
                                                                <>
                                                                    <Button onClick={handleAddNewRow} variant="contained" type="primary" sx={{ mr: 1 }}>
                                                                        추가
                                                                    </Button>
                                                                </>
                                                            )}
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
                                <Typography variant="h6" sx={{ padding: '20px' }}>품목 등록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form
                                        layout="vertical"
                                        onFinish={(values) => { handleFormSubmit(values, 'register') }}
                                        form={registrationForm}
                                    >
                                        {/* 기초 정보 */}
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>기초 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item name="code" rules={[{ required: true, message: '품목 코드를 입력하세요.' }]}>
                                                    <Input addonBefore="품목 코드" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="name" rules={[{ required: true, message: '품목명을 입력하세요.' }]}>
                                                    <Input addonBefore="품목명" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="standard" rules={[{ required: true, message: '규격을 입력하세요.' }]}>
                                                    <Input addonBefore="규격" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="unit" rules={[{ required: true, message: '단위를 입력하세요.' }]}>
                                                    <Input addonBefore="단위" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item name="purchasePrice" rules={[{ required: true, message: '입고 단가를 입력하세요.' }]}>
                                                    <Input addonBefore="입고 단가" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="salesPrice" rules={[{ required: true, message: '출고 단가를 입력하세요.' }]}>
                                                    <Input addonBefore="출고 단가" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="품목 그룹"
                                                        value={displayValues.productGroup}
                                                        onClick={() => handleInputClick('productGroup')}
                                                        onFocus={(e) => e.target.blur()}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="productType">
                                                    <Space.Compact>
                                                        <Input style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="품목 구분" disabled />
                                                        <Select
                                                            style={{ width: '60%' }}
                                                            value={productParam.productType}
                                                            onChange={(value) => {
                                                                setProductParam((prevState) => ({
                                                                    ...prevState,
                                                                    productType: value, // 선택된 값을 transactionType에 반영
                                                                }));
                                                            }}
                                                        >
                                                            <Option value="PRODUCTS">제품</Option>
                                                            <Option value="SEMI_FINISHED_PRODUCT">반제품</Option>
                                                            <Option value="GOODS">상품</Option>
                                                            <Option value="INTANGIBLE_GOODS">무형상품</Option>
                                                        </Select>
                                                    </Space.Compact>

                                                </Form.Item>
                                            </Col>
                                        </Row>


                                        {/* 추가 정보 */}
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>추가 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="거래처"
                                                        value={displayValues.client}
                                                        onClick={() => handleInputClick('client')}
                                                        onFocus={(e) => e.target.blur()}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="생산 경로"
                                                        value={displayValues.processRouting}
                                                        onClick={() => handleInputClick('processRouting')}
                                                        onFocus={(e) => e.target.blur()}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="remarks">
                                                    <Input addonBefore="비고" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        {/* 이미지 업로드 */}
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>이미지 업로드</Divider>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item name="imageFile">
                                                    {/* 이미지 미리보기 */}
                                                    <div style={{ marginBottom: '20px' }}>
                                                        <img
                                                            src={selectedFile ? URL.createObjectURL(selectedFile) : defaultImage}
                                                            alt="미리보기 이미지"
                                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <Upload
                                                        beforeUpload={() => false} // 실제 업로드를 막기 위해 false 반환
                                                        onChange={(info) => {
                                                            const file = info.fileList[info.fileList.length - 1]?.originFileObj; // fileList의 마지막 파일 객체 사용
                                                            setSelectedFile(file); // 선택된 파일을 상태로 설정
                                                        }}
                                                        fileList={selectedFile ? [{ uid: '-1', name: selectedFile.name, status: 'done', url: selectedFile.url }] : []} // 파일 리스트 설정
                                                    >
                                                        <Button icon={<CloudUploadIcon />}>파일 선택</Button>
                                                    </Upload>
                                                </Form.Item>
                                            </Col>
                                        </Row>
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
                                        >
                                            {isLoading ? (
                                                <Spin />  // 로딩 스피너
                                            ) : (
                                                <>
                                                    {/* 품목 그룹 선택 모달 */}
                                                    {currentField === 'productGroup' && (
                                                        <>
                                                            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                                품목 그룹 선택
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
                                                                <>
                                                                    <Table
                                                                        columns={[
                                                                            {
                                                                                title: '코드',
                                                                                dataIndex: 'code',
                                                                                key: 'code',
                                                                                align: 'center',
                                                                                width: '100px',
                                                                                render: (text, record) => {
                                                                                    return editingRow === record.id ? (
                                                                                        <Input
                                                                                            value={editingValues.code}
                                                                                            onChange={(e) => handleFieldChange('code', e.target.value)}
                                                                                        />
                                                                                    ) : (
                                                                                        text
                                                                                    );
                                                                                },
                                                                            },
                                                                            {
                                                                                title: '그룹명',
                                                                                dataIndex: 'name',
                                                                                key: 'name',
                                                                                align: 'center',
                                                                                render: (text, record) => (
                                                                                    <div
                                                                                        style={{
                                                                                            display: 'flex',
                                                                                            justifyContent: 'space-between',
                                                                                            alignItems: 'center',
                                                                                        }}
                                                                                        className="group-row"
                                                                                    >
                                                                                        {editingRow === record.id ? (
                                                                                            <Input
                                                                                                value={editingValues.name}
                                                                                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                                                                            />
                                                                                        ) : (
                                                                                            <div style={{ textAlign: 'center', flex: 1 }}>{text}</div>
                                                                                        )}
                                                                                        <div
                                                                                            className="group-actions"
                                                                                            style={{ position: 'absolute', right: 5, opacity: 0, display: 'flex' }}
                                                                                        >
                                                                                            {editingRow === record.id ? (
                                                                                                <Tooltip title="저장">
                                                                                                    <CheckOutlined
                                                                                                        style={{ marginRight: '10px', cursor: 'pointer', color: 'blue' }}
                                                                                                        onClick={(event) => saveEdit(record.id, event)} // 기존 그룹 저장
                                                                                                    />
                                                                                                </Tooltip>
                                                                                            ) : (
                                                                                                <>
                                                                                                    <Tooltip title="수정">
                                                                                                        <EditOutlined
                                                                                                            style={{ marginRight: '10px', cursor: 'pointer' }}
                                                                                                            onClick={(event) => handleEdit(record, event)} // 수정 핸들러 추가
                                                                                                        />
                                                                                                    </Tooltip>
                                                                                                    <Tooltip title="삭제">
                                                                                                        <DeleteOutlined
                                                                                                            style={{ cursor: 'pointer', color: 'red' }}
                                                                                                            onClick={(event) => handleDelete(record, event)} // 삭제 핸들러 추가
                                                                                                        />
                                                                                                    </Tooltip>
                                                                                                </>
                                                                                            )}
                                                                                        </div>
                                                                                     </div>
                                                                                ),
                                                                            },
                                                                        ]}
                                                                        dataSource={modalData} // 기존 데이터만 포함
                                                                        rowKey={(record) => record.id || record.key}
                                                                        size="small"
                                                                        pagination={{
                                                                            pageSize: 15,
                                                                            position: ['bottomCenter'],
                                                                            showSizeChanger: false,
                                                                            showTotal: (total) => `총 ${total}개`,
                                                                        }}
                                                                        onRow={(record) => ({
                                                                            onMouseEnter: (event) => {
                                                                                const actionDiv = event.currentTarget.querySelector('.group-actions');
                                                                                if (actionDiv && editingRow !== record.id) actionDiv.style.opacity = '1'; // 마우스를 올리면 아이콘을 보이게 함
                                                                            },
                                                                            onMouseLeave: (event) => {
                                                                                const actionDiv = event.currentTarget.querySelector('.group-actions');
                                                                                if (actionDiv && editingRow !== record.id) actionDiv.style.opacity = '0'; // 마우스가 떠나면 아이콘을 보이지 않게 함
                                                                            },
                                                                            style: { cursor: 'pointer' },
                                                                            onClick: (event) => {
                                                                                if (editingRow === record.id) {
                                                                                    event.stopPropagation(); // 수정 모드일 때 행 클릭 방지
                                                                                } else {
                                                                                    handleModalSelect(record); // 행 클릭 시 품목 그룹 선택
                                                                                }
                                                                            },
                                                                        })}
                                                                    />

                                                                    {/* 추가 필드 렌더링 */}
                                                                    {isAdding && (
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                                                            {/* 코드 입력 필드 */}
                                                                            <Input
                                                                                value={newGroup.code}
                                                                                onChange={(e) => setNewGroup({ ...newGroup, code: e.target.value })}
                                                                                placeholder="코드 입력"
                                                                                style={{ width: '30%', marginRight: '10px'  }} // 너비와 높이 조절
                                                                            />

                                                                            {/* 그룹명 입력 필드 */}
                                                                            <Input
                                                                                value={newGroup.name}
                                                                                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                                                                placeholder="그룹명 입력"
                                                                                style={{ width: '70%', marginRight: '10px'  }} // 너비는 코드 필드와 맞춤
                                                                            />

                                                                            {/* 저장 아이콘 */}
                                                                            <Tooltip title="저장">
                                                                                <CheckOutlined
                                                                                    style={{ fontSize: '20px', cursor: 'pointer', color: 'blue' }}
                                                                                    onClick={handleAddGroup} // 새 그룹 저장 함수
                                                                                />
                                                                            </Tooltip>
                                                                        </div>
                                                                    )}
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

                                                    {/* 생산 경로 선택 모달 */}
                                                    {currentField === 'processRouting' && (
                                                        <>
                                                            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                                생산 경로 선택
                                                            </Typography>
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
                                                        </>
                                                    )}

                                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                        {currentField === 'productGroup' && (
                                                            <>
                                                                <Button onClick={handleAddNewRow} variant="contained" type="primary" sx={{ mr: 1 }}>
                                                                    추가
                                                                </Button>
                                                            </>
                                                        )}
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

export default ProductManagementPage;