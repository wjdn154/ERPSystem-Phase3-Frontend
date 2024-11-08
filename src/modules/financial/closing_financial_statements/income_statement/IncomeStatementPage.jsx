import React, {useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './IncomeStatementUtil.jsx';
import {Typography} from '@mui/material';
import {Button, Col, DatePicker, Form, Row, Table} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import dayjs from "dayjs";
import {SearchOutlined} from "@ant-design/icons";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {FINANCIAL_API} from "../../../../config/apiConstants.jsx";
const { RangePicker } = DatePicker;

const IncomeStatementPage = () => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [searchData, setSearchData] = useState(null);
    const [searchParams, setSearchParams] = useState({
        yearMonth: null
    });

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    const handleDateChange = (dates) => {
        if (dates) {
            setSearchParams({ yearMonth: dates.format('YYYY-MM') });
            console.log(dates.format('YYYY-MM'));
        }
    };

    const handleSearch = async () => {

        // 입력값 검증
        if (!searchParams.yearMonth) {
            notify('warning', '입력 오류', '모든 필드를 입력해 주세요.', 'bottomRight');
            return;
        }

        try {
            const response = await apiClient.post(FINANCIAL_API.INCOME_STATEMENT_API, { yearMonth: searchParams.yearMonth });
            console.log(response.data);
            setSearchData(response.data);
        } catch (error) {
            notify('error', '서버 요청 오류', '데이터 조회 중 오류가 발생했습니다.', 'bottomRight');
        }
    };

    const handleRenderName = (level, text) => {
        if (level === 'Large_Category') {
            return <div style={{ color: 'green' }} className="medium-text">{text}</div>;
        } else if (level === 'Medium_Category') {
            return <div style={{ color: 'green' }} className="medium-text">[{text}]</div>;
        } else if (level === 'Small_Category') {
            return <div className="medium-text">{text}</div>;
        } else if (level === 'Account_Name') {
            return <div className="medium-text">{text}</div>;
        }
    };

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="손익계산서"
                        description={(
                            <Typography>
                                손익계산서 페이지는 <span>기업의 일정 기간 동안의 수익과 비용</span>을 통해 <span>순이익을 계산</span>하는 기능을 제공함.<br/>
                                이 페이지에서는 기업이 해당 기간 동안 벌어들인 <span>수익과 지출한 비용</span>을 명확하게 파악할 수 있으며, 이를 통해 <span>경영 성과를 분석</span>하고 <span>미래 전략</span>을 수립할 수 있음.
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
                    <Grid item xs={12} md={4} sx={{ minWidth: '450px !important', maxWidth: '1500px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >손익계산서 조회</Typography>
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
                                                        <DatePicker
                                                            disabledDate={(current) => current && current.year() !== 2024}
                                                            onChange={handleDateChange}
                                                            style={{ width: '250px' }}
                                                            picker="month"  // 월 단위로 설정
                                                            defaultValue={
                                                                searchParams.yearMonth ? dayjs(searchParams.yearMonth, 'YYYY-MM') : null
                                                            }
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col>
                                                    <Form.Item>
                                                        <Button
                                                            icon={<SearchOutlined />}
                                                            style={{ width: '100px' }}
                                                            type="primary"
                                                            onClick={() => { handleSearch(); }}
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
                                        dataSource={searchData ? searchData.map((item, index) => ({
                                            key: `entry-${index}`,
                                            level: item.level,
                                            name: item.name,
                                            totalAmount: item.totalAmount
                                        })) : []}
                                        columns={[
                                            {
                                                title: <div className="title-text">계정과목</div>,
                                                dataIndex: 'name',
                                                key: 'name',
                                                align: 'center',
                                                width: '40%',
                                                render: (text, record) => handleRenderName(record.level, text),
                                            },
                                            {
                                                title: <div className="title-text">금액</div>,
                                                dataIndex: 'totalAmount',
                                                key: 'creditTotalAmount',
                                                align: 'center',
                                                render: (text, record) => <div className="small-text" style={{ textAlign: 'right' }}> {text ? text.toLocaleString() : 0} </div>
                                            }
                                        ]}
                                        rowKey="key"
                                        pagination={false}
                                        size={'small'}
                                        rowClassName={(record) => {
                                            let name;
                                            switch (record.level) {
                                                case 'Large_Category':
                                                    name = 'summary-row-level-3';
                                                    break;
                                                case 'Medium_Category':
                                                    name = 'summary-row-level-2';
                                                    break;
                                                case 'Small_Category':
                                                    name = 'summary-row-level-1';
                                                    break;
                                                // case 'Account_Name':
                                                //     name = 'summary-row';
                                                //     break;
                                            }

                                            return name;
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

export default IncomeStatementPage;