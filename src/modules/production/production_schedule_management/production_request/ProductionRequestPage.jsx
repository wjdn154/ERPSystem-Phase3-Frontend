import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './ProductionRequestUtil.jsx';
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
    Select
} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import {
    EMPLOYEE_API,
    FINANCIAL_API as HUMAN_API,
    FINANCIAL_API, LOGISTICS_API,
    PRODUCTION_API
} from "../../../../config/apiConstants.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import dayjs from "dayjs";
import {BookOutlined, DownSquareOutlined, InfoCircleOutlined, ReloadOutlined, SearchOutlined} from "@ant-design/icons";
const { RangePicker } = DatePicker;
const { Option } = Select;

const ProductionRequestPage = () => {
    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [form] = Form.useForm(); // 폼 인스턴스 생성
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [isLoading, setIsLoading] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [currentRequest, setCurrentRequest] = useState('');
    const [searchParams, setSearchParams] = useState({
        startRequestDate: null,
        endRequestDate: null,
        requestName: '',
        requestType: '',
        progressType: '',
        isConfirmed: undefined,
    });

    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [selectedValue, setSelectedValue] = useState({});

    const [productionRequests, setProductionRequests] = useState(null);
    const [productionRequestDetail, setProductionRequestDetail] = useState(null);
    const [productionRequestParam, setProductionRequestParam] = useState(false); //

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    // 모달창 데이터 가져오기 함수
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;
        if(fieldName === 'client') apiPath = FINANCIAL_API.FETCH_CLIENT_LIST_API;
        if(fieldName === 'department') apiPath = EMPLOYEE_API.DEPARTMENT_DATA_API;
        if(fieldName === 'requester') apiPath = EMPLOYEE_API.EMPLOYEE_DATA_API;
        if(fieldName === 'product') apiPath = LOGISTICS_API.PRODUCT_LIST_API;

        if (!apiPath) {
            console.error(`올바른 API 경로 또는 메서드가 없습니다: ${fieldName}`);
            setIsLoading(false); // 로딩 상태 해제
            return;
        }

        try {
            const response = await apiClient.post(apiPath);
            setModalData(response.data);
            setInitialModalData(response.data);
            console.log('response.data', response.data);
        } catch (error) {
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };

    // 입력 필드 클릭 시 모달 열기
    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setCurrentRequest(null);

        setModalData(null); // 모달 열기 전에 데이터를 초기화
        setInitialModalData(null);
        fetchModalData(fieldName);  // 모달 데이터 가져오기 호출
        fetchProductionRequests(fieldName);
        setIsModalVisible(true);  // 모달창 열기


    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setCurrentField(null);
        setCurrentRequest(null);
    }

    const getDisplayValue = (field, record) => {
        switch (field) {
            case 'client':
                return `${record.printClientName} (${record.representativeName})`;
            case 'department':
                return `[${record.departmentCode}] ${record.departmentName}`;
            case 'requester':
                return `${record.lastName}${record.firstName}(${record.departmentName}, ${record.titleName})`;
            case 'product':
                return `[${record.code}] ${record.name}`;
            default:
                return '';
        }
    };


    const handleModalSelect = (record) => {
        const selectedValue = getDisplayValue(currentField, record); // 선택한 값을 문자열로 조합

        setSelectedValue((prev) => ({ ...prev, [currentField]: selectedValue })); // 상태 업데이트
        form.setFieldsValue({ [currentField]: selectedValue }); // 폼 필드에 값 설정

        console.log(`선택한 ${currentField}: `, selectedValue);  // 디버깅용 로그
        setIsModalVisible(false); // 모달 닫기
    };

    // 상세 조회 후 데이터를 폼에 설정하는 부분
    useEffect(() => {
        if (productionRequestDetail) {
            form.resetFields(); // 기존 필드 초기화
            // ㄴ 데이터가 비동기적으로 조회될 때, 폼이 완전히 마운트되지 않았거나 해당 필드가 설정되지 않았을 수 있어서
            form.setFieldsValue({
                ...productionRequestDetail,
                client: `[${productionRequestDetail.clientCode}] ${productionRequestDetail.clientName}`,
                department: productionRequestDetail.departmentCode
                    ? `[${productionRequestDetail.departmentCode}] ${productionRequestDetail.departmentName}`
                    : undefined,
                product: `[${productionRequestDetail.productGroupCode}-${productionRequestDetail.productCode}] ${productionRequestDetail.productName}`,
                requester: `${productionRequestDetail.requesterName} (${productionRequestDetail.requesterEmployeeNumber})`,
                requestDate: productionRequestDetail.requestDate ? dayjs(productionRequestDetail.requestDate) : null,
                deadlineOfCompletion: productionRequestDetail.deadlineOfCompletion ? dayjs(productionRequestDetail.deadlineOfCompletion) : null,
                dueDateToProvide: productionRequestDetail.dueDateToProvide ? dayjs(productionRequestDetail.dueDateToProvide) : null,
                requestQuantity: productionRequestDetail.requestQuantity || '',
                confirmedQuantity: productionRequestDetail.confirmedQuantity || '',
                remarks: productionRequestDetail.remarks || '',
                requestType: productionRequestDetail.requestType,
                progressType: productionRequestDetail.progressType,
                isConfirmed: productionRequestDetail.isConfirmed,
            });
        }
    }, [productionRequestDetail, form]);


    // 폼 제출 핸들러
    const handleFormSubmit = async (values, type) => {
        console.log('폼 제출 값:', values); // 폼 데이터 확인

        if (typeof values !== 'object') {
            console.error('Error: values가 객체가 아닙니다', values);
            return;
        }

        Modal.confirm({
            title: '저장 확인',
            content: '정말로 저장하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                try {
                    // API 경로 선택 (저장 / 업데이트)
                    const API_PATH = type === 'update'
                        ? PRODUCTION_API.PRODUCTION_REQUEST_UPDATE_API(values.id)
                        : PRODUCTION_API.PRODUCTION_REQUEST_CREATE_API;

                    // 필수 필드 검증
                    if (!values.requestType || !values.product) {
                        notify('error', '저장 실패', '의뢰구분, 제품을 선택해주세요.', 'top');
                        return;
                    }

                    // 불필요한 값 정리 및 변환
                    const preparedValues = {
                        ...values, // 폼에서 받은 모든 값 복사
                        requestQuantity: parseInt(values.requestQuantity, 10), // 요청 수량을 정수로 변환
                        confirmedQuantity: parseInt(values.confirmedQuantity, 10), // 확정 수량을 정수로 변환
                        isConfirmed: !!values.isConfirmed, // 확정 여부를 명시적 boolean 값으로 변환
                        requestDate: values.requestDate ? values.requestDate.format('YYYY-MM-DD') : null, // 날짜 포맷
                        deadlineOfCompletion: values.deadlineOfCompletion ? values.deadlineOfCompletion.format('YYYY-MM-DD') : null,
                        dueDateToProvide: values.dueDateToProvide ? values.dueDateToProvide.format('YYYY-MM-DD') : null,
                        departmentCode: values.department ? values.department.split('] ')[0].replace('[', '') : null, // 부서 코드 추출
                        departmentName: values.department ? values.department.split('] ')[1] : null, // 부서명 추출
                    };
                    console.log('preparedValues 전송할 데이터:', preparedValues); // API로 전송할 데이터 확인

                    // API 호출
                    const response = await apiClient.post(API_PATH, preparedValues);
                    const updatedRequest = response.data;

                    console.log('updatedRequest 응답 데이터:', updatedRequest); // API 응답 데이터 확인

                    // 성공 알림 및 상태 업데이트
                    setProductionRequests((prev) =>
                        type === 'update'
                            ? prev.map((req) => (req.id === updatedRequest.id ? updatedRequest : req))
                            : [...prev, updatedRequest]
                    );

                    notify(
                        'success',
                        type === 'update' ? '의뢰 수정 성공' : '의뢰 저장 성공',
                        '생산 의뢰가 성공적으로 저장되었습니다.',
                        'bottomRight'
                    );

                    // 폼 초기화 (필요할 경우)
                    // form.resetFields();
                    handleModalCancel(); // 모달 닫기

                } catch (error) {
                    console.error('저장 실패:', error);
                    notify('error', '저장 실패', '데이터 저장 중 오류가 발생했습니다.', 'top');
                } finally {
                    setIsLoading(false);
                }
            },
            onCancel() {
                notify('warning', '저장 취소', '저장이 취소되었습니다.', 'bottomRight');
            },
        });
    };

    const fetchProductionRequests = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.post(PRODUCTION_API.PRODUCTION_REQUEST_LIST_API);
            console.log("응답 데이터:", response.data); // 응답 데이터 확인
            if (response.data && response.data.length > 0) {
                setProductionRequests(response.data); // 응답 데이터가 있으면 상태 갱신
            } else {
                console.warn("데이터가 없습니다.");
                setProductionRequests([]); // 빈 배열로 설정
            }
        } catch (error) {
            console.error("조회 오류:", error);
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProductionRequests()
    }, []);

    // 생산 의뢰 삭제
    const handleDelete = async (id) => {
        if (!id) {
            notify('warning', '삭제 오류', '삭제할 항목을 선택하세요.');
            return;
        }
        try {
            await apiClient.post(PRODUCTION_API.PRODUCTION_REQUEST_DELETE_API, { id });
            notify('success', '삭제 완료', '데이터가 삭제되었습니다.');
            fetchProductionRequests();
        } catch (error) {
            notify('error', '삭제 오류', '삭제 중 오류가 발생했습니다.');
        }
    };

    // 검색 처리
    const handleSearch = async () => {
        console.log("handleSearch searchParams 검색 조건:", searchParams);  // 검색 조건 확인
        const { startRequestDate, endRequestDate, requestName, requestType, progressType, isConfirmed } = searchParams;

        try {
            setIsLoading(true);
            const response = await apiClient.post(PRODUCTION_API.PRODUCTION_REQUEST_LIST_API);

            const filteredData = response.data.filter((item) => {
                const {
                    requestName, requestType, progressType, isConfirmed,
                    startRequestDate, endRequestDate,
                } = searchParams;

                // filtering conditions
                const matchName = !searchParams.requestName || item.name.toLowerCase().includes(searchParams.requestName.toLowerCase().trim());
                const matchType = !searchParams.requestType || item.requestType === searchParams.requestType;
                const matchProgress = !searchParams.progressType || item.progressType === searchParams.progressType;
                const matchConfirmed = searchParams.isConfirmed === undefined || item.isConfirmed === searchParams.isConfirmed;

                const matchStartDate =
                    !searchParams.startRequestDate ||
                    new Date(item.requestDate) >= new Date(searchParams.startRequestDate);

                const matchEndDate =
                    !searchParams.endRequestDate ||
                    new Date(item.requestDate) <= new Date(searchParams.endRequestDate);

                // const matchStartDate = !searchParams.startRequestDate || dayjs(item.requestDate).isSameOrAfter(dayjs(searchParams.startRequestDate));
                // const matchEndDate = !searchParams.endRequestDate || dayjs(item.requestDate).isSameOrBefore(dayjs(searchParams.endRequestDate));

                // 조건 중 하나라도 false가 나오면 해당 항목은 제외됨
                return (
                    matchName && matchType && matchProgress && matchConfirmed && matchStartDate && matchEndDate
                )
            })

            console.log("Filtered Data:", filteredData);

            if (filteredData.length === 0) {
                notify('info', '조회 결과 없음', '조건에 맞는 데이터가 없습니다.', 'top');
            }

            setProductionRequests(filteredData); // 필터링된 데이터로 상태 갱신
            notify('success', '조회 성공', '데이터 검색 조회 성공.', 'bottomRight');

        } catch (error) {
            console.error("handleSearch API 호출 오류:", error);

            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSearch = () => {
        setSearchParams({
            startRequestDate: null,
            endRequestDate: null,
            requestName: '',
            requestType: '',
            progressType: '',
            isConfirmed: undefined,
        }); // 초기 상태로 검색 조건을 리셋합니다.
        form.resetFields();     // 폼 필드 초기화

        // 폼 필드에 초기값 강제 설정 (입력 필드에 표시되는 값 제거)
        form.setFieldsValue({
            startRequestDate: null,
            endRequestDate: null,
            requestName: '',
            requestType: '',
            progressType: '',
            isConfirmed: undefined,
        });

        fetchProductionRequests();

    }


    const productionRequestColumns = [
        {
            title: <div className="title-text">의뢰구분</div>,
            dataIndex: 'requestType',
            key: 'requestType',
            width: '10%',
            align: 'center',
            render: (text) => (
                <Tag color="gold">  {/* 모든 의뢰 구분에 동일한 색상 적용 */}
                    {{
                        'Mass Production': '양산',
                        'Pilot Production': '시험양산',
                        'Urgent Order': '특급수주',
                        'Sample': '샘플',
                        'PMS': 'PMS',
                    }[text] || text}
                </Tag>
            ),
        },

        {
            title: <div className="title-text">의뢰명</div>,
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            width: '15%',
            render: (text) => <div className="small-text">{text}</div>,
        },
        {
            title: <div className="title-text">진행상태</div>,
            dataIndex: 'progressType',
            key: 'progressType',
            align: 'center',
            width: '5%',
            render: (text) => (
                <Tag color={{
                    Created: 'geekblue',
                    'In Progress': 'geekblue',
                    'Not Started': 'geekblue',
                    'Halted': 'volcano',
                    'Completed': 'green',
                    'Incomplete': 'red',
                }[text] || 'default'}>
                    {{
                        Created: '등록',
                        'In Progress': '진행중',
                        'Not Started': '미진행',
                        'Halted': '진행중단',
                        'Completed': '완료',
                        'Incomplete': '미완료',
                    }[text] || text}
                </Tag>
            ),
        },
        {
            title: <div className="title-text">생산 요청일자</div>,
            dataIndex: 'requestDate',
            key: 'requestDate',
            align: 'center',
            width: '15%',
            render: (text) => <div className="small-text">{text}</div>,
        },
        {
            title: <div className="title-text">완료 요청일자</div>,
            dataIndex: 'deadlineOfCompletion',
            key: 'deadlineOfCompletion',
            align: 'center',
            width: '15%',
            render: (text) => <div className="small-text">{text}</div>,
        },
        {
            title: <div className="title-text">납기일</div>,
            dataIndex: 'dueDateToProvide',
            key: 'dueDateToProvide',
            align: 'center',
            width: '15%',
            render: (text) => <div className="small-text">{text}</div>,
        },
        {
            title: <div className="title-text">요청 수량</div>,
            dataIndex: 'requestQuantity',
            key: 'requestQuantity',
            align: 'center',
            width: '10%',
            render: (text) => <div className="small-text">{text}</div>,
        },
        {
            title: <div className="title-text">확정 수량</div>,
            dataIndex: 'confirmedQuantity',
            key: 'confirmedQuantity',
            align: 'center',
            width: '10%',
            render: (text) => <div className="small-text">{text}</div>,
        },
        {
            title: <div className="title-text">확정여부</div>,
            dataIndex: 'isConfirmed',
            key: 'isConfirmed',
            align: 'center',
            width: '5%',
            render: (value) => (
                <Tag color={value ? 'green' : 'volcano'}>
                    {value ? '확정됨' : '미확정'}
                </Tag>
            ),
        },
    ];

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="생산의뢰 관리"
                        description={(
                            <Typography>
                                생산 의뢰 관리 페이지는 <span>생산 공정을 시작하기 위한 의뢰 정보를 관리</span>하는 곳임. 이 페이지에서는 <span>생산 의뢰의 추가, 수정, 삭제</span>가 가능하며, 각 의뢰에 대한 <span>요청 제품, 수량, 납기일</span>을 기록할 수 있음. 생산 의뢰는 <span>고객의 주문이나 내부 요구</span>에 따라 생성되며, 이를 통해 생산 계획이 수립됨.
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
                                <Typography variant="h6" sx={{ padding: '20px' }} >생산의뢰 목록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form layout="vertical">
                                        <Row gutter={16}>
                                            <Col span={5}>
                                                <Form.Item name="id" hidden>
                                                    <Input />
                                                </Form.Item>

                                                <Form.Item label="의뢰 구분" tooltip="검색할 의뢰 구분을 선택하세요">
                                                    <Select
                                                        placeholder="의뢰 구분"
                                                        value={searchParams.requestType || undefined}
                                                        onChange={(value) => {
                                                            setSearchParams((prev) => ({
                                                                ...prev,
                                                                requestType: value,
                                                            })); // 상태를 업데이트합니다.

                                                            form.setFieldsValue({ requestType: value }); // 폼 필드 동기화
                                                        }}
                                                    >
                                                        <Select.Option value="Mass Production">양산</Select.Option>
                                                        <Select.Option value="Pilot Production">시험양산</Select.Option>
                                                        <Select.Option value="Urgent Order">특급수주</Select.Option>
                                                        <Select.Option value="Sample">샘플</Select.Option>
                                                        <Select.Option value="PMS">PMS</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item label="진행 상태" tooltip="검색할 진행 상태를 선택하세요">
                                                    <Select
                                                        placeholder="진행 상태"
                                                        value={searchParams.progressType || undefined}
                                                        onChange={(value) => {
                                                            setSearchParams((prev) => ({
                                                                ...prev,
                                                                progressType: value,
                                                            })); // 상태를 업데이트합니다.

                                                            form.setFieldsValue({ progressType: value }); // 폼 필드 동기화
                                                        }}
                                                    >
                                                        <Select.Option value="Created">등록</Select.Option>
                                                        <Select.Option value="In Progress">진행 중</Select.Option>
                                                        <Select.Option value="Not Started">미진행</Select.Option>
                                                        <Select.Option value="Halted">진행중단</Select.Option>
                                                        <Select.Option value="Completed">완료</Select.Option>
                                                        <Select.Option value="Incomplete">미완료</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
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
                                        </Row>

                                        <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                                            <Col flex="1">
                                                <Form.Item name="name" label="의뢰명" tooltip="검색할 생산 의뢰명을 입력하세요">
                                                    <Space.Compact style={{ width: '100%' }}>
                                                        <Input
                                                            placeholder="의뢰명"
                                                            value={searchParams.requestName || ''} // 초기값을 빈 문자열로 설정
                                                            // onChange={(e) => setSearchParams({ ...searchParams, requestName: e.target.value }) // searchParams를 바로 참조하는 방식이라 비동기적 상태 변경 시 예기치 않은 결과 발생
                                                            onChange={(e) => setSearchParams((prev) => ({
                                                                ...prev,// 안정성과 일관성을 위해 함수형 업데이트 방식(prev)을 사용하는 것이 더 좋습니다. 기존의 searchParams 상태를 담고 있는 새 복사객체
                                                                requestName: e.target.value,
                                                            }))}
                                                        />
                                                    </Space.Compact>
                                                </Form.Item>
                                            </Col>
                                            <Col flex="1">
                                                <Form.Item label="요청일 조회 기간" tooltip="검색할 요청기간의 시작일과 종료일을 선택하세요">
                                                    <RangePicker
                                                        value={[
                                                            searchParams.startRequestDate ? dayjs(searchParams.startRequestDate) : null,
                                                            searchParams.endRequestDate ? dayjs(searchParams.endRequestDate) : null,
                                                        ]}
                                                        onChange={(dates) => {
                                                            setSearchParams((prev) => ({
                                                                ...prev,
                                                                startRequestDate: dates ? dates[0].format('YYYY-MM-DD') : null,
                                                                endRequestDate: dates ? dates[1].format('YYYY-MM-DD') : null,
                                                            }));
                                                        }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Form.Item>
                                                    <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>검색</Button>
                                                    <Button style={{ marginLeft: '8px' }} onClick={handleResetSearch} icon={<ReloadOutlined />}>초기화</Button>
                                                </Form.Item>
                                            </Col>
                                            </Row>
                                    </Form>
                                </Grid>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Table
                                        dataSource={productionRequests}
                                        columns={productionRequestColumns}
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
                                                // 행 클릭 시 상태 업데이트 및 API 호출
                                                setSelectedRowKeys([record.id]); // 클릭한 행의 키로 상태 업데이트

                                                try {
                                                    // ID를 API 경로에 포함해 호출
                                                    const response = await apiClient.post(PRODUCTION_API.PRODUCTION_REQUEST_DETAIL_API(record.id));
                                                    setProductionRequestDetail(response.data); // 상세 정보 상태에 저장
                                                    console.log("setProductionRequestDetail(response.data); ", response.data )
                                                    notify('success', '조회 성공', '데이터를 성공적으로 조회했습니다.', 'bottomRight');
                                                } catch (error) {
                                                    console.error('API 호출 오류:', error);
                                                    notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
                                                }
                                            }
                                        })}
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                    { setProductionRequestDetail ? (
                        <Grid item xs={12} md={10} sx={{ minWidth: '1000px !important', maxWidth: '1200px !important' }}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{ height: '100%' }}>
                                    <Typography variant="h6" sx={{ padding: '20px' }}>생산의뢰 등록 및 수정</Typography>
                                    <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onFinish={(values) => {
                                                const allValues = form.getFieldsValue(true);  // 모든 필드 값 가져오기

                                                console.log("onFinish handleFormSubmit:", allValues)
                                                handleFormSubmit(allValues, 'update')}
                                            }
                                            style={{ padding: '20px' }}
                                        >
                                            <Row gutter={16}>
                                                <Col span={6}>
                                                    <Form.Item name="client">
                                                        <Input
                                                            addonBefore="거래처"
                                                            placeholder="거래처 선택"
                                                            onClick={() => handleInputClick('client')}
                                                            value={selectedValue.client}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="department">
                                                        <Input
                                                            addonBefore="부서"
                                                            placeholder="부서 선택"
                                                            onClick={() => handleInputClick('department')}
                                                            value={selectedValue.department}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="product">
                                                        <Input
                                                            addonBefore="제품"
                                                            placeholder="제품 선택"
                                                            onClick={() => handleInputClick('product')}
                                                            value={selectedValue.product}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="requester">
                                                        <Input
                                                            addonBefore="요청자"
                                                            placeholder="요청자 선택"
                                                            onClick={() => handleInputClick('requester')}
                                                            value={selectedValue.requester}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>
                                                생산 의뢰 내용
                                            </Divider>
                                            <Row gutter={16}>
                                                <Col span={8}>
                                                    <Form.Item name="requestType" rules={[{ required: true, message: '의뢰 구분을 선택하세요.' }]}>
                                                        <Space.Compact>
                                                            <Input style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="의뢰 구분" disabled />
                                                            <Select
                                                                name="requestType"
                                                                style={{ width: '60%' }}
                                                                placeholder="의뢰 구분 선택"
                                                                value={productionRequestDetail ? productionRequestDetail.requestType : undefined}
                                                            >
                                                                <Select.Option value="Mass Production">양산</Select.Option>
                                                                <Select.Option value="Pilot Production">시험양산</Select.Option>
                                                                <Select.Option value="Urgent Order">특급수주</Select.Option>
                                                                <Select.Option value="Sample">샘플</Select.Option>
                                                                <Select.Option value="PMS">PMS</Select.Option>
                                                            </Select>
                                                        </Space.Compact>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={8}>
                                                    <Form.Item name="progressType" rules={[{ required: true, message: '진행 상태를 선택하세요.' }]}>
                                                        <Space.Compact>
                                                            <Input style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="진행 상태" disabled />
                                                            <Select
                                                                name="progressType"
                                                                style={{ width: '60%' }}
                                                                placeholder="진행 상태 선택"
                                                                value={productionRequestDetail ? productionRequestDetail.progressType : undefined}
                                                            >
                                                                <Option value="Created">등록</Option>
                                                                <Option value="In Progress">진행 중</Option>
                                                                <Option value="Not Started">미진행</Option>
                                                                <Option value="Halted">진행중단</Option>
                                                                <Option value="Completed">완료</Option>
                                                                <Option value="Incomplete">미완료</Option>
                                                            </Select>
                                                        </Space.Compact>
                                                    </Form.Item>
                                                </Col>
                                                <Col>
                                                    <Form.Item name="isConfirmed">
                                                        <Space.Compact>
                                                            <Input style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="확정 여부" disabled />
                                                            <Select placeholder="확정 여부 선택" value={productionRequestDetail?.isConfirmed || false} style={{ width: '60%' }}>
                                                                <Select.Option value={true}>확정됨</Select.Option>
                                                                <Select.Option value={false}>미확정</Select.Option>
                                                            </Select>
                                                        </Space.Compact>
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Row gutter={16}>
                                                <Col span={24}>
                                                    <Form.Item
                                                        name="name"
                                                        label="의뢰명"
                                                        rules={[{ required: true, message: '의뢰명을 입력하세요.' }]}
                                                    >
                                                        <Input placeholder="의뢰명 입력" />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Row gutter={16}>
                                                <Col span={8}>
                                                    <Form.Item
                                                        label="의뢰등록일"
                                                        name="requestDate"
                                                        required
                                                        tooltip="생산의뢰 등록일을 선택하세요" // TODO 새 폼에서 생성 입력시 자동입력
                                                    >
                                                        <DatePicker style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={8}>
                                                    <Form.Item
                                                        label="완료 요청일"
                                                        name="deadlineOfCompletion"
                                                        required
                                                        tooltip="생산의뢰 완료 요청일을 선택하세요"
                                                    >
                                                        <DatePicker style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={8}>
                                                    <Form.Item
                                                        label="납기일"
                                                        name="dueDateToProvide"
                                                        required
                                                        tooltip="의뢰품목의 납기일을 선택하세요"
                                                    >
                                                        <DatePicker style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row gutter={16}>
                                                <Col span={8}>
                                                    <Form.Item name="requestQuantity" required label="요청 수량">
                                                        <Input type="number" placeholder="요청 수량 입력" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={8}>
                                                    <Form.Item
                                                        name="confirmedQuantity" label="확정 수량"
                                                        tooltip="생산의뢰 확정 시 확정수량을 입력하세요"
                                                    >
                                                        <Input type="number" placeholder="확정 수량 입력" />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row gutter={16}>
                                                <Col span={24}>
                                                    <Form.Item name="remarks">
                                                        <Input.TextArea addonBefore="특이사항" placeholder="특이사항 입력" />
                                                    </Form.Item>
                                                </Col>

                                            </Row>


                                            <Row gutter={16}>
                                            </Row>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                                <Button type="primary" htmlType="submit">
                                                    저장
                                                </Button>
                                                <Button type="default" onClick={handleDelete} style={{ marginLeft: '10px' }} danger>
                                                    삭제
                                                </Button>
                                            </Box>
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
                                                        {/* 거래처 선택 모달 */}
                                                        {currentField === 'client' && (
                                                            <>
                                                                <Typography variant="h6" sx={{ marginBottom: '20px' }}>
                                                                    거래처 선택
                                                                </Typography>
                                                                <Input
                                                                    placeholder="검색"
                                                                    prefix={<SearchOutlined />}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value.toLowerCase();
                                                                        const filtered = initialModalData.filter((item) =>
                                                                            // item.clientCode.toLowerCase().includes(value) ||
                                                                            item.printClientName.toLowerCase().includes(value) ||
                                                                            item.representativeName.toLowerCase().includes(value) ||
                                                                            item.businessType.toLowerCase().includes(value)
                                                                        );
                                                                        setModalData(filtered);
                                                                    }}
                                                                    style={{ marginBottom: 16 }}
                                                                />
                                                                <Table
                                                                    columns={[
                                                                        // { title: '거래처코드', dataIndex:'clientCode', key: 'clientCode', align: 'center' },
                                                                        { title: '업종', dataIndex: 'businessType', key: 'businessType', align: 'center' },
                                                                        { title: '거래처명', dataIndex: 'printClientName', key: 'printClientName', align: 'center' },
                                                                        { title: '대표자명', dataIndex: 'representativeName', key: 'representativeName', align: 'center' },
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

                                                        {/* 부서 선택 모달 */}
                                                        {currentField === 'department' && (
                                                            <>
                                                                <Typography variant="h6" sx={{ marginBottom: '20px' }}>
                                                                    요청부서 선택
                                                                </Typography>
                                                                <Input
                                                                    placeholder="검색"
                                                                    prefix={<SearchOutlined />}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value.toLowerCase();
                                                                        const filtered = initialModalData.filter((item) =>
                                                                            item.departmentCode.toLowerCase().includes(value) ||
                                                                            item.departmentName.toLowerCase().includes(value)
                                                                        );
                                                                        setModalData(filtered);
                                                                    }}
                                                                    style={{ marginBottom: 16 }}
                                                                />
                                                                <Table
                                                                    columns={[
                                                                        { title: '부서 코드', dataIndex: 'departmentCode', key: 'departmentCode', align: 'center' },
                                                                        { title: '부서명', dataIndex: 'departmentName', key: 'departmentName', align: 'center' },
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

                                                        {/* 제품 선택 모달 */}
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

                                                        {/* 요청자 선택 모달 */}
                                                        {currentField === 'requester' && (
                                                            <>
                                                                <Typography variant="h6" sx={{ marginBottom: '20px' }}>
                                                                    요청자 선택
                                                                </Typography>
                                                                <Input
                                                                    placeholder="검색"
                                                                    prefix={<SearchOutlined />}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value.toLowerCase();
                                                                        const filtered = initialModalData.filter((item) =>
                                                                            `${item.lastName}${item.firstName}`.toLowerCase().includes(value) ||
                                                                            item.departmentName.toLowerCase().includes(value) ||
                                                                            item.positionName.toLowerCase().includes(value) ||
                                                                            item.titleName.toLowerCase().includes(value)
                                                                        );
                                                                        setModalData(filtered);
                                                                    }}
                                                                    style={{ marginBottom: 16 }}
                                                                />
                                                                <Table
                                                                    columns={[
                                                                        { title: '부서 코드', dataIndex: 'departmentCode', key: 'departmentCode', align: 'center' },
                                                                        { title: '부서명', dataIndex: 'departmentName', key: 'departmentName', align: 'center' },
                                                                        {
                                                                            title: '이름 (사번)',
                                                                            key: 'name',
                                                                            align: 'center',
                                                                            render: (text, record) => `${record.lastName}${record.firstName} (${record.employeeNumber})`,
                                                                        },
                                                                        { title: '직책', dataIndex: 'positionName', key: 'positionName', align: 'center' },
                                                                        { title: '직위', dataIndex: 'titleName', key: 'titleName', align: 'center' },
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
                                </Paper>
                            </Grow>
                        </Grid>
                    ) : (<></>)
                    }
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

export default ProductionRequestPage;