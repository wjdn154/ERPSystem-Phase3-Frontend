import React, { useEffect, useState } from 'react';
import { Box, Grid, Grow, Paper, Typography } from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './AssignmentManagementUtil.jsx';
import {Space, Tag, Form, Table, Button, Col, Input, Row, Modal, Spin, Select, notification} from 'antd';
import apiClient from '../../../../config/apiClient.jsx';
import {EMPLOYEE_API} from '../../../../config/apiConstants.jsx';
import { Divider } from 'antd';
import { useNotificationContext } from "../../../../config/NotificationContext.jsx";
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;
const { confirm } = Modal;

const AssignmentManagementPage = ({ initialData }) => {
    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [form] = Form.useForm(); // 폼 인스턴스 생성
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [transferList, setTransferList] = useState(initialData);
    const [activeTabKey, setActiveTabKey] = useState('1'); // 활성 탭 키 상태
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 선택된 행 키 상태
    const [editTransfer, setEditTransfer] = useState(false);
    const [fetchTransferData, setFetchTransferData] = useState(false);
    const [transferParam, setTransferParam] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const [currentField, setCurrentField] = useState(''); // 모달 분기할 필드 상태
    const [modalData, setModalData] = useState(null); // 모달 데이터 상태
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 활성화 여부
    const [displayValues, setDisplayValues] = useState({});
    const [employee, setEmployee] = useState({});
    const [initialModalData, setInitialModalData] = useState(null);
    const [transfer, setTransfer] = useState([]); // 부서 데이터 상태
    const [departments, setDepartments] = useState([]); // 부서 데이터 상태
    const [transferType, setTransferType] = useState([]);





    const fetchEmployee = async () => {
        try {
            const response = await axios.post(EMPLOYEE_API.EMPLOYEE_DATA_API);

            if (Array.isArray(response.data)) {
                const modifiedData = response.data.map((item) => ({
                    ...item,
                    employeeName: `${item.lastName} ${item.firstName}`, // lastName과 firstName을 결합하여 employeeName 생성
                }));

                setEmployee(modifiedData);
                setInitialModalData(modifiedData);
                setModalData(modifiedData);
            } else {
                console.error("API did not return an array, response:", response.data);
            }
        } catch (error) {
            console.error("API Error:", error.response || error.message);
            notification.error({
                message: '사원 목록 조회 실패',
                description: '사원 목록을 불러오는 중 오류가 발생했습니다.',
            });
        }
    };


    useEffect(() => {
            fetchEmployee();
        }, []);

    useEffect(() => {
    }, [modalData]);


    const fetchTransfer = async () => {
            try {
                const response = await apiClient.post(EMPLOYEE_API.TRANSFER_DATA_API);
                setTransferList(response.data);

            } catch (error) {
                notification.error({
                    message: '발령 목록 조회 실패',
                    description: '발령 목록을 불러오는 중 오류가 발생했습니다.',
                });
            }
        };

        useEffect(() => {
            fetchTransfer();
        }, []);

        // 부서 목록 가져오는 함수
        const fetchDepartments = async () => {
            try {
                const response = await apiClient.post(EMPLOYEE_API.DEPARTMENT_DATA_API); // 부서 목록 API 호출
                setDepartments(response.data); // 부서 목록 저장
            } catch (error) {
                notification.error({
                    message: ' 목록 조회 실패',
                    description: '부서 목록을 불러오는 중 오류가 발생했습니다.',
                });
            }
        };

        useEffect(() => {
            fetchDepartments(); // 컴포넌트 로드 시 부서 목록 가져오기
        }, []);

        useEffect(() => {
            if (!fetchTransferData) return;
            console.log("fetchTransferData:", fetchTransferData);

            form.setFieldsValue({
                ...fetchTransferData,
                employeeFirstName: fetchTransferData.employeeFirstName,
                employeeLastName: fetchTransferData.employeeLastName,
                toDepartmentCode: fetchTransferData.fromDepartmentCode,
                fromDepartmentCode: fetchTransferData.toDepartmentCode,
                transferTypeCode: fetchTransferData.transferTypeCode,
                transferTypeDescription: fetchTransferData.transferTypeDescription
            });
            setTransferParam(fetchTransferData);

            setDisplayValues({
                employeeName: fetchTransferData.employeeLastName && fetchTransferData.employeeFirstName
                    ? `${fetchTransferData.employeeLastName} ${fetchTransferData.employeeFirstName}`
                    : '',
                fromDepartmentName: fetchTransferData.fromDepartmentCode && fetchTransferData.fromDepartmentName
                    ? `[${fetchTransferData.fromDepartmentCode}] ${fetchTransferData.fromDepartmentName}`
                    : '',
                toDepartmentName: fetchTransferData.toDepartmentCode && fetchTransferData.toDepartmentName
                    ? `[${fetchTransferData.toDepartmentCode}] ${fetchTransferData.toDepartmentName}`
                    : ''
            });
        }, [fetchTransferData, form]);

        // 모달창 열기 핸들러
        const handleInputClick = (fieldName) => {
            setCurrentField(fieldName);
            setModalData(null); // 모달 열기 전에 데이터를 초기화
            setInitialModalData(null);
            fetchModalData(fieldName); // 모달 데이터 가져오기 호출
            setIsModalVisible(true); // 모달창 열기
        };

        // 모달창 닫기 핸들러
        const handleModalCancel = () => setIsModalVisible(false);

        // 모달창 데이터 가져오기 함수
        const fetchModalData = async (fieldName) => {
            setIsLoading(true);
            let apiPath;
            if (fieldName === 'transfer') apiPath = EMPLOYEE_API.TRANSFER_DATA_API;
            if (fieldName === 'employee') apiPath = EMPLOYEE_API.EMPLOYEE_DATA_API;

            try {
                const response = await apiClient.post(apiPath);
                if (Array.isArray(response.data)) {
                    setModalData(response.data); // 모달 데이터 상태 업데이트 추가
                }
            } catch (error) {
                notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
            } finally {
                setIsLoading(false);
            }
        };

        //모달창 선택 핸들러
        const handleModalSelect = (record) => {
            switch (currentField) {
                case 'department':
                    setTransferParam((prevParams) => ({
                        ...prevParams,
                        department: {
                            id:record.id,
                            fromDepartmentId: record.fromDepartmentId || prevParams.fromDepartmentId, // fromDepartmentId가 있을 경우 설정
                            toDepartmentId: record.toDepartmentId || prevParams.toDepartmentId, // toDepartmentId가 있을 경우 설정
                            toDepartmentName: record.toDepartmentName,
                            fromDepartmentName: record.fromDepartmentName,
                            toDepartmentCode: record.toDepartmentCode,
                            fromDepartmentCode: record.fromDepartmentCode,
                            employeeName: record.employeeName,
                        },
                    }));
                    setDisplayValues((prevValues) => ({
                        ...prevValues,
                        toDepartmentName: `[${record.toDepartmentCode}] ${record.toDepartmentName}`,

                    }));
                    break;
                case 'employee':
                    setTransferParam((prevParams) => ({
                        ...prevParams,
                            employeeId: record.id,
                            employeeNumber: record.employeeNumber,
                            employeeName: `${record.lastName}${record.firstName}`,
                    }));
                    setDisplayValues((prevValues) => ({
                        ...prevValues,
                        employeeName: `[${record.employeeNumber}] ${record.lastName}${record.firstName}`,

                    }));
                    break;
            }
            setIsModalVisible(false);

        };

        const handleFormSubmit = async (values, type) => {
            console.log('values111: ', values)

            confirm({
                title: '저장 확인',
                content: '정말로 저장하시겠습니까?',
                okText: '확인',
                cancelText: '취소',
                onOk: async () => {
                    const employeeName = values.employeeName || '';
                    const formattedValues = {
                        id: transferParam.id,
                        transferDate: values.transferDate,
                        employeeId: transferParam.employeeId,
                        employeeNumber: transferParam.employeeNumber,
                        employeeName: transferParam.employeeName,
                        fromDepartmentCode: transferParam.fromDepartmentCode,
                        fromDepartmentName: transferParam.fromDepartmentName,
                        toDepartmentName: transferParam.toDepartmentName,
                        toDepartmentCode: transferParam.toDepartmentCode,
                        reason: values.reason,
                        transferType: transferParam.transferType
                    };

                    // 신규 등록 시에는 id 필드를 삭제
                    if (type === 'register') {
                        delete formattedValues.id;
                    }


                    const formData = new FormData();
                    formData.append("formattedValues", JSON.stringify(formattedValues));

                    try {
                        const API_PATH = type === 'update' ? EMPLOYEE_API.UPDATE_TRANSFER_API(transferParam.id) : EMPLOYEE_API.SAVE_TRANSFER_API;
                        console.log("확인용 : ", formattedValues);
                        const response = await apiClient.post(API_PATH, formattedValues, {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        const updatedData = response.data;
                        console.log("updatedData:",updatedData);

                        if (type === 'update') {
                            setTransferList((prevList) =>
                                prevList.map((transfer) => transfer.id === updatedData.id ? updatedData : transfer)
                            );
                        } else {
                            setTransferList((prevList) => [...prevList, updatedData]);
                            registrationForm.resetFields();
                        }
                        setEditTransfer(false);
                        setFetchTransferData(updatedData); // 여기를 통해 최신 데이터로 상태를 업데이트
                        setTransferParam(updatedData); // 최신 상태로 transferParam 업데이트
                        setDisplayValues({});


                        type === 'update'
                            ? notify('success', '발령 수정', '발령 기록 수정 성공.', 'bottomRight')
                            : (notify('success', '발령 저장', '발령 기록 저장 성공.', 'bottomRight'), registrationForm.resetFields());
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
        const formatDate = (value) => {
            if (!value) return '';
            const cleanValue = value.replace(/[^\d]/g, ''); // 숫자 외의 모든 문자 제거
            if (cleanValue.length <= 4) return cleanValue;
            if (cleanValue.length <= 6) return `${cleanValue.slice(0, 4)}-${cleanValue.slice(4)}`;
            return `${cleanValue.slice(0, 4)}-${cleanValue.slice(4, 6)}-${cleanValue.slice(6)}`;
        };

        // 탭 변경 핸들러
        const handleTabChange = (key) => {
            setEditTransfer(false);
            setFetchTransferData(null);
            setTransferParam({});
            setDisplayValues({});
            form.resetFields();
            registrationForm.resetFields(); // 2탭 폼 초기화
            registrationForm.setFieldValue(true);
            setActiveTabKey(key);
        };

        return (
            <Box sx={{margin: '20px'}}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <WelcomeSection
                            title="발령 관리"
                            description={(
                                <Typography>
                                    발령 관리 페이지는 <span>사원의 부서 이동과 같은 발령 사항을 관리</span>하는 기능을 제공함. 이 페이지에서는 <span>발령 내역을 기록하고 이력을 관리</span>할
                                    수 있으며, 사원의 <span>현재 근무 위치</span>를 쉽게 파악할 수 있음. 이를 통해 <span>조직 내 인사 이동 사항을 효율적으로 관리</span>하고
                                    기록할 수 있음.
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
                                    <Typography variant="h6" sx={{padding: '20px'}}>발령 목록</Typography>
                                    <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                        <Table
                                            dataSource={transferList}
                                            columns={[
                                                {
                                                    title: <div className="title-text">발령날짜</div>,
                                                    dataIndex: 'transferDate',
                                                    key: 'transferDate',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">사원번호</div>,
                                                    dataIndex: 'employeeNumber',
                                                    key: 'employeeNumber',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">사원이름</div>,
                                                    dataIndex: 'employeeName',
                                                    key: 'employeeName',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">이전부서</div>,
                                                    dataIndex: 'fromDepartmentName',
                                                    key: 'fromDepartmentName',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">발령부서</div>,
                                                    dataIndex: 'toDepartmentName',
                                                    key: 'toDepartmentName',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">발령유형명</div>,
                                                    dataIndex: 'transferType',
                                                    key: 'transferType',
                                                    align: 'center',
                                                    render: (text) => {
                                                        let value;
                                                        switch (text) {
                                                            case 'PROMOTION':
                                                                value = '승진';
                                                                break;
                                                            case 'DEMOTION':
                                                                value = '강등';
                                                                break;
                                                            case 'LATERAL':
                                                                value = '전보';
                                                                break;
                                                            case 'TEMPORARY_ASSIGNMENT':
                                                                value = '임시 배치';
                                                                break;
                                                            case 'RELOCATION':
                                                                value = '이전';
                                                                break;
                                                            case 'RETURN':
                                                                value = '복귀';
                                                                break;
                                                        }
                                                        return <div className="small-text">{value}</div>;
                                                    },
                                                },
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
                                                        const response = await apiClient.post(EMPLOYEE_API.TRANSFER_DETAIL_DATA_API(id));
                                                        setFetchTransferData(response.data);
                                                        setEditTransfer(true);
                                                        notify('success', '발령 조회', '발령 정보 조회 성공.', 'bottomRight')
                                                    } catch (error) {
                                                        notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
                                                    }
                                                }
                                            }}
                                            onRow={(record) => ({
                                                style: { cursor: 'pointer' },
                                                onClick: async () => {
                                                    setSelectedRowKeys([record.id]);
                                                    const id = record.id;
                                                    try {
                                                        const response = await apiClient.post(EMPLOYEE_API.TRANSFER_DETAIL_DATA_API(id));
                                                        setFetchTransferData(response.data);
                                                        setEditTransfer(true);
                                                        notify('success', '발령 조회', '발령 정보 조회 성공.', 'bottomRight')
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
                        {editTransfer && (
                            <Grid item xs={12} md={12}
                                  sx={{minWidth: '1000px !important', maxWidth: '1500px !important'}}>
                                <Grow in={true} timeout={200}>
                                    <Paper elevation={3} sx={{height: '100%'}}>
                                        <Typography variant="h6" sx={{padding: '20px'}}>발령정보 수정</Typography>
                                        <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                            <Form
                                                initialValues={fetchTransferData}
                                                form={form}
                                                onFinish={(values) => {
                                                    handleFormSubmit(values, 'update')
                                                }}
                                            >
                                                <Divider orientation={'left'} orientationMargin="0"
                                                         style={{marginTop: '0px', fontWeight: 600}}>
                                                    사원 정보
                                                </Divider>
                                                <Row gutter={16}>
                                                    <Col span={6}>
                                                        <Form.Item name="employeeNumber"
                                                                   rules={[{required: true, message: '사원번호를 입력하세요.'}]}>
                                                            <Input addonBefore="사원번호" disabled/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Form.Item name="employeeName"
                                                                   rules={[{required: true, message: '사원이름을 입력하세요.'}]}>
                                                            <Input addonBefore="사원이름" disabled/>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                                <Divider orientation={'left'} orientationMargin="0"
                                                         style={{marginTop: '0px', fontWeight: 600}}>
                                                    발령 정보
                                                </Divider>
                                                <Row gutter={16}>
                                                    <Col span={6}>
                                                        <Form.Item name="transferDate"
                                                                   rules={[{required: true, message: '발령날짜를 입력하세요.'}]}>
                                                            <Input addonBefore="발령날짜" maxLength={14}
                                                                   onChange={(e) => form.setFieldValue('transferDate', formatDate(e.target.value))}/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={16}>
                                                        <Form.Item name="reason"
                                                                   rules={[{required: true, message: '발령사유를 입력하세요.'}]}>
                                                            <Input addonBefore="발령 사유"/>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                                <Row gutter={16}>
                                                    <Col span={6}>
                                                        <Form.Item>
                                                            <Input
                                                                addonBefore="이전부서"
                                                                style={{
                                                                    backgroundColor: '#FAFAFA',
                                                                    color: '#000',
                                                                    textAlign: 'center'
                                                                }}
                                                                value={`[${transferParam.toDepartmentCode}] ${transferParam.fromDepartmentName}`}
                                                                disabled
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Form.Item name="toDepartment">
                                                            <Space.Compact>
                                                                {/* 부서 코드 Input */}
                                                                <Input
                                                                    style={{
                                                                        backgroundColor: '#FAFAFA',
                                                                        color: '#000',
                                                                        textAlign: 'center'
                                                                    }}
                                                                    value="발령부서"
                                                                />

                                                                {/* 부서명 Select */}
                                                                <Select
                                                                    value={`[${transferParam.fromDepartmentCode}] ${transferParam.toDepartmentName}`}
                                                                    onChange={(value, option) => {
                                                                        setTransferParam((prevState) => ({
                                                                            ...prevState,
                                                                            fromDepartmentCode: value, // 부서 코드 설정
                                                                            toDepartmentName: option.children[3]
                                                                        }));
                                                                    }}
                                                                >
                                                                    {departments.map((dept) => (
                                                                        <Option key={dept.departmentCode}
                                                                                value={dept.departmentCode}>
                                                                            [{dept.departmentCode}] {dept.departmentName}
                                                                        </Option>
                                                                    ))}
                                                                </Select>
                                                            </Space.Compact>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={10}>
                                                        <Form.Item name="transferType">
                                                            <Space.Compact>
                                                                <Input style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="발령유형명" disabled />
                                                                <Select
                                                                    style={{ width: '60%' }}
                                                                    value={transferParam.transferType}
                                                                    onChange={(value) => {
                                                                        setTransferParam((prevState) => ({
                                                                            ...prevState,
                                                                            transferType: value,
                                                                        }));
                                                                    }}
                                                                >
                                                                    <Option value="PROMOTION">승진</Option>
                                                                    <Option value="DEMOTION">강등</Option>
                                                                    <Option value="LATERAL">전보</Option>
                                                                    <Option value="TEMPORARY_ASSIGNMENT">임시배치</Option>
                                                                    <Option value="RELOCATION">이전</Option>
                                                                    <Option value="RETURN">복귀</Option>
                                                                </Select>
                                                            </Space.Compact>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                                {/* 저장 버튼 */}
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-end',
                                                    marginBottom: '20px'
                                                }}>
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
                    <Grid sx={{padding: '0px 20px 0px 20px'}} container spacing={3}>
                        <Grid item xs={12} md={12} sx={{minWidth: '500px !important', maxWidth: '1500px !important'}}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{height: '100%'}}>
                                    <Typography variant="h6" sx={{padding: '20px'}}>발령 등록</Typography>
                                    <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                        <Form
                                            layout="vertical"
                                            onFinish={(values) => {
                                                console.log("저장직전 : ", values);
                                                handleFormSubmit(values, 'register')
                                            }}
                                            form={registrationForm}
                                        >
                                            <Row gutter={12}>
                                                <Col span={7}>
                                                    <Form.Item>
                                                        <Input
                                                            addonBefore="사원"
                                                            value={displayValues.employeeName}
                                                            onClick={() => handleInputClick('employee')}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined/>}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="transferDate"
                                                               rules={[{required: true, message: '발령날짜를 입력하세요.'}]}>
                                                        <Input addonBefore="발령날짜" maxLength={14}
                                                               onChange={(e) => form.setFieldValue('transferDate', formatDate(e.target.value))}/>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row gutter={10}>
                                                <Col span={5}>
                                                    <Form.Item name="toDepartment">
                                                        <Space.Compact>
                                                            {/* 부서 코드 Input */}
                                                            <Input
                                                                style={{
                                                                    backgroundColor: '#FAFAFA',
                                                                    color: '#000',
                                                                    textAlign: 'center'
                                                                }}
                                                                value="이전부서"
                                                                disabled
                                                            />

                                                            {/* 부서명 Select */}
                                                            <Select
                                                                placeholder="이전부서 선택" // 안내 메시지 설정
                                                                value={transferParam.fromDepartmentCode ? `[${transferParam.fromDepartmentCode}] ${transferParam.fromDepartmentName}` : undefined}
                                                                onChange={(value, option) => {
                                                                    setTransferParam((prevState) => ({
                                                                        ...prevState,
                                                                        fromDepartmentCode: value, // 부서 코드 설정
                                                                        fromDepartmentName: option.children[3]
                                                                    }));
                                                                }}
                                                            >
                                                                {departments.map((dept) => (
                                                                    <Option key={dept.departmentCode}
                                                                            value={dept.departmentCode}>
                                                                        [{dept.departmentCode}] {dept.departmentName}
                                                                    </Option>
                                                                ))}
                                                            </Select>
                                                        </Space.Compact>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={5}>
                                                    <Form.Item name="toDepartment">
                                                        <Space.Compact>
                                                            {/* 부서 코드 Input */}
                                                            <Input
                                                                style={{
                                                                    backgroundColor: '#FAFAFA',
                                                                    color: '#000',
                                                                    textAlign: 'center'
                                                                }}
                                                                value="발령부서"
                                                                disabled
                                                            />

                                                            {/* 부서명 Select */}
                                                            <Select
                                                                placeholder="발령부서 선택" // 안내 메시지 설정
                                                                value={transferParam.toDepartmentCode ? `[${transferParam.toDepartmentCode}] ${transferParam.toDepartmentName}` : undefined}
                                                                onChange={(value, option) => {
                                                                    setTransferParam((prevState) => ({
                                                                        ...prevState,
                                                                        toDepartmentCode: value, // 부서 코드 설정
                                                                        toDepartmentName: option.children[3]
                                                                    }));
                                                                }}
                                                            >
                                                                {departments.map((dept) => (
                                                                    <Option key={dept.departmentCode}
                                                                            value={dept.departmentCode}>
                                                                        [{dept.departmentCode}] {dept.departmentName}
                                                                    </Option>
                                                                ))}
                                                            </Select>
                                                        </Space.Compact>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item name="transferType">
                                                        <Space.Compact>
                                                            <Input style={{ width: '60%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="발령유형명" disabled />
                                                            <Select
                                                                style={{ width: '40%' }}
                                                                value={transferParam.transferType}
                                                                onChange={(value) => {
                                                                    setTransferParam((prevState) => ({
                                                                        ...prevState,
                                                                        transferType: value,
                                                                    }));
                                                                }}
                                                            >
                                                                <Option value="PROMOTION">승진</Option>
                                                                <Option value="DEMOTION">강등</Option>
                                                                <Option value="LATERAL">전보</Option>
                                                                <Option value="TEMPORARY_ASSIGNMENT">임시배치</Option>
                                                                <Option value="RELOCATION">이전</Option>
                                                                <Option value="RETURN">복귀</Option>
                                                            </Select>
                                                        </Space.Compact>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={16}>
                                                    <Form.Item name="reason"
                                                               rules={[{required: true, message: '발령사유를 입력하세요.'}]}>
                                                        <Input addonBefore="발령 사유"/>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            {/* 저장 버튼 */}
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
                                            >{isLoading ? (
                                                <Spin/>  // 로딩 스피너
                                            ) : (
                                                <>
                                                    {currentField === 'employee' && (
                                                        <>
                                                            <Typography id="modal-modal-title" variant="h6"
                                                                        component="h2" sx={{marginBottom: '20px'}}>
                                                                사원 선택
                                                            </Typography>
                                                            <Input
                                                                placeholder="검색"
                                                                prefix={<SearchOutlined/>}
                                                                onChange={(e) => {
                                                                    const value = e.target.value.toLowerCase();
                                                                    if (!value) {
                                                                        setModalData(initialModalData); // 검색어가 없으면 초기 데이터로 복구
                                                                    } else {
                                                                        const filtered = initialModalData.filter((item) => {
                                                                            return (
                                                                                (item.employeeNumber && item.employeeNumber.toLowerCase().includes(value)) ||
                                                                                (item.employeeName && item.employeeName.toLowerCase().includes(value))
                                                                            );
                                                                        });
                                                                        setModalData(filtered); // 검색 결과로 modalData 업데이트
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
                                                                                className="title-text">사원이름</div>,
                                                                            dataIndex: 'employeeName',
                                                                            key: 'employeeName',
                                                                            align: 'center',
                                                                            render: (text, record) => (
                                                                                <div className="small-text">
                                                                                    {record.lastName}{record.firstName}
                                                                                </div>
                                                                            )
                                                                        },
                                                                    ]}
                                                                    dataSource={modalData}
                                                                    rowKey="employeeNumber"
                                                                    size={"small"}
                                                                    pagination={{
                                                                        pageSize: 15,
                                                                        position: ['bottomCenter'],
                                                                        showSizeChanger: false,
                                                                        showTotal: (total) => `총 ${total}명`,
                                                                    }}
                                                                    onRow={(record) => ({
                                                                        style: { cursor: 'pointer' },
                                                                        onClick: () => handleModalSelect(record), // 선택 시 처리
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
                    </Grid>
                )}
            </Box>
        );
    };
export default AssignmentManagementPage;