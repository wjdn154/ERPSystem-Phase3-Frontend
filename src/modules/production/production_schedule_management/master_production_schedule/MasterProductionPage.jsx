import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './MasterProductionUtil.jsx';
import {Typography} from '@mui/material';
import {
    Space,
    Button,
    DatePicker,
    Form,
    Input,
    Modal,
    Spin,
    Table,
    Tag,
    Tooltip,
    Col,
    Row,
    Divider,
    Select, message
} from 'antd';import TemporarySection from "../../../../components/TemporarySection.jsx";
import dayjs from "dayjs";
import {
    BookOutlined, CheckCircleOutlined, CheckOutlined,
    DownSquareOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined, ReloadOutlined, SafetyCertificateOutlined,
    SearchOutlined
} from "@ant-design/icons";
const { RangePicker } = DatePicker;
const { Option } = Select;
import apiClient from "../../../../config/apiClient.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {LOGISTICS_API, PRODUCTION_API} from "../../../../config/apiConstants.jsx";
const { confirm } = Modal;

const MasterProductionPage = () => {
    const [mpsList, setMpsList] = useState([]);
    const [filteredMpsList, setFilteredMpsList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [requestList, setRequestList] = useState([]); // 생산의뢰 리스트
    const [mpsDetail, setMpsDetail] = useState(null);
    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [form] = Form.useForm();
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [isLoading, setIsLoading] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [selectedValue, setSelectedValue] = useState({});
    const [currentField, setCurrentField] = useState('');
    const [currentMps, setCurrentMps] = useState('');
    // 검색 조건
    const [searchParams, setSearchParams] = useState({
        product: '',
        request: '',
        status: '',
        planDate: null,
        startDate: null,
        endDate: null,
    });

    useEffect(() => {
        fetchMpsList();
    }, []);

    const confirmMps = async (id) => {
        try {
            await apiClient.post(PRODUCTION_API.MPS_CONFIRM(id));
            notify('success', '확정 성공', 'MPS가 확정되었습니다.', 'bottomRight');
            fetchMpsList(); // 목록 새로고침
        } catch (error) {
            console.error('API 호출 오류:', error);
            notify('error', '확정 실패', 'MPS를 확정하는 데 실패했습니다.', 'top');
        }
    };

    // fieldName에 따라 API를 호출하여 모달 데이터를 가져옴
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;

        if (fieldName === 'product') apiPath = LOGISTICS_API.PRODUCT_LIST_API;
        else if (fieldName === 'request') apiPath = PRODUCTION_API.PRODUCTION_REQUEST_LIST_API;

        try {
            const response = await apiClient.post(apiPath);
            setModalData(response.data); // 모달에 표시할 데이터 설정
            console.log('setModalData 응답 데이터:', response.data);

        } catch (error) {
            console.error('setModalData API 호출 오류:', error);
            notify('error', '조회 실패', '데이터를 불러오는 데 실패했습니다.', 'top');

        } finally {
            setIsLoading(false);
        }
    };

    const getDisplayValue = (field, record) => {
        switch (field) {
            case 'request':
                return `${record.requestType}${record.name}`;
            case 'product':
                return `[${record.code}] ${record.name}`;
            default:
                return '';
        }
    };

    const handleModalSelect = (record) => {
        const selectedValueStr = getDisplayValue(currentField, record);

        setSelectedValue((prev) => ({ ...prev, [currentField]: selectedValueStr }));
        setSearchParams((prev) => ({ ...prev, [currentField]: selectedValueStr }));
        console.log(`선택한 ${currentField}:`, selectedValueStr);

        // setTimeout을 사용해서 상태 갱신 후 필터링 수행
        setTimeout(() => {
            console.log("모달에서 선택된 후의 searchParams:", searchParams);
            // 이 시점에서 필터링을 다시 수행하거나, 필터링 로직을 확인할 수 있습니다.
        }, 0);

        setIsModalVisible(false);
    };


    const handleModalCancel = () => {
        setIsModalVisible(false);
        setCurrentField(null);
        setCurrentMps(null);
    }

    useEffect(() => {
        // selectedValue가 변경될 때마다 폼 필드에 반영
        form.setFieldsValue(selectedValue);
    }, [selectedValue, form]);

    useEffect(() => {
        if (modalData && modalData.length > 0) {
            // 데이터가 로드된 후에 필터링을 수행합니다.
            const filteredData = modalData.filter((item) => {
                const matchProduct = !searchParams.product ||
                    (item.name && item.name.toLowerCase().includes(searchParams.product.toLowerCase().trim()));
                const matchRequest = !searchParams.request ||
                    (item.requestName && item.requestName.toLowerCase().includes(searchParams.request.toLowerCase().trim()));
                return matchProduct && matchRequest;
            });

            console.log("필터링된 데이터:", filteredData);
            setFilteredMpsList(filteredData);
        }
    }, [modalData, searchParams]);



    // 입력 필드 클릭 시 모달 열기
    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setCurrentMps(null);

        setModalData(null); // 모달 열기 전에 데이터를 초기화
        // setInitialModalData(null);
        fetchModalData(fieldName);  // 모달 데이터 가져오기 호출
        fetchMpsList(fieldName);
        setIsModalVisible(true);  // 모달창 열기
    };

    const handleProductAndRequestSearch = async () => {
        console.log("Product and Request Search initiated with searchParams:", searchParams);

        if (!modalData || modalData.length === 0) {
            console.error("modalData가 비어 있습니다. 데이터 구조를 확인하세요.");
        }


        // 제품 또는 생산의뢰 데이터 비동기 로드 및 검색 필터링
        if (searchParams.product) {
            await fetchModalData('product');
        }
        if (searchParams.request) {
            await fetchModalData('request');
        }

        console.log("searchParams:", searchParams);
        console.log("modalData:", modalData);

        // 모달 데이터가 로드된 후 필터링
        const filteredData = modalData.filter((item) => {
            // const matchProduct = !searchParams.product ||
            //     (item.name && item.name.toLowerCase().includes(searchParams.product.toLowerCase()));
            // // searchParams의 request 값이 존재하지 않거나 비어 있을 때 필터링을 수행하지 않도록 조건을 추가 => request가 undefined일 때에도 필터링 과정에서 오류가 발생하지 않도록
            //
            // const matchRequest = !searchParams.request ||
            //     (item.requestName && item.requestName.toLowerCase().includes(searchParams.request.toLowerCase()));

            const matchProduct = !searchParams.product ||
                (item.name && item.name.toLowerCase().includes(searchParams.product.toLowerCase().trim()));

            const matchRequest = !searchParams.request ||
                (item.requestName && item.requestName.toLowerCase().includes(searchParams.request.toLowerCase().trim()));


            // const matchRequest = !searchParams.request || (
            //     item.requestName &&
            //     searchParams.request &&
            //     item.requestName.toLowerCase().includes(searchParams.request.toLowerCase())
            // );


            return matchProduct && matchRequest;
        });

        console.log("필터링한 제품 및 생산의뢰::", filteredData);
        setFilteredMpsList(filteredData);
    };

    const handleBasicFieldSearch = () => {
        console.log("기본 필드 검색조건 initiated with searchParams:", searchParams);

        const { status, planDate, startDate, endDate } = searchParams;

        const filteredData = mpsList.filter((item) => {
            const matchStatus = !status || item.status === status;
            const matchPlanDate = !planDate || (item.planDate && dayjs(item.planDate).isBetween(planDate[0], planDate[1], 'day', '[]'));
            const matchStartDate = !startDate || (item.startDate && dayjs(item.startDate).isBetween(startDate[0], startDate[1], 'day', '[]'));
            const matchEndDate = !endDate || (item.endDate && dayjs(item.endDate).isBetween(endDate[0], endDate[1], 'day', '[]'));

            return matchStatus && matchPlanDate && matchStartDate && matchEndDate;
        });

        console.log("기본 필드 검색 데이터:", filteredData);
        setFilteredMpsList(filteredData);
    };

    const handleSearch = async () => {
        await handleProductAndRequestSearch();
        handleBasicFieldSearch();
    }

    // 검색 필드를 초기화하는 함수
    const handleResetSearch = () => {
        setSearchParams({
            product: '',
            request: '',
            status: '',
            planDate: null,
            startDate: null,
            endDate: null,
        }); // 초기 상태로 검색 조건을 리셋합니다.

        form.resetFields();  // 폼 필드를 초기화합니다.
        // 폼 필드에 초기값 강제 설정 (입력 필드에 표시되는 값 제거)
        form.setFieldsValue({
            product: '',
            request: '',
            status: '',
            planDate: null,
            startDate: null,
            endDate: null,
        });

        fetchMpsList();      // 초기 조건으로 데이터 조회
    };

    // 확정 모달 표시 함수
    const showConfirmModal = (record) => {
        // 계획 상태가 "계획"일 때만 모달을 띄움
        if (record.status.toLowerCase() !== "계획") {
            notify('error', '처리 오류', "확정 처리는 상태 '계획'만 가능합니다.", 'top');
            return;
        }
        // 상태 값 로그로 확인
        console.log('현재 상태:', record.status);

        confirm({
            title: '생산계획을 확정하시겠습니까?',
            icon: <ExclamationCircleOutlined />,
            content: '확정을 진행하면 더 이상 수정이 불가능합니다.',
            onOk() {
                confirmMps(record.id); // 확정 진행
            },
            onCancel() {
                console.log('확정 취소됨');
            },
        });
    };

    // 초기 데이터 조회 함수
    const fetchMpsList = async () => {
        try {
            const response = await apiClient.post(PRODUCTION_API.MPS_LIST_API, {
                searchDate: dayjs().format('YYYY-MM-DD'),
            });
            setMpsList(response.data);
            notify('success', '조회 성공', '데이터 조회 성공.', 'bottomRight');
            console.log('응답 데이터:', response.data);

        } catch (error) {
            console.error('API 호출 오류:', error);
            notify('error', '조회 실패', '데이터를 불러오는 데 실패했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMpsDetail = async (id) => {
        try {
            const response = await apiClient.post(PRODUCTION_API.MPS_DETAIL_ID(id));
            notify('success', '조회 성공', '데이터 조회 성공', 'bottomRight');
            console.log('상세조회 데이터:', response.data);

        } catch (error) {
            console.error('API 호출 오류:', error);
            notify('error', '조회 실패', '데이터를 불러오는 데 실패했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };


    // MPS 생성 함수
    const createMps = async (values) => {
        try {
            const response = await apiClient.post(PRODUCTION_API.MPS_CREATE, values);
            notify('success', '저장 성공', '데이터 저장 성공.', 'bottomRight');
            fetchMpsList(); // 목록 새로고침
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            notify('error', '저장 실패', '데이터를 저장하는 데 실패했습니다.', 'top');
        }
    };

    // MPS 업데이트 함수
    const updateMps = async (id, values) => {
        try {
            const response = await apiClient.post(PRODUCTION_API.MPS_UPDATE(id), values);
            notify('success', '저장 성공', '데이터 저장 성공.', 'bottomRight');
            fetchMpsList(); // 목록 새로고침
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            notify('error', '저장 실패', '데이터를 저장하는 데 실패했습니다.', 'top');
        }
    };

    // MPS 삭제 함수
    const deleteMps = async (id) => {
        try {
            await apiClient.post(PRODUCTION_API.MPS_DELETE(id));
            notify('success', '삭제 성공', '데이터 삭제 성공.', 'bottomRight');
            fetchMpsList(); // 목록 새로고침
        } catch (error) {
            notify('error', '삭제 실패', '데이터를 삭제하는 데 실패했습니다.', 'top');
        }
    };

    // MPS 완료 처리 함수
    const completeMps = async (id) => {
        try {
            await apiClient.post(PRODUCTION_API.MPS_COMPLETE(id));
            notify('success', '처리 성공', '데이터 완료 처리 성공.', 'bottomRight');
            fetchMpsList(); // 목록 새로고침
        } catch (error) {
            notify('error', '처리 실패', '데이터를 완료 처리하는 데 실패했습니다.', 'top');
        }
    };

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    const columns = [
        {
            title: <div className="title-text">계획명</div>,
            dataIndex: 'name',
            key: 'name',
            align:'center',
        },
        {
            title: <div className="title-text">계획수립일</div>,
            dataIndex: 'planDate',
            key: 'planDate',
            align:'center',
            render: (date) => dayjs(date).format('YYYY-MM-DD'),
        },
        {
            title: <div className="title-text">생산시작일</div>,
            dataIndex: 'startDate',
            key: 'startDate',
            align:'center',
            render: (date) => dayjs(date).format('YYYY-MM-DD'),
        },
        {
            title: <div className="title-text">완료예정일</div>,
            dataIndex: 'endDate',
            key: 'endDate',
            align:'center',
            render: (date) => dayjs(date).format('YYYY-MM-DD'),
        },
        {
            title: <div className="title-text">계획상태</div>,
            dataIndex: 'status',
            key: 'status',
            align:'center',
            render: (status) => {
                let color = '';
                switch (status) {
                    case '등록':
                        color = 'blue';
                        break;
                    case '진행 중':
                        color = 'orange';
                        break;
                    case '확정':
                        color = 'green';
                        break;
                    case '완료':
                        color = 'gold';
                        break;
                    default:
                        color = 'default';
                        break;
                }
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: <div className="title-text">생산수량</div>,
            dataIndex: 'quantity',
            key: 'quantity',
            align:'center',
        },
        {
            title: <div className="title-text">처리</div>,
            key: 'action',
            align:'center',
            render: (_, record) => (
                <Button
                    type="default"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    // icon={<SafetyCertificateOutlined />}
                    // icon={<CheckOutlined />}
                    onClick={() => showConfirmModal(record.id)}
                    style={{
                        height: '24px',
                        padding: '0 8px',
                        lineHeight: '1',
                    }}
                >
                    확정
                </Button>
            ),
        },
    ];


    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="주생산계획(MPS)"
                        description={(
                            <Typography>
                                주생산계획 관리 페이지는 <span>전체 생산 흐름을 체계적으로 계획하고 관리</span>하는 곳임. 이 페이지에서는 <span>월별, 분기별 생산 목표</span>를 설정하고, 각 기간에 맞춘 생산 계획을 세울 수 있음. 주생산계획은 <span>전체적인 생산 용량과 자재 공급 상황</span>을 고려하여 수립되며, 이를 통해 <span>효율적인 생산 일정</span>을 유지할 수 있음.
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
                    <Grid item xs={12} md={10} sx={{ minWidth: '1000px !important', maxWidth: '1200px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >주생산계획 목록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form layout="vertical">
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item name="product" label="제품 선택">
                                                    <Input
                                                        placeholder="제품 선택"
                                                        onClick={() => handleInputClick('product')}
                                                        value={searchParams.product}
                                                        // value={selectedValue.product} // 선택한 값 표시
                                                        onFocus={(e) => e.target.blur()}
                                                        onChange={(e) => {
                                                            console.log('입력된 제품명:', e.target.value); // 콘솔 로그 추가
                                                            setSearchParams((prev) => ({ ...prev, product: e.target.value }));
                                                        }}
                                                        suffix={<DownSquareOutlined />}

                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="request" label="생산 의뢰 선택">
                                                    <Input
                                                        placeholder="생산 의뢰 선택"
                                                        onClick={() => handleInputClick('request')}
                                                        value={searchParams.request}
                                                        // value={selectedValue.product} // 선택한 값 표시

                                                        onFocus={(e) => e.target.blur()}
                                                        onChange={(e) => {
                                                            console.log('입력된 생산 의뢰:', e.target.value); // 콘솔 로그 추가
                                                            setSearchParams((prev) => ({ ...prev, request: e.target.value }));
                                                        }}
                                                        suffix={<DownSquareOutlined />}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item label="확정 여부" tooltip="확정 여부를 선택하세요">
                                                    <Select
                                                        placeholder="확정 여부"
                                                        value={searchParams.isConfirmed}
                                                        onChange={(value) => {
                                                            setSearchParams((prev) => ({
                                                                ...prev,
                                                                isConfirmed: value,
                                                            })); // 상태를 업데이트합니다.

                                                            form.setFieldsValue({ isConfirmed: value }); // 폼 필드 동기화
                                                        }}
                                                    >
                                                        <Select.Option value={true}>확정됨</Select.Option>
                                                        <Select.Option value={false}>미확정</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item label="계획 상태" tooltip="검색할 진행 상태를 선택하세요">
                                                    <Select
                                                        placeholder="계획 상태 선택"
                                                        value={searchParams.status || undefined}
                                                        onChange={(value) => {
                                                            setSearchParams((prev) => ({
                                                                ...prev,
                                                                status: value,
                                                            })); // 상태를 업데이트합니다.

                                                            form.setFieldsValue({ status: value }); // 폼 필드 동기화
                                                        }}
                                                    >
                                                        <Select.Option value="Created">등록</Select.Option>
                                                        <Select.Option value="In Progress">진행 중</Select.Option>
                                                        <Select.Option value="Completed">완료</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item label="계획 수립일" name="planDate">
                                                    <RangePicker
                                                        value={
                                                            searchParams.planDate
                                                                ? [dayjs(searchParams.planDate[0]), dayjs(searchParams.planDate[1])]
                                                                : [] // 초기화 시 빈 배열로 표시
                                                        }
                                                        onChange={(dates) => {
                                                            const formattedDates = dates ? dates.map((date) => date.format('YYYY-MM-DD')) : [];
                                                            console.log('선택한 계획 수립일:', formattedDates); // 콘솔 로그 추가
                                                            setSearchParams((prev) => ({ ...prev, planDate: formattedDates }));

                                                        }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item label="생산 시작일" name="startDate">
                                                    <RangePicker
                                                        value={
                                                            searchParams.startDate
                                                                ? [dayjs(searchParams.startDate[0]), dayjs(searchParams.startDate[1])]
                                                                : []
                                                        }
                                                        onChange={(dates) => {
                                                            const formattedDates = dates ? dates.map((date) => date.format('YYYY-MM-DD')) : [];
                                                            console.log('선택한 생산 시작일:', formattedDates); // 콘솔 로그 추가
                                                            setSearchParams((prev) => ({ ...prev, startDate: formattedDates }));

                                                        }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item label="생산완료 예정일" name="endDate">
                                                    <RangePicker
                                                        value={
                                                            searchParams.endDate
                                                                ? [dayjs(searchParams.endDate[0]), dayjs(searchParams.endDate[1])]
                                                                : []
                                                        }
                                                        onChange={(dates) => {
                                                            const formattedDates = dates ? dates.map((date) => date.format('YYYY-MM-DD')) : [];
                                                            console.log('선택한 생산완료 예정일:', formattedDates); // 콘솔 로그 추가
                                                            setSearchParams((prev) => ({ ...prev, endDate: formattedDates }));

                                                        }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6} style={{ display: 'flex', alignItems: 'end' }}>
                                                <Form.Item>
                                                    <Button
                                                        type="primary"
                                                        icon={<SearchOutlined />}
                                                        onClick={() => {
                                                            console.log('검색 버튼 클릭됨');
                                                            handleSearch(); // 검색 함수 호출
                                                        }}
                                                    >
                                                        검색
                                                    </Button>
                                                    <Button
                                                        type="default"
                                                        icon={<ReloadOutlined />}
                                                        onClick={() => {
                                                            console.log('초기화 버튼 클릭됨');
                                                            handleResetSearch(); // 검색 함수 호출
                                                        }}
                                                        style={{ marginLeft: '8px' }}
                                                    >
                                                        초기화
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Modal
                                            open={isModalVisible}
                                            onCancel={handleModalCancel}
                                            width="40vw"
                                            footer={null}
                                        >
                                            {isLoading ? (
                                                <Spin /> // 로딩 스피너
                                            ) : (
                                                <>
                                                    {currentField === 'product' && (
                                                        <>
                                                            <Typography variant="h6" sx={{ marginBottom: '20px' }}>
                                                                제품 선택
                                                            </Typography>
                                                            <Input
                                                                placeholder="검색"
                                                                prefix={<SearchOutlined />}
                                                                onChange={(e) => {
                                                                    const value = e.target.value.toLowerCase();
                                                                    const filtered = initialModalData.filter((item) =>
                                                                        item.name.toLowerCase().includes(value) ||
                                                                        item.code.toLowerCase().includes(value)
                                                                    );
                                                                    setModalData(filtered);
                                                                }}
                                                                style={{ marginBottom: 16 }}
                                                            />
                                                            <Table
                                                                columns={[
                                                                    { title: '코드', dataIndex: 'code', key: 'id', align: 'center' },
                                                                    { title: '제품명', dataIndex: 'name', key: 'name', align: 'center' },
                                                                ]}
                                                                dataSource={modalData}
                                                                rowKey="id"
                                                                size="small"
                                                                pagination={{ pageSize: 15, showSizeChanger: false }}
                                                                onRow={(record) => ({
                                                                    onClick: () => handleModalSelect(record),
                                                                })}
                                                            />
                                                        </>
                                                    )}
                                                    {currentField === 'request' && (
                                                        <>
                                                            <Typography variant="h6" sx={{ marginBottom: '20px' }}>
                                                                생산의뢰 선택
                                                            </Typography>
                                                            <Input
                                                                placeholder="검색"
                                                                prefix={<SearchOutlined />}
                                                                onChange={(e) => {
                                                                    const value = e.target.value.toLowerCase();
                                                                    const filtered = initialModalData.filter((item) =>
                                                                        item.name.toLowerCase().includes(value) ||
                                                                        item.requestType.toLowerCase().includes(value)
                                                                    );
                                                                    console.log("생산의뢰 선택", setModalData(filtered));
                                                                    setModalData(filtered);
                                                                }}
                                                                style={{ marginBottom: 16 }}
                                                            />
                                                            <Table
                                                                columns={[
                                                                    { title: '의뢰구분', dataIndex: 'requestType', key: 'requestType', align: 'center',
                                                                        render: (text) => ({
                                                                            'Mass Production': '양산',
                                                                            'Pilot Production': '시험 양산',
                                                                            'Urgent Order': '특급 수주',
                                                                            'Sample': '샘플',
                                                                            'PMS': 'PMS',
                                                                        }[text] || text), // 매핑되지 않으면 원본 값 표시
                                                                    },
                                                                    { title: '의뢰명', dataIndex: 'name', key: 'name', align: 'center' },
                                                                    { title: '진행상태', dataIndex: 'progressType', key: 'progressType', align: 'center',
                                                                        render: (text) => ({
                                                                            'Created': '등록',
                                                                            'In Progress': '진행 중',
                                                                            'Not Started': '미진행',
                                                                            'Halted': '중단',
                                                                            'Completed': '완료',
                                                                            'Incomplete': '미완료',
                                                                        }[text] || text), // 매핑되지 않으면 원본 값 표시
                                                                    },
                                                                    { title: '요청등록일', dataIndex: 'requestDate', key: 'requestDate', align: 'center' },
                                                                    { title: '완료요청일', dataIndex: 'deadlineOfCompletion', key: 'deadlineOfCompletion', align: 'center' },
                                                                    { title: '납기일', dataIndex: 'dueDateToProvide', key: 'dueDateToProvide', align: 'center' },
                                                                    { title: '요청수량', dataIndex: 'requestQuantity', key: 'requestQuantity', align: 'center' },
                                                                    // { title: '확정여부', dataIndex: 'isConfirmed', key: 'isConfirmed', align: 'center' },
                                                                ]}
                                                                dataSource={modalData}
                                                                rowKey="id"
                                                                size="small"
                                                                pagination={{ pageSize: 15, showSizeChanger: false }}
                                                                onRow={(record) => ({
                                                                    onClick: () => handleModalSelect(record),
                                                                })}
                                                            />
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </Modal>

                                    </Form>
                                </Grid>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Table
                                        columns={columns}
                                        dataSource={mpsList}
                                        rowKey="id"
                                        size="small"
                                        pagination={{
                                            pageSize: 15,
                                            position: ['bottomCenter'], // 페이지네이션을 중앙에 배치
                                        }}
                                        rowSelection={{
                                            type: 'radio',
                                            selectedRowKeys,
                                            onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
                                        }}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: () => {
                                                setSelectedRowKeys([record.id]);
                                                fetchMpsDetail(record.id);
                                            },
                                        })}
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}


            {/*{activeTabKey === '2' && (*/}
            {/*    <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>*/}
            {/*        <Grid item xs={12} md={5} sx={{ minWidth: '500px !important', maxWidth: '700px !important' }}>*/}
            {/*            <Grow in={true} timeout={200}>*/}
            {/*                <div>*/}
            {/*                    <TemporarySection />*/}
            {/*                </div>*/}
            {/*            </Grow>*/}
            {/*        </Grid>*/}
            {/*    </Grid>*/}
            {/*)}*/}
        </Box>
    );
};

export default MasterProductionPage;