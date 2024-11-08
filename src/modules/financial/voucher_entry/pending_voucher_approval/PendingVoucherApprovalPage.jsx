import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './PendingVoucherApprovalUtil.jsx';
import {Typography} from '@mui/material';
import {Button, Col, DatePicker, Form, Modal, notification, Row, Table, Tag} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import {useSelector} from "react-redux";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {format} from "date-fns";
import {ko} from "date-fns/locale";
import apiClient from "../../../../config/apiClient.jsx";
import {FINANCIAL_API} from "../../../../config/apiConstants.jsx";
import dayjs from "dayjs";
import {SearchOutlined} from "@ant-design/icons";
import {jwtDecode} from "jwt-decode";
const { confirm } = Modal;

const PendingVoucherApprovalPage = () => {
    const { token, isAdmin } = useSelector((state) => state.auth);
    const notify = useNotificationContext();
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [searchData, setSearchData] = useState([])
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [selectedVouchers, setSelectedVouchers] = useState([]);

    const handleSearch = async () => {
        try {
            const response = await apiClient.post(FINANCIAL_API.UNRESOLVED_VOUCHER_APPROVAL_SEARCH_API, {
                searchDate: formattedDate,
            });
            console.log('response:', response.data);
            setSearchData(response.data); // API로 받은 데이터를 바로 상태로 설정
            notify('success', '조회 성공', '전표 목록 데이터 조회 성공.', 'bottomRight');
        } catch (err) {
            console.error('데이터를 불러오는 중 오류 발생:', err);
            notify('error', '오류', '데이터를 불러오는 중 오류가 발생했습니다.', 'top');
        }
    }

    const formattedDate = useMemo(() => {
        return format(selectedDate, 'yyyy-MM-dd', { locale: ko });
    }, [selectedDate]);

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };



    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="일반전표승인"
                        description={(
                            <Typography>
                                일반전표승인 페이지는 <span>미결 상태의 일반전표를 승인하는 기능</span>을 제공함. 이 페이지를 통해 승인자는 <span>거래 내역을 검토하고 승인 또는 반려</span>할 수 있음.<br/>
                                미결 일반전표를 승인하면 <span>전표가 확정되어 회계 처리</span>가 완료됨. 이를 통해 정확한 재무 데이터를 유지하고 결산을 원활하게 진행할 수 있음.
                            </Typography>
                        )}
                        tabItems={tabItems()}
                        activeTabKey={activeTabKey}
                        handleTabChange={handleTabChange}
                    />
                </Grid>
            </Grid>

            {activeTabKey === '1' && (
                <Grid sx={{ padding: '0px 20px 0px 20px', minWidth: '1400px !important' }} container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >미결 일반전표 목록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
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
                                                        value={selectedDate ? dayjs(selectedDate) : null}
                                                        onChange={(date) => {
                                                            if (date) {
                                                                setSelectedDate(date.toDate());
                                                            } else {
                                                                setSelectedDate(null);
                                                            }
                                                        }}
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Form.Item>
                                                    <Button style={{ width: '100px' }} type="primary" onClick={handleSearch}  icon={<SearchOutlined />} block>
                                                        검색
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                    <Grid item xs={12} sx={{ marginBottom: '20px' }}>
                                        <Table
                                            dataSource={searchData?.voucherDtoList}
                                            columns={[
                                                {
                                                    title: '날짜',
                                                    dataIndex: 'voucherDate',
                                                    key: 'voucherDate',
                                                    align: 'center',
                                                    render: (text, record) => <span className="small-text">{text || formattedDate}</span>
                                                },
                                                {
                                                    title: '전표번호',
                                                    dataIndex: 'voucherNumber',
                                                    key: 'voucherNumber',
                                                    align: 'center',
                                                    render: (text, record) => record.total ? null : <span className="small-text">{text}</span>
                                                },
                                                {
                                                    title: '구분',
                                                    dataIndex: 'voucherType',
                                                    key: 'voucherType',
                                                    align: 'center',
                                                    render: (text) => {
                                                        let color;
                                                        let value;
                                                        switch (text) {
                                                            case 'DEPOSIT':
                                                                color = 'green';
                                                                value = '입금';
                                                                break;
                                                            case 'WITHDRAWAL':
                                                                color = 'red';
                                                                value = '출금';
                                                                break;
                                                            case 'DEBIT':
                                                                color = 'green';
                                                                value = '차변';
                                                                break;
                                                            case 'CREDIT':
                                                                color = 'red';
                                                                value = '대변';
                                                                break;
                                                            default:
                                                                color = 'gray';
                                                                value = text;
                                                        }
                                                        return <Tag style={{ marginLeft: '5px' }} color={color}>{value}</Tag>;
                                                    }
                                                },
                                                {
                                                    title: '계정과목',
                                                    dataIndex: 'accountSubjectCode',
                                                    key: 'accountSubjectCode',
                                                    align: 'center',
                                                    render: (text, record) => <span className="small-text">[{text.padStart(5, '0')}]] {record.accountSubjectName}</span>
                                                },
                                                {
                                                    title: '거래처',
                                                    dataIndex: 'clientCode',
                                                    key: 'clientCode',
                                                    align: 'center',
                                                    render: (text, record) => <span className="small-text">[{text.padStart(5, '0')}] {record.clientName}</span>
                                                },
                                                {
                                                    title: '담당자',
                                                    dataIndex: 'voucherManagerCode',
                                                    key: 'voucherManagerCode',
                                                    align: 'center',
                                                    render: (text, record) => <div className="small-text">[{text}] {record.voucherManagerName}</div>
                                                },
                                                {
                                                    title: '적요',
                                                    dataIndex: 'transactionDescription',
                                                    key: 'transactionDescription',
                                                    align: 'center',
                                                    render: (text) => <span className="small-text">{text}</span>
                                                },
                                                {
                                                    title: <div style={{ textAlign: 'center' }}>차변</div>,
                                                    dataIndex: 'debitAmount',
                                                    key: 'debitAmount',
                                                    align: 'right',
                                                    render: (text) => <span className="small-text">{text.toLocaleString()}</span>
                                                },
                                                {
                                                    title: <div style={{ textAlign: 'center' }}>대변</div>,
                                                    dataIndex: 'creditAmount',
                                                    key: 'creditAmount',
                                                    align: 'right',
                                                    render: (text) => <span className="small-text">{text.toLocaleString()}</span>
                                                }
                                            ]}
                                            rowKey={(record) => record.id}
                                            pagination={false}
                                            size="small"
                                            scroll={{ x: 'max-content' }}
                                            rowSelection={{
                                                type: 'checkbox',
                                                selectedRowKeys: searchData?.voucherDtoList ? searchData.voucherDtoList
                                                        .filter((item) => selectedVouchers.includes(item.voucherNumber)) // 선택된 전표 번호 배열에 있는지 확인
                                                        .map((item) => item.id)
                                                    : [],
                                                onChange: (selectedRowKeys, selectedRows) => {
                                                    const selectedVoucherNumbers = selectedRows.map(row => row.voucherNumber); // 선택된 전표번호 추출
                                                    setSelectedVouchers(selectedVoucherNumbers); // 배열로 상태 저장
                                                },
                                                columnWidth: 50,
                                            }}
                                            onRow={(record) => ({
                                                style: { cursor: 'pointer' },
                                                onClick: () => {
                                                    if (selectedVouchers.includes(record.voucherNumber)) {
                                                        // 이미 선택된 전표인 경우 선택 해제
                                                        setSelectedVouchers(selectedVouchers.filter(voucher => voucher !== record.voucherNumber));
                                                    } else {
                                                        // 선택되지 않은 전표인 경우 배열에 추가
                                                        setSelectedVouchers([...selectedVouchers, record.voucherNumber]);
                                                    }
                                                }
                                            })}
                                            summary={() =>  (
                                                searchData?.voucherDtoList && searchData.voucherDtoList.length > 0 ? (
                                                    <Table.Summary.Row style={{ textAlign: 'right', backgroundColor: '#FAFAFA' }}>
                                                        <Table.Summary.Cell index={0}>
                                                            <div style={{ textAlign: 'center' }} className="medium-text">합계</div>
                                                        </Table.Summary.Cell>
                                                        <Table.Summary.Cell index={1} />
                                                        <Table.Summary.Cell index={2} />
                                                        <Table.Summary.Cell index={3} />
                                                        <Table.Summary.Cell index={4} />
                                                        <Table.Summary.Cell index={5} />
                                                        <Table.Summary.Cell index={6} />
                                                        <Table.Summary.Cell index={7} />
                                                        <Table.Summary.Cell index={8}><div className="medium-text">{Number(searchData.totalDebit || 0).toLocaleString()}</div></Table.Summary.Cell>
                                                        <Table.Summary.Cell index={9}><div className="medium-text">{Number(searchData.totalCredit || 0).toLocaleString()}</div></Table.Summary.Cell>
                                                    </Table.Summary.Row>
                                                ) : null
                                            )}
                                        />
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                                            <Button
                                                type="danger"
                                                onClick={() => {
                                                    confirm({
                                                        title: '매입매출 전표 반려 확인',
                                                        content: '정말 매입매출 전표를 반려 하시겠습니까?',
                                                        okText: '확인',
                                                        cancelText: '취소',
                                                        async onOk() {
                                                            try {
                                                                if (selectedVouchers.length === 0) {
                                                                    notify('warning', '전표 선택', '반려할 전표를 선택해주세요.', 'bottomRight');
                                                                    return;
                                                                }

                                                                console.log(dayjs(selectedDate).format('YYYY-MM-DD'));
                                                                console.log(selectedVouchers);
                                                                console.log(isAdmin);

                                                                // 미결 전표 반려 API 호출
                                                                const response = await apiClient.post(FINANCIAL_API.APPROVAL_UNRESOLVED_VOUCHER_API, {
                                                                    searchDate: dayjs(selectedDate).format('YYYY-MM-DD'),
                                                                    searchVoucherNumberList: selectedVouchers,
                                                                    approvalManagerId: jwtDecode(token).employeeId,
                                                                    approvalStatus: 'Rejected',
                                                                    superManager: isAdmin
                                                                });

                                                                if (response.status === 200) {
                                                                    notify('success', '매입매출 전표 반려', '전표 반려가 완료되었습니다.', 'bottomRight');
                                                                    handleSearch();  // 반려 후 데이터 갱신
                                                                } else {
                                                                    notify('error', '매입매출 전표 반려 실패', '전표 반려 중 오류가 발생했습니다.', 'bottomRight');
                                                                }
                                                            } catch (error) {
                                                                console.error('매입매출 전표 반려 중 오류 발생:', error);
                                                                notify('error', '매입매출 전표 반려 실패', '전표 반려 중 오류가 발생했습니다.', 'bottomRight');
                                                            }
                                                        },
                                                        onCancel() {
                                                            notify('warning', '매입매출 전표 반려 취소', '전표 반려가 취소되었습니다.', 'bottomRight');
                                                        }
                                                    });
                                                }}
                                            >
                                                전표 반려
                                            </Button>

                                            <Button
                                                type="primary"
                                                onClick={async () => {
                                                    if (!selectedVouchers) {
                                                        notify('warning', '전표 선택', '승인할 전표를 선택해주세요.', 'bottomRight');
                                                        return;
                                                    }

                                                    confirm({
                                                        title: '전표 승인 확인',
                                                        content: '정말 전표를 승인 하시겠습니까?',
                                                        okText: '확인',
                                                        cancelText: '취소',
                                                        async onOk() {
                                                            if (selectedVouchers.length === 0) {
                                                                notify('warning', '전표 선택', '승인할 전표를 선택해주세요.', 'bottomRight');
                                                                return;
                                                            }

                                                            try {
                                                                console.log(dayjs(selectedDate).format('YYYY-MM-DD'));
                                                                console.log(selectedVouchers);
                                                                console.log(isAdmin);

                                                                // 미결 전표 승인 API
                                                                const response = await apiClient.post(FINANCIAL_API.APPROVAL_UNRESOLVED_VOUCHER_API, {
                                                                    searchDate:dayjs(selectedDate).format('YYYY-MM-DD'),
                                                                    searchVoucherNumberList: selectedVouchers,
                                                                    approvalManagerId: jwtDecode(token).employeeId,
                                                                    approvalStatus: 'Approved',
                                                                    superManager: isAdmin
                                                                });

                                                                if (response.status === 200) {
                                                                    notify('success', '전표 승인', '전표 승인이 완료되었습니다.', 'bottomRight');
                                                                    handleSearch();  // 승인 후 데이터 갱신
                                                                } else {
                                                                    notify('error', '전표 승인 실패', '전표 승인 중 오류가 발생했습니다.', 'bottomRight');
                                                                }
                                                            } catch (error) {
                                                                console.error('전표 승인 중 오류 발생:', error);
                                                                notify('error', '전표 승인 실패', '전표 승인 중 오류가 발생했습니다.', 'bottomRight');
                                                            }
                                                        },
                                                    onCancel() { notify('warning', '전표 승인 취소', '전표 승인이 취소되었습니다', 'bottomRight'); }
                                                    });
                                                }}
                                            >
                                                전표 승인
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

            {activeTabKey === '2' && (
                <TemporarySection />
            )}

        </Box>
    );
};

export default PendingVoucherApprovalPage;