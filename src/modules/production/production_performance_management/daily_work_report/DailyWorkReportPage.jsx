import React, {useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './DailyWorkReportUtil.jsx';
import {Typography} from '@mui/material';
import {Tag, Button, Col, DatePicker, Form, Row, Table} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import dayjs from "dayjs";
import {SearchOutlined} from "@ant-design/icons";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {FINANCIAL_API, PRODUCTION_API} from "../../../../config/apiConstants.jsx";
const { RangePicker } = DatePicker;

const DailyWorkReportPage = () => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [reportData, setReportData] = useState(null);
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

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="생산 일보"
                        description={(
                            <Typography>
                                생산 일보 등록 페이지는 <span>일일 생산 결과를 보고하고 기록하는 곳</span>임. 이 페이지에서는 <span>하루 동안 생산된 제품 수량, 작업 시간, 불량 발생 내역</span> 등을 등록하여 <span>일간 생산 성과</span>를 관리할 수 있음. 이를 통해 <span>매일의 생산 목표 달성 여부</span>를 확인하고, 문제 발생 시 즉각적인 대응을 할 수 있음.
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
                    <Grid item xs={12} md={12} sx={{ minWidth: '1200px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >생산일보 조회</Typography>
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
                                                            onChange={handleDateChange}
                                                            style={{ width: '250px', marginRight: '10px' }}
                                                            defaultValue={[
                                                                searchParams.startDate ? dayjs(searchParams.startDate, 'YYYY-MM-DD') : null,
                                                                searchParams.endDate ? dayjs(searchParams.endDate, 'YYYY-MM-DD') : null,
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
                                                            onClick={async () => {
                                                                if (!searchParams.startDate || !searchParams.endDate) {
                                                                    notify('warning', '입력 오류', '모든 필드를 입력해 주세요.', 'bottomRight');
                                                                    return;
                                                                }

                                                                try {
                                                                    const response = await apiClient.post(PRODUCTION_API.WORK_PERFORMANCE_DAILY_REPORT_API, searchParams);
                                                                    setReportData(response.data);
                                                                    console.log(response.data);
                                                                } catch (error) {
                                                                    notify('error', '조회 오류', '생산 월보 조회 중 오류가 발생했습니다.', 'top');
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
                                        dataSource={reportData?.map((item, index) => ({ ...item, key: `entry-${index}` }))}
                                        columns={[
                                            {
                                                title: <div className="title-text">품번</div>,
                                                dataIndex: 'productCode',
                                                key: 'productCode',
                                                align: 'center',
                                                render: (text) => text ? <Tag color="blue">{text}</Tag> : ''
                                            },
                                            {
                                                title: <div className="title-text">품명</div>,
                                                dataIndex: 'productName',
                                                key: 'productName',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text}</div> : ''
                                            },
                                            {
                                                title: <div className="title-text">규격</div>,
                                                dataIndex: 'productStandard',
                                                key: 'productStandard',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text}</div> : ''
                                            },
                                            {
                                                title: <div className="title-text">단위</div>,
                                                dataIndex: 'productUnit',
                                                key: 'productUnit',
                                                align: 'center',
                                                render: (text) => text ? <Tag color="green">{text}</Tag> : <Tag color="red">N/A</Tag>
                                            },
                                            {
                                                title: <div className="title-text">실적수량</div>,
                                                dataIndex: 'totalQuantity',
                                                key: 'totalQuantity',
                                                align: 'right',
                                                render: (text) => <div className="small-text">{text.toLocaleString()}</div>
                                            },
                                            {
                                                title: <div className="title-text">실적금액</div>,
                                                dataIndex: 'processCost',
                                                key: 'processCost',
                                                align: 'right',
                                                render: (text) => <div className="small-text">{text.toLocaleString()}</div>
                                            },
                                            {
                                                title: <div className="title-text">양품수량</div>,
                                                dataIndex: 'acceptableQuantity',
                                                key: 'acceptableQuantity',
                                                align: 'right',
                                                render: (text) => <div className="small-text">{text.toLocaleString()}</div>
                                            },
                                            {
                                                title: <div className="title-text">양품금액</div>,
                                                dataIndex: 'acceptableAmount',
                                                key: 'acceptableAmount',
                                                align: 'right',
                                                render: (text) => <div className="small-text">{parseFloat(text).toLocaleString()}</div>
                                            },
                                            {
                                                title: <div className="title-text">부적합수량</div>,
                                                dataIndex: 'defectiveQuantity',
                                                key: 'defectiveQuantity',
                                                align: 'right',
                                                render: (text) => <div className="small-text">{text.toLocaleString()}</div>
                                            },
                                            {
                                                title: <div className="title-text">부적합금액</div>,
                                                dataIndex: 'defectiveAmount',
                                                key: 'defectiveAmount',
                                                align: 'right',
                                                render: (text) => <div className="small-text">{parseFloat(text).toLocaleString()}</div>
                                            },
                                            {
                                                title: <div className="title-text">평균 폐기물 발생량 (KG)</div>,
                                                dataIndex: 'industryAverageWasteGenerated',
                                                key: 'industryAverageWasteGenerated',
                                                align: 'right',
                                                render: (text) => <div className="small-text">{parseFloat(text).toLocaleString()}</div>
                                            },
                                            {
                                                title: <div className="title-text">폐기물 발생량 (KG)</div>,
                                                dataIndex: 'wasteGenerated',
                                                key: 'wasteGenerated',
                                                align: 'right',
                                                render: (text) => <div className="small-text">{parseFloat(text).toLocaleString()}</div>
                                            },
                                            {
                                                title: <div className="title-text">산업폐기물 발생율 (%)</div>,
                                                dataIndex: 'wasteGeneratedPercentage',
                                                key: 'wasteGeneratedPercentage',
                                                align: 'right',
                                                render: (text) => <div className="small-text">{parseFloat(text).toLocaleString()}</div>
                                            },
                                            {
                                                title: <div className="title-text">산업평균 에너지 소비량 (MJ)</div>,
                                                dataIndex: 'industryAverageEnergyConsumed',
                                                key: 'industryAverageEnergyConsumed',
                                                align: 'right',
                                                render: (text) => <div className="small-text">{parseFloat(text).toLocaleString()}</div>
                                            },
                                            {
                                                title: <div className="title-text">에너지 소비량 (MJ)</div>,
                                                dataIndex: 'energyConsumed',
                                                key: 'energyConsumed',
                                                align: 'right',
                                                render: (text) => <div className="small-text">{parseFloat(text).toLocaleString()}</div>
                                            },
                                            {
                                                title: <div className="title-text">에너지 소비율 (%)</div>,
                                                dataIndex: 'energyConsumedPercentage',
                                                key: 'energyConsumedPercentage',
                                                align: 'right',
                                                render: (text) => <div className="small-text">{parseFloat(text).toLocaleString()}</div>
                                            }
                                        ]}
                                        pagination={false}
                                        size="small"
                                        summary={() => (
                                            reportData && reportData.length > 0 ? (
                                                <Table.Summary.Row style={{ textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                                                    <Table.Summary.Cell index={0}><div className="medium-text">합계</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={1} />
                                                    <Table.Summary.Cell index={2} />
                                                    <Table.Summary.Cell index={3} />
                                                    <Table.Summary.Cell index={4}><div className="medium-text" style={{ textAlign: 'right' }}>{reportData.reduce((acc, curr) => acc + curr.totalQuantity, 0).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={5}><div className="medium-text" style={{ textAlign: 'right' }}>{reportData.reduce((acc, curr) => acc + curr.processCost, 0).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={6}><div className="medium-text" style={{ textAlign: 'right' }}>{reportData.reduce((acc, curr) => acc + curr.acceptableQuantity, 0).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={7}><div className="medium-text" style={{ textAlign: 'right' }}>{reportData.reduce((acc, curr) => acc + parseFloat(curr.acceptableAmount), 0).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={8}><div className="medium-text" style={{ textAlign: 'right' }}>{reportData.reduce((acc, curr) => acc + curr.defectiveQuantity, 0).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={9}><div className="medium-text" style={{ textAlign: 'right' }}>{reportData.reduce((acc, curr) => acc + parseFloat(curr.defectiveAmount), 0).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={10}><div className="medium-text" style={{ textAlign: 'right' }}>{reportData.reduce((acc, curr) => acc + parseFloat(curr.industryAverageWasteGenerated), 0).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={11}><div className="medium-text" style={{ textAlign: 'right' }}>{reportData.reduce((acc, curr) => acc + parseFloat(curr.wasteGenerated), 0).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={15}><div className="medium-text" style={{ textAlign: 'right' }}>{(reportData.reduce((acc, curr) => acc + parseFloat(curr.wasteGeneratedPercentage), 0) / reportData.length).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={13}><div className="medium-text" style={{ textAlign: 'right' }}>{reportData.reduce((acc, curr) => acc + parseFloat(curr.industryAverageEnergyConsumed), 0).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={14}><div className="medium-text" style={{ textAlign: 'right' }}>{reportData.reduce((acc, curr) => acc + parseFloat(curr.energyConsumed), 0).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={15}><div className="medium-text" style={{ textAlign: 'right' }}>{(reportData.reduce((acc, curr) => acc + parseFloat(curr.energyConsumedPercentage), 0) / reportData.length).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></Table.Summary.Cell>
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

export default DailyWorkReportPage;