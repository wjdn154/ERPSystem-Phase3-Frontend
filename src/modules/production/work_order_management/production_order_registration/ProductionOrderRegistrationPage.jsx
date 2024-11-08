import React, {useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './ProductionOrderRegistrationUtil.jsx';
import {Typography} from '@mui/material';
import {Tag, Button, Col, Card, DatePicker, Form, Row, Steps, Table, Spin, Input, Modal, Checkbox} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import dayjs from "dayjs";
import {SearchOutlined} from "@ant-design/icons";
import apiClient from "../../../../config/apiClient.jsx";
import {EMPLOYEE_API, FINANCIAL_API, PRODUCTION_API} from "../../../../config/apiConstants.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
const { Step } = Steps;

const ProductionOrderRegistrationPage = () => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [searchData, setSearchData] = useState(null);
    const [expandedRowKeys , setExpandedRowKeys ] = useState(null);
    const [activeStep, setActiveStep] = useState({});
    const [modalData, setModalData] = useState({});
    const [updatedSaveParamsState, setUpdatedSaveParamsState] = useState();
    const [selectedWorkers, setSelectedWorkers] = useState([]);
    const [productionOrderId, setProductionOrderId] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 활성화 여부 상태
    const [submit, setSubmit] = useState(false); // 모달 활성화 여부 상태
    const [activeStepDetails, setActiveStepDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(null);
    const [searchParams, setSearchParams] = useState({
        searchDate: null,
    });
    const [saveParams, setSaveParams] = useState({
        mpsId: null,
        processDetailsId: null,
        processRoutingStepId: null,
        name: null,
        remarks: null,
        confirmed: false,
        closed: false,
        startDateTime: null,
        endDateTime: null,
        productionQuantity: null,
        workers: null,
    });

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedWorkers(selectedRows); // 선택한 작업자 목록을 업데이트
        },
        selectedRowKeys: selectedWorkers.map(worker => worker.name), // 선택된 작업자들을 테이블에 반영
    };

    const handleSearch = async () => {
        const { searchDate } = searchParams;
        // 입력값 검증
        if (!searchDate) {
            notify('warning', '입력 오류', '모든 필드를 입력해 주세요.', 'bottomRight');
            return;
        }

        try {
            const response = await apiClient.post(PRODUCTION_API.MPS_LIST_API, {
                searchDate: searchDate,
            }) ;
            const data = response.data;
            console.log(data);
            setSearchData(data);
            setModalData(null);
            setActiveStepDetails(null);
            setSaveParams(null);
            setSubmit(false);
            notify('success', '조회 성공', 'mps 조회 성공.', 'bottomRight');
        } catch (error) {
            console.log(error);
            notify('error', '조회 오류', 'mps 조회 중 오류가 발생했습니다.', 'top');
        }
    };

    const handleStepClick = (stepIndex, recordKey) => {
        const clickedStep = searchData
            .find((record) => record.id === recordKey)
            .routingSteps[stepIndex]; // 클릭된 스텝의 정보를 가져옴

        setActiveStep((prevActiveStep) => ({
            ...prevActiveStep,
            [recordKey]: stepIndex,
        }));

        setSaveParams({
            ...saveParams,
            processDetailsId: clickedStep.processDetails.id,
            processRoutingStepId: clickedStep.id.processRoutingId
        });

        setActiveStepDetails(clickedStep); // 클릭된 스텝 정보를 상태에 저장
    };

    const handleSave = async (values) => {
        try {
            const updatedSaveParams = {
                ...saveParams,
                name: values.orderName,
                remarks: values.orderDescription,
                startDateTime: values.startTime ? dayjs(values.startTime).format("YYYY-MM-DDTHH:mm:ss") : null,
                endDateTime: values.endTime ? dayjs(values.endTime).format("YYYY-MM-DDTHH:mm:ss") : null,
                workers: selectedWorkers.length,
                confirmed: values.confirmed || false
            };

            console.log(updatedSaveParams);
            const response = await apiClient.post(PRODUCTION_API.PRODUCTION_ORDER_SAVE_API, updatedSaveParams);
            setUpdatedSaveParamsState(updatedSaveParams);
            setProductionOrderId(response.data.id); // 저장된 ID 사용
            setSubmit(true);
            notify('success', '작업 저장 성공', '작업이 성공적으로 저장되었습니다.');

        } catch (error) {
            notify('error', '오류 발생', '작업 지시 저장 중 오류가 발생했습니다.');
        }
    };


    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="작업 지시 등록"
                        description={(
                            <Typography>
                                작업 지시 등록 페이지는 <span>생산 공정에 필요한 작업 지시를 관리</span>하는 곳임. 이 페이지에서는 <span>작업 지시의 생성, 수정, 삭제</span>가 가능하며, 각 작업 지시에는 <span>지시 내용, 작업 일정, 배정된 인원</span> 등의 정보를 입력할 수 있음. 이를 통해 <span>작업의 진행 상황</span>을 체계적으로 관리하고, 작업이 원활하게 이루어지도록 지원함.
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
                    <Grid item xs={12} md={10} sx={{ minWidth: '800px'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%', marginBottom: '20px'}}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >작업 지시 생성</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form layout="vertical">
                                        <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                                            <Col>
                                                <Form.Item
                                                    label="조회 기간"
                                                    required
                                                    tooltip="검색할 기간의 시작일과 종료일을 선택하세요"
                                                >
                                                    <DatePicker
                                                        disabledDate={(current) => current && current.year() !== 2024}
                                                        value={searchParams.searchDate ? dayjs(searchParams.searchDate) : null} // selectedDate가 null일 때를 처리
                                                        onChange={(date) => {
                                                            if (date) {
                                                                setSearchParams({
                                                                    ...searchParams,
                                                                    searchDate: date.format('YYYY-MM-DD'),  // 날짜가 선택된 경우
                                                                });
                                                            } else {
                                                                setSearchParams({
                                                                    ...searchParams,
                                                                    searchDate: null,  // 날짜가 삭제된 경우 (X 버튼 클릭)
                                                                });
                                                            }
                                                        }}
                                                        style={{ width: '250px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Form.Item>
                                                    <Button
                                                        style={{ width: '100px' }}
                                                        type="primary"
                                                        onClick={handleSearch}
                                                        icon={<SearchOutlined />}
                                                        block
                                                    >
                                                        검색
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                    <Table
                                        dataSource={searchData ? searchData : []}
                                        columns={[
                                            {
                                                title: <div className="title-text">MPS명</div>,
                                                dataIndex: 'name',
                                                key: 'name',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">계획일</div>,
                                                dataIndex: 'planDate',
                                                key: 'planDate',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">시작일</div>,
                                                dataIndex: 'startDate',
                                                key: 'startDate',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">종료일</div>,
                                                dataIndex: 'endDate',
                                                key: 'endDate',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">상태</div>,
                                                dataIndex: 'status',
                                                key: 'status',
                                                align: 'center',
                                                render: (text) => (
                                                    <Tag color={text === '계획' ? 'blue' : 'green'}>
                                                        {text}
                                                    </Tag>
                                                ),
                                            },
                                            {
                                                title: <div className="title-text">제품명</div>,
                                                dataIndex: 'productName',
                                                key: 'productName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">생산량</div>,
                                                dataIndex: 'quantity',
                                                key: 'quantity',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text.toLocaleString()}</div>,
                                            },
                                            {
                                                title: <div className="title-text">비고</div>,
                                                dataIndex: 'remarks',
                                                key: 'remarks',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                        ]}
                                        expandable={{
                                            expandedRowRender: (record) => (
                                                <Steps
                                                    direction="horizontal"
                                                    size="small"
                                                    current={activeStep[record.id] || 0}
                                                >
                                                    {record.routingSteps.map((step, index) => (
                                                        <Step
                                                            key={`${step.id.processRoutingId}-${step.id.processId}-${index}`}
                                                            title={step.processDetails.name}
                                                            onClick={() => handleStepClick(index, record.id)}  // index 사용하여 클릭한 단계 활성화
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    ))}
                                                </Steps>
                                            ),
                                            rowExpandable: (record) => record.routingSteps && record.routingSteps.length > 0,
                                        }}
                                        onRow={(record) => {
                                            return {
                                                onClick: () => {

                                                    setSaveParams({
                                                        ...saveParams,
                                                        mpsId: record.id, // MPS ID 저장
                                                        productionQuantity: record.quantity, // 생산량 저장
                                                    });

                                                    setModalData(searchData[0].workers);

                                                    setExpandedRowKeys((prevKeys) => {
                                                        const expanded = Array.isArray(prevKeys) ? [...prevKeys] : [];
                                                        const index = expanded.indexOf(record.id);

                                                        if (index > -1) {
                                                            expanded.splice(index, 1);
                                                        } else {
                                                            expanded.length = 0;
                                                            expanded.push(record.id);
                                                        }
                                                        return expanded;
                                                    });
                                                },
                                                style: { cursor: 'pointer' },
                                            };
                                        }}
                                        expandedRowKeys={expandedRowKeys}
                                        pagination={false}
                                        size="small"
                                        rowKey="id"
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                    {activeStepDetails && (
                        <Grid item xs={12} md={10} sx={{ minWidth: '800px'}}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{ height: '100%', marginBottom: '20px'}}>
                                    <Typography variant="h6" sx={{ padding: '20px' }} >프로세스: {activeStepDetails.processDetails.name}</Typography>
                                        <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                            <Table
                                                dataSource={activeStepDetails.processDetails.workcenterDTOList}
                                                columns={[
                                                    {
                                                        title: <div className="title-text">작업장</div>,
                                                        dataIndex: 'name',
                                                        key: 'name',
                                                        align: 'center',
                                                        render: (text) => <div className="small-text">{text}</div>,
                                                    },
                                                    {
                                                        title: <div className="title-text">작업장 유형</div>,
                                                        dataIndex: 'workcenterType',
                                                        key: 'workcenterType',
                                                        align: 'center',
                                                        render: (text) => {
                                                            let translatedText;
                                                            let tagColor;

                                                            switch (text) {
                                                                case 'Press':
                                                                    translatedText = '프레스 작업장';
                                                                    tagColor = 'blue';
                                                                    break;
                                                                case 'Assembly':
                                                                    translatedText = '조립 작업장';
                                                                    tagColor = 'green';
                                                                    break;
                                                                case 'Casting':
                                                                    translatedText = '주조 작업장';
                                                                    tagColor = 'red';
                                                                    break;
                                                                case 'Welding':
                                                                    translatedText = '용접 작업장';
                                                                    tagColor = 'orange';
                                                                    break;
                                                                case 'Paint':
                                                                    translatedText = '도장 작업장';
                                                                    tagColor = 'purple';
                                                                    break;
                                                                case 'Plastic_Molding':
                                                                    translatedText = '플라스틱 성형 작업장';
                                                                    tagColor = 'cyan';
                                                                    break;
                                                                case 'Quality_Inspection':
                                                                    translatedText = '품질 검사';
                                                                    tagColor = 'magenta';
                                                                    break;
                                                                case 'Forging':
                                                                    translatedText = '단조 작업';
                                                                    tagColor = 'gold';
                                                                    break;
                                                                case 'Heat_Treatment':
                                                                    translatedText = '열처리 작업';
                                                                    tagColor = 'lime';
                                                                    break;
                                                                case 'Machining':
                                                                    translatedText = '기계 가공 작업';
                                                                    tagColor = 'geekblue';
                                                                    break;
                                                                case 'Plastic Molding':
                                                                    translatedText = '플라스틱 성형 작업';
                                                                    tagColor = 'volcano';
                                                                    break;
                                                                default:
                                                                    translatedText = text;
                                                                    tagColor = 'default';
                                                                    break;
                                                            }

                                                            return (
                                                                <Tag color={tagColor}>
                                                                    {translatedText}
                                                                </Tag>
                                                            );
                                                        }
                                                    },
                                                    {
                                                        title: <div className="title-text">공장</div>,
                                                        dataIndex: 'factoryName',
                                                        key: 'factoryName',
                                                        align: 'center',
                                                        render: (text) => <div className="small-text">{text}</div>,
                                                    },
                                                    {
                                                        title: <div className="title-text">설명</div>,
                                                        dataIndex: 'description',
                                                        key: 'description',
                                                        align: 'center',
                                                        render: (text) => <div className="small-text">{text || '설명 없음'}</div>,
                                                    },
                                                ]}

                                                onRow={(record) => {
                                                    return {
                                                        onClick: () => {
                                                            setIsModalVisible(true);
                                                        },
                                                        style: { cursor: 'pointer' },
                                                    };
                                                }}
                                                pagination={false}
                                                size="small"
                                                rowKey="id"
                                            />
                                            <Form
                                                layout="vertical"
                                                style={{ marginTop: '20px' }}
                                                onFinish={async (values) => {

                                                    if(dayjs(values.startTime).isAfter(dayjs(values.endTime))) {
                                                        notify('error', '입력 오류', '시작일이 종료일보다 늦을 수 없습니다.');
                                                        return;
                                                    }

                                                    if (selectedWorkers.length === 0) {
                                                        notify('warning', '입력 오류', '작업장을 눌러 작업자를 선택하세요.');
                                                        return;
                                                    }
                                                    handleSave(values);
                                                }}
                                            >
                                                {/* 작업 지시명 */}
                                                <Form.Item
                                                    label="작업 지시명"
                                                    name="orderName"
                                                    rules={[{ required: true, message: '작업 지시명을 입력하세요!' }]}
                                                >
                                                    <Input placeholder="작업 지시명을 입력하세요" />
                                                </Form.Item>

                                                {/* 작업 지시 설명 */}
                                                <Form.Item
                                                    label="작업 지시 설명"
                                                    name="orderDescription"
                                                    rules={[{ required: true, message: '작업 지시 설명을 입력하세요!' }]}
                                                >
                                                    <Input placeholder="작업 지시 설명을 입력하세요" />
                                                </Form.Item>

                                                {/* 선택된 작업자 */}
                                                <Form.Item label="선택된 작업자">
                                                    <div>
                                                        {selectedWorkers.map((worker) => (
                                                            <Tag key={worker.name} color="blue" style={{ marginBottom: '8px' }}>
                                                                {worker.name} ({worker.position})
                                                            </Tag>
                                                        ))}
                                                    </div>
                                                </Form.Item>

                                                <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                                    <Col span={6}>
                                                        <Form.Item
                                                            label="작업 시작 시간"
                                                            name="startTime"
                                                            rules={[{ required: true, message: '작업 시작 시간을 선택하세요!' }]}
                                                        >
                                                            <DatePicker
                                                                showTime
                                                                format="YYYY-MM-DD HH:mm:ss"
                                                                placeholder="작업 시작 시간을 선택하세요"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </Form.Item>
                                                    </Col>

                                                    <Col span={6}>
                                                        <Form.Item
                                                            label="작업 끝 시간"
                                                            name="endTime"
                                                            rules={[{ required: true, message: '작업 끝 시간을 선택하세요!' }]}
                                                        >
                                                            <DatePicker
                                                                showTime
                                                                format="YYYY-MM-DD HH:mm:ss"
                                                                placeholder="작업 끝 시간을 선택하세요"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </Form.Item>
                                                    </Col>

                                                    <Col span={4} offset={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                        <Form.Item>
                                                            <Button type="primary" htmlType="submit" style={{ width: '100px' }}>
                                                                작업 저장
                                                            </Button>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
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
            {/*        <Grid item xs={12} md={5} sx={{ minWidth: '500px !important', maxWidth: '700px !important' }}>*/}
            {/*            <Grow in={true} timeout={200}>*/}
            {/*                <div>*/}
            {/*                    <TemporarySection />*/}
            {/*                </div>*/}
            {/*            </Grow>*/}
            {/*        </Grid>*/}
            {/*    </Grid>*/}
            {/*)}*/}
            <Modal
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                width="40vw"
                footer={null}
            >{isLoading ? (
                <Spin />  // 로딩 스피너
            ) : (
                <>
                    <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                        작업자 선택
                    </Typography>
                    <Input
                        placeholder="작업자 검색"
                        prefix={<SearchOutlined />}
                        onChange={(e) => {
                            const value = e.target.value.toLowerCase(); // 입력값을 소문자로 변환
                            if (!value) {
                                setModalData(searchData[0].workers); // 초기 데이터를 세팅
                            } else {
                                console.log(value);
                                const filtered = searchData[0].workers.filter((item) => {
                                    return (
                                        (item.name && item.name.toLowerCase().includes(value)) || // 작업자 이름으로 필터링
                                        (item.position && item.position.toLowerCase().includes(value)) // 직책으로 필터링
                                    );
                                });
                                setModalData(filtered);
                            }
                        }}
                        style={{ marginBottom: 16 }}
                    />
                    {searchData && (
                        <Table
                            rowSelection={rowSelection} // rowSelection 추가
                            columns={[
                                {
                                    title: <div className="title-text">작업자 이름</div>,
                                    dataIndex: 'name',
                                    key: 'name',
                                    align: 'center',
                                    render: (text) => <div className="small-text">{text}</div>,
                                },
                                {
                                    title: <div className="title-text">직책</div>,
                                    dataIndex: 'position',
                                    key: 'position',
                                    align: 'center',
                                    render: (text) => <div className="small-text">{text}</div>,
                                },
                            ]}
                            dataSource={modalData}
                            rowKey="name"
                            size={'small'}
                            pagination={{
                                pageSize: 15,
                                position: ['bottomCenter'],
                                showSizeChanger: false,
                                showTotal: (total) => `총 ${total}명`,
                            }}
                        />
                    )}


                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={() => setIsModalVisible(false)} variant="contained" type="danger" sx={{ mr: 1 }}>
                            닫기
                        </Button>
                    </Box>
                </>
            )}
            </Modal>

        </Box>
    );
};

export default ProductionOrderRegistrationPage;