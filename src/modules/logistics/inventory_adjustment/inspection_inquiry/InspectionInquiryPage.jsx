import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import {tabItems} from './InspectionInquiryUtil.jsx';
import {Typography} from '@mui/material';
import {useNotificationContext} from '../../../../config/NotificationContext.jsx';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {EMPLOYEE_API, LOGISTICS_API} from "../../../../config/apiConstants.jsx";
import dayjs from "dayjs";
import {Button, Col, DatePicker, Divider, Form, Input, Modal, Row, Spin, Table} from "antd";
import {SearchOutlined} from "@ant-design/icons";

const {RangePicker} = DatePicker;

const InspectionInquiryPage = () => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [inspectionListData, setInspectionListData] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useState({
        startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [editInspection, setEditInspection] = useState(false);
    const [detailInspectionData, setDetailInspectionData] = useState(false);
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [initialModalData, setInitialModalData] = useState([]);
    const [currentField, setCurrentField] = useState('');
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
    const [currentFieldIndex, setCurrentFieldIndex] = useState(null);

    // 탭 전환 처리 함수
    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    const fetchInspectionStatus = async (startDate, endDate) => {
        setLoading(true);
        try {
            // API 호출
            const response = await apiClient.post(LOGISTICS_API.INVENTORY_INSPECTION_LIST_API(startDate, endDate));
            setInspectionListData(response.data);  // 데이터 설정
            notify('success', '데이터 조회 성공', '재고실사 현황 데이터를 성공적으로 조회했습니다.', 'bottomRight');
        } catch (error) {
            notify('error', '데이터 조회 오류', '재고실사 현황 데이터를 조회하는 중 오류가 발생했습니다.', 'top');
        } finally {
            setLoading(false);
        }
    }

    const handleFormSubmit = async (values) => {
        try {
            // 기존 데이터에 대한 ID 및 관계 정보 유지
            const filteredDetails = values.details.filter(detail => {
                // 모든 필드가 비어 있는 항목을 필터링
                return detail.productCode || detail.productName || detail.standard || detail.unit || detail.warehouseLocationName || detail.actualQuantity || detail.comment;
            });

            const requestDTO = {
                inspectionDate: values.inspectionDate,
                warehouseId: values.warehouseId,
                employeeId: values.employeeId,
                comment: values.comment,
                details: filteredDetails.map((detail) => ({
                    id: detail.id || null, // 항목 고유 ID가 없을 경우 null로 설정
                    productId: detail.productId || null, // 제품 ID가 없을 경우 null로 설정
                    inventoryId: detail.inventoryId || null, // 재고 ID가 없을 경우 null로 설정
                    warehouseLocationId: detail.warehouseLocationId || null, // 창고 위치 ID가 없을 경우 null로 설정
                    productCode: detail.productCode,
                    productName: detail.productName,
                    standard: detail.standard || '',
                    unit: detail.unit || '',
                    actualQuantity: detail.actualQuantity,
                    comment: detail.comment || '',  // 코멘트가 없을 경우 빈 문자열로 설정
                })),
            };

            console.log('요청 데이터:', requestDTO);
            // API 호출
            const id = detailInspectionData.id;
            const response = await apiClient.put(LOGISTICS_API.INVENTORY_INSPECTION_UPDATE_API(id), requestDTO);

            notify('success', '수정 완료', '재고 실사 정보가 성공적으로 저장되었습니다.', 'bottomRight');
        } catch (error) {
            notify('error', '저장 오류', '재고 실사 정보 저장 중 오류가 발생했습니다.', 'top');
        }
    };

    // 모달 닫기 핸들러
    const handleModalCancel = () => setIsModalVisible(false);

    const handleInputClick = (fieldName, index) => {
        setCurrentField(fieldName);
        setCurrentFieldIndex(index);  // 수정하려는 항목의 인덱스를 설정
        setModalData(null);
        setInitialModalData(null);
        if (!selectedWarehouseId && detailInspectionData.warehouseId) {
            setSelectedWarehouseId(detailInspectionData.warehouseId);
        }
        fetchModalData(fieldName);
        setIsModalVisible(true);
    };

    // 모달 데이터 조회 함수
    const fetchModalData = async (fieldName) => {
        setLoading(true);
        let apiPath;
        if (fieldName === 'employeeName') apiPath = EMPLOYEE_API.EMPLOYEE_DATA_API;
        if (fieldName === 'warehouseName') apiPath = LOGISTICS_API.WAREHOUSE_LIST_API;
        if (fieldName === 'productCode') {
            if (!selectedWarehouseId) {
                notify('error', '창고 선택 오류', '창고를 먼저 선택해 주세요.', 'top');
                setLoading(false);
                return;
            }
            apiPath = LOGISTICS_API.WAREHOUSE_INVENTORY_DETAIL_API(selectedWarehouseId);
        }

        try {
            const response = await apiClient.post(apiPath);
            let data = response.data;
            if (typeof data === 'string' && data.startsWith('[') && data.endsWith(']')) {
                data = JSON.parse(data);
            }
            const modalData = Array.isArray(data) ? data : [data];
            console.log('모달 데이터:', modalData);
            setModalData(modalData);
            setInitialModalData(modalData);
        } catch (error) {
            notify('error', '데이터 조회 오류', '데이터를 조회하는 중 오류가 발생했습니다.', 'top');
        } finally {
            setLoading(false);
        }
    }

    const handleModalSelect = (record) => {
        const prevValues = form.getFieldsValue(); // 기존 필드 값 가져오기
        const details = prevValues.details || []; // 기존 details 필드 유지

        if (currentField === 'employeeName') {
            // 담당자명 필드가 선택된 경우
            form.setFieldsValue({
                ...prevValues, // 기존 필드 값 유지
                employeeName: `${record.lastName}${record.firstName}`, // 성과 이름을 합쳐서 설정
                employeeId: record.id, // 담당자 ID 설정
            });
        } else if (currentField === 'warehouseName') {
            // 창고명 필드가 선택된 경우
            form.setFieldsValue({
                ...prevValues, // 기존 필드 값 유지
                warehouseName: record.name, // 창고명 설정
                warehouseId: record.id, // 창고 ID 설정
            });
            setSelectedWarehouseId(record.id);
        } else if (currentField === 'productCode') {
            // 품목 코드가 선택된 경우, 기존 항목을 업데이트하거나 새 항목 추가
            const updatedDetails = details.map((item, index) => {
                if (index === currentFieldIndex) {
                    // 선택된 항목 업데이트
                    return {
                        ...item,
                        productCode: record.productCode,
                        productName: record.productName,
                        standard: record.standard, // 규격 설정
                        unit: record.unit, // 단위 설정
                        warehouseLocationName: record.warehouseLocationName, // 창고 위치 설정
                        actualQuantity: record.quantity, // 조회된 수량을 실사 수량 필드에 설정
                        warehouseLocationId: record.warehouseLocationId, // 창고 위치 ID 설정
                        inventoryId: record.inventoryNumber, // 재고 ID 설정
                        productId: record.id, // 제품 ID 설정
                    };
                }
                return item; // 다른 항목은 그대로 유지
            });

            form.setFieldsValue({
                ...prevValues, // 기존 필드 값 유지
                details: updatedDetails, // 수정된 details 반영
            });
        }

        setIsModalVisible(false); // 모달 닫기
    };


    // 날짜 범위 변경 핸들러
    const handleDateChange = (dates, dateStrings) => {
        setSearchParams({
            startDate: dateStrings[0],
            endDate: dateStrings[1],
        });
    };

    // 검색 버튼 클릭 시 데이터 로드
    const handleSearch = () => {
        fetchInspectionStatus(searchParams.startDate, searchParams.endDate);
    };

    useEffect(() => {
        if (editInspection && detailInspectionData) {
            form.setFieldsValue({
                ...detailInspectionData,
                details: detailInspectionData.details.map((detail) => ({
                    id: detail.id,
                    productId: detail.productId,
                    inventoryId: detail.inventoryId,
                    warehouseLocationId: detail.warehouseLocationId,
                    warehouseLocationName: detail.warehouseLocationName,
                    productCode: detail.productCode,
                    productName: detail.productName,
                    standard: detail.standard,
                    unit: detail.unit,
                    actualQuantity: detail.actualQuantity,
                    comment: detail.comments,  // 서버에서 받아온 comments를 form의 comment로 매핑
                })),
                warehouseId: detailInspectionData.warehouseId,  // 창고 ID 설정
                employeeId: detailInspectionData.employeeId,  // 담당자 ID 설정
                comment: detailInspectionData.comment,  // 코멘트 설정
            });

            if (detailInspectionData.warehouseId) {
                setSelectedWarehouseId(detailInspectionData.warehouseId);
            }
        }
    }, [detailInspectionData, form, editInspection]);


    useEffect(() => {
        fetchInspectionStatus(searchParams.startDate, searchParams.endDate);
    }, []);

    return (
        <Box sx={{margin: '20px'}}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="재고실사조회"
                        description={(
                            <Typography>
                                재고실사조회 페이지는 <span>현재 진행 중인 재고 실사의 내용을 조회</span>하는 곳임. 이 페이지에서는 실사된 재고 정보를 확인할 수 있으며, 재고 실사 결과를 <span>기록</span>하는 기능을 제공함. 실사 중
                                발생한 <span>불일치 항목</span>을 쉽게 파악하여 즉시 조정할 수 있음.
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
                                <Typography variant="h6" sx={{padding: '20px'}}>재고실사 조회</Typography>
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
                                    dataSource={inspectionListData}
                                    columns={[
                                        {
                                            title: <div className="title-text">입력일자</div>,
                                            dataIndex: 'inspectionNumber',
                                            key: 'inspectionNumber',
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
                                            title: <div className="title-text">담당자</div>,
                                            dataIndex: 'employeeName',
                                            key: 'employeeName',
                                            align: 'center',
                                            render: (text) => <div className="small-text">{text}</div>,
                                        },
                                        {
                                            title: <div className="title-text">품목명[규격]</div>,
                                            dataIndex: 'productSummary',
                                            key: 'productSummary',
                                            align: 'center',
                                            render: (text) => <div className="small-text">{text}</div>

                                        },
                                        {
                                            title: <div className="title-text">조정 수량</div>,
                                            dataIndex: 'totalDifferenceQuantity',
                                            key: 'totalDifferenceQuantity',
                                            align: 'center',
                                            render: (text) => <div className="small-text">{text}</div>
                                        },
                                        {
                                            title: <div className="title-text">조정 전표</div>,
                                            dataIndex: 'adjustmentSlip',
                                            key: 'adjustmentSlip',
                                            align: 'center',
                                            render: (text) => <div className="small-text">{text}</div>
                                        },
                                        {
                                            title: <div className="title-text">적요</div>,
                                            dataIndex: 'comments',
                                            key: 'comments',
                                            align: 'center',
                                            render: (text) => <div className="small-text">{text}</div>,
                                        }
                                    ]}
                                    rowKey="id"
                                    pagination={{pageSize: 15, position: ['bottomCenter']}}
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
                                                const response = await apiClient.post(LOGISTICS_API.INVENTORY_INSPECTION_DETAIL_API(id));
                                                console.log(response.data);
                                                setDetailInspectionData(response.data);
                                                setEditInspection(true);
                                                notify('success', '실사 조회', '실사 정보 조회 성공.', 'bottomRight')
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
                    {editInspection && (
                        <Grid item xs={12} md={12} sx={{minWidth: '1000px !important', maxWidth: '1500px !important'}}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{height: '100%'}}>
                                    <Typography variant="h6" sx={{padding: '20px'}}>재고 실사 정보</Typography>
                                    <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                        <Form
                                            initialValues={detailInspectionData}
                                            form={form}
                                            onFinish={(values) => {
                                                handleFormSubmit(values, 'update');
                                            }}
                                        >
                                            {/* 기초 정보 */}
                                            <Divider orientation={'left'} orientationMargin="0"
                                                     style={{marginTop: '0px', fontWeight: 600}}>
                                                기초 정보
                                            </Divider>
                                            <Row gutter={16}>
                                                <Col span={6}>
                                                    <Form.Item
                                                        name="inspectionDate"
                                                        rules={[{required: true, message: '실사 날짜를 입력하세요.'}]}
                                                    >
                                                        <Input addonBefore="실사 날짜"/>
                                                        {/*<DatePicker placeholder="실사 날짜 선택" format=" YYYY-MM-DD"/>*/}
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        name=" inspectionNumber"
                                                        rules={[{required: true, message: '실사 번호를 입력하세요.'}]}
                                                    >
                                                        <Input addonBefore=" 실사 번호" disabled={true}/>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        name=" employeeName"
                                                        rules={[{required: true, message: '담당자명을 입력하세요.'}]}
                                                    >
                                                        <Input addonBefore=" 담당자명"
                                                               onDoubleClick={() => handleInputClick('employeeName')}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item name=" employeeId" hidden>
                                                        <Input/>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        name=" warehouseName"
                                                        rules={[{required: true, message: '창고명을 입력하세요.'}]}
                                                    >
                                                        <Input addonBefore=" 창고명"
                                                               onDoubleClick={() => handleInputClick('warehouseName')}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item name=" warehouseId" hidden>
                                                        <Input/>
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            {/* 실사 품목 정보 */}
                                            <Divider orientation={'left'} orientationMargin="0"
                                                     style={{marginTop: '0px', fontWeight: 600}}>
                                                실사 품목 정보
                                            </Divider>

                                            <Form.List name="details">
                                                {(fields, {add, remove}) => (
                                                    <>
                                                        {fields.map(({key, name, ...restField}, index) => (
                                                            <Row gutter={16} key={key}
                                                                 style={{marginBottom: '10px'}}>
                                                                <Col span={6}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'productCode']}
                                                                    >
                                                                        <Input addonBefore="품목 코드"
                                                                               onDoubleClick={() => handleInputClick('productCode', index)}/>
                                                                    </Form.Item>
                                                                    <Form.Item name={[name, 'productId']}
                                                                               hidden>
                                                                        <Input/>
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={6}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'productName']}
                                                                    >
                                                                        <Input addonBefore="품목명"/>
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={6}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'standard']}
                                                                    >
                                                                        <Input addonBefore="규격"/>
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={6}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'unit']}
                                                                    >
                                                                        <Input addonBefore="단위"/>
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={6}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'warehouseLocationName']}
                                                                    >
                                                                        <Input addonBefore="창고 위치"/>
                                                                    </Form.Item>
                                                                    <Form.Item
                                                                        name={[name, 'warehouseLocationId']}
                                                                        hidden>
                                                                        <Input/>
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={6}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'actualQuantity']}
                                                                    >
                                                                        <Input addonBefore="실사 수량"/>
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={10}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'comment']}
                                                                    >
                                                                        <Input addonBefore="비고"/>
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={2} style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'flex-end'
                                                                }}>
                                                                    <Button type="danger" onClick={() => remove(name)}>삭제</Button>
                                                                </Col>
                                                            </Row>
                                                        ))}
                                                        <Form.Item>
                                                            <Button type="dashed" onClick={() => add()} block>
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
                                                                            component="h2"
                                                                            sx={{marginBottom: '20px'}}>
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
                                                                                title: <div
                                                                                    className="title-text">사번</div>,
                                                                                dataIndex: 'employeeNumber',
                                                                                key: 'employeeNumber',
                                                                                align: 'center',
                                                                                render: (text) => <div
                                                                                    className="small-text">{text}</div>,
                                                                            },
                                                                            {
                                                                                title: <div
                                                                                    className="title-text">이름</div>,
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
                                                                            component="h2"
                                                                            sx={{marginBottom: '20px'}}>
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
                                                                                title: <div
                                                                                    className="title-text">창고
                                                                                    코드</div>,
                                                                                dataIndex: 'code',
                                                                                key: 'code',
                                                                                align: 'center',
                                                                                render: (text) => <div
                                                                                    className="small-text">{text}</div>,
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
                                                                                title: <div
                                                                                    className="title-text">창고
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
                                                                            component="h2"
                                                                            sx={{marginBottom: '20px'}}>
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
                                                                                title: <div
                                                                                    className="title-text">품목
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
                                                                                title: <div
                                                                                    className="title-text">로케이션
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

                                                        <Box sx={{
                                                            mt: 2,
                                                            display: 'flex',
                                                            justifyContent: 'flex-end'
                                                        }}>
                                                            <Button onClick={handleModalCancel}
                                                                    variant="contained"
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

export default InspectionInquiryPage;