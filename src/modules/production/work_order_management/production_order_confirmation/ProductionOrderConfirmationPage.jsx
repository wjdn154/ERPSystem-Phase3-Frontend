import React, {useEffect, useState} from 'react';
import {Box, Grid, Grow, Paper, Typography} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import {tabItems} from './ProductionOrderConfirmationUtil.jsx';
import {Button, Col, DatePicker, Form, InputNumber, Modal, notification, Row, Table, Tag} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import dayjs from "dayjs";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {PRODUCTION_API} from "../../../../config/apiConstants.jsx";
const { confirm } = Modal;

const ProductionOrderConfirmationPage = ({ initialData }) => {
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
        setSearchData(initialData);
    }, []);

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    const handleConfirm = async (selectedRowKey) => {
        console.log('selectedRowKey:', selectedRowKey);
        confirm({
            title: '작업 지시 확정 확인',
            content: '작업 지시를 확정 하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            async onOk() {
                const selectedRow = searchData.find((data) => data.id === selectedRowKey);
                if(selectedRow.confirmed) {
                    notify('error', '확정 실패', '이미 확정된 작업 지시입니다.');
                    return;
                }
                try {
                    await apiClient.post(PRODUCTION_API.PRODUCTION_ORDER_CONFIRM_API(selectedRow.id));

                    const updatedData = searchData.map((item) =>
                        item.id === selectedRow.id ? {
                            ...item,
                            confirmed: true,
                        } : item
                    );

                    setSearchData(updatedData);

                    notify('success', '작업지시 확정 성공', '작업지시가 성공적으로 확정되었습니다.');
                } catch (error) {
                    notify('error', '오류 발생', '작업 지시 확정 처리 중 오류가 발생했습니다.');
                }
            },
            onCancel() {
                notification.warning({
                    message: '확정 취소',
                    description: '작업 지시 확정이 취소되었습니다.',
                    placement: 'bottomRight',
                });
            },
        });
    };

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="작업 지시 확정"
                        description={(
                            <Typography>
                                작업 지시 확정 페이지는 <span>생산 과정에서 각 작업의 지시를 확정하고 관리</span>하는 곳임. 이 페이지에서는 <span>계획 상태인 작업 지시를 확정</span>할 수 있으며, 각 작업의 <span>작업 내용, 작업 인원, 작업 시간</span> 등의 정보를 조회할 수 있음. <br/>이를 통해 <span>생산 작업의 효율성</span>을 높이고, 현장의 <span>생산 스케줄을 체계적으로 관리</span>할 수 있음.
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
                                <Typography variant="h6" sx={{ padding: '20px' }} >작업 지시 생성</Typography>
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
                                                title: <div className="title-text">생산량</div>,
                                                dataIndex: 'productionQuantity',
                                                key: 'productionQuantity',
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
                                        ]}
                                        rowSelection={{
                                            type: 'radio',
                                            selectedRowKeys,
                                            onChange: (newSelectedRowKeys) => {
                                                setSelectedRowKeys(newSelectedRowKeys);
                                                handleConfirm(newSelectedRowKeys[0]);
                                            },
                                        }}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: () => {
                                                setSelectedRowKeys([record.id]);
                                                handleConfirm(record.id);
                                            },
                                        })}
                                        style={{ marginBottom: '20px' }}
                                        pagination={false}
                                        size="small"
                                        rowKey="id"
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

export default ProductionOrderConfirmationPage;