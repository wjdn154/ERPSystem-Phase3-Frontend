import React, {useEffect, useMemo, useState} from 'react';
import {Paper, Box, Grid, Grow, Card} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { processRoutingColumns, tabItems} from './RoutingManagementUtil.jsx';
import {Typography} from '@mui/material';
import {
    Steps,
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
    notification,
    Tabs
} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {EMPLOYEE_API, FINANCIAL_API, LOGISTICS_API, PRODUCTION_API} from "../../../../config/apiConstants.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import dayjs from 'dayjs';
import { Divider } from 'antd';
import {
    CloseCircleOutlined,
    CloseSquareOutlined, DeleteOutlined,
    DownSquareOutlined, MinusCircleOutlined, PlusOutlined, ScissorOutlined,
    SearchOutlined,
    StopOutlined
} from "@ant-design/icons";
import TabPane from "antd/es/tabs/TabPane.js";
const { Option } = Select;
const { confirm } = Modal;
const { Step } = Steps

const RoutingManagementPage = ({initialData}) => {
    const notify = useNotificationContext();
    const [form] = Form.useForm();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [displayValues, setDisplayValues] = useState({});
    const [fetchRoutingData, setFetchRoutingData] = useState(null);
    const [editRouting, setEditRouting] = useState(false);

    useEffect(() => {
        if (!fetchRoutingData) return;

        form.setFieldsValue(fetchRoutingData);

    }, [fetchRoutingData, form]);



    const handleTabChange = (key) => { setActiveTabKey(key); };
    const handleModalCancel = () => { setIsModalVisible(false) };  // 모달창 닫기


    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setModalData(null);
        setInitialModalData(null);
        fetchModalData(fieldName);  // 모달 데이터 가져오기 호출
        setIsModalVisible(true);  // 모달창 열기
    };

    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;
        if(fieldName === 'processDetails') apiPath = PRODUCTION_API.ROUTING_SEARCH_PROCESS_DETAILS_API;

        try {
            const response = await apiClient.post(apiPath);
            setModalData(response.data);
            setInitialModalData(response.data);
        } catch (error) {
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };

    const handleModalSelect = (record) => {
        const isDuplicate = fetchRoutingData.processDetails.some(
            (detail) => detail.id === record.id
        );

        if (isDuplicate) {
            notify('warning', '중복 경고', '이미 추가된 공정 경로입니다.', 'bottomRight');
            return;
        }

        setFetchRoutingData((prevParams) => ({
            ...prevParams,
            processDetails: [...prevParams.processDetails, record],
        }));

        setIsModalVisible(false); // 모달창 닫기
    };

    const handleFormSubmit = async (values, type) => {
        // values.id = fetchRoutingData.id;
        // values.processDetails = fetchRoutingData.processDetails;
        // values.products = fetchRoutingData.products;

        setFetchRoutingData({
            ...fetchRoutingData,
            active: values.active,
            code: values.code,
            description: values.description,
            name: values.name,
            standard: values.standard,
        })

        confirm({
            title: '저장 확인',
            content: '정말로 저장하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                try {
                    if (type === 'register') {
                        // await apiClient.post(PRODUCTION_API.SAVE_WORKCENTER_API, values);
                        // notify('success', '등록 성공', '새 작업장이 등록되었습니다.', 'bottomRight');
                    } else if (type === 'update') {
                        // await apiClient.post(PRODUCTION_API.ROUTING_UPDATE_API, {
                        //     code:"PRC001",
                        //     cost:500000,
                        //     defectRate:0.02,
                        //     description:"Assembly of parts and modules. 부품 및 모듈 조립.",
                        //     duration:2.5,
                        //     id:1,
                        //     isOutsourced:false,
                        //     isUsed:true,
                        //     name:"조립"
                        // });
                        await apiClient.post(PRODUCTION_API.ROUTING_UPDATE_API, {
                            id:fetchRoutingData.id,
                            code:values.code,
                            name:values.name,
                            // cost:values.cost,
                            standard:values.standard,
                            active:values.active,
                            description:values.description,
                            // defectRate:values.defectRate,
                            // duration:values.duration,
                            // isOutsourced:values.isOutsourced,
                            // isUsed:values.isUsed,
                            processDetails:fetchRoutingData.processDetails,
                            products:fetchRoutingData.products
                        });
                        notify('success', '수정 성공', '공정 경로가 수정되었습니다.', 'bottomRight');
                    }
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

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="Routing 관리"
                        description={(
                            <Typography>
                                Routing 관리 페이지는 <span>제품 생산에 필요한 공정 흐름을 관리</span>하는 곳임. 각 제품의 생산 과정을 <span>효율적으로 연결</span>하고, <span>공정 순서</span>를 최적화하여 생산 속도를 높일 수 있음. <br/>
                                이 페이지에서는 <span>Routing 경로를 설정, 수정</span>할 수 있으며, <span>각 공정의 순서와 의존성</span>을 관리할 수 있음.
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
                                <Typography variant="h6" sx={{ padding: '20px' }} >Routing 목록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    {/* ProcessRouting 목록 */}
                                    <Table
                                        dataSource={initialData}
                                        columns={[
                                            {
                                                title: <div className="title-text">코드</div>,
                                                dataIndex: 'code',
                                                key: 'code',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">루트명</div>,
                                                dataIndex: 'name',
                                                key: 'name',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">표준 여부</div>,
                                                dataIndex: 'standard',
                                                key: 'standard',
                                                align: 'center',
                                                render: (standard) => (
                                                    <Tag color={standard ? 'green' : 'red'}>
                                                        {standard ? '표준' : '비표준'}
                                                    </Tag>
                                                ),
                                            },
                                            {
                                                title: <div className="title-text">설명</div>,
                                                dataIndex: 'description',
                                                key: 'description',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">활성 상태</div>,
                                                dataIndex: 'active',
                                                key: 'active',
                                                align: 'center',
                                                render: (active) => (
                                                    <Tag color={active ? 'green' : 'red'}>
                                                        {active ? '활성' : '비활성'}
                                                    </Tag>
                                                ),
                                            },
                                            {
                                                title: <div className="title-text">제품 목록</div>,
                                                key: 'products',
                                                align: 'center',
                                                render: (record) => <div className="small-text">{record.products && record.products.length > 0
                                                    ? `${record.products[0].name} 외 ${record.products.length - 1}건`
                                                    : '제품 없음'}</div>,
                                            },
                                        ]}
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
                                                setSelectedRowKeys([record.id]);
                                                const id = record.id;
                                                try {
                                                    const response = await apiClient.post(PRODUCTION_API.ROUTING_DETAIL_API(id));
                                                    setFetchRoutingData(response.data);
                                                    setEditRouting(true);

                                                    notify('success', '루트 조회', '루트 정보 조회 성공.', 'bottomRight');
                                                } catch (error) {
                                                    notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
                                                }
                                            }
                                        })}
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                    {editRouting && (
                        <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{ height: '100%' }}>
                                    <Typography variant="h6" sx={{ padding: '20px' }}>루트 등록 및 수정</Typography>
                                    <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                        <Form
                                            initialValues={fetchRoutingData}
                                            form={form}
                                            onFinish={(values) => { handleFormSubmit(values, 'update') }}
                                        >
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>기본 정보</Divider>
                                            <Row gutter={16}>
                                                <Col span={6}>
                                                    <Form.Item name="code" rules={[{ required: true, message: '코드를 입력하세요.' }]}>
                                                        <Input addonBefore="코드" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="name" rules={[{ required: true, message: '루트명을 입력하세요.' }]}>
                                                        <Input addonBefore="루트명" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item name="description" rules={[{ required: true, message: '설명을 입력하세요.' }]}>
                                                        <Input addonBefore="설명" />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>상태 정보</Divider>
                                            <Row gutter={16}>
                                                <Col span={6}>
                                                    <Form.Item name="active" valuePropName="checked">
                                                        <Checkbox>활성 여부</Checkbox>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="standard" valuePropName="checked">
                                                        <Checkbox>표준 여부</Checkbox>
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>공정 단계</Divider>
                                            <Row gutter={16}>
                                                <Col span={16}>
                                                    <Steps direction="vertical" current={fetchRoutingData.processDetails.length - 1}>
                                                        {fetchRoutingData.processDetails.map((step, index) => (
                                                            <Step
                                                                key={step.id}
                                                                title={
                                                                    <div className="medium-text">
                                                                        {step.name} (공정 코드: {step.code})
                                                                        <Button
                                                                            type="text"
                                                                            icon={<MinusCircleOutlined style={{ color: 'red' }} />}
                                                                            style={{ marginLeft: '10px' }}
                                                                            onClick={async () => {
                                                                                const updatedSteps = fetchRoutingData.processDetails.filter(
                                                                                    (item) => item.id !== step.id
                                                                                );
                                                                                setFetchRoutingData({
                                                                                    ...fetchRoutingData,
                                                                                    processDetails: updatedSteps, // 상태 갱신
                                                                                });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                }
                                                                description={
                                                                    <>
                                                                        <div className="small-text">
                                                                            <span className="medium-text">비용: </span>{step.cost.toLocaleString()} 원
                                                                        </div>
                                                                        <div className="small-text">
                                                                            <span className="medium-text">소요 시간: </span>{step.duration} 시간
                                                                        </div>
                                                                        <div className="small-text">
                                                                            <span className="medium-text">불량률: </span>{(step.defectRate * 100).toFixed(2)}%
                                                                        </div>
                                                                        <div className="small-text">
                                                                            <span className="medium-text">설명: </span>{step.description}
                                                                        </div>
                                                                        <div>
                                                                            외주 여부: <Tag color={step.isOutsourced ? 'red' : 'green'}>{step.isOutsourced ? '외주' : '내부'}</Tag>
                                                                        </div>
                                                                    </>
                                                                }
                                                            />
                                                        ))}
                                                    </Steps>
                                                        {/* 공정 추가 버튼 */}
                                                        <Step
                                                            key="add-step"
                                                            description={
                                                                <Button
                                                                    icon={<PlusOutlined />}
                                                                    onClick={() => handleInputClick('processDetails')}
                                                                    style={{
                                                                        outline: 'none',
                                                                        marginTop: '20px',
                                                                        marginBottom: '20px',
                                                                        width: '50%',
                                                                        height: '40px',
                                                                    }}
                                                                >
                                                                    공정 경로 추가
                                                                </Button>
                                                            }
                                                        />
                                                </Col>
                                            </Row>

                                            {/* 제품 목록 */}
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>제품 목록</Divider>
                                            <Row gutter={16}>
                                                <Col span={24}>
                                                    <Form.Item>
                                                        <Table
                                                            dataSource={fetchRoutingData.products}
                                                            columns={[
                                                                {
                                                                    title: '제품 코드',
                                                                    dataIndex: 'code',
                                                                    key: 'code',
                                                                    align: 'center',
                                                                    render: (text) => <div className="small-text">{text}</div>,
                                                                },
                                                                {
                                                                    title: '제품명',
                                                                    dataIndex: 'name',
                                                                    key: 'name',
                                                                    align: 'center',
                                                                    render: (text) => <div className="small-text">{text}</div>,
                                                                },
                                                                {
                                                                    title: '제품 그룹명',
                                                                    dataIndex: 'productGroupName',
                                                                    key: 'productGroupName',
                                                                    align: 'center',
                                                                    render: (text) => <div className="small-text">{text || '-'}</div>,
                                                                },
                                                                {
                                                                    title: '규격',
                                                                    dataIndex: 'standard',
                                                                    key: 'standard',
                                                                    align: 'center',
                                                                    render: (text) => <div className="small-text">{text || '-'}</div>,
                                                                },
                                                                {
                                                                    title: '구매 가격',
                                                                    dataIndex: 'purchasePrice',
                                                                    key: 'purchasePrice',
                                                                    align: 'center',
                                                                    render: (text) => <div style={{ textAlign: 'right' }} className="small-text">{text ? text.toLocaleString() : '-'}</div>,
                                                                },
                                                                {
                                                                    title: '판매 가격',
                                                                    dataIndex: 'salesPrice',
                                                                    key: 'salesPrice',
                                                                    align: 'center',
                                                                    render: (text) => <div style={{ textAlign: 'right' }} className="small-text">{text ? text.toLocaleString() : '-'}</div>,
                                                                },
                                                                {
                                                                    title: '제품 유형',
                                                                    dataIndex: 'productType',
                                                                    key: 'productType',
                                                                    align: 'center',
                                                                    render: (text) => (
                                                                        <Tag color={text === 'GOODS' ? 'green' : 'blue'}>
                                                                            {text ? (text === 'GOODS' ? '상품' : '반제품') : '-'}
                                                                        </Tag>
                                                                    ),
                                                                },
                                                            ]}
                                                            rowKey="id"
                                                            pagination={false}
                                                            size="small"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Divider />

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

            {/*{activeTabKey === '2' && (*/}
            {/*    <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>*/}
            {/*        <Grid item xs={12} md={5} sx={{ minWidth: '500px !important', maxWidth: '1500px !important' }}>*/}
            {/*            <Grow in={true} timeout={200}>*/}
            {/*                <Paper elevation={3} sx={{ height: '100%' }}>*/}
            {/*                    <Typography variant="h6" sx={{ padding: '20px' }}>Routing 등록</Typography>*/}
            {/*                        <Grid sx={{ padding: '0px 20px 0px 20px' }}>*/}

            {/*                        </Grid>*/}
            {/*                </Paper>*/}

            {/*            </Grow>*/}
            {/*        </Grid>*/}
            {/*    </Grid>*/}
            {/*)}*/}
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
                        {currentField === 'processDetails' && (
                            <>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                    공정 선택
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
                                            render: (text) => <div className="small-text">{text}</div>
                                        },
                                    ]}
                                    dataSource={modalData}
                                    rowKey="id"
                                    size={'small'}
                                    pagination={{
                                        pageSize: 15,
                                        position: ['bottomCenter'],
                                        showSizeChanger: false,
                                        showTotal: (total) => `총 ${total}개`,
                                    }}
                                    onRow={(record) => ({
                                        style: { cursor: 'pointer' },
                                        onClick: () => handleModalSelect(record), // 선택 시 처리
                                    })}
                                />
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

export default RoutingManagementPage;