import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './PendingSalesPurchaseVoucherApprovalUtil.jsx';
import {Typography} from '@mui/material';
import {Button, Col, DatePicker, Form, Modal, notification, Row, Spin, Table, Tag, Tooltip} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import {useSelector} from "react-redux";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {format} from "date-fns";
import {ko} from "date-fns/locale";
import apiClient from "../../../../config/apiClient.jsx";
import {FINANCIAL_API} from "../../../../config/apiConstants.jsx";
import dayjs from "dayjs";
import {QuestionCircleOutlined, SearchOutlined} from "@ant-design/icons";
import {jwtDecode} from "jwt-decode";
const { confirm } = Modal;

const PendingSalesPurchaseVoucherApprovalPage = () => {
    const { token, isAdmin } = useSelector((state) => state.auth);
    const notify = useNotificationContext();
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [searchData, setSearchData] = useState([])
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [selectedVouchers, setSelectedVouchers] = useState([]);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [voucherDetails, setVoucherDetails] = useState({});

    const handleSearch = async () => {
        try {
            const response = await apiClient.post(FINANCIAL_API.SALE_END_PURCHASE_RESOLVED_VOUCHER_APPROVE_SEARCH_API, {
                searchDate: formattedDate,
            });
            console.log('response:', response.data);
            setSearchData(response.data); // API로 받은 데이터를 바로 상태로 설정
            notify('success', '조회 성공', '매입매출전표 목록 데이터 조회 성공.', 'bottomRight');
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
                        title="매입매출전표 승인"
                        description={(
                            <Typography>
                                미결 매입매출 전표승인 페이지는 <span>미결 상태의 전표를 승인하는 기능</span>을 제공함. 이 페이지를 통해 승인자는 <span>거래 내역을 검토하고 승인 또는 반려</span>할 수 있음.<br/>
                                미결 전표를 승인하면 <span>전표가 확정되어 회계 처리</span>가 완료됨. 이를 통해 정확한 재무 데이터를 유지하고 결산을 원활하게 진행할 수 있음.
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
                                <Typography variant="h6" sx={{ padding: '20px' }} >미결 매입매출 전표 목록</Typography>
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
                                            dataSource={searchData}
                                            columns={[
                                                {
                                                    title: <div className="title-text">날짜</div>,
                                                    dataIndex: 'voucherDate',
                                                    key: 'voucherDate',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>
                                                },
                                                {
                                                    title: <div className="title-text">전표번호</div>,
                                                    dataIndex: 'voucherNumber',
                                                    key: 'voucherNumber',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>
                                                },
                                                {
                                                    title: <div className="title-text">거래유형</div>,
                                                    dataIndex: 'transactionType',
                                                    key: 'transactionType',
                                                    align: 'center',
                                                    render: (text) => {
                                                        let color = 'gray';
                                                        let value = '없음';

                                                        if (text === 'SALES') {
                                                            color = 'green';
                                                            value = '매출';
                                                        } else if (text === 'PURCHASE') {
                                                            color = 'red';
                                                            value = '매입';
                                                        }

                                                        return <Tag color={color}>{value}</Tag>;
                                                    }
                                                },
                                                {
                                                    title: <div className="title-text">부가세유형</div>,
                                                    dataIndex: 'vatTypeCode',
                                                    key: 'vatTypeCode',
                                                    align: 'center',
                                                    render: (text, record) => <div className="small-text">[{text}] {record.vatTypeName}</div>
                                                },
                                                {
                                                    title: <div className="title-text">품목</div>,
                                                    dataIndex: 'itemName',
                                                    key: 'itemName',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>
                                                },
                                                {
                                                    title: <div className="title-text">수량</div>,
                                                    dataIndex: 'quantity',
                                                    key: 'quantity',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{Number(text).toLocaleString()}</div>
                                                },
                                                {
                                                    title: <div className="title-text">단가</div>,
                                                    dataIndex: 'unitPrice',
                                                    key: 'unitPrice',
                                                    align: 'center',
                                                    render: (text) => <div style={{ textAlign: 'right' }} className="small-text">{Number(text).toLocaleString()}</div>
                                                },
                                                {
                                                    title: <div className="title-text">공급가액</div>,
                                                    dataIndex: 'supplyAmount',
                                                    key: 'supplyAmount',
                                                    align: 'center',
                                                    render: (text) => <div style={{ textAlign: 'right' }} className="small-text">{Number(text).toLocaleString()}</div>
                                                },
                                                {
                                                    title: <div className="title-text">부가세</div>,
                                                    dataIndex: 'vatAmount',
                                                    key: 'vatAmount',
                                                    align: 'center',
                                                    render: (text) => <div style={{ textAlign: 'right' }} className="small-text">{Number(text).toLocaleString()}</div>
                                                },
                                                {
                                                    title: <div className="title-text">거래처</div>,
                                                    dataIndex: 'clientName',
                                                    key: 'clientName',
                                                    align: 'center',
                                                    render: (text, record) => <div className="small-text">[{record.clientCode.padStart(5, '0')}] {text}</div>
                                                },
                                                {
                                                    title: <div className="title-text">담당자</div>,
                                                    dataIndex: 'voucherManagerCode',
                                                    key: 'voucherManagerCode',
                                                    align: 'center',
                                                    render: (text, record) => <div className="small-text">[{text}] {record.voucherManagerName}</div>
                                                },
                                                {
                                                    title: <div className="title-text">분개유형</div>,
                                                    dataIndex: 'journalEntryName',
                                                    key: 'journalEntryName',
                                                    align: 'center',
                                                    render: (text) => {
                                                        let color;
                                                        switch (text) {
                                                            case '외상':
                                                                color = 'green';
                                                                break;
                                                            case '카드':
                                                                color = 'blue';
                                                                break;
                                                            case '현금':
                                                                color = 'red';
                                                                break;
                                                            default:
                                                                color = 'gray';
                                                        }
                                                        return <Tag style={{ marginLeft: '5px' }} color={color}>{text}</Tag>;
                                                    }
                                                },
                                                {
                                                    title: (
                                                        <div className="title-text" style={{ textAlign: 'center' }}>
                                                            전자
                                                            <Tooltip title="전자세금계산서 발행 여부">
                                                                <QuestionCircleOutlined style={{ marginLeft: '5px' }} />
                                                            </Tooltip>
                                                        </div>
                                                    ),
                                                    dataIndex: 'invoiceStatus',
                                                    key: 'invoiceStatus',
                                                    align: 'center',
                                                    render: (text, record) => {
                                                        if (!text) return '';
                                                        let color, value, tooltipText;
                                                        switch (text) {
                                                            case 'PUBLISHED':
                                                                color = 'green';
                                                                value = '발행';
                                                                tooltipText = '세금 계산서가 발행되었습니다.';
                                                                break;
                                                            case 'UNPUBLISHED':
                                                                color = 'red';
                                                                value = '미발행';
                                                                tooltipText = '세금 계산서가 아직 발행되지 않았습니다.';
                                                                break;
                                                            default:
                                                                color = 'gray';
                                                                value = text;
                                                                tooltipText = '상태 정보 없음';
                                                        }
                                                        return (
                                                            <Tooltip title={tooltipText}>
                                                                <Tag color={color} style={{ cursor: 'pointer' }}>{value}</Tag>
                                                            </Tooltip>
                                                        );
                                                    }
                                                }
                                            ]}
                                            rowKey={(record) => record.voucherNumber}
                                            pagination={false}
                                            size="small"
                                            scroll={{ x: 'max-content' }}
                                            rowSelection={{
                                                type: 'checkbox',
                                                selectedRowKeys: searchData
                                                    ? searchData
                                                        .filter((item) => selectedVouchers.includes(item.voucherNumber))
                                                        .map((item) => item.voucherNumber)
                                                    : [],
                                                onChange: (selectedRowKeys, selectedRows) => {
                                                    const selectedVoucherNumbers = selectedRows.map(row => row.voucherNumber);
                                                    setSelectedVouchers(selectedVoucherNumbers);
                                                },
                                                columnWidth: 50,
                                            }}
                                            onRow={(record) => ({
                                                style: { cursor: 'pointer' },
                                                onClick: () => {
                                                    if (selectedVouchers.includes(record.voucherNumber)) {
                                                        setSelectedVouchers(selectedVouchers.filter(voucher => voucher !== record.voucherNumber));
                                                    } else {
                                                        setSelectedVouchers([...selectedVouchers, record.voucherNumber]);
                                                    }
                                                }
                                            })}
                                            expandable={{
                                                expandedRowRender: (record) =>
                                                    loadingDetail ? (
                                                        <Spin />
                                                    ) : (
                                                        <div>
                                                            {voucherDetails[record.voucherNumber] ? (
                                                                <Table
                                                                    columns={[
                                                                        {
                                                                            title: <div className="title-text">전표일자</div>,
                                                                            dataIndex: 'voucherDate',
                                                                            key: 'voucherDate',
                                                                            align: 'center',
                                                                            render: (text) => text ? <div className="small-text">{text}</div> : '',
                                                                        },
                                                                        {
                                                                            title: <div className="title-text">전표번호</div>,
                                                                            dataIndex: 'voucherNumber',
                                                                            key: 'voucherNumber',
                                                                            align: 'center',
                                                                            render: (text) => text ? <div className="small-text">{text}</div> : '',
                                                                        },
                                                                        {
                                                                            title: <div className="title-text">구분</div>,
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
                                                                            title: <div className="title-text">계정과목</div>,
                                                                            dataIndex: 'accountSubjectName',
                                                                            key: 'accountSubjectName',
                                                                            align: 'center',
                                                                            render: (text) => text ? <div className="small-text">{text}</div> : '',
                                                                        },
                                                                        {
                                                                            title: <div className="title-text">거래처</div>,
                                                                            dataIndex: 'clientCode',
                                                                            key: 'clientCode',
                                                                            align: 'center',
                                                                            render: (text, record) => <div className="small-text">[{text.padStart(5, '0')}] {record.clientName}</div>
                                                                        },
                                                                        {
                                                                            title: <div className="title-text">거래설명</div>,
                                                                            dataIndex: 'transactionDescription',
                                                                            key: 'transactionDescription',
                                                                            align: 'center',
                                                                            render: (text) => text ? <div className="small-text">{text}</div> : '',
                                                                        },
                                                                        {
                                                                            title: <div className="title-text">담당자</div>,
                                                                            dataIndex: 'voucherManagerCode',
                                                                            key: 'voucherManagerCode',
                                                                            align: 'center',
                                                                            render: (text, record) => <div className="small-text">[{text}] {record.voucherManagerName}</div>
                                                                        },
                                                                        {
                                                                            title: <div className="title-text">차변</div>,
                                                                            dataIndex: 'debitAmount',
                                                                            key: 'debitAmount',
                                                                            align: 'center',
                                                                            render: (text) => text ? (
                                                                                <div style={{ textAlign: 'right' }} className="small-text">
                                                                                    {Number(text).toLocaleString()}
                                                                                </div>
                                                                            ) : (
                                                                                <div style={{ textAlign: 'right' }} className="small-text">0</div>
                                                                            ),
                                                                        },
                                                                        {
                                                                            title: <div className="title-text">대변</div>,
                                                                            dataIndex: 'creditAmount',
                                                                            key: 'creditAmount',
                                                                            align: 'center',
                                                                            render: (text) => text ? (
                                                                                <div style={{ textAlign: 'right' }} className="small-text">
                                                                                    {Number(text).toLocaleString()}
                                                                                </div>
                                                                            ) : (
                                                                                <div style={{ textAlign: 'right' }} className="small-text">0</div>
                                                                            ),
                                                                        },
                                                                    ]}
                                                                    dataSource={voucherDetails[
                                                                        record.voucherNumber
                                                                        ].voucherDtoList.map((item, index) => ({
                                                                        key: index,
                                                                        voucherDate: item.voucherDate,
                                                                        voucherNumber: item.voucherNumber,
                                                                        voucherType: item.voucherType,
                                                                        accountSubjectName: item.accountSubjectName,
                                                                        clientCode: item.clientCode,
                                                                        clientName: item.clientName,
                                                                        voucherManagerName: item.voucherManagerName,
                                                                        voucherManagerCode: item.voucherManagerCode,
                                                                        transactionDescription: item.transactionDescription,
                                                                        debitAmount: item.debitAmount > 0 ? item.debitAmount : null,
                                                                        creditAmount: item.creditAmount > 0 ? item.creditAmount : null,
                                                                    }))}
                                                                    pagination={false}
                                                                    size="small"
                                                                    rowKey="key"
                                                                    summary={() => (
                                                                        <>
                                                                            <Table.Summary.Row style={{ textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                                                                                <Table.Summary.Cell align="center" index={0}><div className="medium-text">합계</div></Table.Summary.Cell>
                                                                                <Table.Summary.Cell align="center" index={1}/>
                                                                                <Table.Summary.Cell align="center" index={2}/>
                                                                                <Table.Summary.Cell align="center" index={3}/>
                                                                                <Table.Summary.Cell align="center" index={4}/>
                                                                                <Table.Summary.Cell align="center" index={5}/>
                                                                                <Table.Summary.Cell align="center" index={6}/>
                                                                                <Table.Summary.Cell align="right" index={7}><div className="medium-text">{Number(voucherDetails[record.voucherNumber].totalDebit).toLocaleString()}</div></Table.Summary.Cell>
                                                                                <Table.Summary.Cell align="right" index={8}><div className="medium-text">{Number(voucherDetails[record.voucherNumber].totalCredit).toLocaleString()}</div></Table.Summary.Cell>
                                                                            </Table.Summary.Row>
                                                                        </>
                                                                    )}
                                                                />
                                                            ) : (
                                                                '상세 정보가 없습니다.'
                                                            )}
                                                        </div>
                                                    ),
                                                expandedRowKeys: expandedRowKeys,
                                                onExpand: async (expanded, record) => {
                                                    setExpandedRowKeys(
                                                        expanded ? [record.voucherNumber] : [] // 하나의 행만 열리도록 설정
                                                    );

                                                    if (expanded) {
                                                        if (!voucherDetails[record.voucherNumber]) {
                                                            setLoadingDetail(true);
                                                            let voucherId = record.voucherId;
                                                            try {
                                                                const response = await apiClient.post(
                                                                    FINANCIAL_API.SALE_END_PURCHASE_RESOLVED_VOUCHER_ENTRY_API,
                                                                    {
                                                                        voucherId,
                                                                    }
                                                                );
                                                                console.log('상세 정보:', response.data);
                                                                setVoucherDetails((prevDetails) => ({
                                                                    ...prevDetails,
                                                                    [record.voucherNumber]: response.data,
                                                                }));
                                                            } catch (error) {
                                                                console.error('상세 정보 가져오기 실패:', error);
                                                            }
                                                            setLoadingDetail(false);
                                                        }
                                                    }
                                                },
                                            }}
                                            summary={() => (
                                                searchData && searchData.length > 0 ? (
                                                    <Table.Summary.Row style={{ textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                                                        <Table.Summary.Cell index={0}><div className="medium-text">합계</div></Table.Summary.Cell>
                                                        <Table.Summary.Cell index={1} />
                                                        <Table.Summary.Cell index={2} />
                                                        <Table.Summary.Cell index={3} />
                                                        <Table.Summary.Cell index={4} />
                                                        <Table.Summary.Cell index={5} />
                                                        <Table.Summary.Cell index={6} />
                                                        <Table.Summary.Cell index={7}> <div className="medium-text"> {Number(searchData.reduce((acc, curr) => acc + curr.quantity, 0)).toLocaleString()}</div> </Table.Summary.Cell>
                                                        <Table.Summary.Cell index={8}> <div style={{ textAlign: 'right' }} className="medium-text"> {Number(searchData.reduce((acc, curr) => acc + curr.unitPrice, 0)).toLocaleString()} </div> </Table.Summary.Cell>
                                                        <Table.Summary.Cell index={9}> <div style={{ textAlign: 'right' }} className="medium-text"> {Number(searchData.reduce((acc, curr) => acc + curr.supplyAmount, 0)).toLocaleString()} </div> </Table.Summary.Cell>
                                                        <Table.Summary.Cell index={10}> <div style={{ textAlign: 'right' }} className="medium-text"> {Number(searchData.reduce((acc, curr) => acc + curr.vatAmount, 0)).toLocaleString()} </div> </Table.Summary.Cell>
                                                        <Table.Summary.Cell index={11} />
                                                        <Table.Summary.Cell index={12} />
                                                        <Table.Summary.Cell index={13} />
                                                        <Table.Summary.Cell index={14} />
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
                                                                    notify('warning', '전표 선택', '반려할 매출매입 전표를 선택해주세요.', 'bottomRight');
                                                                    return;
                                                                }

                                                                // 미결 전표 반려 API 호출
                                                                const response = await apiClient.post(FINANCIAL_API.SALE_AND_PURCHASE_UNRESOLVED_VOUCHER_APPROVE_API, {
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
                                                매출매입 전표 반려
                                            </Button>

                                            <Button
                                                type="primary"
                                                onClick={async () => {
                                                    confirm({
                                                        title: '매입매출 전표 승인 확인',
                                                        content: '정말 매입매출 전표를 승인 하시겠습니까?',
                                                        okText: '확인',
                                                        cancelText: '취소',
                                                        async onOk() {
                                                            try {
                                                                if (selectedVouchers.length === 0) {
                                                                    notify('warning', '전표 선택', '승인할 매출매입 전표를 선택해주세요.', 'bottomRight');
                                                                    return;
                                                                }
                                                                const response = await apiClient.post(FINANCIAL_API.SALE_AND_PURCHASE_UNRESOLVED_VOUCHER_APPROVE_API, {
                                                                    searchDate: dayjs(selectedDate).format('YYYY-MM-DD'),
                                                                    searchVoucherNumberList: selectedVouchers,
                                                                    approvalManagerId: jwtDecode(token).employeeId,
                                                                    approvalStatus: 'Approved',
                                                                    superManager: isAdmin
                                                                });

                                                                if (response.status === 200) {
                                                                    notify('success', '매입매출 전표 승인', '전표 승인이 완료되었습니다.', 'bottomRight');
                                                                    handleSearch();  // 승인 후 데이터 갱신
                                                                } else {
                                                                    notify('error', '매입매출 전표 승인 실패', '전표 승인 중 오류가 발생했습니다.', 'bottomRight');
                                                                }
                                                            } catch (error) {
                                                                console.error('매입매출 전표 승인 중 오류 발생:', error);
                                                                notify('error', '매입매출 전표 승인 실패', '전표 승인 중 오류가 발생했습니다.', 'bottomRight');
                                                            }
                                                        },
                                                        onCancel() {
                                                            notify('warning', '매입매출 전표 승인 취소', '전표 승인이 취소되었습니다', 'bottomRight');
                                                        }
                                                    });
                                                }}
                                            >
                                                매출매입 전표 승인
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default PendingSalesPurchaseVoucherApprovalPage;