import React, { useEffect, useState } from 'react';
import { Box, Grid, Grow, Paper, Typography } from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './PerformanceEvaluationUtil.jsx';
import {Space, Tag, Form, Table, Button, Col, Input, Row, Checkbox, Modal, Spin, Select, notification, Upload} from 'antd';
import apiClient from '../../../../config/apiClient.jsx';
import {EMPLOYEE_API, FINANCIAL_API} from '../../../../config/apiConstants.jsx';
import { Divider } from 'antd';
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";
const { Option } = Select;
const { confirm } = Modal;

const PerformanceEvaluationPage = ( {initialData} ) => {
    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [form] = Form.useForm(); // 폼 인스턴스 생성
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [performanceList, setPerformanceList] = useState(initialData); // 사원 목록 상태
    const [activeTabKey, setActiveTabKey] = useState('1'); // 활성 탭 키 상태
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 선택된 행 키 상태
    const [editPerformance, setEditPerformance] = useState(false); // 사원 수정 탭 활성화 여부 상태
    const [fetchPerformanceData, setFetchPerformanceData] = useState(false); // 사원 조회한 정보 상태
    const [performanceParam, setPerformanceParam] = useState(false); // 수정할 사원 정보 상태
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const [currentField, setCurrentField] = useState(''); // 모달 분기할 필드 상태
    const [modalData, setModalData] = useState(null); // 모달 데이터 상태
    const [performance, setPerformance] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 활성화 여부
    const [displayValues, setDisplayValues] = useState({});

    useEffect(() => {
        if (!fetchPerformanceData) return; // 선택된 사원 데이터가 없으면 종료
        form.setFieldsValue({
            employeeId: fetchPerformanceData[0].employeeId,
            evaluatorId: fetchPerformanceData[0].evaluatorId,
            employeeNumber: fetchPerformanceData[0].employeeNumber,
            employeeName: fetchPerformanceData[0].employeeName,
            evaluatorName: fetchPerformanceData[0].evaluatorName,
            evaluationDate: fetchPerformanceData[0].evaluationDate,
            title: fetchPerformanceData[0].title,
            comments: fetchPerformanceData[0].comments,
            score: fetchPerformanceData[0].score,});
        setPerformanceParam(fetchPerformanceData[0]);
        setDisplayValues({});
    }, [fetchPerformanceData, form]);

    // 모달창 열기 핸들러
    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setModalData(null); // 모달 열기 전에 데이터를 초기화
        fetchModalData(fieldName); // 모달 데이터 가져오기 호출
        setIsModalVisible(true); // 모달창 열기
    };

    // 모달창 닫기 핸들러
    const handleModalCancel = () => setIsModalVisible(false);

    const updatePerformance = async (performanceId, performanceData) => {
        if (!performanceId) {
            console.error("Performance ID가 없습니다.");
            return;
        }

        try {
            const response = await apiClient.post(`/api/performance/put/${performanceId}`, performanceData);
            // 응답 처리
        } catch (error) {
            console.error("API 호출 오류:", error);
        }
    };

    // 모달창 데이터 가져오기 함수
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;
        if(fieldName === 'performance') apiPath = EMPLOYEE_API.PERFORMANCE_DATA_API;

        try {
            const response = await apiClient.post(apiPath);
            setModalData(response.data);
        } catch (error) {
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };

    // 모달창 선택 핸들러
    const handleModalSelect = (record) => {
        if (currentField ==='performance'){
                setPerformanceParam((prevParams) => (prevParams));
                setDisplayValues((prevValues) => ({prevValues}));
        }
        // 모달창 닫기
        setIsModalVisible(false);
    };

    const handleFormSubmit = async (values, type) => {
        confirm({
            title: '저장 확인',
            content: '정말로 저장하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                const employeeName = values.employeeName || '';
                const formattedValues = {
                    ...values,
                    title: performanceParam.title,
                    evaluationDate: performanceParam.evaluationDate,
                    score: performanceParam.score,
                    comments: performanceParam.comments,
                };
                const formData = new FormData();
                formData.append("formattedValues", JSON.stringify(formattedValues));

                try {
                    const API_PATH = type === 'update' ? EMPLOYEE_API.UPDATE_PERFORMANCE_API(performanceParam.id ) : EMPLOYEE_API.SAVE_PERFORMANCE_API;
                    const response = await apiClient.post(API_PATH,formData,{
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    const updatedData = response.data;

                    if (type === 'update') {
                        setPerformanceList((prevList) =>
                            prevList.map((employee) => employee.id === updatedData.id ? updatedData : employee)
                        );
                    } else {
                        setPerformanceList((prevList) => [...prevList, updatedData]);
                        registrationForm.resetFields();
                    }
                    setEditPerformance(false);
                    setFetchPerformanceData(null);
                    setPerformanceParam({});
                    setDisplayValues({});

                    type === 'update'
                        ? notify('success', '성과평가 수정', '성과평가 정보 수정 성공.', 'bottomRight')
                        : (notify('success', '성과평가 저장', '성과평가 정보 저장 성공.', 'bottomRight'), registrationForm.resetFields());
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

    // 탭 변경 핸들러
    const handleTabChange = (key) => {
        setEditPerformance(false);
        setFetchPerformanceData(null);
        setPerformanceParam({});
        setDisplayValues({});
        form.resetFields();
        registrationForm.resetFields(); // 2탭 폼 초기화
        registrationForm.setFieldValue(true);
        setActiveTabKey(key);
    };



    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="성과 평가 관리"
                        description={(
                            <Typography>
                                성과 평가 관리 페이지는 <span>사원의 성과 평가 데이터를 관리</span>하는 기능을 제공함. 이 페이지에서는 <span>평가 받은 개인별 성과를 조회</span>할 수 있으며, 이를 바탕으로 <span>보상이나 승진, 인사 조정</span>에 반영할 수 있음. 이를 통해 <span>사원의 성과를 체계적으로 관리</span>하고 인재 관리를 강화할 수 있음.
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
                                <Typography variant="h6" sx={{ padding: '20px' }}>성과평가 목록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Table
                                        dataSource={performanceList}
                                        columns={[
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
                                                title: <div className="title-text">평가자이름</div>,
                                                dataIndex: 'evaluatorName',
                                                key: 'evaluatorName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">평가제목</div>,
                                                dataIndex: 'title',
                                                key: 'title',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">평가일</div>,
                                                dataIndex: 'evaluationDate',
                                                key: 'evaluationDate',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">평가점수</div>,
                                                dataIndex: 'score',
                                                key: 'score',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">평가내용</div>,
                                                dataIndex: 'comments',
                                                key: 'comments',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
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
                                                setSelectedRowKeys([record.employeeId]); // 클릭한 행의 키로 상태 업데이트
                                                const id = record.employeeId;
                                                try {
                                                    const response = await apiClient.post(EMPLOYEE_API.PERFORMANCE_DETAIL_DATA_API(id));
                                                    setFetchPerformanceData(response.data);
                                                    setEditPerformance(true);
                                                    console.log(fetchPerformanceData);

                                                    notify('success', '성과 조회', '성과 평가 정보 조회 성공.', 'bottomRight')
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
            {editPerformance && (
                <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                    <Grow in={true} timeout={200}>
                        <Paper elevation={3} sx={{ height: '100%' }}>
                            <Typography variant="h6" sx={{ padding: '20px' }}>성과평가 수정</Typography>`
                            <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                <Form
                                    initialValues={fetchPerformanceData[0]}
                                    form={form}
                                    onFinish={(values) => { handleFormSubmit(values, 'update'); }}
                                >
                                    <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>기본 정보</Divider>
                                    <Row gutter={16}>
                                        <Col span={6}>
                                            <Form.Item name="employeeNumber">
                                                <Input addonBefore="사원번호" disabled/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item name="employeeName">
                                                <Input
                                                    addonBefore="사원이름" disabled/>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>
                                        평가 정보
                                    </Divider>

                                    <Row gutter={16}>
                                        <Col span={6}>
                                            <Form.Item name="evaluatorName" >
                                                <Input
                                                    addonBefore="평가자이름" disabled/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item name="evaluationDate" rules={[{ required: true, message: '평가일을 입력하세요.' }]}>
                                                <Input addonBefore="평가일"/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item name="title" rules={[{ required: true, message: '평가제목을 입력하세요.' }]}>
                                                <Input addonBefore="평가 제목"/>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item name="score" rules={[{ required: true, message: '평가점수를 입력하세요.' }]}>
                                                    <Input addonBefore="평가점수"/>
                                                </Form.Item>
                                            </Col>
                                        <Col span={12}>
                                            <Form.Item name="comments" rules={[{ required: true, message: '평가내용을 입력하세요.' }]}>
                                                <Input addonBefore="평가내용"/>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    {/* 저장 버튼 */}
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
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
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={5} sx={{ minWidth: '500px !important', maxWidth: '700px !important' }}>
                    </Grid>
                </Grid>
            )}
        </Box>
    )};
export default PerformanceEvaluationPage;