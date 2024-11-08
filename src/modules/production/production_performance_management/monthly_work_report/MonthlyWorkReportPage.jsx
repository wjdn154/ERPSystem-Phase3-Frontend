import React, {useMemo, useState} from 'react';
import { Box, Grid, Grow, Paper } from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { Typography } from '@mui/material';
import { Button, Col, DatePicker, Form, Row, Table, Tag } from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import { useNotificationContext } from "../../../../config/NotificationContext.jsx";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween'; // isBetween 플러그인 추가
import { SearchOutlined } from "@ant-design/icons";
import apiClient from "../../../../config/apiClient.jsx";
import { PRODUCTION_API } from "../../../../config/apiConstants.jsx";
import {tabItems} from "./MonthlyWorkReportUtil.jsx";

const { RangePicker } = DatePicker;

// dayjs에 isBetween 플러그인 사용
dayjs.extend(isBetween);

const MonthlyWorkReportPage = () => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [reportData, setReportData] = useState([]);
    const [monthsInRange , setMonthsInRange ] = useState([]);
    const [searchParams, setSearchParams] = useState({
        startDate: null,
        endDate: null,
    });

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

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

    // 선택된 월 범위에 맞게 데이터 필터링
    const filterDataByDateRange = (data, startDate, endDate) => {
        const start = dayjs(startDate);
        const end = dayjs(endDate);

        return data.map((item) => {
            const filteredMonths = Object.keys(item).filter((key) => {
                const month = key.replace('planned_', '').replace('actual_', '');
                const monthDate = dayjs(`2024-${month.padStart(2, '0')}-01`);
                return monthDate.isBetween(start, end, 'month', '[]');
            });

            const filteredData = filteredMonths.reduce((acc, month) => {
                return {
                    ...acc,
                    [`planned_${month}`]: item[`planned_${month}`],
                    [`actual_${month}`]: item[`actual_${month}`],
                };
            }, {});

            return {
                ...item,
                ...filteredData,
            };
        });
    };

    // 데이터 조회 처리
    const handleSearch = async () => {
        if (!searchParams.startDate || !searchParams.endDate) {
            notify('warning', '입력 오류', '모든 필드를 입력해 주세요.', 'bottomRight');
            return;
        }

        try {
            console.log(searchParams)
            const response = await apiClient.post(PRODUCTION_API.WORK_PERFORMANCE_MONTHLY_REPORT_API, searchParams);
            const data = response.data;
            console.log(data);
            const filteredData = filterDataByDateRange(data, searchParams.startDate, searchParams.endDate);
            setReportData(filteredData);
            notify('success', '조회 성공', '생산 월보 조회가 성공적으로 완료되었습니다.', 'bottomRight');
        } catch (error) {
            console.log(error);
            notify('error', '조회 오류', '생산 월보 조회 중 오류가 발생했습니다.', 'top');
        }
    };

    const monthNames = [
        { number: 1, name: 'jan' },
        { number: 2, name: 'feb' },
        { number: 3, name: 'mar' },
        { number: 4, name: 'apr' },
        { number: 5, name: 'may' },
        { number: 6, name: 'jun' },
        { number: 7, name: 'jul' },
        { number: 8, name: 'aug' },
        { number: 9, name: 'sep' },
        { number: 10, name: 'oct' },
        { number: 11, name: 'nov' },
        { number: 12, name: 'dec' },
    ];

    const getMonthsInRange = () => {
        if (searchParams.startDate && searchParams.endDate) {
            const start = dayjs(searchParams.startDate).startOf('month');
            const end = dayjs(searchParams.endDate).endOf('month');

            return monthNames.filter(month => {
                const monthDate = dayjs(`2024-${month.number.toString().padStart(2, '0')}-01`);
                return monthDate.isBetween(start, end, 'month', '[]');
            });
        }
        return [];
    };

    const dynamicColumns = useMemo(() => {
        setMonthsInRange(getMonthsInRange());

        return monthsInRange.map(month => ({
            title: <div className="title-text">{month.number}월</div>,
            children: [
                {
                    title: <div className="title-text">계획</div>,
                    dataIndex: `${month.name}Planned`,
                    key: `${month.name}Planned`,
                    align: 'center',
                    render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                },
                {
                    title: <div className="title-text">실적</div>,
                    dataIndex: `${month.name}Actual`,
                    key: `${month.name}Actual`,
                    align: 'center',
                    render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                },
            ],
        }));
    }, [searchParams, reportData]);

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="생산 월보"
                        description={(
                            <Typography>
                                생산 월보 등록 페이지는 <span>월간 생산 성과를 집계하고 보고하는 곳</span>임. 이 페이지에서는 <span>한 달 동안의 생산 실적, 작업 시간, 불량 발생률</span> 등을 등록하고, 월간 목표 달성 여부를 확인할 수 있음. 월간 보고서를 통해 <span>전체 생산 흐름</span>을 파악하고, <span>장기적인 생산 계획 수립</span>에 기여함.
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
                    <Grid item xs={12} md={11} sx={{ minWidth: '1000px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }}>생산월보 조회</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Grid sx={{ marginTop: '20px', marginBottom: '20px' }}>
                                        <Form layout="vertical">
                                            <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                                <Col>
                                                    <Form.Item
                                                        label="조회 기간"
                                                        required
                                                        tooltip="검색할 기간의 시작일과 종료일을 선택하세요"
                                                    >
                                                        <RangePicker
                                                            disabledDate={(current) => current && current.year() !== 2024}
                                                            onChange={handleDateChange}
                                                            picker="month"
                                                            style={{ width: '250px', marginRight: '10px' }}
                                                            defaultValue={[
                                                                searchParams.startDate ? dayjs(searchParams.startDate, 'YYYY-MM') : null,
                                                                searchParams.endDate ? dayjs(searchParams.endDate, 'YYYY-MM') : null,
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
                                                            onClick={handleSearch}
                                                        >
                                                            검색
                                                        </Button>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Grid>

                                    <Table
                                        dataSource={reportData ? reportData.map((item, index) => ({
                                            key: `entry-${index}`,
                                            productCode: item.productCode,           // 품번
                                            productName: item.productName,           // 품명
                                            productStandard: item.productStandard,   // 규격
                                            productUnit: item.productUnit,           // 단위
                                            totalPlanned: item.totalPlanned,         // 계획수량
                                            totalActual: item.totalActual,           // 실적수량
                                            ...item // 동적으로 추가된 계획/실적 데이터 포함
                                        })) : null}
                                        columns={[
                                            {
                                                title: <div className="title-text">품번</div>,
                                                dataIndex: 'productCode',
                                                key: 'productCode',
                                                align: 'center',
                                                fixed: 'left',
                                                render: (text) => (text ? <Tag color="blue">{text}</Tag> : ''),
                                            },
                                            {
                                                title: <div className="title-text">품명</div>,
                                                dataIndex: 'productName',
                                                key: 'productName',
                                                align: 'center',
                                                fixed: 'left',
                                                render: (text) => <div className="small-text">{text}</div>
                                            },
                                            {
                                                title: <div className="title-text">규격</div>,
                                                dataIndex: 'productStandard',
                                                key: 'productStandard',
                                                align: 'center',
                                                fixed: 'left',
                                                render: (text) => <div className="small-text">{text}</div>
                                            },
                                            {
                                                title: <div className="title-text">단위</div>,
                                                dataIndex: 'productUnit',
                                                key: 'productUnit',
                                                align: 'center',
                                                fixed: 'left',
                                                render: (text) => (text ? <Tag color="green">{text}</Tag> : <Tag color="red">N/A</Tag>),
                                            },
                                            {
                                                title: <div className="title-text">합계</div>,
                                                children: [
                                                    {
                                                        title: <div className="title-text">계획</div>,
                                                        dataIndex: 'totalPlanned',
                                                        key: 'totalPlanned',
                                                        align: 'center',
                                                        fixed: 'left',
                                                        render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                                                    },
                                                    {
                                                        title: <div className="title-text">실적</div>,
                                                        dataIndex: 'totalActual',
                                                        key: 'totalActual',
                                                        align: 'center',
                                                        fixed: 'left',
                                                        render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div>
                                                    }
                                                ]
                                            },
                                            ...dynamicColumns]}
                                        scroll={{ x: 'max-content' }}
                                        size={ 'small'}
                                        pagination={ false }
                                        bordered={ true }
                                        style={{ marginTop: '20px', marginBottom: '50px' }}
                                        summary={() => (
                                            reportData && reportData.length > 0 ? (
                                                <Table.Summary.Row style={{ textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                                                    <Table.Summary.Cell index={0}><div className="medium-text" >합계</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={1} />
                                                    <Table.Summary.Cell index={2} />
                                                    <Table.Summary.Cell index={3} />
                                                    <Table.Summary.Cell index={4}><div className="medium-text" style={{ textAlign: 'right' }}>{reportData.reduce((acc, curr) => acc + curr.totalPlanned, 0).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={5}><div className="medium-text" style={{ textAlign: 'right' }}>{reportData.reduce((acc, curr) => acc + curr.totalActual, 0).toLocaleString()}</div></Table.Summary.Cell>
                                                    {monthsInRange.map((month, idx) => (
                                                        <>
                                                            <Table.Summary.Cell key={`planned-${month.number}`} index={6 + idx * 2}>
                                                                <div className="medium-text" style={{ textAlign: 'right' }}>
                                                                    {reportData.reduce((acc, curr) => acc + (curr[`${month.name}Planned`] || 0), 0).toLocaleString()}
                                                                </div>
                                                            </Table.Summary.Cell>
                                                            <Table.Summary.Cell key={`actual-${month.number}`} index={7 + idx * 2}>
                                                                <div className="medium-text" style={{ textAlign: 'right' }}>
                                                                    {reportData.reduce((acc, curr) => acc + (curr[`${month.name}Actual`] || 0), 0).toLocaleString()}
                                                                </div>
                                                            </Table.Summary.Cell>
                                                        </>
                                                    ))}
                                                </Table.Summary.Row>
                                            ) : null
                                        )}
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

export default MonthlyWorkReportPage;
