import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {Box, Grid, Grow, Paper, Typography} from '@mui/material'
import {
    DeleteOutlined,
    PlusOutlined,
    SaveOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined, SearchOutlined, DownSquareOutlined
} from '@ant-design/icons'
import {
    Space,
    Table,
    Button,
    Input,
    Select,
    DatePicker,
    InputNumber,
    message,
    Spin,
    AutoComplete,
    Modal,
    Tag,
    Col, Row, Form, Tooltip, notification
} from 'antd'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import dayjs from "dayjs"
import WelcomeSection from "../../../../components/WelcomeSection"
import { tabItems } from "./PendingVoucherInputUtil"
import TemporarySection from "../../../../components/TemporarySection"
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import axios from "axios";
import {FINANCIAL_API} from "../../../../config/apiConstants.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import { useSelector } from 'react-redux';
import {jwtDecode} from "jwt-decode";

const { Option } = Select

const PendingVoucherInputPage = () => {
    const token = useSelector(state => state.auth.token);
    const notify = useNotificationContext();
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [searchData, setSearchData] = useState([])
    const [activeTabKey, setActiveTabKey] = useState('1')
    const [voucher, setVoucher] = useState({});
    const [vouchers, setVouchers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [displayValues, setDisplayValues] = useState({
        accountSubjectCode: '',
        clientCode: ''
    });

    const handleTabChange = (key) => {
        setActiveTabKey(key)
    }

    const handleVoucherTypeChange = (value) => {
        setVoucher((prevVoucher) => {
            let updatedVoucher = { ...prevVoucher, voucherType: value };

            // 구분이 'Credit' 또는 'Withdrawal'일 경우 차변 값 0으로 설정
            if (value === 'Debit' || value === 'Withdrawal') {
                updatedVoucher.creditAmount = null;
            }

            // 구분이 'Debit' 또는 'Deposit'일 경우 대변 값 0으로 설정
            if (value === 'Credit' || value === 'Deposit') {
                updatedVoucher.debitAmount = null;
            }

            return updatedVoucher;
        });
    };

    // 모달에서 선택한 값 searchParams에 반영
    const handleModalSelect = (record) => {
        const formattedValue = `[${record.code}] ${record.name || record.printClientName}`;

        setVoucher((prevParams) => ({
            ...prevParams,
            [currentField]: record.code, // 선택한 필드에 따라 값을 할당
        }));

        setDisplayValues((prevValues) => ({
            ...prevValues,
            [currentField]: formattedValue, // 화면에 표시될 형식으로 저장
        }));

        setIsModalVisible(false);  // 모달창 닫기
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);  // 모달창 닫기
    };

    // 모달 데이터 가져오기
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        const apiPath = (fieldName === 'accountSubjectCode')
            ? FINANCIAL_API.ACCOUNT_SUBJECTS_SEARCH_API
            : FINANCIAL_API.CLIENT_SEARCH_API;
        try {
            const searchText = null;
            const response = await apiClient.post(apiPath, { searchText });
            setModalData(response.data);
            setInitialModalData(response.data);
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


    const handleSearch = async () => {
        try {
            const response = await apiClient.post(FINANCIAL_API.UNRESOLVED_VOUCHER_SEARCH_API, {
                searchDate: formattedDate,
            });

            setSearchData(response.data); // API로 받은 데이터를 바로 상태로 설정
            console.log(response.data);
            notify('success', '조회 성공', '전표 목록 데이터 조회 성공.', 'bottomRight');

        } catch (err) {
            notify('error', '조회 오류', '데이터를 불러오는 중 오류가 발생했습니다.', 'top');
        }
    }

    const formattedDate = useMemo(() => {
        return format(selectedDate, 'yyyy-MM-dd', { locale: ko });
    }, [selectedDate]);

    const handleSubmit = async () => {
        try {
            // vouchers 배열이 비어 있으면 현재 voucher 객체를 추가
            if(!vouchers.length) throw new Error("전표를 추가해주세요.");

            const updatedVouchers = vouchers.length ? vouchers : [{
                ...voucher, // voucher 상태에서 필요한 값들 모두 가져옴
                creditAmount: voucher.creditAmount || 0,
                debitAmount: voucher.debitAmount || 0,
            }];

            const processedVouchers = updatedVouchers.map((v) => {
                // 유효성 검사
                if ((v.voucherType === 'Withdrawal' || v.voucherType === 'Deposit') && v.accountSubjectCode === '101') throw new Error("입금, 출금 전표는 현금 계정과목을 사용 할 수 없습니다.");
                if (v.debitAmount < 0 || v.creditAmount < 0) throw new Error("금액은 음수가 될 수 없습니다.");
                if (!v.voucherType || !v.accountSubjectCode || !v.clientCode) throw new Error("필수 입력값이 누락되었습니다.");
                if (v.voucherType === 'Deposit' && v.creditAmount === 0) throw new Error("전표 구분이 입금일 경우 금액을 입력해주세요.");
                if (v.voucherType === 'Withdrawal' && v.debitAmount === 0) throw new Error("전표 구분이 출금일 경우 금액을 입력해주세요.");
                if ((v.voucherType === 'Debit' || v.voucherType === 'Credit') &&
                    (v.voucherType === 'Deposit' || v.voucherType === 'Withdrawal')) {
                    throw new Error("차변/대변과 입금/출금은 동시에 사용할 수 없습니다.");
                }
                if (v.voucherType === 'Debit' || v.voucherType === 'Credit') {
                    const totalDebit = updatedVouchers.reduce((sum, item) => sum + Number(item.debitAmount || 0), 0);
                    const totalCredit = updatedVouchers.reduce((sum, item) => sum + Number(item.creditAmount || 0), 0);
                    if (totalDebit !== totalCredit) throw new Error("차변과 대변의 합계가 일치하지 않습니다.");
                }

                // formattedAccountSubjectCode와 formattedClientCode에서 숫자만 추출하고 반환
                const { formattedAccountSubjectCode, formattedClientCode, ...rest } = v;

                const accountSubjectCode = formattedAccountSubjectCode ? formattedAccountSubjectCode.match(/\d+/)[0] : rest.accountSubjectCode;
                const clientCode = formattedClientCode ? formattedClientCode.match(/\d+/)[0] : rest.clientCode;

                return {
                    ...rest, // 나머지 필드 유지 (formattedAccountSubjectCode와 formattedClientCode는 포함되지 않음)
                    voucherDate: format(selectedDate, 'yyyy-MM-dd'),
                    voucherKind: "General",
                    voucherManagerId: jwtDecode(token).employeeId,
                    debitAmount: v.debitAmount ? v.debitAmount : 0,
                    creditAmount: v.creditAmount ? v.creditAmount : 0,
                    accountSubjectCode, // 숫자로 변환된 accountSubjectCode
                    clientCode, // 숫자로 변환된 clientCode
                    transactionDescription: v.transactionDescription,
                    voucherType: v.voucherType,
                };
            });

            console.log(processedVouchers);

            // 데이터 저장
            await apiClient.post(FINANCIAL_API.SAVE_UNRESOLVED_VOUCHER_API, processedVouchers); // API 호출
            handleSearch(); // 저장 후 조회
            notify('success', '저장 완료', '전표가 성공적으로 저장되었습니다.', 'bottomRight');
            setVoucher({}); // 저장 후 입력폼 초기화
            setDisplayValues({ accountSubjectCode: '', clientCode: '' });
            setVouchers([]); // 저장 후 배열 초기화

        } catch (err) {
            notify('error', '저장 실패', err.message || '전표 저장 중 오류가 발생했습니다.', 'bottomRight');
        }
    };

    const handleAddRow = () => {
        if ((!voucher.debitAmount && !voucher.creditAmount) || isNaN(voucher.debitAmount) || isNaN(voucher.creditAmount)) {
            notify('warning', '입력 오류', '금액을 입력하세요.', 'bottomRight');
            return;
        }

        if (voucher.voucherType === 'Deposit' || voucher.voucherType === 'Withdrawal') {
            if (vouchers.length > 0) {
                notify('warning', '입력 오류', '입금 또는 출금일 경우 한 행만 추가할 수 있습니다.', 'bottomRight');
                return;
            }
        }

        const hasDepositOrWithdrawal = vouchers.some(v => v.voucherType === 'Deposit' || v.voucherType === 'Withdrawal');
        if (hasDepositOrWithdrawal) {
            notify('warning', '입력 오류', '입금 또는 출금일 경우 한 행만 추가할 수 있습니다.', 'bottomRight');
            return;
        }

        if (!voucher.voucherType || !voucher.accountSubjectCode || !voucher.clientCode) {
            notify('warning', '입력 오류', '모든 필수 필드를 입력해주세요.', 'bottomRight');
            return;
        }

        const newVoucher = {
            ...voucher,
            key: Date.now(),
            formattedAccountSubjectCode: displayValues.accountSubjectCode, // 포맷된 값 추가
            formattedClientCode: displayValues.clientCode, // 포맷된 값 추가
        };

        setVouchers([...vouchers, newVoucher]);
        setVoucher({}); // 입력폼 초기화
        setDisplayValues({ accountSubjectCode: '', clientCode: '' });
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
            accountSubjectCode: lastVoucher.formattedAccountSubjectCode,
            clientCode: lastVoucher.formattedClientCode
        });
    };

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="일반전표입력"
                        description={(
                            <Typography>
                                일반전표 입력 페이지는 <span>아직 승인되지 않은 전표</span>를 등록하고 관리하는 기능을 제공합니다.<br/>
                                이 페이지에서는 <span>거래 내역, 적요, 금액, 계정과목</span> 등을 입력하여 <span>미결 상태의 전표를 작성</span>할 수 있으며, 전표 승인 전까지 <span>검토</span>가 가능합니다.<br/>
                                이를 통해 <span>전표 처리 과정</span>을 효율적으로 관리하고 추적할 수 있습니다.
                            </Typography>
                        )}
                        tabItems={tabItems()}
                        activeTabKey={activeTabKey}
                        handleTabChange={handleTabChange}
                    />
                </Grid>
            </Grid>

            {activeTabKey === '1' && (
                <Grid sx={{ padding: '0px 20px 0px 20px', minWidth: '1400px !important', maxWidth: '1700px' }} container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >일반전표 목록</Typography>
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
                                            dataSource={searchData?.voucherDtoList}
                                            columns={[
                                                {
                                                    title: <div className="title-text">날짜</div>,
                                                    dataIndex: 'voucherDate',
                                                    key: 'voucherDate',
                                                    align: 'center',
                                                    render: (text, record) => <span className="small-text">{text || formattedDate}</span>
                                                },
                                                {
                                                    title: <div className="title-text">전표번호</div>,
                                                    dataIndex: 'voucherNumber',
                                                    key: 'voucherNumber',
                                                    align: 'center',
                                                    render: (text, record) => record.total ? null : <span className="small-text">{text}</span>
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
                                                    dataIndex: 'accountSubjectCode',
                                                    key: 'accountSubjectCode',
                                                    align: 'center',
                                                    render: (text, record) => <span className="small-text">[{text.padStart(5, '0')}] {record.accountSubjectName}</span>
                                                },
                                                {
                                                    title: <div className="title-text">거래처</div>,
                                                    dataIndex: 'clientCode',
                                                    key: 'clientCode',
                                                    align: 'center',
                                                    render: (text, record) => <span className="small-text">[{text.padStart(5, '0')}] {record.clientName}</span>
                                                },
                                                {
                                                    title: <div className="title-text">적요</div>,
                                                    dataIndex: 'transactionDescription',
                                                    key: 'transactionDescription',
                                                    align: 'center',
                                                    render: (text) => <span className="small-text">{text}</span>
                                                },
                                                {
                                                    title: <div className="title-text" style={{ textAlign: 'center' }}>차변</div>,
                                                    dataIndex: 'debitAmount',
                                                    key: 'debitAmount',
                                                    align: 'right',
                                                    render: (text) => <span className="small-text">{text.toLocaleString()}</span>
                                                },
                                                {
                                                    title: <div className="title-text" style={{ textAlign: 'center' }}>대변</div>,
                                                    dataIndex: 'creditAmount',
                                                    key: 'creditAmount',
                                                    align: 'right',
                                                    render: (text) => <span className="small-text">{text.toLocaleString()}</span>
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
                                            rowKey={(record) => record.id}
                                            pagination={false}
                                            size="small"
                                            scroll={{ x: 'max-content' }}
                                            summary={() =>  (
                                                searchData?.voucherDtoList && searchData.voucherDtoList.length > 0 ? (
                                                <Table.Summary.Row style={{ textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                                                    <Table.Summary.Cell index={0} ><div className="medium-text">합계</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={1} />
                                                    <Table.Summary.Cell index={2} />
                                                    <Table.Summary.Cell index={3} />
                                                    <Table.Summary.Cell index={4} />
                                                    <Table.Summary.Cell index={5} />
                                                    <Table.Summary.Cell index={6}><div style={{ textAlign: 'right' }} className="medium-text">{Number(searchData.totalDebit).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={7}><div style={{ textAlign: 'right' }} className="medium-text">{Number(searchData.totalCredit).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={8} />
                                                    <Table.Summary.Cell index={9} />
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
                                <Typography variant="h6" sx={{ padding: '20px' }}>일반전표 입력</Typography>
                                <Grid sx={{ padding: '0px 20px 20px 20px' }}>
                                    <Grid sx={{ marginTop: '20px', marginBottom: '20px' }}>
                                        <Form layout="vertical">
                                            <Row gutter={8} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                {/* 구분 입력 */}
                                                <Col span={3}>
                                                    <Form.Item
                                                        label="구분"
                                                        tooltip="등록할 전표의 구분(입금, 출금, 차변, 대변)을 선택하세요"
                                                        required
                                                    >
                                                        <Select
                                                            placeholder="구분"
                                                            style={{ width: '100%' }}
                                                            value={voucher.voucherType}
                                                            onChange={handleVoucherTypeChange}
                                                        >
                                                            <Option value="Deposit">입금</Option>
                                                            <Option value="Withdrawal">출금</Option>
                                                            <Option value="Debit">차변</Option>
                                                            <Option value="Credit">대변</Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>

                                                {/* 계정과목 입력 */}
                                                <Col span={3}>
                                                    <Form.Item
                                                        label="계정과목"
                                                        tooltip="등록할 전표의 계정과목를 선택하세요"
                                                        required
                                                    >
                                                        <Input
                                                            name="accountCode"
                                                            placeholder="계정과목"
                                                            value={displayValues.accountSubjectCode}
                                                            onClick={() => handleInputClick('accountSubjectCode')}
                                                            style={{ caretColor: 'transparent' }}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                {/* 거래처명 입력 */}
                                                <Col span={3}>
                                                    <Form.Item
                                                        label="거래처명"
                                                        tooltip="등록할 전표의 거래처명을 선택하세요"
                                                        required
                                                    >
                                                        <Input
                                                            name="clientCode"
                                                            placeholder="거래처"
                                                            value={displayValues.clientCode}
                                                            onClick={() => handleInputClick('clientCode')}
                                                            style={{ cursor: 'pointer', caretColor: 'transparent' }}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                {/* 적요 입력 */}
                                                <Col span={4}>
                                                    <Form.Item
                                                        label="적요"
                                                        tooltip="등록할 전표의 거래 적요를 입력하세요"
                                                    >
                                                        <Input
                                                            placeholder="적요"
                                                            value={voucher.transactionDescription}
                                                            onChange={(e) => setVoucher({ ...voucher, transactionDescription: e.target.value })}
                                                            style={{ width: '100%' }}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                {/* 차변 금액 입력 */}
                                                <Col span={3}>
                                                    <Form.Item
                                                        label="차변 금액"
                                                        tooltip="차변 금액을 입력하세요"
                                                        required
                                                    >
                                                        <InputNumber
                                                            style={{ width: '100%' }}
                                                            placeholder="차변"
                                                            value={voucher.debitAmount}
                                                            onChange={(value) => {
                                                                const formattedValue = value?.toString().replace(/[^0-9]/g, '');  // 숫자만 허용
                                                                setVoucher({ ...voucher, debitAmount: formattedValue });
                                                            }}
                                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}  // 3자리마다 콤마 추가
                                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}  // 콤마 제거
                                                            disabled={voucher.voucherType === 'Credit' || voucher.voucherType === 'Deposit'}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                {/* 대변 금액 입력 */}
                                                <Col span={3}>
                                                    <Form.Item
                                                        label="대변 금액"
                                                        tooltip="대변 금액을 입력하세요"
                                                        required
                                                    >
                                                        <InputNumber
                                                            style={{ width: '100%' }}
                                                            placeholder="대변"
                                                            value={voucher.creditAmount}
                                                            onChange={(value) => {
                                                                const formattedValue = value?.toString().replace(/[^0-9]/g, '');  // 숫자만 허용
                                                                setVoucher({ ...voucher, creditAmount: formattedValue });
                                                            }}
                                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}  // 3자리마다 콤마 추가
                                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}  // 콤마 제거
                                                            disabled={voucher.voucherType === 'Debit' || voucher.voucherType === 'Withdrawal'}
                                                        />
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
                                                width: "10%",
                                                align: "center",
                                                render: () => <div className="small-text">{formattedDate}</div>,
                                            },
                                            {
                                                title: <div className="title-text">구분</div>,
                                                dataIndex: "voucherType",
                                                key: "voucherType",
                                                width: "10%",
                                                align: "center",
                                                render: (text) => {
                                                    let color;
                                                    let value;
                                                    switch (text) {
                                                        case 'Deposit':
                                                            color = 'green';
                                                            value = '입금';
                                                            break;
                                                        case 'Withdrawal':
                                                            color = 'red';
                                                            value = '출금';
                                                            break;
                                                        case 'Debit':
                                                            color = 'green';
                                                            value = '차변';
                                                            break;
                                                        case 'Credit':
                                                            color = 'red';
                                                            value = '대변';
                                                            break;
                                                        default:
                                                            color = 'gray';
                                                            value = text;
                                                    }
                                                    return <Tag color={color}>{value}</Tag>;
                                                }
                                            },
                                            {
                                                title: <div className="title-text">계정과목</div>,
                                                dataIndex: "formattedAccountSubjectCode", // 포맷된 값을 사용
                                                key: "formattedAccountSubjectCode",
                                                width: "15%",
                                                align: "center",
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">거래처</div>,
                                                dataIndex: "formattedClientCode", // 포맷된 값을 사용
                                                key: "formattedClientCode",
                                                width: "15%",
                                                align: "center",
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">적요</div>,
                                                dataIndex: "transactionDescription",
                                                key: "transactionDescription",
                                                width: "20%",
                                                align: "center",
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">차변</div>,
                                                dataIndex: "debitAmount",
                                                key: "debitAmount",
                                                width: "10%",
                                                align: "center",
                                                render: (text) => <div style={{ textAlign: 'right' }} className="small-text">{Number(text).toLocaleString()}</div>,
                                            },
                                            {
                                                title: <div className="title-text">대변</div>,
                                                dataIndex: "creditAmount",
                                                key: "creditAmount",
                                                width: "10%",
                                                align: "center",
                                                render: (text) => <div style={{ textAlign: 'right' }} className="small-text">{Number(text).toLocaleString()}</div>,
                                            }
                                        ]}
                                        rowKey={(record) => record.key}
                                        pagination={false}
                                        size="small"
                                        summary={() => (
                                            vouchers.length > 0 &&
                                            <>
                                                <Table.Summary.Row style={{ textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                                                    <Table.Summary.Cell index={0}><div className="medium-text">합계</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={2}></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={3}></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={4}></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={5}> <div style={{ textAlign: 'right' }} className="medium-text"> {vouchers.length > 0 ? vouchers.reduce((acc, cur) => acc + Number(cur?.debitAmount || 0), 0).toLocaleString() : '0'} </div> </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={6}> <div style={{ textAlign: 'right' }} className="medium-text"> {vouchers.length > 0 ? vouchers.reduce((acc, cur) => acc + Number(cur?.creditAmount || 0), 0).toLocaleString() : '0'} </div> </Table.Summary.Cell>
                                                </Table.Summary.Row>
                                                <Table.Summary.Row style={{ textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                                                    <Table.Summary.Cell index={0}><div className="medium-text">대차차액</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={2}></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={3}></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={4}></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={5}> <div style={{ textAlign: 'right' }} className="medium-text"> {(vouchers.reduce((acc, cur) => acc + (Number(cur?.debitAmount) || 0), 0) - vouchers.reduce((acc, cur) => acc + (Number(cur?.creditAmount) || 0), 0)).toLocaleString()} </div> </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={6}> <div style={{ textAlign: 'right' }} className="medium-text"> {(vouchers.reduce((acc, cur) => acc + (Number(cur?.creditAmount) || 0), 0) - vouchers.reduce((acc, cur) => acc + (Number(cur?.debitAmount) || 0), 0)).toLocaleString()} </div> </Table.Summary.Cell>
                                                </Table.Summary.Row>
                                            </>
                                        )}
                                        locale={{
                                            emptyText: '데이터가 없습니다.',
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                        {/* 삭제 버튼 */}
                                        <Button type="danger" onClick={handleDeleteRow} style={{ marginRight: '20px' }}>삭제</Button>
                                        <Button type="primary" onClick={handleSubmit}>미결전표 등록</Button>
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
                onCancel={handleModalCancel}
                footer={null}
                width="40vw"
            >
                {isLoading ? (
                    <Spin />  // 로딩 스피너
                ) : (
                    <>
                        {currentField === 'accountSubjectCode' && (
                            <>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                    계정과목 선택
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
                                                    (item.name && item.name.toLowerCase().includes(value))
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
                                                render: (text) => <span className="small-text">{text}</span>
                                            },
                                            {
                                                title: <div className="title-text">이름</div>,
                                                dataIndex: 'name',
                                                key: 'name',
                                                align: 'center',
                                                render: (text) => <span className="small-text">{text}</span>
                                            },
                                        ]}
                                        dataSource={modalData}
                                        rowKey="id"
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
                                                render: (text) => <span className="small-text">{text}</span>
                                            },
                                            {
                                                title: <div className="title-text">거래처명</div>,
                                                dataIndex: 'printClientName',
                                                key: 'printClientName',
                                                align: 'center',
                                                render: (text) => <span className="small-text">{text}</span>
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
                            <Button onClick={handleModalCancel} variant="contained" type="danger" sx={{ mr: 1 }}>
                                닫기
                            </Button>
                        </Box>
                    </>
                )}
            </Modal>
        </Box>
    )
}

export default PendingVoucherInputPage