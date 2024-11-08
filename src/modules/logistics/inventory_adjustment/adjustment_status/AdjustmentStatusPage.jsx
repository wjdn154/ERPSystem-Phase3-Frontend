import React, {useState, useEffect} from 'react';
import {Box, Grid, Grow, Paper, Typography} from '@mui/material';
import {LOGISTICS_API} from '../../../../config/apiConstants.jsx';
import apiClient from '../../../../config/apiClient.jsx';
import dayjs from 'dayjs';
import {Table, Button, DatePicker, Row, Col, Form} from 'antd';
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {Spin} from "antd"; // 로딩 스피너
import {SearchOutlined} from '@ant-design/icons';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import {tabItems} from './AdjustmentStatusUtil.jsx';

const {RangePicker} = DatePicker;

const AdjustmentStatusPage = () => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [adjustmentData, setAdjustmentData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useState({
        startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    // API 호출 함수
    const fetchAdjustmentStatus = async (startDate, endDate) => {
        setLoading(true);
        try {
            const response = await apiClient.post(LOGISTICS_API.INVENTORY_INSPECTION_DETAILS_LIST_API(startDate, endDate));
            setAdjustmentData(response.data);  // 데이터 설정
            notify('success', '데이터 조회 성공', '재고조정 현황 데이터를 성공적으로 조회했습니다.', 'bottomRight');
        } catch (error) {
            notify('error', '데이터 조회 오류', '재고조정 현황 데이터를 조회하는 중 오류가 발생했습니다.', 'top');
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 기본 데이터 로드
    useEffect(() => {
        fetchAdjustmentStatus(searchParams.startDate, searchParams.endDate);
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
        fetchAdjustmentStatus(searchParams.startDate, searchParams.endDate);
    };

    return (
        <Box sx={{margin: '20px'}}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="재고조정현황"
                        description={(
                            <Typography>
                                재고조정현황 페이지는 <span>재고 조정 작업의 전체적인 진행 상태와 결과</span>를 확인하는 곳임. 이 페이지에서는 <span>재고 실사와 그에 따른 조정 작업의 이력</span>을
                                조회하고, 각 조정 작업의 <span>진행 상황과 완료 여부</span>를 확인할 수 있음. 실사 후 조정된 재고 내역을
                                통해 <span>실시간 재고 정보</span>를 최신 상태로 유지할 수 있음.
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
                    <Grid item xs={12} md={12} sx={{minWidth: '1200px !important', maxWidth: '700px !important'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{height: '100%'}}>
                                <Typography variant="h6" sx={{padding: '20px'}}>재고조정 현황 조회</Typography>

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

                                {/* 재고 조정 현황 테이블 */}
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
                                                title: <div className="title-text">장부 수량</div>,
                                                dataIndex: 'bookQuantity',
                                                key: 'bookQuantity',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">실사 수량</div>,
                                                dataIndex: 'actualQuantity',
                                                key: 'actualQuantity',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">조정 수량</div>,
                                                dataIndex: 'differenceQuantity',
                                                key: 'differenceQuantity',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">적요</div>,
                                                dataIndex: 'comments',
                                                key: 'comments',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            }
                                        ]}
                                        dataSource={adjustmentData}
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

export default AdjustmentStatusPage;
