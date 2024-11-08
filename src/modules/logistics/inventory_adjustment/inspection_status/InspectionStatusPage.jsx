import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper, Typography} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import {tabItems} from './InspectionStatusUtil.jsx';
import {Button, Col, DatePicker, Form, Row, Spin, Table} from 'antd';
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import dayjs from "dayjs";
import {SearchOutlined} from "@ant-design/icons";
import apiClient from "../../../../config/apiClient.jsx";
import {LOGISTICS_API} from "../../../../config/apiConstants.jsx";

const {RangePicker} = DatePicker;

const InspectionStatusPage = () => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [inspectionDetailsData, setInspectionDetailsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useState({
        startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    const fetchInspectionStatus = async (startDate, endDate) => {
        setLoading(true);
        try {
            const response = await apiClient.post(LOGISTICS_API.INVENTORY_INSPECTION_DETAILS_LIST_API(startDate, endDate));
            setInspectionDetailsData(response.data);  // 데이터 설정
            notify('success', '데이터 조회 성공', '재고실사 현황 데이터를 성공적으로 조회했습니다.', 'bottomRight');
        } catch (error) {
            notify('error', '데이터 조회 오류', '재고실사 현황 데이터를 조회하는 중 오류가 발생했습니다.', 'top');
        } finally {
            setLoading(false);
        }
    }

    // 컴포넌트 마운트 시 기본 데이터 로드
    useEffect(() => {
        fetchInspectionStatus(searchParams.startDate, searchParams.endDate);
    }, []);

    // 날짜 범위 변경 핸들러
    const handleDateChange = (dates, dateStrings) => {
        setSearchParams({
            startDate: dateStrings[0],
            endDate: dateStrings[1],
        });
    };

    // 검색 버튼 클릭 시 데이터 로드
    const handleSearch = () => {
        fetchInspectionStatus(searchParams.startDate, searchParams.endDate);
    };

    return (
        <Box sx={{margin: '20px'}}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="재고실사현황"
                        description={(
                            <Typography>
                                재고실사현황 페이지는 <span>재고 실사의 진행 상태와 실사 완료 여부</span>를 관리하는 곳임. 이 페이지에서는 <span>실사 진행 상황을 실시간으로 추적</span>할
                                수 있으며, 실사 중인 항목의 상태를 <span>조정하거나 검토</span>할 수 있음. 재고 실사의 <span>진행 단계</span>를 한눈에 파악하여
                                일정에 따라 실사를 완료할 수 있도록 함.
                            </Typography>
                        )}
                        tabItems={tabItems()}
                        activeTabKey={activeTabKey}
                        handleTabChange={handleTabChange}
                    />
                </Grid>
            </Grid>

            {activeTabKey === '1' && (
                <Grid sx={{padding: '0px 20px 0px 20px'}} container spacing={3}>
                    <Grid item xs={12} md={5} sx={{minWidth: '1200px !important', maxWidth: '700px !important'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{height: '100%'}}>
                                <Typography variant="h6" sx={{padding: '20px'}}>재고실사 현황 조회</Typography>

                                {/* 날짜 선택 및 검색 버튼 */}
                                <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                    <Form layout="vertical">
                                        <Row gutter={16} style={{
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Col>
                                                <Form.Item
                                                    label="조회 기간"
                                                    required
                                                    tooltip="검색할 기간의 시작일과 종료일을 선택하세요"
                                                >
                                                    <RangePicker
                                                        onChange={handleDateChange}
                                                        defaultValue={[
                                                            searchParams.startDate ? dayjs(searchParams.startDate, 'YYYY-MM-DD') : null,
                                                            searchParams.endDate ? dayjs(searchParams.endDate, 'YYYY-MM-DD') : null,
                                                        ]}
                                                        format="YYYY-MM-DD"
                                                        style={{width: '300px'}}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Form.Item>
                                                    <Button style={{width: '100px'}} type="primary"
                                                            onClick={handleSearch} icon={<SearchOutlined/>} block>
                                                        검색
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Grid>
                                <Grid sx={{margin: '20px'}}>
                                    <Table
                                        columns={[
                                            {
                                                title: <div className="title-text">일자-No</div>,
                                                dataIndex: 'inspectionNumber',
                                                key: 'inspectionNumber',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">품목 코드</div>,
                                                dataIndex: 'productCode',
                                                key: 'productCode',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">품목명[규격]</div>,
                                                dataIndex: 'productName',
                                                key: 'productName',
                                                align: 'center',
                                                render: (text, record) => (
                                                    <div className="small-text">
                                                        {record.productName} [{record.standard}]
                                                    </div>
                                                )
                                            },
                                            {
                                                title: <div className="title-text">창고명</div>,
                                                dataIndex: 'warehouseName',
                                                key: 'warehouseName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">실사 수량</div>,
                                                dataIndex: 'actualQuantity',
                                                key: 'actualQuantity',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            }
                                        ]}
                                        dataSource={inspectionDetailsData}
                                        rowKey="id"
                                        pagination={{pageSize: 10, position: ['bottomCenter']}}
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

export default InspectionStatusPage;