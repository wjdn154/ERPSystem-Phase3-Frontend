import React, { useEffect, useState } from 'react';
import { Box, Grid, Grow, Paper, Typography } from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './LeaveManagementUtil.jsx';
import {Space, Tag, Form, Table, Button, Col, Input, Row, Checkbox, Modal, Spin, Select, notification, Upload} from 'antd';
import apiClient from '../../../../config/apiClient.jsx';
import {EMPLOYEE_API} from '../../../../config/apiConstants.jsx';
import { Divider } from 'antd';
import { useNotificationContext } from "../../../../config/NotificationContext.jsx";
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";
const { Option } = Select;
const { confirm } = Modal;

const LeaveManagementPage = ({initialData}) => {
    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [form] = Form.useForm(); // 폼 인스턴스 생성
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [leaveList, setLeaveList] = useState(initialData);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 선택된 행 키 상태
    const [editLeave, setEditLeave] = useState(false);
    const [fetchLeaveData, setFetchLeaveData] = useState(false);
    const [leaveParam, setLeaveParam] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const [currentField, setCurrentField] = useState(''); // 모달 분기할 필드 상태
    const [modalData, setModalData] = useState(null); // 모달 데이터 상태
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 활성화 여부
    const [displayValues, setDisplayValues] = useState({});
    const [initialModalData, setInitialModalData] = useState(null);
    const [activeTabKey, setActiveTabKey] = useState('1');


    const fetchLeave = async () => {
        try{
            const response = await apiClient.post(EMPLOYEE_API.LEAVE_DATA_API);
            setLeaveList(response.data);
        } catch(error){
            notification.error({
                message: '직책 목록 조회 실패',
                description: '직책 목록을 불러오는 중 오류가 발생했습니다.',
            });
        }
    };


    useEffect(()=>{
        fetchLeave();
    }, []);

    useEffect(() => {
        if (!fetchLeaveData) return; // 선택된 사원 데이터가 없으면 종료
        console.log('Fetched Leave Data:', fetchLeaveData); // Employee 데이터 확인

        // firstName과 lastName을 조합해서 employeeName 필드에 설정
        form.setFieldsValue({
            ...fetchLeaveData,
            employeeName: `${fetchLeaveData.lastName}${fetchLeaveData.firstName}`
        });
        setLeaveParam(fetchLeaveData);

        setDisplayValues();
    }, [fetchLeaveData, form]);

    // 모달창 데이터 가져오기 함수
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;
        if(fieldName === 'leave') apiPath = EMPLOYEE_API.LEAVE_DATA_API;

        try {
            const response = await apiClient.post(apiPath);
            setModalData(response.data);
        } catch (error) {
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };

    // 모달창 열기 핸들러
    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setModalData(null); // 모달 열기 전에 데이터를 초기화
        fetchModalData(fieldName); // 모달 데이터 가져오기 호출
        setIsModalVisible(true); // 모달창 열기
    };
    // 모달창 닫기 핸들러
    const handleModalCancel = () => setIsModalVisible(false);

    // 탭 변경 핸들러
    const handleTabChange = (key) => {
        setEditLeave(false);
        setFetchLeaveData(null);
        setLeaveParam({});
        setDisplayValues({});
        form.resetFields();
        registrationForm.resetFields(); // 2탭 폼 초기화
        registrationForm.setFieldValue(true);
        setActiveTabKey(key);
    };

    // 모달창 선택 핸들러
    const handleModalSelect = (record) => {
        switch (currentField) {
            case 'leave':
                setLeaveParam((prevParams) => (prevParams));
                setDisplayValues((prevValues) => ({prevValues}));
                break;
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
                    id: values.id,
                    employeeName:values.employeeName,
                    employeeNumber: leaveParam.employeeNumber,
                    startDate: values.startDate,
                    endDate: values.endDate,
                    status: leaveParam.status,
                    typeName: leaveParam.typeName,
                };

                try {
                    //console.log(formattedValues);
                    const API_PATH = type === 'update' ? EMPLOYEE_API.LEAVE_DATA_API(leaveParam.id)  : EMPLOYEE_API.SAVE_LEAVE_API;
                    const response = await apiClient.post(API_PATH,formattedValues);
                    const updatedData = response.data;

                    if (type === 'update') {
                        setLeaveList((prevList) =>
                            prevList.map((leave) => leave.id === updatedData.id ? updatedData : leave)
                        );
                    } else {
                        setLeaveList((prevList) => [...prevList, updatedData]);
                        registrationForm.resetFields();
                    }
                    setEditLeave(false);
                    setFetchLeaveData(null);
                    setLeaveParam({});
                    setDisplayValues({});

                    type === 'update'
                        ? notify('success', '휴가 수정', '휴가 기록 수정 성공.', 'bottomRight')
                        : (notify('success', '휴가 저장', '휴가 기록 저장 성공.', 'bottomRight'), registrationForm.resetFields());
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

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="휴가 관리"
                        description={(
                            <Typography>
                                휴가 관리 페이지는 <span>사원의 휴가 신청 및 승인 내역</span>을 관리하는 기능을 제공함. 이 페이지에서는 <span>연차, 병가, 특별 휴가</span> 등의 정보를 기록하고 관리할 수 있으며, <span>휴가 사용 내역과 잔여 일수</span>를 정확히 파악할 수 있음. 이를 통해 <span>사원의 휴가 상태를 명확하게 관리</span>하고, 기업의 휴가 정책에 따라 휴가가 적절히 사용되도록 할 수 있음.
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
                                <Typography variant="h6" sx={{ padding: '20px' }}>휴가 목록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Table
                                        dataSource={leaveList}
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
                                                dataIndex: 'fullName',
                                                key: 'fullName',
                                                align: 'center',
                                                render: (text, record) => (
                                                    <div className="small-text">
                                                        {record.lastName}{record.firstName}
                                                    </div>
                                                ),
                                            },
                                            {
                                                title: <div className="title-text">직위</div>,
                                                dataIndex: 'positionName',
                                                key: 'positionName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">휴가 시작일</div>,
                                                dataIndex: 'startDate',
                                                key: 'startDate',
                                                align: 'center',
                                                sorter: (a, b) => {
                                                    return new Date(a.startDate) - new Date(b.startDate);
                                                },
                                                sortDirections: ['ascend', 'descend'],
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">휴가 종료일</div>,
                                                dataIndex: 'endDate',
                                                key: 'endDate',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">휴가 유형명</div>,
                                                dataIndex: 'typeName',
                                                key: 'typeName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">휴가 상태</div>,
                                                dataIndex: 'status',
                                                key: 'status',
                                                align: 'center',
                                                render: (text) => {
                                                    let color;
                                                    let value;
                                                    switch (text) {
                                                        case 'PENDING':
                                                            color = 'green';
                                                            value = '대기중';
                                                            break;
                                                        case 'APPROVED':
                                                            color = 'blue';
                                                            value = '승인됨';
                                                            break;
                                                        case 'REJECTED':
                                                            color = 'red';
                                                            value = '거절됨';
                                                            break;
                                                        default:
                                                            color = 'gray'; // 기본 색상
                                                    }
                                                    return <Tag style={{ marginLeft: '5px' }} color={color}>{value}</Tag>;
                                                },
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
                                        setSelectedRowKeys([record.id]); // 클릭한 행의 키로 상태 업데이트
                                        const id = record.id;
                                        try {
                                            const response = await apiClient.post(EMPLOYEE_API.LEAVE_DETAIL_DATA_API(id));
                                            setFetchLeaveData(response.data);
                                            setEditLeave(true);
                                            notify('success', '휴가 조회', '휴가 정보 조회 성공.', 'bottomRight')
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
                </Grid>
            )}

            {activeTabKey === '2' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={5} sx={{ minWidth: '500px !important', maxWidth: '700px !important' }}>
                        <Grow in={true} timeout={200}>
                            <div>
                                <TemporarySection />
                            </div>
                        </Grow>
                    </Grid>
                </Grid>
            )}

        </Box>
    );
};

export default LeaveManagementPage;