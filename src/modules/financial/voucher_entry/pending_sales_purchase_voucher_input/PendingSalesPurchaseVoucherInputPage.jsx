import React, {useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './PendingSalesPurchaseVoucherInputUtil.jsx';
import {Typography} from '@mui/material';
import {Button, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, Spin, Table, Tag, Tooltip} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import dayjs from "dayjs";
import {DownSquareOutlined, PlusOutlined, QuestionCircleOutlined, SearchOutlined} from "@ant-design/icons";
import apiClient from "../../../../config/apiClient.jsx";
import {FINANCIAL_API} from "../../../../config/apiConstants.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {useSelector} from "react-redux";
import {format} from "date-fns";
import {ko} from "date-fns/locale";
import {jwtDecode} from "jwt-decode";
const { Option } = Select

const PendingSalesPurchaseVoucherInputPage = () => {
    const token = useSelector(state => state.auth.token);
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [searchData, setSearchData] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [voucher, setVoucher] = useState({});
    const [vouchers, setVouchers] = useState([]);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [voucherDetails, setVoucherDetails] = useState({})
    const [displayValues, setDisplayValues] = useState({
        vatTypeCode: '',
        clientCode: ''
    });


    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    const handleModalSelect = (record) => {
        const formattedValue = `[${record.code || record.vatTypeCode}] ${record.printClientName || record.vatTypeName}`;

        setVoucher((prevParams) => ({
            ...prevParams,
            [currentField]: record.code || record.vatTypeCode,
        }));

        if(currentField === 'vatTypeCode') {
            setVoucher((prevParams) => ({
                ...prevParams,
                transactionType: record.transactionType,
            }));
        }

        setDisplayValues((prevValues) => ({
            ...prevValues,
            [currentField]: formattedValue,
        }));

        setIsModalVisible(false);
    };


    // 모달 데이터 가져오기
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        const apiPath = (fieldName === 'vatTypeCode')
            ? FINANCIAL_API.VAT_TYPE_SEARCH_API
            : FINANCIAL_API.CLIENT_SEARCH_API;
        try {
            const searchText = null;
            const response = await apiClient.post(apiPath, { searchText });
            if(fieldName === 'vatTypeCode') {
                const combinedData = [...response.data.salesVatTypeShowDTO, ...response.data.purchaseVatTypeShowDTO];
                setModalData(combinedData);
                setInitialModalData(combinedData);
            }else {
                setModalData(response.data);
                setInitialModalData(response.data);
            }
        } catch (error) {
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };

    // 입력 필드 클릭 시 모달 열기
    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setModalData(null); // 모달 열기 전에 데이터를 초기화
        setInitialModalData(null); // 모달 열기 전에 데이터를 초기화
        fetchModalData(fieldName);  // 모달 데이터 가져오기 호출
        setIsModalVisible(true);  // 모달창 열기
    };

    const handleAddRow = async () => {
        try {
            // 필수 필드 검사
            if (voucher.supplyAmount) {
                if (!voucher.vatTypeCode || !voucher.itemName || !voucher.supplyAmount || !voucher.clientCode || !voucher.journalEntryCode) {
                    notify('warning', '입력 오류', '모든 필수 필드를 입력해주세요.', 'bottomRight');
                    return;
                }

                if (voucher.supplyAmount <= 0) {
                    notify('warning', '입력 오류', '공급가액은 0보다 커야 합니다.', 'bottomRight');
                    return;
                }
            } else {
                if (!voucher.vatTypeCode || !voucher.itemName || !voucher.quantity || !voucher.unitPrice || !voucher.clientCode || !voucher.journalEntryCode) {
                    notify('warning', '입력 오류', '모든 필수 필드를 입력해주세요.', 'bottomRight');
                    return;
                }

                if (voucher.quantity <= 0 || voucher.unitPrice <= 0) {
                    notify('warning', '입력 오류', '수량과 단가는 0보다 커야 합니다.', 'bottomRight');
                    return;
                }
            }

            // 부가세 조회 API 호출
            let vatAmount = 0;

            // const searchVatTypeId = await apiClient.post(FINANCIAL_API.VAT_TYPE_ID_API(voucher.vatTypeCode));
            const searchVatTypeId = (await apiClient.post(FINANCIAL_API.VAT_TYPE_ID_API, { vatTypeCode: voucher.vatTypeCode})).data;
            // const searchVatTypeId = voucher.vatTypeCode;

            if (voucher.supplyAmount) {
                // 공급가액을 기준으로 부가세 계산

                const response = await apiClient.post(FINANCIAL_API.VAT_AMOUNT_SUPPLY_AMOUNT_API, {
                    vatTypeId: searchVatTypeId,
                    supplyAmount: voucher.supplyAmount,
                });
                vatAmount = response.data; // API 응답에서 부가세 금액을 가져옴
            } else {
                // 수량과 단가를 기준으로 부가세 계산
                const response = await apiClient.post(FINANCIAL_API.VAT_AMOUNT_QUANTITY_PRICE_API, {
                    vatTypeId: searchVatTypeId,
                    quantity: voucher.quantity,
                    price: voucher.unitPrice,
                });
                vatAmount = response.data; // API 응답에서 부가세 금액을 가져옴
            }

            // 새로운 전표 추가
            const newVoucher = {
                ...voucher,
                key: Date.now(), // 고유한 키 추가
                formattedClientCode: displayValues.clientCode,
                formattedVatTypeCode: displayValues.vatTypeCode,
                vatAmount: vatAmount // 부가세 금액을 전표에 추가
            };

            // 전표 배열에 새로운 전표 추가
            setVouchers([...vouchers, newVoucher]);

            // 입력폼 및 displayValues 초기화
            setVoucher({});
            setDisplayValues({ vatTypeCode: '', clientCode: '' });

            notify('success', '전표 추가 완료', '전표가 성공적으로 추가되었습니다.', 'bottomRight');
        } catch (error) {
            notify('error', '부가세 조회 실패', '부가세 금액을 조회하는 중 오류가 발생했습니다.', 'bottomRight');
        }
    };

    const handleDeleteRow = () => {
        if (vouchers.length === 0) return;

        const updatedVouchers = [...vouchers];
        const lastVoucher = updatedVouchers.pop();

        // vouchers 배열 업데이트 및 입력 필드 유지
        setVouchers(updatedVouchers);
        setVoucher(lastVoucher);

        // displayValues도 lastVoucher에 맞게 업데이트
        setDisplayValues({
            clientCode: lastVoucher.formattedClientCode,
            vatTypeCode: lastVoucher.formattedVatTypeCode
        });
    };

    const handleSubmit = async () => {
        try {
            if (!vouchers.length) throw new Error("전표를 추가해주세요.");

            const updatedVouchers = vouchers.length ? vouchers : [{
                ...voucher, // voucher 상태에서 필요한 값들 모두 가져옴
            }];

            for (const v of updatedVouchers) {
                const { formattedClientCode, ...rest } = v;

                const clientCode = formattedClientCode ? formattedClientCode.match(/\d+/)?.[0] : rest.clientCode;

                const processedVoucher = {
                    ...rest,
                    voucherDate: format(selectedDate, 'yyyy-MM-dd'),
                    voucherManagerId: jwtDecode(token).employeeId,
                    quantity: rest.quantity || 0,
                    unitPrice: rest.unitPrice || 0,
                    clientCode,
                    electronicTaxInvoiceStatus: 'Unpublished',
                };

                // 각 요청을 순차적으로 전송 (각 요청이 독립적으로 처리됨)
                await apiClient.post(FINANCIAL_API.SALE_AND_PURCHASE_UNRESOLVED_VOUCHER_ENTRY_API, processedVoucher);
            }

            // 성공적으로 저장되었을 때 후속 처리
            handleSearch(); // 저장 후 조회
            notify('success', '저장 완료', '모든 매출/매입 전표가 성공적으로 저장되었습니다.', 'bottomRight');
            setVoucher({}); // 저장 후 입력폼 초기화
            setDisplayValues({ vatTypeCode: '', clientCode: '' });
            setVouchers([]); // 저장 후 배열 초기화

        } catch (err) {
            notify('error', '저장 실패', err.message || '전표 저장 중 오류가 발생했습니다.', 'bottomRight');
        }
    };


    const formattedDate = useMemo(() => {
        return format(selectedDate, 'yyyy-MM-dd', { locale: ko });
    }, [selectedDate]);

    const handleSearch = async () => {
        try {
            const response = await apiClient.post(FINANCIAL_API.SALE_END_PURCHASE_RESOLVED_VOUCHER_SEARCH_API, {
                searchDate: formattedDate,
            });

            setSearchData(response.data);
            notify('success', '조회 성공', '전표 목록 데이터 조회 성공.', 'bottomRight');

        } catch (err) {
            console.log(err)
            notify('error', '조회 오류', '데이터를 불러오는 중 오류가 발생했습니다.', 'top');
        }
    }

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="매입매출전표입력"
                        description={(
                            <Typography>
                                매입매출 전표 입력 페이지는 <span>기업의 매입 및 매출 내역을 기록하는 중요한 기능</span>을 제공함. <br/>
                                사용자는 <span>구매 및 판매 거래</span>에 대한 전표를 입력하고, 이 정보는 재무 보고서나 회계 처리를 위해 활용됨. <br/>
                                <span>매입 전표</span>는 기업이 지불해야 할 금액을 기록하고, <span>매출 전표</span>는 발생한 수익을 기록함.<br/>
                                이 페이지에서는 신규 매입/매출 전표를 <span>등록, 삭제</span>할 수 있으며, 각 전표에는 <span>거래처 정보, 금액, 세금 정보</span> 등을 입력할 수 있음.<br/>
                                입력된 매입매출 전표는 <span>회계환경설정에 따라 자동으로 분개처리 됨</span>
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
                    <Grid item xs={12} md={12} style={{ minWidth: '1400px !important', maxWidth: '1700px' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >매입매출 전표 목록</Typography>
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
                                                        value={selectedDate ? dayjs(selectedDate) : null}  // selectedDate가 null일 때를 처리
                                                        onChange={(date) => {
                                                            if (date) {
                                                                setSelectedDate(date.toDate());  // 날짜가 선택된 경우
                                                            } else {
                                                                setSelectedDate(null);  // 날짜가 삭제된 경우 (X 버튼 클릭)
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
                                    <Grid item xs={12} sx={{ padding: '0 !important', marginBottom: '20px' }}>
                                        <Table
                                            dataSource={searchData?.showDTOS}
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
                                                    render: (text, record) => <div className="small-text">[{text.padStart(5, '0')}] {record.vatTypeName}</div>
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
                                                },
                                                {
                                                    title: <div className="title-text">담당자</div>,
                                                    dataIndex: 'voucherManagerCode',
                                                    key: 'voucherManagerCode',
                                                    align: 'center',
                                                    render: (text, record) => <div className="small-text">[{text}] {record.voucherManagerName}</div>
                                                },
                                                {
                                                    title: <div className="title-text">승인여부</div>,
                                                    dataIndex: 'approvalStatus',
                                                    key: 'approvalStatus',
                                                    align: 'center',
                                                    render: (text) => {
                                                        let color;
                                                        let value;
                                                        switch (text) {
                                                            case 'APPROVED':
                                                                color = 'green';
                                                                value = '승인';
                                                                break;
                                                            case 'PENDING':
                                                                color = 'red';
                                                                value = '미승인';
                                                                break;
                                                            case 'REJECTED':
                                                                color = 'orange';
                                                                value = '반려';
                                                                break;
                                                            default:
                                                                color = 'gray';
                                                                value = text;
                                                        }
                                                        return <Tag style={{ marginLeft: '5px' }} color={color}>{value}</Tag>;
                                                    }
                                                },
                                            ]}
                                            rowKey={(record) => record.voucherNumber}
                                            pagination={false}
                                            size="small"
                                            scroll={{ x: 'max-content' }}
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
                                                searchData?.showDTOS && searchData?.showDTOS.length > 0 ? (
                                                    <Table.Summary.Row style={{ textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                                                        <Table.Summary.Cell index={0}><div className="medium-text">합계</div></Table.Summary.Cell>
                                                        <Table.Summary.Cell index={1} />
                                                        <Table.Summary.Cell index={2} />
                                                        <Table.Summary.Cell index={3} />
                                                        <Table.Summary.Cell index={4} />
                                                        <Table.Summary.Cell index={5} />
                                                        <Table.Summary.Cell index={6} />
                                                        <Table.Summary.Cell index={7}> <div className="medium-text"> {Number(searchData.showDTOS.reduce((acc, curr) => acc + curr.quantity, 0)).toLocaleString()}</div> </Table.Summary.Cell>
                                                        <Table.Summary.Cell index={8}> <div style={{ textAlign: 'right' }} className="medium-text"> {Number(searchData.showDTOS.reduce((acc, curr) => acc + curr.unitPrice, 0)).toLocaleString()} </div> </Table.Summary.Cell>
                                                        <Table.Summary.Cell index={9}> <div style={{ textAlign: 'right' }} className="medium-text"> {Number(searchData.showDTOS.reduce((acc, curr) => acc + curr.supplyAmount, 0)).toLocaleString()} </div> </Table.Summary.Cell>
                                                        <Table.Summary.Cell index={10}> <div style={{ textAlign: 'right' }} className="medium-text"> {Number(searchData.showDTOS.reduce((acc, curr) => acc + curr.vatAmount, 0)).toLocaleString()} </div> </Table.Summary.Cell>
                                                        <Table.Summary.Cell index={11} />
                                                        <Table.Summary.Cell index={12} />
                                                        <Table.Summary.Cell index={13} />
                                                        <Table.Summary.Cell index={14} />
                                                    </Table.Summary.Row>
                                                ) : null
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} md={12} style={{ minWidth: '1400px !important', maxWidth: '1700px' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }}>매입매출 전표 입력</Typography>
                                <Grid sx={{ padding: '0px 20px 20px 20px' }}>
                                    <Grid sx={{ marginTop: '20px', marginBottom: '20px' }}>
                                        <Form layout="vertical">
                                            <Row gutter={8} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                {/* 부가세유형 - 모달 */}
                                                <Col span={3}>
                                                    <Form.Item
                                                        label="부가세유형"
                                                        tooltip="등록할 부가세의 유형을 선택하세요"
                                                        required
                                                    >
                                                        <Input
                                                            placeholder="부가세유형 선택"
                                                            value={displayValues.vatTypeCode}
                                                            onClick={() => handleInputClick('vatTypeCode')}
                                                            style={{ cursor: 'pointer', caretColor: 'transparent' }}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                {/* 품목 - 텍스트 */}
                                                <Col span={3}>
                                                    <Form.Item
                                                        label="품목"
                                                        tooltip="등록할 전표의 품목을 입력하세요"
                                                        required
                                                    >
                                                        <Input
                                                            name="itemName"
                                                            placeholder="품목"
                                                            value={voucher.itemName}
                                                            onChange={(e) => setVoucher({ ...voucher, itemName: e.target.value })}
                                                            style={{ width: '100%' }}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                {/* 수량 - 숫자 */}
                                                <Col span={2}>
                                                    <Form.Item
                                                        label="수량"
                                                        tooltip={<span>등록할 수량을 입력하세요.<br />수량과 단가를 입력하면 공급가액이 자동으로 계산되므로, 공급가액 입력이 비활성화됩니다.</span>}
                                                        required
                                                    >
                                                        <InputNumber
                                                            style={{ width: '100%' }}
                                                            placeholder="수량"
                                                            value={voucher.quantity}
                                                            onChange={(value) => setVoucher({ ...voucher, quantity: value })}
                                                            disabled={!!voucher.supplyAmount}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                {/* 단가 - 숫자 */}
                                                <Col span={3}>
                                                    <Form.Item
                                                        label="단가"
                                                        tooltip={<span>등록할 단가를 입력하세요.<br />수량과 단가를 입력하면 공급가액이 자동으로 계산되므로, 공급가액 입력이 비활성화됩니다.</span>}
                                                        required
                                                    >
                                                        <InputNumber
                                                            style={{ width: '100%' }}
                                                            placeholder="단가"
                                                            value={voucher.unitPrice}
                                                            onChange={(value) => {
                                                                const formattedValue = value?.toString().replace(/[^0-9]/g, '');
                                                                setVoucher({ ...voucher, unitPrice: formattedValue});
                                                            }}
                                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                            disabled={!!voucher.supplyAmount}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                {/* 공급가액 */}
                                                <Col span={3}>
                                                    <Form.Item
                                                        label="공급가액"
                                                        tooltip={<span>공급가액을 입력하세요.<br />공급가액을 직접 입력하면 수량과 단가는 자동으로 계산되므로, 수량과 단가 입력이 비활성화됩니다.</span>}
                                                        required
                                                    >
                                                        <InputNumber
                                                            style={{ width: '100%' }}
                                                            placeholder="공급가액"
                                                            value={voucher.supplyAmount}
                                                            onChange={(value) => {
                                                                const formattedValue = value?.toString().replace(/[^0-9]/g, '');
                                                                setVoucher({ ...voucher, supplyAmount: formattedValue });
                                                            }}
                                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                            disabled={!!voucher.quantity || !!voucher.unitPrice}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                {/* 거래처 - 모달 */}
                                                <Col span={3}>
                                                    <Form.Item
                                                        label="거래처"
                                                        tooltip="등록할 거래처를 선택하세요"
                                                        required
                                                    >
                                                        <Input
                                                            placeholder="거래처 선택"
                                                            value={displayValues.clientCode}
                                                            onClick={() => handleInputClick('clientCode')}
                                                            style={{ cursor: 'pointer', caretColor: 'transparent' }}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                {/* 분개유형(현금, 외상, 카드 현금) */}
                                                <Col span={2}>
                                                    <Form.Item
                                                        label="분개유형"
                                                        tooltip="등록할 전표의 분개유형을 선택하세요"
                                                        required
                                                    >
                                                        <Select
                                                            placeholder="유형 선택"
                                                            style={{ width: '100%' }}
                                                            value={voucher.journalEntryCode}
                                                            onChange={(value) => setVoucher({ ...voucher, journalEntryCode: value })}
                                                        >
                                                            <Option value="1">현금</Option>
                                                            <Option value="2">외상</Option>
                                                            <Option value="3">카드</Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>

                                                <Col span={2}>
                                                    <Button
                                                        type="primary"
                                                        icon={<PlusOutlined />}
                                                        onClick={handleAddRow}
                                                        style={{ width: '100%' }}
                                                    >
                                                        행 추가
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Form>

                                        <Table
                                            dataSource={vouchers}
                                            columns={[
                                                {
                                                    title: <div className="title-text">날짜</div>,
                                                    dataIndex: "voucherDate",
                                                    key: "voucherDate",
                                                    align: "center",
                                                    render: () => <span className="small-text">{formattedDate}</span>, // formattedDate 변수를 적절히 설정
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
                                                    dataIndex: "vatTypeCode",
                                                    key: "vatTypeCode",
                                                    align: "center",
                                                    render: (text, record) => <div className="small-text">{record.formattedVatTypeCode}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">품목</div>,
                                                    dataIndex: "itemName",
                                                    key: "itemName",
                                                    align: "center",
                                                    render: (text) => <div className="small-text">{text}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">수량</div>,
                                                    dataIndex: "quantity",
                                                    key: "quantity",
                                                    align: "center",
                                                    render: (text) => text ? <div className="small-text">{Number(text).toLocaleString()}</div> : <div className="small-text">0</div>,
                                                },
                                                {
                                                    title: <div className="title-text">단가</div>,
                                                    dataIndex: "unitPrice",
                                                    key: "unitPrice",
                                                    align: "center",
                                                    render: (text) => text ? <div style={{ textAlign: 'right' }} className="small-text">{Number(text).toLocaleString()}</div> : <div style={{ textAlign: 'right' }} className="small-text">0</div>,
                                                },
                                                {
                                                    title: <div className="title-text">공급가액</div>,
                                                    dataIndex: "supplyAmount",
                                                    key: "supplyAmount",
                                                    align: "center",
                                                    render: (text) => text ? <div style={{ textAlign: 'right' }} className="small-text">{Number(text).toLocaleString()}</div> : <div style={{ textAlign: 'right' }} className="small-text">0</div>,
                                                },
                                                {
                                                    title: <div className="title-text">부가세</div>,
                                                    dataIndex: "vatAmount",
                                                    key: "vatAmount",
                                                    align: "center",
                                                    render: (text) => text ? <div style={{ textAlign: 'right' }} className="small-text">{Number(text).toLocaleString()}</div> : <div style={{ textAlign: 'right' }} className="small-text">0</div>,
                                                },
                                                {
                                                    title: <div className="title-text">거래처</div>,
                                                    dataIndex: "clientCode",
                                                    key: "clientCode",
                                                    align: "center",
                                                    render: (text, record) => <div className="small-text">{record.formattedClientCode}</div>,
                                                },
                                                {
                                                    title: <div className="title-text">분개유형</div>,
                                                    dataIndex: "journalEntryCode",
                                                    key: "journalEntryCode",
                                                    align: "center",
                                                    render: (text) => {
                                                        let color;
                                                        let journalEntryName;
                                                        switch (text) {
                                                            case '1':
                                                                color = 'green';
                                                                journalEntryName = '외상';
                                                                break;
                                                            case '2':
                                                                color = 'blue';
                                                                journalEntryName = '카드';
                                                                break;
                                                            case '3':
                                                                color = 'red';
                                                                journalEntryName = '현금';
                                                                break;
                                                            default:
                                                                color = 'gray';
                                                        }
                                                        return <Tag color={color}>{journalEntryName}</Tag>;
                                                    },
                                                }
                                            ]}
                                            rowKey={(record) => record.key}
                                            pagination={false}
                                            size="small"
                                            summary={() => (
                                                vouchers.length > 0 && (
                                                    <>
                                                        <Table.Summary.Row style={{ textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                                                            <Table.Summary.Cell index={0}><div className="medium-text">합계</div></Table.Summary.Cell>
                                                            <Table.Summary.Cell index={1}></Table.Summary.Cell>
                                                            <Table.Summary.Cell index={2}></Table.Summary.Cell>
                                                            <Table.Summary.Cell index={3}></Table.Summary.Cell>
                                                            <Table.Summary.Cell index={4}><div className="medium-text">{vouchers.reduce((acc, cur) => acc + Number(cur.quantity || 0), 0).toLocaleString()}</div></Table.Summary.Cell>
                                                            <Table.Summary.Cell index={5}><div style={{ textAlign: 'right' }} className="medium-text">{vouchers.reduce((acc, cur) => acc + Number(cur.unitPrice || 0), 0).toLocaleString()}</div></Table.Summary.Cell>
                                                            <Table.Summary.Cell index={6}><div style={{ textAlign: 'right' }} className="medium-text">{vouchers.reduce((acc, cur) => acc + Number(cur.supplyAmount || 0), 0).toLocaleString()}</div></Table.Summary.Cell>
                                                            <Table.Summary.Cell index={7}><div style={{ textAlign: 'right' }} className="medium-text">{vouchers.reduce((acc, cur) => acc + Number(cur.vatAmount || 0), 0).toLocaleString()}</div></Table.Summary.Cell>
                                                            <Table.Summary.Cell index={8}></Table.Summary.Cell>
                                                            <Table.Summary.Cell index={9}></Table.Summary.Cell>
                                                        </Table.Summary.Row>
                                                    </>
                                                )
                                            )}
                                            locale={{
                                                emptyText: '데이터가 없습니다.',
                                            }}
                                        />
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                            {/* 삭제 버튼 */}
                                            <Button type="danger" onClick={handleDeleteRow} style={{ marginRight: '20px' }}>삭제</Button>
                                            <Button type="primary" onClick={handleSubmit}>매입매출 전표 등록</Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

            <Modal
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width="40vw"
            >
                {isLoading ? (
                    <Spin />  // 로딩 스피너
                ) : (
                    <>
                        {currentField === 'vatTypeCode' && (
                            <>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                    부가세 유형 선택
                                </Typography>
                                <Input
                                    placeholder="검색"
                                    prefix={<SearchOutlined />}
                                    onChange={(e) => {
                                        const value = e.target.value.toLowerCase(); // 입력값을 소문자로 변환
                                        if (!value) {
                                            setModalData(initialModalData);
                                        } else {
                                            const filtered = initialModalData.filter((item) => {
                                                return (
                                                    (item.transactionType && item.transactionType.toLowerCase().includes(value)) ||
                                                    (item.vatTypeCode && item.vatTypeCode.toLowerCase().includes(value)) ||
                                                    (item.vatTypeName && item.vatTypeName.toLowerCase().includes(value))
                                                );
                                            });
                                            setModalData(filtered);
                                        }
                                    }}
                                    style={{ marginBottom: 16 }}
                                />
                                {modalData && (
                                    <Table
                                        columns={[
                                            {
                                                title: <div className="title-text">매출/매입 구분</div>,
                                                dataIndex: 'transactionType',
                                                key: 'transactionType',
                                                align: 'center',
                                                width: '30%',
                                                render: (text) => (
                                                    <Tag color={text === 'SALES' ? 'green' : 'red'}>
                                                        {text === 'SALES' ? '매출' : '매입'}
                                                    </Tag>
                                                ),
                                            },
                                            {
                                                title: <div className="title-text">코드</div>,
                                                dataIndex: 'vatTypeCode',
                                                key: 'vatTypeCode',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">부가세명</div>,
                                                dataIndex: 'vatTypeName',
                                                key: 'vatTypeName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                        ]}
                                        dataSource={modalData}
                                        rowKey="vatTypeCode"
                                        size="small"
                                        pagination={{
                                            pageSize: 15,
                                            position: ['bottomCenter'],
                                            showSizeChanger: false,
                                            showTotal: (total) => `총 ${total}개`,
                                        }}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: () => handleModalSelect(record),
                                        })}
                                    />
                                )}
                            </>
                        )}

                        {currentField === 'clientCode' && (
                            <>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                    거래처 선택
                                </Typography>
                                <Input
                                    placeholder="검색"
                                    prefix={<SearchOutlined />}
                                    onChange={(e) => {
                                        const value = e.target.value.toLowerCase(); // 입력값을 소문자로 변환
                                        if (!value) {
                                            setModalData(initialModalData);
                                        } else {
                                            const filtered = initialModalData.filter((item) => {
                                                return (
                                                    (item.code && item.code.toLowerCase().includes(value)) ||
                                                    (item.printClientName && item.printClientName.toLowerCase().includes(value))
                                                );
                                            });
                                            setModalData(filtered);
                                        }
                                    }}
                                    style={{ marginBottom: 16 }}
                                />
                                {modalData && (
                                    <Table
                                        columns={[
                                            {
                                                title: <div className="title-text">코드</div>,
                                                dataIndex: 'code',
                                                key: 'code',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>
                                            },
                                            {
                                                title: <div className="title-text">거래처명</div>,
                                                dataIndex: 'printClientName',
                                                key: 'printClientName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>
                                            },
                                        ]}
                                        dataSource={modalData}
                                        rowKey="code"
                                        size={'small'}
                                        pagination={{
                                            pageSize: 15,
                                            position: ['bottomCenter'],
                                            showSizeChanger: false,
                                            showTotal: (total) => `총 ${total}개`,
                                        }}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: () => handleModalSelect(record), // 선택 시 처리
                                        })}
                                    />
                                )}
                            </>
                        )}

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setIsModalVisible(false)} variant="contained" type="danger" sx={{ mr: 1 }}>
                                닫기
                            </Button>
                        </Box>
                    </>
                )}
            </Modal>
        </Box>
    );
};

export default PendingSalesPurchaseVoucherInputPage;