import React, {useEffect, useMemo, useState} from 'react';
import { Box, Grid, Grow, Paper, Typography } from '@mui/material';
import {Spin, Table, Button, DatePicker, Input, Modal, Tag, Row, Form, Space, Col} from 'antd';
import dayjs from 'dayjs';
import apiClient from "../../../../config/apiClient.jsx";
import {EMPLOYEE_API, } from "../../../../config/apiConstants.jsx";
import { useNotificationContext } from "../../../../config/NotificationContext.jsx";
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './SocialInsuranceUtil.jsx';
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";
const { RangePicker } = DatePicker;

const SocialInsurancePage = () => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    // const [employmentInsurancePensionData, setEmploymentInsurancePensionData] = useState(null);
    const [insuranceData, setInsuranceData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams, setSearchParams] = useState({
        startDate: null, endDate: null, code: ''
    });

    const handleInputChange = (e) => {
        setSearchParams({ ...searchParams, code: e.target.value });
    };

    // 탭 변경 처리
    const handleTabChange = (key) => {
        setActiveTabKey(key);
        resetSearchParams(); // 탭 변경 시 검색 초기화
    };

    // 검색조건 초기화
    const resetSearchParams = () => {
        setSearchParams({
            startDate: null, endDate: null, code: ''
        })
    }

    // 날짜 선택 처리
    const handleDateChange = (dates) => {
        if (dates) {
            setSearchParams({
                ...searchParams,
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD'),
            });
        }
    };

    // 검색 처리
    const handleSearch = async () => {
        const {startDate, endDate, code} = searchParams;

        // 장기요양보험이 아닐 경우 기간 입력이 필수
        if (activeTabKey !== '3' && (!startDate || !endDate)) {
            notify('warning', '입력 오류', '조회 기간을 선택해 주세요.', 'bottomRight');
            return;
        }

        try {
            setIsLoading(true);
            const response = await apiClient.post(apiMapping[activeTabKey], { startDate, endDate, code })
            setInsuranceData(response.data)
            notify('success', '조회 성공', '데이터 조회 성공', 'bottomRight')
        } catch (error) {
            notify('warning', '조회 실패', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    }

    // 각 탭에 대한 API 매핑
    const apiMapping = {
        '1': EMPLOYEE_API.EMPLOYMENT_INSURANCE_PENSION_API,
        '2': EMPLOYEE_API.HEALTH_INSURANCE_PENSION_API,
        '3': EMPLOYEE_API.LONG_TERM_CARE_INSURANCE_PENSION_API,
        '4': EMPLOYEE_API.NATIONAL_PENSION_API,
        '5': EMPLOYEE_API.INCOME_TAX_API,
    };

    const fetchInsuranceData = async () => {
        setIsLoading(true);

        try {
            const response = await apiClient.post(apiMapping[activeTabKey]);
            setInsuranceData(response.data);

        } catch (error) {
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    }

    // 페이지 로딩 시 데이터 조회
    useEffect(() => {

        fetchInsuranceData();
    }, [activeTabKey]);

    // Tab 1: 고용보험
    const employmentInsurancePensionColumns = [
        {
            title: <div className="title-text">기업 적용 요율</div>,
            dataIndex: 'companyRate',
            key: 'companyRate',
            align: 'center',
            render: (text) => <div className="small-text">{text ? `${(text * 100).toFixed(2)}%` : 'N/A'}</div>
        },
        {
            title: <div className="title-text">가입자 적용 요율</div>,
            dataIndex: 'employeeRate',
            key: 'employeeRate',
            align: 'center',
            render: (text) => <div className="small-text">{text ? `${(text * 100).toFixed(2)}%` : 'N/A'}</div>
        },
        {
            title: <div className="title-text">적용 시작 날짜</div>,
            dataIndex: 'startDate',
            key: 'startDate',
            align: 'center',
            render: (text) => <div className="small-text">{text}</div>
        },
        {
            title: <div className="title-text">적용 마감 날짜</div>,
            dataIndex: 'endDate',
            key: 'endDate',
            align: 'center',
            render: (text) => <div className="small-text">{text}</div>
        },
    ]

    // Tab 2 건강보험
    const healthInsurancePensionColumns = [
        {
            title: <div className="title-text">기업 적용 요율</div>,
            dataIndex: 'companyRate',
            key: 'companyRate',
            align: 'center',
            render: (text) => <div className="small-text">{text ? `${(text * 100).toFixed(2)}%` : 'N/A'}</div>
        },
        {
            title: <div className="title-text">가입자 적용 요율</div>,
            dataIndex: 'employeeRate',
            key: 'employeeRate',
            align: 'center',
            render: (text) => <div className="small-text">{text ? `${(text * 100).toFixed(2)}%` : 'N/A'}</div>
        },
        {
            title: <div className="title-text">최저하한 금액</div>,
            dataIndex: 'lowerAmount',
            key: 'startDate',
            align: 'center',
            render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()} 원</div>,
        },
        {
            title: <div className="title-text">최고상한 금액</div>,
            dataIndex: 'upperAmount',
            key: 'upperAmount',
            align: 'center',
            render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()} 원</div>,
        },
        {
            title: <div className="title-text">적용 시작 날짜</div>,
            dataIndex: 'startDate',
            key: 'startDate',
            align: 'center',
            render: (text) => <div className="small-text">{text}</div>
        },
        {
            title: <div className="title-text">적용 마감 날짜</div>,
            dataIndex: 'endDate',
            key: 'endDate',
            align: 'center',
            render: (text) => <div className="small-text">{text}</div>
        },
    ]

    // Tab3 장기요양보험
    const longTermCareInsuranceColumns = [
        {
            title: <div className="title-text">보험 코드</div>,
            dataIndex: 'code',
            key: 'code',
            align: 'center',
            render: (text) => <div className="small-text">{text}</div>,
        },
        {
            title: <div className="title-text">적용 요율</div>,
            dataIndex: 'rate',
            key: 'rate',
            align: 'right',
            render: (text) => <div className="small-text">{text ? `${(text * 100).toFixed(2)}%` : 'N/A'}</div>
        },
        {
            title: <div className="title-text">설명</div>,
            dataIndex: 'description',
            key: 'description',
            align: 'center',
            render: (text) => <div className="small-text">{text}</div>,
        },
        {
            title: <div className="title-text">적용 시작 날짜</div>,
            dataIndex: 'startDate',
            key: 'startDate',
            align: 'center',
            render: (text) => <div className="small-text">{text}</div>,
        },
        {
            title: <div className="title-text">적용 마감 날짜</div>,
            dataIndex: 'endDate',
            key: 'endDate',
            align: 'center',
            render: (text) => <div className="small-text">{text}</div>,
        },
    ];

    const nationalPensionColumns = [
        {
            title: <div className="title-text">기업 적용 요율</div>,
            dataIndex: 'companyRate',
            key: 'companyRate',
            align: 'center',
            render: (text) => <div className="small-text">{text ? `${(text * 100).toFixed(2)}%` : 'N/A'}</div>
        },
        {
            title: <div className="title-text">가입자 적용 요율</div>,
            dataIndex: 'employeeRate',
            key: 'employeeRate',
            align: 'center',
            render: (text) => <div className="small-text">{text ? `${(text * 100).toFixed(2)}%` : 'N/A'}</div>
        },
        {
            title: <div className="title-text">최저하한 금액</div>,
            dataIndex: 'lowerAmount',
            key: 'lowerAmount',
            align: 'center',
            render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()} 원</div>,
        },
        {
            title: <div className="title-text">최고상한 금액</div>,
            dataIndex: 'upperAmount',
            key: 'upperAmount',
            align: 'center',
            render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()} 원</div>,
        },
        {
            title: <div className="title-text">적용 시작 날짜</div>,
            dataIndex: 'startDate',
            key: 'startDate',
            align: 'center',
            render: (text) => <div className="small-text">{text}</div>,
        },
        {
            title: <div className="title-text">적용 마감 날짜</div>,
            dataIndex: 'endDate',
            key: 'endDate',
            align: 'center',
            render: (text) => <div className="small-text">{text}</div>,
        },
    ];

    const incomeTaxColumns = [
        {
            title: <div className="title-text">과세표준 하한</div>,
            dataIndex: 'lowAmount',
            key: 'lowAmount',
            align: 'center',
            render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()} 원</div>,
        },
        {
            title: <div className="title-text">과세표준 상한</div>,
            dataIndex: 'highAmount',
            key: 'highAmount',
            align: 'center',
            render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()} 원</div>,
        },
        {
            title: <div className="title-text">세율</div>,
            dataIndex: 'rate',
            key: 'rate',
            align: 'center',
            render: (text) => <div className="small-text">{Number(text).toFixed(2)}%</div>,
        },
        {
            title: <div className="title-text">누진공제액</div>,
            dataIndex: 'taxCredit',
            key: 'taxCredit',
            align: 'center',
            render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()} 원</div>,
        },
    ];

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="공제산출근거"
                        description={(
                            <Typography>
                                공제산출근거 페이지는 <span>고용보험, 건강보험, 장기요양보험, 국민연금, 소득세</span> 공제 항목의 세부 내용을 제공합니다. 법정 공제 산출 근거와 계산 과정을 정확하게 확인할 수 있습니다. 이를 통해 <span>급여의 공제 산출근거</span>를 투명하게 관리하고, <span>공제 관련 법적 요구 사항</span>을 준수합니다.
                                {/*공제산출근거 페이지는 <span>사원의 사회보험 가입 상태 및 보험료</span>를 관리하는 기능을 제공함. 이 페이지에서는 <span>국민연금, 건강보험, 고용보험</span> 등의 사회보험 정보를 관리하고, 각 사원의 <span>보험료 납부 내역</span>을 조회할 수 있음. 이를 통해 <span>정확한 사회보험 납부 관리</span>와 급여 계산 시 자동으로 반영되는 보험료 계산을 지원함.*/}
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
                    <Grid item xs={12} md={8} sx={{ minWidth: '700px' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >고용보험 조회</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form layout="vertical">
                                        <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                                            <Col>
                                                <Form.Item
                                                    label="조회 기간"
                                                    required
                                                    tooltip="검색할 기간의 시작일과 종료일을 선택하세요"
                                                >
                                                    <RangePicker
                                                        disabledDate={(current) => current && current.year() !== 2024}
                                                        onChange={handleDateChange}
                                                        defaultValue={[
                                                            searchParams.startDate ? dayjs(searchParams.startDate, 'YYYY-MM-DD') : null,
                                                            searchParams.endDate ? dayjs(searchParams.endDate, 'YYYY-MM-DD') : null,
                                                        ]}
                                                        format="YYYY-MM-DD"
                                                        style={{ width: '250px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Form.Item>
                                                    <Button style={{ width: '100px' }} type="primary" onClick={handleSearch}  icon={<SearchOutlined />} block>
                                                        검색
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Grid>
                                <Grid sx={{ margin: '20px' }}>
                                    <Table
                                        dataSource={insuranceData}
                                        columns={employmentInsurancePensionColumns}
                                        rowKey="id"
                                        pagination={false}
                                        size={'small'}
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

            {/* Tab 2: 건강보험 */}
            {activeTabKey === '2' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={8} sx={{ minWidth: '700px' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }}>건강보험 조회</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form layout="vertical">
                                        <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                                            <Col>
                                                <Form.Item
                                                    label="조회 기간"
                                                    required
                                                    tooltip="검색할 기간의 시작일과 종료일을 선택하세요"
                                                >
                                                    <RangePicker
                                                        disabledDate={(current) => current && current.year() !== 2024}
                                                        onChange={handleDateChange}
                                                        defaultValue={[
                                                            searchParams.startDate ? dayjs(searchParams.startDate, 'YYYY-MM-DD') : null,
                                                            searchParams.endDate ? dayjs(searchParams.endDate, 'YYYY-MM-DD') : null,
                                                        ]}
                                                        format="YYYY-MM-DD"
                                                        style={{ width: '250px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Form.Item>
                                                    <Button style={{ width: '100px' }} type="primary" onClick={handleSearch}  icon={<SearchOutlined />} block>
                                                        검색
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Grid>
                                <Grid sx={{ margin: '20px' }}>
                                    <Table
                                        dataSource={insuranceData}
                                        columns={healthInsurancePensionColumns}
                                        rowKey="id"
                                        loading={isLoading}
                                        pagination={false}
                                        size="small"
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

            {/* Tab 3: 장기요양보험 */}
            {activeTabKey === '3' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={8} sx={{ minWidth: '700px' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }}>장기요양보험 조회</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form layout="vertical">
                                        <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                                            <Col>
                                                <Form.Item
                                                    label="보험 코드"
                                                    tooltip="검색할 보험 코드를 입력하세요"
                                                >
                                                    <Input
                                                        placeholder="코드 입력"
                                                        value={searchParams.code}
                                                        onChange={handleInputChange}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Form.Item
                                                    label="조회 기간"
                                                    tooltip="검색할 기간의 시작일과 종료일을 선택하세요"
                                                >
                                                    <RangePicker
                                                        disabledDate={(current) => current && current.year() !== 2024}
                                                        onChange={handleDateChange}
                                                        defaultValue={[
                                                            searchParams.startDate ? dayjs(searchParams.startDate, 'YYYY-MM-DD') : null,
                                                            searchParams.endDate ? dayjs(searchParams.endDate, 'YYYY-MM-DD') : null,
                                                        ]}
                                                        format="YYYY-MM-DD"
                                                        style={{ width: '250px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Form.Item>
                                                    <Button style={{ width: '100px' }} type="primary" onClick={handleSearch}  icon={<SearchOutlined />} block>
                                                        검색
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Grid>
                                <Grid sx={{ margin: '20px' }}>
                                    <Table
                                        dataSource={insuranceData}
                                        columns={longTermCareInsuranceColumns}
                                        rowKey="id"
                                        loading={isLoading}
                                        pagination={false}
                                        size="small"
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

            {/* Tab 4: 국민연금 */}
            {activeTabKey === '4' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={8} sx={{ minWidth: '700px' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }}>국민연금 조회</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form layout="vertical">
                                        <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                                            <Col>
                                                <Form.Item
                                                    label="조회 기간"
                                                    required
                                                    tooltip="검색할 기간의 시작일과 종료일을 선택하세요"
                                                >
                                                    <RangePicker
                                                        disabledDate={(current) => current && current.year() !== 2024}
                                                        onChange={handleDateChange}
                                                        defaultValue={[
                                                            searchParams.startDate ? dayjs(searchParams.startDate, 'YYYY-MM-DD') : null,
                                                            searchParams.endDate ? dayjs(searchParams.endDate, 'YYYY-MM-DD') : null,
                                                        ]}
                                                        format="YYYY-MM-DD"
                                                        style={{ width: '250px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Form.Item>
                                                    <Button style={{ width: '100px' }} type="primary" onClick={handleSearch}  icon={<SearchOutlined />} block>
                                                        검색
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Grid>
                                <Grid sx={{ margin: '20px' }}>
                                    <Table
                                        dataSource={insuranceData}
                                        columns={nationalPensionColumns}
                                        rowKey="id"
                                        loading={isLoading}
                                        pagination={false}
                                        size="small"
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

            {/* Tab 5: 소득세 */}
            {activeTabKey === '5' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={8} sx={{ minWidth: '700px' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }}>소득세 조회</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form layout="vertical">
                                        <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                                            <Col>
                                                <Form.Item
                                                    label="조회 기간"
                                                    required
                                                    tooltip="검색할 기간의 시작일과 종료일을 선택하세요"
                                                >
                                                    <RangePicker
                                                        disabledDate={(current) => current && current.year() !== 2024}
                                                        onChange={handleDateChange}
                                                        defaultValue={[
                                                            searchParams.startDate ? dayjs(searchParams.startDate, 'YYYY-MM-DD') : null,
                                                            searchParams.endDate ? dayjs(searchParams.endDate, 'YYYY-MM-DD') : null,
                                                        ]}
                                                        format="YYYY-MM-DD"
                                                        style={{ width: '250px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Form.Item>
                                                    <Button style={{ width: '100px' }} type="primary" onClick={handleSearch}  icon={<SearchOutlined />} block>
                                                        검색
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Grid>
                                <Grid sx={{ margin: '20px' }}>
                                    <Table
                                        dataSource={insuranceData}
                                        columns={incomeTaxColumns}
                                        rowKey="id"
                                        loading={isLoading}
                                        pagination={false}
                                        size="small"
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default SocialInsurancePage;