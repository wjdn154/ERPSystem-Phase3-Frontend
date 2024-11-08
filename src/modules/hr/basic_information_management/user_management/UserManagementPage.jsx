import React, {useEffect, useState} from 'react';
import { Box, Grid, Grow, Paper, Typography } from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './UserManagementUtil.jsx';
import {Space, Tag, Form, Table, Button, Col, Input, Row, Checkbox, Modal, Spin, Select, notification, Upload} from 'antd';
import apiClient from '../../../../config/apiClient.jsx';
import {EMPLOYEE_API} from '../../../../config/apiConstants.jsx';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import { Divider } from 'antd';
import { useNotificationContext } from "../../../../config/NotificationContext.jsx";
import {DownSquareOutlined, EyeInvisibleOutlined, EyeOutlined, SearchOutlined} from "@ant-design/icons";
const { Option } = Select;
const { confirm } = Modal;


const UserManagementPage = ({initialData}) => {
    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [form] = Form.useForm(); // 폼 인스턴스 생성
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [userList, setUserList] = useState(initialData); // 사원 목록 상태
    const [activeTabKey, setActiveTabKey] = useState('1'); // 활성 탭 키 상태
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 선택된 행 키 상태
    const [editUser, setEditUser] = useState(false); // 사원 수정 탭 활성화 여부 상태
    const [fetchUserData, setFetchUserData] = useState(false); // 사원 조회한 정보 상태
    const [userParam, setUserParam] = useState(false); // 수정할 사원 정보 상태
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const [currentField, setCurrentField] = useState(''); // 모달 분기할 필드 상태
    const [modalData, setModalData] = useState(null); // 모달 데이터 상태
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 활성화 여부
    const [displayValues, setDisplayValues] = useState({});
    const [initialModalData, setInitialModalData] = useState(null);


    useEffect(() => {
        if (!fetchUserData || !fetchUserData.employeeName) return;

        // firstName과 lastName을 조합해서 employeeName 필드에 설정
        form.setFieldsValue({
            ...fetchUserData,
            employeeName: fetchUserData.employeeName,
        });
        setUserParam(fetchUserData);

        setDisplayValues({});
    }, [fetchUserData, form]);

    const togglePasswordVisibility = (record) => {
        setUserList((prevList) =>
            prevList.map((user) =>
                user.id === record.id ? { ...user, passwordVisible: !user.passwordVisible } : user
            )
        );
    };


    const handleTabChange = (key) => {
        setEditUser(false);
        setFetchUserData(null);
        setUserParam({});
        setDisplayValues({});
        form.resetFields();
        registrationForm.resetFields(); // 2탭 폼 초기화
        registrationForm.setFieldValue(true);
        setActiveTabKey(key);
    };

    const columns = [
        {
            title: <div className="title-text">사용자 아이디</div>,
            dataIndex: 'userName',
            key: 'userName',
            align: 'center',
            width: '25%',
            render: (text) => <div className="small-text">{text}</div>,
        },
        {
            title: <div className="title-text">사용자 이름</div>,
            dataIndex: 'userNickname',
            key: 'userNickname',
            align: 'center',
            width: '20%',

            render: (text) => <div className="small-text">{text}</div>,
        },
        {
            title: <div className="title-text">사원번호</div>,
            dataIndex: 'employeeNumber',
            key: 'employeeNumber',
            align: 'center',
            width: '20%',
            render: (text) => <div className="small-text">{text}</div>,
        },
        {
            title: <div className="title-text">사원이름</div>,
            dataIndex: 'employeeName',
            key: 'employeeName',
            align: 'center',
            width: '35%',
            render: (text) => <div className="small-text">{text}</div>,
        },
        // {
        //     title: <div className="title-text">비밀번호</div>,
        //     dataIndex: 'password',
        //     key: 'password',
        //     align: 'center',
        //     render: (text, record) => (
        //         <div className="small-text">
        //             {record.passwordVisible ? text : '●●●●●●'}
        //             <span
        //                 onClick={() => togglePasswordVisibility(record)}
        //                 style={{ marginLeft: 8, cursor: 'pointer' }}
        //             >
        //                 {record.passwordVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        //             </span>
        //         </div>
        //     ),
        // },
    ];

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} >
                    <WelcomeSection
                        title="사용자 관리"
                        description={(
                            <Typography>
                                사용자 관리 페이지는 <span>시스템에 접근할 수 있는 사용자 계정</span>을 관리하는 기능을 제공함. 이 페이지에서는 <span>사용자 목록 조회가 가능함.</span>
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
                    <Grid item xs={12} sx={{ minWidth: '800px', maxWidth: '1200px', margin: 'auto' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ padding: '20px' }}>
                                <Typography variant="h6" sx={{ marginBottom: '20px' }}>사용자 목록</Typography>
                                    <Table
                                        dataSource={userList}
                                        columns={columns}
                                        rowKey={(record) => record.id}
                                        pagination={{ pageSize: 15, position: ['bottomCenter'], showSizeChanger: false }}
                                        size="small"
                                        rowSelection={{
                                            type: 'radio',
                                            selectedRowKeys,
                                            onChange:async (newSelectedRowKeys) => {
                                                setSelectedRowKeys(newSelectedRowKeys);
                                                const id = newSelectedRowKeys[0];
                                                try {
                                                    const response = await apiClient.post(EMPLOYEE_API.USERS_DATA_DETAIL_API(id));
                                                    setFetchUserData(response.data);
                                                    setEditUser(true);
                                                    notify('success', '사용자 조회', '사용자 정보 조회 성공.', 'bottomRight')
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
                                                    const response = await apiClient.post(EMPLOYEE_API.USERS_DATA_DETAIL_API(id));
                                                    setFetchUserData(response.data);
                                                    setEditUser(true);
                                                    notify('success', '사용자 조회', '사용자 정보 조회 성공.', 'bottomRight')
                                                } catch (error) {
                                                    notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
                                                }
                                            },
                                        })}
                                    />
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

            {editUser && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} sx={{ minWidth: '800px', maxWidth: '1200px', margin: 'auto' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ padding: '20px' }}>
                                <Typography variant="h6" sx={{ marginBottom: '20px' }}>사용자 정보수정</Typography>
                                <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                    <Form
                                        initialValues={fetchUserData}
                                        form={form}
                                        onFinish={(values) => {
                                            handleFormSubmit(values, 'update')
                                        }}
                                    >
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item name="userName"
                                                           rules={[{required: true, message: '사용자 아이디를 입력하세요.'}]}>
                                                    <Input addonBefore="사용자 아이디"/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="userNickname"
                                                           rules={[{required: true, message: '사용자 이름을 입력하세요.'}]}>
                                                    <Input addonBefore="사용자 이름"/>
                                                </Form.Item>
                                            </Col>
                                            {/*<Col span={6}>*/}
                                            {/*    <Form.Item name="password"*/}
                                            {/*               rules={[{required: true, message: '비밀번호를 입력하세요.'}]}>*/}
                                            {/*        <Input addonBefore="비밀번호"/>*/}

                                            {/*    </Form.Item>*/}
                                            {/*</Col>*/}
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item name="employeeNumber"
                                                           rules={[{required: true, message: '사원번호를 입력하세요.'}]}>
                                                    <Input addonBefore="사원번호" disabled/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="employeeName" rules={[{ required: true, message: '사원이름을 입력하세요.' }]}>
                                                    <Input addonBefore="사원이름" disabled />
                                                </Form.Item>
                                            </Col>
                                        </Row>
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

export default UserManagementPage;