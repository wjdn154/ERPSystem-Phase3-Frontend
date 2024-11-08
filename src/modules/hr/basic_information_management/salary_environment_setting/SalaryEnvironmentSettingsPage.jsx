import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './SalaryEnviromentSettingsUtil.jsx';
import {Typography} from '@mui/material';
import {Button, Col, Form, Row, Table, Tag} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import {
    fetchAccountSubjectDetail
} from "../../../financial/basic_information_management/account_subject/AccountSubjectApi.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {COMMON_API, EMPLOYEE_API, FINANCIAL_API} from "../../../../config/apiConstants.jsx";
import dayjs from "dayjs";
import {SearchOutlined} from "@ant-design/icons";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";

const RetirementManagementPage = ({ initialData }) => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [searchData, setSearchData] = useState(null);
    const [searchData2, setSearchData2] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState({
        id: 1,
        name: '사장',
    });
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);


    useEffect(() => {
        setSearchData(initialData);
        const fetchData = async () => {
            try {
                const result = await apiClient.post(EMPLOYEE_API.POSITION_SALARY_STEP_API, { positionId: 1 });
                setSearchData2(result.data);
                console.log(result.data);
            } catch (error) {
                console.error('급여 환경 설정 페이지 초기 데이터를 불러오는 중 오류 발생', error);
            }
        };

        fetchData();
    }, []);


    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="급여 환경 설정"
                        description={(
                            <Typography>
                                급여 환경 설정 페이지는 <span>회사의 직책 및 호봉체계별 급여 설정을 관리</span>하는 기능을 제공함.<br/>
                                이 페이지에서는 <span>직책별, 호봉별 지급 설정을 제공</span> 하며 <span>인사 기초 급여 지급</span>에 필요한 기준 정보를 관리할 수 있음. 이를 통해 필요 시 재무 및 인사 처리에 활용할 수 있음.
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
                    <Grid item xs={12} md={2} sx={{ minWidth: '400px'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >직책 및 적용일자</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Table
                                        dataSource={searchData ? searchData : []}
                                        columns={[
                                            {
                                                title: <div className="title-text">직책 코드</div>,
                                                dataIndex: 'positionCode',
                                                key: 'positionCode',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text}</div> : ''
                                            },
                                            {
                                                title: <div className="title-text">직책 이름</div>,
                                                dataIndex: 'positionName',
                                                key: 'positionName',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text}</div> : ''
                                            },
                                        ]}
                                        rowKey="id"
                                        pagination={false}
                                        size="small"
                                        style={{ marginBottom: '20px' }}
                                        rowSelection={{
                                            type: 'radio',
                                            selectedRowKeys,
                                            onChange: (newSelectedRowKeys) => {
                                                setSelectedRowKeys(newSelectedRowKeys);
                                            }
                                        }}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: async () => {
                                                setSelectedRowKeys([record.id]); // 클릭한 행의 키로 상태 업데이트
                                                const id = record.id;
                                                try {
                                                    const response = await apiClient.post(EMPLOYEE_API.POSITION_SALARY_STEP_API, { positionId: id });
                                                    setSearchData2(response.data);
                                                    setSelectedPosition({
                                                        id: id,
                                                        name: record.positionName,
                                                    });
                                                    console.log(response.data);

                                                    notify('success', '호봉체계 조회', '호봉체계 조회 성공.', 'bottomRight')
                                                } catch (error) {
                                                    notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
                                                }
                                            },
                                        })}
                                    />
                                </Grid>
                                <Grid sx={{ padding: '20px 20px 0px 20px' }}>
                                    <Table
                                        dataSource={searchData2 ? searchData2.positionSalaryStepDateDetailDTOList.map((item, index) => ({ ...item, key: `entry-${index}` })) : []}
                                        columns={[
                                            {
                                                title: <div className="title-text">적용시작연월</div>,
                                                dataIndex: 'useStartDate',
                                                key: 'useStartDate',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text}</div> : ''
                                            },
                                            {
                                                title: <div className="title-text">적용종료연월</div>,
                                                dataIndex: 'useEndDate',
                                                key: 'useEndDate',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text}</div> : ''
                                            },
                                        ]}
                                        pagination={false}
                                        size="small"
                                        style={{ marginBottom: '20px' }}
                                        rowSelection={{
                                            type: 'radio',
                                            selectedRowKeys,
                                            onChange: (newSelectedRowKeys) => {
                                                setSelectedRowKeys(newSelectedRowKeys);
                                            }
                                        }}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: async () => {
                                                setSelectedRowKeys([record.key]);
                                                console.log(selectedPosition.id);
                                                try {
                                                    const response = await apiClient.post(EMPLOYEE_API.POSITION_SALARY_STEP_DATE_CATEGORY_API, {
                                                        positionId: selectedPosition.id,
                                                        endMonth: record.useEndDate ? dayjs(record.useEndDate).format('YYYY-MM-DD') : null,
                                                    });
                                                    console.log(response.data);
                                                    setSearchData2({
                                                        ...searchData2,
                                                        positionSalaryStepShowDTOList: response.data.positionSalaryStepShowDTOList,
                                                    });

                                                    notify('success', '호봉 체계 조회', '호봉 체계 정보 조회 성공.', 'bottomRight');
                                                } catch (error) {
                                                    notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
                                                }
                                            },
                                        })}
                                    />
                            </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} md={8} sx={{ minWidth: '400px'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >호봉체계 [{selectedPosition.name}]</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Table
                                        dataSource={searchData2 ? searchData2.positionSalaryStepShowDTOList : []}
                                        columns={[
                                            {
                                                title: <div className="title-text">호봉</div>,
                                                dataIndex: 'salaryStepName',
                                                key: 'salaryStepName',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text}</div> : ''
                                            },
                                            ...(
                                                searchData2 && searchData2.positionSalaryStepShowDTOList.length > 0
                                                    ? searchData2.positionSalaryStepShowDTOList[0].allowances.map((allowance) => ({
                                                        title: <div className="title-text">{allowance.allowanceName}</div>,
                                                        dataIndex: ['allowances', allowance.allowanceId - 1, 'amount'],
                                                        key: `allowance_${allowance.allowanceId}`,
                                                        align: 'center',
                                                        render: (text) => text ? <div style={{ textAlign: 'right' }} className="small-text">{text.toLocaleString()}</div> : ''
                                                    }))
                                                    : []
                                            ),
                                            {
                                                title: <div className="title-text">합계</div>,
                                                dataIndex: 'totalAllowance',
                                                key: 'totalAllowance',
                                                align: 'center',
                                                render: (text) => text ? <div style={{ textAlign: 'right' }} className="small-text">{text.toLocaleString()}</div> : ''
                                            }
                                        ]}
                                        rowKey="positionSalaryStepId"
                                        pagination={false}
                                        size="small"
                                        style={{ marginBottom: '20px' }}
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

export default RetirementManagementPage;