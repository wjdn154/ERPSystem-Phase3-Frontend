import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import {tabItems} from './OutgoingStatusUtil.jsx';
import {Typography} from '@mui/material';
import {Button, Col, DatePicker, Form, Row, Table} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import dayjs from "dayjs";
import apiClient from "../../../../config/apiClient.jsx";
import {LOGISTICS_API} from "../../../../config/apiConstants.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {SearchOutlined} from "@ant-design/icons";

const {RangePicker} = DatePicker;

const OutgoingStatusPage = () => {
    const [activeTabKey, setActiveTabKey] = useState('1');
    const notify = useNotificationContext();
    const [isLoading, setIsLoading] = useState(false);
    const [shippingDetailList, setShippingDetailList] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [detailShipmentData, setDetailShipmentData] = useState(false);
    const [editDetailShipmentData, setEditDetailShipmentData] = useState(false);

    const [searchParams, setSearchParams] = useState({
        startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });

    const fetchShippingDetailList = async (startDate, endDate) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post(LOGISTICS_API.SHIPPING_ORDER_DETAILS_API(startDate, endDate));
            setShippingDetailList(response.data);
            notify('success', '데이터 조회 성공', '출하 목록 데이터를 성공적으로 조회했습니다.', 'bottomRight');
        } catch (error) {
            notify('error', '데이터 조회 오류', '출하 목록 데이터를 조회하는 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    }

    const handleSearch = () => {
        fetchShippingDetailList(searchParams.startDate, searchParams.endDate);
    };

    const handleDateChange = (dates, dateStrings) => {
        setSearchParams({
            startDate: dateStrings[0],
            endDate: dateStrings[1],
        });
    }

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    useEffect(() => {
        fetchShippingDetailList(searchParams.startDate, searchParams.endDate);
    }, []);

    return (
        <Box sx={{margin: '20px'}}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="출고예정현황"
                        description={(
                            <Typography>
                                출고예정현황 페이지는 <span>출고 예정 상태를 실시간으로 확인</span>하고 <span>출고 진행 상황</span>을 관리하는 곳임. 이
                                페이지에서는 <span>출고 예정된 품목들의 상태</span>를 종합적으로 확인할 수 있으며, 출고 예정일에 따른 스케줄 관리를 통해 <span>출고 계획의 적시성</span>을
                                보장할 수 있음.
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
                    <Grid item xs={12} md={5} sx={{minWidth: '1000px !important', maxWidth: '1500px !important'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{height: '100%'}}>
                                <Typography variant="h6" sx={{padding: '20px'}}>출고 예정 현황</Typography>
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
                                        dataSource={shippingDetailList}
                                        columns={[
                                            {
                                                title: <div className="title-text">등록일자</div>,
                                                dataIndex: 'date',
                                                key: 'date',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">거래처</div>,
                                                dataIndex: 'representativeName',
                                                key: 'representativeName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">담당자</div>,
                                                dataIndex: 'managerName',
                                                key: 'managerName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">품목명</div>,
                                                dataIndex: 'productName',
                                                key: 'productName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">수량</div>,
                                                dataIndex: 'quantity',
                                                key: 'quantity',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">비고</div>,
                                                dataIndex: 'remarks',
                                                key: 'remarks',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            }
                                        ]}
                                        pagination={{pageSize: 15, position: ['bottomCenter'], showSizeChanger: false}}
                                        size="small"
                                        rowKey={(record) => record.id}
                                        // rowSelection={{
                                        //     type: 'radio',
                                        //     selectedRowKeys,
                                        //     onChange: (newSelectedRowKeys) => {
                                        //         setSelectedRowKeys(newSelectedRowKeys);
                                        //     }
                                        // }}
                                        // onRow={(record) => ({
                                        //     style: {cursor: 'pointer'},
                                        //     onClick: async () => {
                                        //         setSelectedRowKeys([record.id]); // 클릭한 행의 키로 상태 업데이트
                                        //         const id = record.id;
                                        //         try {
                                        //             const response = await apiClient.post(LOGISTICS_API.SHIPMENT_DETAIL_API(id));
                                        //             console.log(response.data);
                                        //             setDetailShipmentData(response.data);
                                        //             setEditDetailShipmentData(true);
                                        //             notify('success', '품목 조회', '출하 정보 조회 성공.', 'bottomRight')
                                        //         } catch (error) {
                                        //             notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
                                        //         }
                                        //     },})}
                                    >
                                    </Table>
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

            {activeTabKey === '2' && (
                <Grid sx={{padding: '0px 20px 0px 20px'}} container spacing={3}>
                    <Grid item xs={12} md={5} sx={{minWidth: '500px !important', maxWidth: '700px !important'}}>
                        <Grow in={true} timeout={200}>
                            <div>
                                <TemporarySection/>
                            </div>
                        </Grow>
                    </Grid>
                </Grid>
            )}

        </Box>
    );
};

export default OutgoingStatusPage;