import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './WorkcenterUtil.jsx';
import {Typography} from '@mui/material';
import {Button, Col, Divider, Form, Input, Modal, notification, Row, Select, Table} from 'antd';
import WorkcenterListSection from "./tab1_workcenter_list/WorkcenterListSection.jsx";
import {workcenterColumns} from "./WorkcenterColumn.jsx";
import {getRowClassName} from "./WorkcenterUtil.jsx";
import SelectedWorkcenterSection from "./tab1_workcenter_list/SelectedWorkcenterSection.jsx";
import WorkerAssignmentPage from "./tab3_workcenter_assignment/WorkerAssignmentPage.jsx";
import {useWorkcenter} from "./WorkcenterHook.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {PRODUCTION_API, LOGISTICS_API} from "../../../../config/apiConstants.jsx";
import {fetchWorkcenter, fetchWorkcenters} from "./WorkcenterApi.jsx";
import {SearchOutlined} from "@ant-design/icons";

const WorkcenterManagementPage = ({ initialData }) => {

    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [form] = Form.useForm(); // 폼 인스턴스 생성
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [workcenter, setWorkcenter] = useState(null); // 선택된 작업장 데이터 관리
    const [workcenterList, setWorkcenterList] = useState(initialData || []);
    const [filteredData, setFilteredData] = useState(workcenterList); // 필터링된 데이터 관리

    const [workcenterParam, setWorkcenterParam] = useState({
        workcenterType:'',
    }); // 선택된 작업장 데이터 관리
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 상태 관리
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const [displayValues, setDisplayValues] = useState({});
    const [modalData, setModalData] = useState([]); // 모달에 사용할 데이터 관리
    const [initialModalData, setInitialModalData] = useState([]);

    const {
        data,
        setData,
        handleSave,
        handleSelectedRow,
        handleDeleteWorkcenter,
        // isWorkcenterModalVisible,
        // handleClose,
        handleInputChange,
        handleAddWorkcenter,
        searchData,
        isSearchActive,
        handleTabChange,
        activeTabKey,
        reloadWorkcenters,
    } = useWorkcenter(initialData);

    useEffect(() => {
        setFilteredData(data); // 초기 데이터 설정
    }, [data]);

    // 검색 핸들러
    const handleSearch = async () => {
        const { code, name, workcenterType } = searchParams;

        try {
            const filtered = data.filter((item) => {
                const matchesCode = code ? item.code.includes(code) : true;
                const matchesName = name ? item.name.includes(name) : true;
                const matchesType = workcenterType ? item.workcenterType === workcenterType : true;
                return matchesCode && matchesName && matchesType;
            });

            setFilteredData(filtered); // 필터된 데이터 설정
        } catch (error) {
            console.error('검색 오류:', error);
        }
    };

    // 폼 초기화
    const handleReset = () => {
        form.resetFields();
        setSearchParams({ code: '', name: '', workcenterType: '' }); // 검색 조건 초기화
        setFilteredData(data); // 원래 데이터로 초기화
    };

    // 폼 제출 핸들러
    const handleFormSubmit = async (values, workcenterType) => {
        console.log('handleFormSubmit 호출됨. 폼 제출 값:', values);  // 전달된 값 확인

        Modal.confirm({
            title: '저장 확인',
            content: '정말로 저장하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                try {
                    const apiPath = PRODUCTION_API.UPDATE_WORKCENTER_API(values.code);
                    console.log('UPDATE_WORKCENTER_API 경로:', apiPath); // 경로 로그로 확인
                    await apiClient.post(apiPath, values);
                    notify('success', '성공', '작업장이 저장되었습니다.', 'bottomRight');
                    await reloadWorkcenters();

                } catch (error) {
                    console.error('저장 실패:', error);
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
                        title="작업장 관리"
                        description={(
                            <Typography>
                                작업장 관리 페이지는 <span>제품을 생산하는 작업장에 대한 기본 정보를 관리</span>하는 곳임. 이 페이지에서는 작업장을 관리해서 작업장의 <span>작업장 유형, 배정 작업자, 설비 정보</span>를 입력할 수 있음. 또한 작업장 간의 <span>생산 공정 배분</span> 및 <span>작업량 조정</span>을 효율적으로 관리할 수 있음.
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
                    <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1200px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >작업장 목록</Typography>
                                {/* 기본 데이터 목록 */}
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Table
                                        columns={workcenterColumns}
                                        dataSource={data}
                                        pagination={{ pageSize: 15, position: ['bottomCenter'], showSizeChanger: false }}
                                        rowClassName={getRowClassName}
                                        rowSelection={{
                                            type: 'radio', // 선택 방식 (radio or checkbox)
                                            selectedRowKeys: selectedRowKeys, // 선택된 행의 키들
                                            onChange: (newSelectedRowKeys) => {
                                                console.log('새로운 Row Keys:', newSelectedRowKeys); // 디버그용 로그
                                                setSelectedRowKeys(newSelectedRowKeys); // 선택된 행의 키 업데이트
                                            },
                                        }}
                                        rowKey="code" // Workcenter에서 고유 CODE 필드를 사용
                                        size="small"
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: async () => {
                                                setSelectedRowKeys([record.code]); // 클릭한 행의 키로 상태 업데이트
                                                try {
                                                    // 작업장 상세 정보 가져오기 (API 호출)
                                                    const detail = await fetchWorkcenter(record.code);
                                                    console.log("fetchWorkcenter respone of record.code: ", detail)

                                                    setWorkcenter(detail); // 선택된 작업장 데이터 설정
                                                    setWorkcenterParam(detail);
                                                    notify('success', '작업장 조회', '작업장 정보 조회 성공.', 'bottomRight');
                                                } catch (error) {
                                                    console.error("작업장 정보 조회 실패:", error);
                                                    notify('error', '조회 오류', '작업장 정보 조회 중 오류가 발생했습니다.', 'top');
                                                }
                                            },
                                        })}
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>

                    {/* 선택한 작업장 조회 */}
                    {workcenter && (
                        <SelectedWorkcenterSection
                            key={workcenter.code}  // 선택된 작업장마다 고유 key 부여 <= 선택한 행 작업장의 상세조회 창 바뀜
                            workcenter={workcenter}
                            handleInputChange={handleInputChange}
                            handleSave={handleSave}
                            handleSelectedRow={handleSelectedRow}
                            handleDeleteWorkcenter={handleDeleteWorkcenter}
                            rowClassName={getRowClassName}
                            handleFormSubmit={handleFormSubmit}
                        />
                    )}
                </Grid>
            )}

            {activeTabKey === '2' && (
                <Grid item xs={12} md={6} sx={{ minWidth: '700px !important', maxWidth: '1200px !important' }}>
                    <Grow in={true} timeout={200}>
                        <Paper elevation={3} sx={{ height: '100%' }}>
                            <Typography variant="h6" sx={{ padding: '20px' }}>작업장 등록</Typography>
                            <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                <Form
                                    layout="vertical"
                                    form={form}
                                    onFinish={(values) => handleFormSubmit(values)}
                                    initialValues={{
                                        workcenterType: 'Press', // 기본값 설정
                                    }}
                                >
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="code"
                                                label="작업장 코드"
                                                rules={[{ required: true, message: '작업장 코드를 입력해주세요.' }]}
                                                readOnly
                                            >
                                                <Input placeholder="예: WC001" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="name"
                                                label="작업장 이름"
                                                rules={[{ required: true, message: '작업장 이름을 입력해주세요.' }]}
                                            >
                                                <Input placeholder="예: 프레스 작업장" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="workcenterType"
                                                label="작업장 유형"
                                                rules={[{ required: true, message: '작업장 유형을 선택해주세요.' }]}
                                            >
                                                <Select placeholder="작업장 유형 선택">
                                                    <Select.Option value="Press">프레스</Select.Option>
                                                    <Select.Option value="Assembly">조립</Select.Option>
                                                    <Select.Option value="Welding">용접</Select.Option>
                                                    <Select.Option value="Machining">가공</Select.Option>
                                                    <Select.Option value="Quality Inspection">품질 검사</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="description"
                                                label="설명"
                                                rules={[{ required: false }]}
                                            >
                                                <Input.TextArea rows={2} placeholder="작업장 설명을 입력하세요." />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <Form.Item
                                                name="equipmentIds"
                                                label="설비 선택"
                                            >
                                                <Select

                                                    mode="tags"
                                                    style={{ width: '100%' }}
                                                    placeholder="설치된 설비를 선택하세요."
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={24} style={{ textAlign: 'right' }}>
                                            <Button type="primary" htmlType="submit">
                                                저장
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </Grid>
                        </Paper>
                    </Grow>
                </Grid>
            )}

            {activeTabKey === '3' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={6} sx={{ minWidth: '1000px !important', maxWidth: '1200px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }}>오늘의 작업자</Typography>
                                    <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                        {/* 작업장별 오늘의 작업자 배정 명단 */}
                                        <WorkerAssignmentPage />
                                    </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

        </Box>
    );
};

export default WorkcenterManagementPage;