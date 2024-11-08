import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './DailyMonthlyReportUtil.jsx';
import {Typography} from '@mui/material';
import {Table, Button, DatePicker, Col, Form, Row} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import dayjs from "dayjs";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {FINANCIAL_API} from "../../../../config/apiConstants.jsx";
import {SearchOutlined} from "@ant-design/icons";
const { RangePicker } = DatePicker;

const DailyMonthlyReportPage = () => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [dailyReportData, setDailyReportData] = useState(null);
    const [monthlyReportData, setMonthlyReportData] = useState(null);
    const [dailyProcessedData, setDailyProcessedData] = useState([]);
    const [monthlyProcessedData, setMonthlyProcessedData] = useState([]);
    const [searchParamsDaily, setSearchParamsDaily] = useState({
        journalType: null,
        startDate: null,
        endDate: null,
    });
    const [searchParamsMonthly, setSearchParamsMonthly] = useState({
        journalType: null,
        startDate: null,
        endDate: null,
    });

    useEffect(() => {
        if (dailyReportData) {
            let categoryCounter = 1; // Medium_category 카운터 초기화
            const newData = dailyReportData.map((item) => {
                if (item.level === 'Medium_category' && !item.isCounted) {
                    item.name = `${categoryCounter}. [${item.name}]`;
                    item.isCounted = true;
                    categoryCounter++;
                }
                return item;
            });
            setDailyProcessedData(newData);
        }
    }, [dailyReportData]);

    useEffect(() => {
        if (monthlyReportData) {
            let categoryCounter = 1; // Medium_category 카운터 초기화
            const newData = monthlyReportData.map((item) => {
                if (item.level === 'Medium_category' && !item.isCounted) {
                    item.name = `${categoryCounter}. [${item.name}]`;
                    item.isCounted = true;
                    categoryCounter++;
                }
                return item;
            });
            setMonthlyProcessedData(newData);
        }
    }, [monthlyReportData]);

    const handleRenderName = (level, text) => {
        if (level === 'Medium_category') {
            return <div className="medium-text">{text}</div>;
        } else if (level === 'Small_category') {
            return <div className="medium-text">[{text}]</div>;
        } else if (level === 'Account_name') {
            return <div className="medium-text">{text}</div>;
        } else if (level === null) {
            return <div className="medium-text">{text}</div>;
        }
    };

    // 날짜 선택 처리
    const handleDailyDateChange = (dates) => {
        if (dates) {
            setSearchParamsDaily({
                ...searchParamsDaily,
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD'),
            });
        }
    };
    const handleMonthlyDateChange = (dates) => {
        if (dates) {
            setSearchParamsMonthly({
                ...searchParamsMonthly,
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD'),
            });
        }
    };

    // 검색 처리
    const handleSearch = async (params) => {
        const { startDate, endDate, journalType } = params;

        // 입력값 검증
        if (!startDate || !endDate || !journalType) {
            notify('warning', '입력 오류', '모든 필드를 입력해 주세요.', 'bottomRight');
            return;
        }

        try {
            if (journalType === 'Daily') {
                const response = await apiClient.post(FINANCIAL_API.DAILY_AND_MONTH_JOURNAL_LEDGER_API, params);
                const data = response.data;
                setDailyReportData(data);
                console.log(data);
            }else if (journalType === 'Monthly') {
                const response = await apiClient.post(FINANCIAL_API.DAILY_AND_MONTH_JOURNAL_LEDGER_API, params);
                const data = response.data;
                setMonthlyReportData(data);
                console.log(data);
            }
        } catch (error) {
            notify('error', '조회 오류', '일계표/월계표 조회 중 오류가 발생했습니다.', 'top');
        }
    };

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="일계표/월계표"
                        description={(
                            <Typography>
                                일계표/월계표 페이지는 기업의 재무 데이터를 <span>일별 혹은 월별로 집계</span>하여 보여주는 기능을 제공함.<br/>
                                일계표와 월계표를 통해 사용자는 <span>각종 거래 내역의 요약</span>을 확인하고, 특정 기간 동안의 <span>재무 상태를 분석</span>할 수 있음. 이를 통해 <span>신속한 재무 보고서 작성</span>이 가능함.
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
                                <Typography variant="h6" sx={{ padding: '20px' }} >일계표 조회</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Grid sx={{ marginTop: '20px', marginBottom: '20px' }}>
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
                                                            onChange={handleDailyDateChange}
                                                            style={{ width: '250px', marginRight: '10px' }}
                                                            defaultValue={[
                                                                searchParamsDaily.startDate ? dayjs(searchParamsDaily.startDate, 'YYYY-MM-DD') : null,
                                                                searchParamsDaily.endDate ? dayjs(searchParamsDaily.endDate, 'YYYY-MM-DD') : null,
                                                            ]}
                                                            format="YYYY-MM-DD"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col>
                                                    <Form.Item>
                                                        <Button
                                                            icon={<SearchOutlined />}
                                                            style={{ width: '100px' }}
                                                            type="primary"
                                                            onClick={() => {
                                                                setSearchParamsDaily((prevParams) => {
                                                                    const updatedParams = {
                                                                        ...prevParams,
                                                                        journalType: 'Daily',
                                                                    };
                                                                    handleSearch(updatedParams); // 상태 업데이트 후 바로 검색 실행
                                                                    return updatedParams;
                                                                });
                                                            }}
                                                        >
                                                            검색
                                                        </Button>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Grid>
                                    <Table
                                        style={{ marginBottom: '20px' }}
                                        dataSource={dailyProcessedData ? dailyProcessedData.map((item, index) => ({
                                            key: `entry-${index}`,
                                            level: item.level,
                                            name: item.name,
                                            cashTotalDebit: item.cashTotalDebit,
                                            subTotalDebit: item.subTotalDebit,
                                            sumTotalDebit: item.sumTotalDebit,
                                            cashTotalCredit: item.cashTotalCredit,
                                            subTotalCredit: item.subTotalCredit,
                                            sumTotalCredit: item.sumTotalCredit,
                                        })) : []}
                                        columns={[
                                            {
                                                title: <div className="title-text">차변</div>,
                                                children: [
                                                    {
                                                        title: <div className="title-text">현금</div>,
                                                        dataIndex: 'cashTotalDebit',
                                                        key: 'cashTotalDebit',
                                                        align: 'center',
                                                        render: (text, record) => record.level === null ?
                                                            <div className="medium-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                                                            : record.level !== 'Account_name' ?
                                                                (text !== null ? <div className="medium-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '')
                                                                : (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : ''),
                                                    },
                                                    {
                                                        title: <div className="title-text">대체</div>,
                                                        dataIndex: 'subTotalDebit',
                                                        key: 'subTotalDebit',
                                                        align: 'center',
                                                        render: (text, record) => record.level === null ?
                                                            <div className="medium-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                                                            : record.level !== 'Account_name' ?
                                                                (text !== null ? <div className="medium-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '')
                                                                : (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : ''),
                                                    },
                                                    {
                                                        title: <div className="title-text">합계</div>,
                                                        dataIndex: 'sumTotalDebit',
                                                        key: 'sumTotalDebit',
                                                        align: 'center',
                                                        render: (text, record) => record.level === null ?
                                                            <div className="medium-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                                                            : record.level !== 'Account_name' ?
                                                                (text !== null ? <div className="medium-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '')
                                                                : (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : ''),
                                                    },
                                                ],
                                            },
                                            {
                                                title: <div className="title-text">계정과목</div>,
                                                dataIndex: 'name',
                                                key: 'name',
                                                align: 'center',
                                                width: '15%',
                                                onCell: () => ({
                                                    style: { backgroundColor: '#F7F7F7' },
                                                }),
                                                render: (text, record) => handleRenderName(record.level, text),
                                            },
                                            {
                                                title: <div className="title-text">대변</div>,
                                                children: [
                                                    {
                                                        title: <div className="title-text">현금</div>,
                                                        dataIndex: 'cashTotalCredit',
                                                        key: 'cashTotalCredit',
                                                        align: 'center',
                                                        render: (text, record) => record.level === null ?
                                                            <div className="medium-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                                                            : record.level !== 'Account_name' ?
                                                                (text !== null ? <div className="medium-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '')
                                                                : (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : ''),
                                                    },
                                                    {
                                                        title: <div className="title-text">대체</div>,
                                                        dataIndex: 'subTotalCredit',
                                                        key: 'subTotalCredit',
                                                        align: 'center',
                                                        render: (text, record) => record.level === null ?
                                                            <div className="medium-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                                                            : record.level !== 'Account_name' ?
                                                                (text !== null ? <div className="medium-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '')
                                                                : (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : ''),
                                                    },
                                                    {
                                                        title: <div className="title-text">합계</div>,
                                                        dataIndex: 'sumTotalCredit',
                                                        key: 'sumTotalCredit',
                                                        align: 'center',
                                                        render: (text, record) => record.level === null ?
                                                            <div className="medium-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                                                            : record.level !== 'Account_name' ?
                                                                (text !== null ? <div className="medium-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '')
                                                                : (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : ''),
                                                    },
                                                ],
                                            }
                                        ]}
                                        rowKey="key"
                                        // pagination={{ pageSize: 30, position: ['bottomCenter'], showSizeChanger: false }}
                                        pagination={ false }
                                        bordered={true}
                                        size={'small'}
                                        rowClassName={(record) => {
                                            return record.level !== 'Account_name' ? 'summary-row' : '';
                                        }}
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

            {activeTabKey === '2' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >월계표 조회</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Grid sx={{ width: '100%', marginBottom: '20px' }}>
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
                                                            onChange={handleMonthlyDateChange}
                                                            style={{ width: '250px' }}
                                                            picker="month"  // 월 단위로 설정
                                                            defaultValue={[
                                                                searchParamsMonthly.startDate ? dayjs(searchParamsMonthly.startDate, 'YYYY-MM') : null,
                                                                searchParamsMonthly.endDate ? dayjs(searchParamsMonthly.endDate, 'YYYY-MM') : null,
                                                            ]}
                                                            format="YYYY-MM"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col>
                                                    <Form.Item>
                                                        <Button
                                                            icon={<SearchOutlined />}
                                                            style={{ width: '100px' }}
                                                            type="primary"
                                                            onClick={() => {
                                                                setSearchParamsMonthly((prevParams) => {
                                                                    const updatedParams = {
                                                                        ...prevParams,
                                                                        journalType: 'Monthly',
                                                                    };
                                                                    handleSearch(updatedParams); // 상태 업데이트 후 바로 검색 실행
                                                                    return updatedParams;
                                                                });
                                                            }}
                                                        >
                                                            검색
                                                        </Button>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Form>

                                    </Grid>
                                    <Table
                                        style={{ marginBottom: '20px' }}
                                        dataSource={monthlyProcessedData ? monthlyProcessedData.map((item, index) => ({
                                            key: `entry-${index}`,
                                            level: item.level,
                                            name: item.name,
                                            cashTotalDebit: item.cashTotalDebit,
                                            subTotalDebit: item.subTotalDebit,
                                            sumTotalDebit: item.sumTotalDebit,
                                            cashTotalCredit: item.cashTotalCredit,
                                            subTotalCredit: item.subTotalCredit,
                                            sumTotalCredit: item.sumTotalCredit,
                                        })) : []}
                                        columns={[
                                            {
                                                title: <div className="title-text">차변</div>,
                                                children: [
                                                    {
                                                        title: <div className="title-text">현금</div>,
                                                        dataIndex: 'cashTotalDebit',
                                                        key: 'cashTotalDebit',
                                                        align: 'center',
                                                        render: (text, record) => record.level === null ?
                                                            <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                                                            : record.level !== 'Account_name' ?
                                                                (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '')
                                                                : (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : ''),
                                                    },
                                                    {
                                                        title: <div className="title-text">대체</div>,
                                                        dataIndex: 'subTotalDebit',
                                                        key: 'subTotalDebit',
                                                        align: 'center',
                                                        render: (text, record) => record.level === null ?
                                                            <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                                                            : record.level !== 'Account_name' ?
                                                                (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '')
                                                                : (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : ''),
                                                    },
                                                    {
                                                        title: <div className="title-text">합계</div>,
                                                        dataIndex: 'sumTotalDebit',
                                                        key: 'sumTotalDebit',
                                                        align: 'center',
                                                        render: (text, record) => record.level === null ?
                                                            <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                                                            : record.level !== 'Account_name' ?
                                                                (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '')
                                                                : (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : ''),
                                                    },
                                                ],
                                            },
                                            {
                                                title: <div className="title-text">계정과목</div>,
                                                dataIndex: 'name',
                                                key: 'name',
                                                align: 'center',
                                                width: '15%',
                                                onCell: () => ({
                                                    style: { backgroundColor: '#F7F7F7' },
                                                }),
                                                render: (text, record) => handleRenderName(record.level, text),
                                            },
                                            {
                                                title: <div className="title-text">대변</div>,
                                                children: [
                                                    {
                                                        title: '현금',
                                                        dataIndex: 'cashTotalCredit',
                                                        key: 'cashTotalCredit',
                                                        align: 'center',
                                                        render: (text, record) => record.level === null ?
                                                            <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                                                            : record.level !== 'Account_name' ?
                                                                (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '')
                                                                : (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : ''),
                                                    },
                                                    {
                                                        title: <div className="title-text">대체</div>,
                                                        dataIndex: 'subTotalCredit',
                                                        key: 'subTotalCredit',
                                                        align: 'center',
                                                        render: (text, record) => record.level === null ?
                                                            <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                                                            : record.level !== 'Account_name' ?
                                                                (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '')
                                                                : (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : ''),
                                                    },
                                                    {
                                                        title: <div className="title-text">합계</div>,
                                                        dataIndex: 'sumTotalCredit',
                                                        key: 'sumTotalCredit',
                                                        align: 'center',
                                                        render: (text, record) => record.level === null ?
                                                            <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                                                            : record.level !== 'Account_name' ?
                                                                (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '')
                                                                : (text !== null ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : ''),
                                                    },
                                                ],
                                            }
                                        ]}
                                        rowKey="key"
                                        // pagination={{ pageSize: 30, position: ['bottomCenter'], showSizeChanger: false }}
                                        pagination={ false }
                                        size={'small'}
                                        rowClassName={(record) => {
                                            return record.level !== 'Account_name' ? 'summary-row' : '';
                                        }}
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

export default DailyMonthlyReportPage;