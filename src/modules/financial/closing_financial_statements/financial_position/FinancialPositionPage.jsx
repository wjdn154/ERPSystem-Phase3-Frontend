import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './FinancialPositionUtil.jsx';
import {Typography} from '@mui/material';
import {Button, Col, DatePicker, Form, Row, Table} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import dayjs from "dayjs";
import {SearchOutlined} from "@ant-design/icons";
import apiClient from "../../../../config/apiClient.jsx";
import {FINANCIAL_API} from "../../../../config/apiConstants.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";

const FinancialPositionPage = () => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [fetchData, setFetchData] = useState(null);
    const [processedData, setProcessedData] = useState([]);
    const [searchParams, setSearchParams] = useState({
        yearMonth: null,
    });

    useEffect(() => {
        if (fetchData) {
            let categoryCounter = 1; // Medium_category 카운터 초기화
            const newData = fetchData.map((item) => {
                if (item.level === 'Medium_category' && !item.isCounted) {
                    item.name = item.name;
                    // item.name = `${categoryCounter}. [${item.name}]`;
                    item.isCounted = true;
                    categoryCounter++;
                }
                return item;
            });
            setProcessedData(newData);
        }
    }, [fetchData]);

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    // 날짜 선택 처리
    const handleDateChange = (dates) => {
        if (dates) {
            setSearchParams({
                yearMonth: dates.format('YYYY-MM'),
            });
        }
    };

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

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="재무상태표"
                        description={(
                            <Typography>
                                재무상태표 페이지는 <span>기업의 자산, 부채, 자본 등 재무 상태</span>를 한눈에 파악할 수 있는 기능을 제공함.<br/>
                                <span>재무상태표</span>는 기업의 <span>재무 건전성</span>을 평가하는 중요한 자료로, 사용자는 <span>자산과 부채의 균형</span>을 통해 기업의 재무 건전성을 쉽게 확인할 수 있음.
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
                                <Typography variant="h6" sx={{ padding: '20px' }} >재무상태표 조회</Typography>
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
                                                        <DatePicker
                                                            disabledDate={(current) => current && current.year() !== 2024}
                                                            // onChange={handleDailyDateChange}
                                                            style={{ width: '250px', marginRight: '10px' }}
                                                            picker="month"
                                                            onChange={handleDateChange}
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
                                                            onClick={async () => {
                                                                try {
                                                                    if (!searchParams.yearMonth) {
                                                                        notify('warning', '데이터 조회 실패', '날짜를 선택해주세요.');
                                                                        return;
                                                                    }

                                                                    const response = await apiClient.post(FINANCIAL_API.FINANCIAL_STATEMENTS_API, {
                                                                        yearMonth: searchParams.yearMonth
                                                                    });

                                                                    setFetchData(response.data);
                                                                    console.log('response', response.data);
                                                                    notify('success', '데이터 조회 성공', '재무상태표 데이터 조회에 성공했습니다.');
                                                                } catch (error) {
                                                                    console.error('error', error);
                                                                    notify('error', '데이터 조회 실패', '재무상태표 데이터 조회에 실패했습니다.');
                                                                }
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
                                        dataSource={processedData}
                                        columns={[
                                            {
                                                title: <div className="title-text">차변</div>,
                                                children: [
                                                    {
                                                        title: <div className="title-text">잔액</div>,
                                                        dataIndex: 'totalDebitBalance',
                                                        key: 'totalDebitBalance',
                                                        align: 'center',
                                                        render: (text, record) => text !== null ?
                                                            <div className={record.level !== 'Account_name' ? "medium-text" : "small-text"} style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '',
                                                    },
                                                    {
                                                        title: <div className="title-text">금액</div>,
                                                        dataIndex: 'totalDebitAmount',
                                                        key: 'totalDebitAmount',
                                                        align: 'center',
                                                        render: (text, record) => text !== null ?
                                                            <div className={record.level !== 'Account_name' ? "medium-text" : "small-text"} style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '',
                                                    },
                                                ],
                                            },
                                            {
                                                title: <div className="title-text">계정과목</div>,
                                                dataIndex: 'name',
                                                key: 'name',
                                                align: 'center',
                                                width: '25%',
                                                onCell: () => ({
                                                    style: { backgroundColor: '#F7F7F7' },
                                                }),
                                                render: (text, record) => handleRenderName(record.level, text),
                                            },
                                            {
                                                title: <div className="title-text">대변</div>,
                                                children: [
                                                    {
                                                        title: <div className="title-text">잔액</div>,
                                                        dataIndex: 'totalCreditBalance',
                                                        key: 'totalCreditBalance',
                                                        align: 'center',
                                                        render: (text, record) => text !== null ?
                                                            <div className={record.level !== 'Account_name' ? "medium-text" : "small-text"} style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '',
                                                    },
                                                    {
                                                        title: <div className="title-text">금액</div>,
                                                        dataIndex: 'totalCreditAmount',
                                                        key: 'totalCreditAmount',
                                                        align: 'center',
                                                        render: (text, record) => text !== null ?
                                                            <div className={record.level !== 'Account_name' ? "medium-text" : "small-text"} style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : '',
                                                    },
                                                ],
                                            }
                                        ]}
                                        rowKey="key"
                                        pagination={false}
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

        </Box>
    );
};

export default FinancialPositionPage;