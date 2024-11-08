import React, {useEffect, useState} from 'react';
import {Box, Grid, Grow, Paper, Typography} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import {tabItems} from './ProductionOrderClosingUtil.jsx';
import {Button, Col, DatePicker, Form, InputNumber, notification, Row, Table, Tag} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import dayjs from "dayjs";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {EMPLOYEE_API, PRODUCTION_API} from "../../../../config/apiConstants.jsx";

const ProductionOrderClosingPage = () => {
    const [form] = Form.useForm();
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [selectedRowKeys, setSelectedRowKeys] = useState();
    const [searchData, setSearchData] = useState();
    const [saveParams, setSaveParams] = useState({
        id: null,
        actualEndDateTime: null,
        actualProductionQuantity: null,
        actualStartDateTime: null,
        actualWorkers: null,
        closed: null,
        confirmed: null,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try{
            const response = await apiClient.post(PRODUCTION_API.PRODUCTION_ORDER_LIST_API);
            setSearchData(response.data);
            notify('success', '작업 지시 목록 불러오기 성공', '작업 지시 목록을 성공적으로 불러왔습니다.');
        } catch(error){
            notify('error', '오류 발생', '작업 지시 목록을 불러오는 중 오류가 발생했습니다.');
        }
    };


    useEffect(() => {
        if (form && selectedRowKeys) {
            const selectedData = searchData.find((data) => data.id === selectedRowKeys[0]) || {};
            setSaveParams({
                id: selectedData.id || null,
                actualEndDateTime: selectedData.actualEndDateTime || null,
                actualProductionQuantity: selectedData.actualProductionQuantity || null,
                actualStartDateTime: selectedData.actualStartDateTime || null,
                actualWorkers: selectedData.actualWorkers || null,
                closed: selectedData.closed || null,
                confirmed: selectedData.confirmed || null,
            });

            form.setFieldsValue({
                actualStartDateTime: selectedData.actualStartDateTime ? dayjs(selectedData.actualStartDateTime) : null,
                actualEndDateTime: selectedData.actualEndDateTime ? dayjs(selectedData.actualEndDateTime) : null,
                actualWorkers: selectedData.actualWorkers || null,
                actualProductionQuantity: selectedData.actualProductionQuantity || null,
            });
        }
    }, [selectedRowKeys, searchData, form]);

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    const generateQuantities = (totalQuantity) => {
        const defectiveRate = Math.random() * 0.08 + 0.02;
        const defectiveQuantity = Math.floor(totalQuantity * defectiveRate);
        const acceptableQuantity = totalQuantity - defectiveQuantity;
        return { acceptableQuantity, defectiveQuantity };
    };

    const handleCloseOrder = async () => {
        const selectedRow = searchData.find((data) => data.id === selectedRowKeys[0]);
        if(selectedRow.closed) {
            notify('error', '확정 실패', '이미 마감된 작업 지시입니다.');
            return;
        }
        if(dayjs(saveParams.actualStartDateTime).isAfter(dayjs(saveParams.actualEndDateTime))) {
            notify('error', '마감 실패', '시작일이 종료일보다 늦을 수 없습니다.');
            return;
        }
        if(!saveParams.actualStartDateTime || !saveParams.actualEndDateTime || !saveParams.actualWorkers || !saveParams.actualProductionQuantity) {
            notify('error', '마감 실패', '모든 필드를 입력하세요.');
            return;
        }
        if(!saveParams.confirmed) {
            notify('error', '마감 실패', '작업 지시가 확정되지 않았습니다.');
            return;
        }

        const { acceptableQuantity, defectiveQuantity } = generateQuantities(saveParams.actualProductionQuantity);

        const closureParams = {
            productionOrderId: saveParams.id,
            workers: saveParams.actualWorkers,
            quantity: saveParams.actualProductionQuantity,
            defectiveQuantity: defectiveQuantity,
            acceptableQuantity: acceptableQuantity,
            actualStartDateTime: dayjs(saveParams.actualStartDateTime).format("YYYY-MM-DDTHH:mm:ss"),
            actualEndDateTime: dayjs(saveParams.actualEndDateTime).format("YYYY-MM-DDTHH:mm:ss"),
        };
        console.log(closureParams);

        try {
            const response = await apiClient.post(PRODUCTION_API.PRODUCTION_ORDER_CLOSE_API, closureParams);
            console.log(response);

            const updatedData = searchData.map((item) =>
                item.id === saveParams.id ? {
                    ...item,
                    actualEndDateTime: saveParams.actualEndDateTime,
                    actualProductionQuantity: saveParams.actualProductionQuantity,
                    actualStartDateTime: saveParams.actualStartDateTime,
                    actualWorkers: saveParams.actualWorkers,
                    closed: true,
                } : item
            );
            console.log(updatedData);

            setSearchData(updatedData);

            notify('success', '작업 마감 성공', '작업이 성공적으로 마감되었습니다.');
        } catch (error) {
            notify('error', '오류 발생', '작업 지시 마감 처리 중 오류가 발생했습니다.');
        }
    };

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="작업 지시 마감"
                        description={(
                            <Typography>
                                작업 지시 마감 페이지는 <span>완료된 생산 작업의 지시를 정리하고 마감여부를 관리</span>하는 곳임. 이 페이지에서는 <span>확정된 작업지시가 완료되면 마감처리</span>할 수 있음. 이를 통해 <span>생산공정의 종료 단계까지 체계적으로 관리</span>할 수 있으며, 향후 생산 계획에 필요한 데이터를 축적할 수 있음.
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
                    <Grid item xs={12} md={10} sx={{ minWidth: '1400px'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ marginBottom: '20px'}}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >작업 지시 마감</Typography>
                                <Grid sx={{ padding: '0px 20px 20px 20px' }}>
                                    <Table
                                        dataSource={searchData ? searchData : []}
                                        columns={[
                                            {
                                                title: <div className="title-text">상태</div>,
                                                dataIndex: 'confirmed',
                                                key: 'confirmed',
                                                align: 'center',
                                                render: (confirmed) => (
                                                    <Tag color={confirmed ? 'green' : 'red'}>
                                                        {confirmed ? '확정' : '미확정'}
                                                    </Tag>
                                                ),
                                            },
                                            {
                                                title: <div className="title-text">작업지시명</div>,
                                                dataIndex: 'name',
                                                key: 'name',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text}</div> : '',
                                            },
                                            {
                                                title: <div className="title-text">계획 시작일</div>,
                                                dataIndex: 'startDateTime',
                                                key: 'startDateTime',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{dayjs(text).format('YYYY-MM-DD HH:mm:ss')}</div> : '',
                                            },
                                            {
                                                title: <div className="title-text">계획 종료일</div>,
                                                dataIndex: 'endDateTime',
                                                key: 'endDateTime',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{dayjs(text).format('YYYY-MM-DD HH:mm:ss')}</div> : '',
                                            },
                                            {
                                                title: <div className="title-text">실제 시작일</div>,
                                                dataIndex: 'actualStartDateTime',
                                                key: 'actualStartDateTime',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{dayjs(text).format('YYYY-MM-DD HH:mm:ss')}</div> : '',
                                            },
                                            {
                                                title: <div className="title-text">실제 종료일</div>,
                                                dataIndex: 'actualEndDateTime',
                                                key: 'actualEndDateTime',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{dayjs(text).format('YYYY-MM-DD HH:mm:ss')}</div> : '',
                                            },
                                            {
                                                title: <div className="title-text">생산량</div>,
                                                dataIndex: 'productionQuantity',
                                                key: 'productionQuantity',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text.toLocaleString()}</div> : '',
                                            },
                                            {
                                                title: <div className="title-text">실제 생산량</div>,
                                                dataIndex: 'actualProductionQuantity',
                                                key: 'actualProductionQuantity',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text.toLocaleString()}</div> : '',
                                            },
                                            {
                                                title: <div className="title-text">작업자 수</div>,
                                                dataIndex: 'workers',
                                                key: 'workers',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text}</div> : '',
                                            },
                                            {
                                                title: <div className="title-text">실제 작업자 수</div>,
                                                dataIndex: 'actualWorkers',
                                                key: 'actualWorkers',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text}</div> : '',
                                            },
                                            {
                                                title: <div className="title-text">마감여부</div>,
                                                dataIndex: 'closed',
                                                key: 'closed',
                                                align: 'center',
                                                render: (closed) => (
                                                    closed ? <Tag color="red">마감</Tag> : ''
                                                ),
                                            },
                                        ]}

                                        rowSelection={{
                                            type: 'radio',
                                            selectedRowKeys,
                                            onChange: (newSelectedRowKeys) => {
                                                setSelectedRowKeys(newSelectedRowKeys);
                                            },
                                        }}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: () => {
                                                setSelectedRowKeys([record.id]);
                                            },
                                        })}
                                        pagination={false}
                                        style={{ marginBottom: '20px' }}
                                        size="small"
                                        rowKey="id"
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                        {selectedRowKeys && (
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{ marginTop: '20px', padding: '20px' }}>
                                    <Typography variant="h6">작업 상세 입력</Typography>
                                    <Form
                                        form={form}
                                        layout="vertical"
                                        onValuesChange={(changedValues, allValues) => {
                                            setSaveParams((prev) => ({
                                                ...prev,
                                                ...changedValues,
                                            }));
                                        }}
                                    >
                                        <Row gutter={16} style={{ marginTop: '20px' }}>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="실제 시작 시간"
                                                    name="actualStartDateTime"
                                                    rules={[{ required: true, message: '실제 시작 시간을 선택하세요!' }]}
                                                >
                                                    <DatePicker
                                                        showTime
                                                        format="YYYY-MM-DD HH:mm:ss"
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="실제 종료 시간"
                                                    name="actualEndDateTime"
                                                    rules={[{ required: true, message: '실제 종료 시간을 선택하세요!' }]}
                                                >
                                                    <DatePicker
                                                        showTime
                                                        format="YYYY-MM-DD HH:mm:ss"
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="실제 작업자 수"
                                                    name="actualWorkers"
                                                    rules={[{ required: true, message: '작업자 수를 입력하세요!' }]}
                                                >
                                                    <InputNumber
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="실제 생산량"
                                                    name="actualProductionQuantity"
                                                    rules={[{ required: true, message: '생산량을 입력하세요!' }]}
                                                >
                                                    <InputNumber
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                            <Button onClick={handleCloseOrder} type="primary">
                                                작업지시 마감
                                            </Button>
                                        </Box>
                                    </Form>
                                </Paper>
                            </Grow>
                        )}
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

export default ProductionOrderClosingPage;