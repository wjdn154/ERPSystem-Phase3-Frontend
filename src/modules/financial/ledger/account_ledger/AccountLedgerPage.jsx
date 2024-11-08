import React, {useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './AccountLedgerUtil.jsx';
import {Typography} from '@mui/material';
import {Table, Button, DatePicker, Input, Modal, Spin, Tag, Form, Space} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import dayjs from "dayjs";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {FINANCIAL_API} from "../../../../config/apiConstants.jsx";
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";
const { RangePicker } = DatePicker;


const AccountLedgerPage = () => {
    const notify = useNotificationContext();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [searchData, setSearchData] = useState(null);
    const [searchDetailData, setSearchDetailData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [initialModalData, setInitialModalData] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [isFocusedAccount, setIsFocusedAccount] = useState(null);
    const [searchParams, setSearchParams] = useState({
        startDate: null,
        endDate: null,
        startAccountCode: '',
        endAccountCode: '',
    });
    const [searchDetailParams, setSearchDetailParams] = useState({
        startDate : null,
        endDate : null,
        accountId :  '',
    });
    const [displayValues, setDisplayValues] = useState({
        startAccountCode: '',
        endAccountCode: '',
        startClientCode: '',
        endClientCode: ''
    });

    // 입력 필드 클릭 시 모달 열기
    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setModalData(null); // 모달 열기 전에 데이터를 초기화
        setInitialModalData(null); // 모달 열기 전에 데이터를 초기화
        fetchModalData();  // 모달 데이터 가져오기 호출
        setIsModalVisible(true);  // 모달창 열기
    };

    // 날짜 선택 처리
    const handleDateChange = (dates) => {
        if (dates) {
            setSearchParams({
                ...searchParams,
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD'),
            });
            setSearchDetailParams({
                ...searchDetailParams,
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD'),
            });
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);  // 모달창 닫기
    };

    // 모달에서 선택한 값 searchParams에 반영
    const handleModalSelect = (record) => {
        const formattedValue = `[${record.code}] ${record.name}`;

        setSearchParams((prevParams) => ({
            ...prevParams,
            [currentField]: record.code, // 선택한 필드에 따라 값을 할당
        }));

        setDisplayValues((prevValues) => ({
            ...prevValues,
            [currentField]: formattedValue, // 화면에 표시될 형식으로 저장
        }));

        setIsModalVisible(false);  // 모달창 닫기
    };

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    const handleSearch = async () => {
        const { startDate, endDate, startAccountCode, endAccountCode } = searchParams;
        // 입력값 검증
        if (!startDate || !endDate || !startAccountCode || !endAccountCode) {
            notify('warning', '입력 오류', '모든 필드를 입력해 주세요.', 'bottomRight');
            return;
        }

        // 계정과목 코드 순서 검증
        if (Number(startAccountCode) > Number(endAccountCode)) {
            notify('warning', '입력 오류', '계정과목 시작 코드는 종료 코드보다 작아야 합니다.', 'bottomRight');
            return;
        }

        try {
            const response = await apiClient.post(FINANCIAL_API.ACCOUNT_SUBJECT_LEDGER_API, searchParams);
            const data = response.data;
            setSearchData(data);
        } catch (error) {
            notify('error', '조회 오류', '계정별 원장 조회 중 오류가 발생했습니다.', 'top');
        }
    };

    // 모달 데이터 가져오기
    const fetchModalData = async () => {
        setIsLoading(true);

        try {
            const searchText = null;
            const response = await apiClient.post(FINANCIAL_API.ACCOUNT_SUBJECTS_SEARCH_API, { searchText });
            setModalData(response.data);
            setInitialModalData(response.data);
        } catch (error) {
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="계정별 원장"
                        description={(
                            <Typography>
                                계정별 원장 페이지는 <span>각 계정과목에 따른 거래 내역을 기록하고 조회</span>하는 기능을 제공함.<br/>
                                이를 통해 기업은 각 계정과목의 <span>세부 거래 내역과 잔액</span>을 정확하게 파악할 수 있음. 이 페이지는 <span>총계정원장과 연계</span>되어 상세한 재무 관리를 도와줌.
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
                    <Grid item xs={12} md={2} sx={{ minWidth: '400px' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >계정별 원장 조회</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form layout="vertical">
                                        <Form.Item
                                            name="accountCodeRange"
                                            label="계정과목 코드 범위"
                                            required
                                            tooltip="검색할 계정과목의 시작 코드와 끝 코드를 선택하세요"
                                        >
                                            <Space.Compact style={{ width: '100%' }}>
                                                <Form.Item
                                                    noStyle
                                                    rules={[{ required: true, message: '시작 코드를 선택하세요' }]}
                                                >
                                                    <Input
                                                        placeholder="시작 코드"
                                                        value={displayValues.startAccountCode}
                                                        onClick={() => handleInputClick('startAccountCode')}
                                                        className="search-input"
                                                        style={{ width: '45%' }}
                                                        suffix={<DownSquareOutlined />}
                                                    />
                                                </Form.Item>
                                                <Input
                                                    style={{ width: '10%', textAlign: 'center', borderLeft: 0, pointerEvents: 'none', fontSize: '0.8rem', backgroundColor: '#fff' }}
                                                    placeholder="~"
                                                    disabled
                                                />
                                                <Form.Item
                                                    noStyle
                                                    rules={[{ required: true, message: '끝 코드를 선택하세요' }]}
                                                >
                                                    <Input
                                                        placeholder="끝 코드"
                                                        value={displayValues.endAccountCode}
                                                        onClick={() => handleInputClick('endAccountCode')}
                                                        onFocus={() => setIsFocusedAccount(true)}
                                                        onBlur={() => setIsFocusedAccount(false)}
                                                        className="search-input"
                                                        style={{
                                                            width: '45%',
                                                            borderLeft: isFocusedAccount ? '1px solid #4096FF' : '1px solid #fff',
                                                        }}
                                                        suffix={<DownSquareOutlined />}
                                                    />
                                                </Form.Item>
                                            </Space.Compact>
                                        </Form.Item>
                                        <Form.Item
                                            label="조회 기간"
                                            required
                                            tooltip="검색할 기간의 시작일과 종료일을 선택하세요"
                                        >
                                            <RangePicker
                                                disabledDate={(current) => current && current.year() !== 2024}
                                                onChange={handleDateChange}
                                                defaultValue={[
                                                    searchParams.startDate ? dayjs(searchParams.startDate, 'YYYY-MM-DD') : null,
                                                    searchParams.endDate ? dayjs(searchParams.endDate, 'YYYY-MM-DD') : null,
                                                ]}
                                                format="YYYY-MM-DD"
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>

                                        <Form.Item>
                                            <Button type="primary" onClick={handleSearch}  icon={<SearchOutlined />} block>
                                                검색
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Grid>

                                <Grid sx={{ margin: '20px' }}>
                                    <Table
                                        dataSource={searchData}
                                        columns={[
                                            {
                                                title: <div className="title-text">계정과목</div>,
                                                dataIndex: 'accountCode',
                                                key: 'accountId',
                                                align: 'center',
                                                render: (text, record) => <div className="small-text">[{text.padStart(5, '0')}] {record.accountName}</div>,
                                            },
                                        ]}
                                        rowKey="accountId"
                                        rowSelection={{
                                            type: 'radio',
                                            selectedRowKeys,
                                            onChange: (newSelectedRowKeys) => {
                                                setSelectedRowKeys(newSelectedRowKeys);
                                            },
                                        }}
                                        pagination={{ pageSize: 10, position: ['bottomCenter'], showSizeChanger: false }}
                                        size={'small'}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: async () => {
                                                setSelectedRowKeys([record.accountId]); // 클릭한 행의 키로 상태 업데이트

                                                try {
                                                    const updatedParams = {
                                                        ...searchDetailParams,
                                                        accountId: record.accountId,
                                                    };
                                                    // API 호출 시 updatedParams 사용
                                                    const response = await apiClient.post(FINANCIAL_API.ACCOUNT_SUBJECT_LEDGER_DETAIL_API, { ...updatedParams });
                                                    setSearchDetailData(response.data);
                                                    notify('success', '조회 성공', '데이터를 성공적으로 조회했습니다.', 'bottomRight');
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
                    { searchDetailData ? (
                        <Grid item xs={12} md={9} sx={{ minWidth: '1100px' }}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{ height: '100%' }}>
                                    <Typography variant="h6" sx={{ padding: '20px' }}>계정별 원장 상세 조회</Typography>
                                    <Grid sx={{ padding: '0px 20px 20px 20px' }}>
                                        <Table
                                            dataSource={[
                                                {
                                                    voucherDate: '',
                                                    transactionDescription: '[전기이월]',
                                                    clientCode: '',
                                                    clientName: '',
                                                    debitAmount: searchDetailData.previousTotalDebitAmount,
                                                    creditAmount: searchDetailData.previousTotalCreditAmount,
                                                    cashAmount: searchDetailData.previousTotalCashAmount,
                                                    voucherNumber: '',
                                                    voucherRegistrationTime: '',
                                                    departmentName: '',
                                                    voucherManagerName: '',
                                                    isSummary: true,
                                                    key: 'previous-summary'
                                                },
                                                ...searchDetailData.cashJournalShowAllDTOList.flatMap((entry, index) => [
                                                    ...entry.accountLedgerShows.map(show => ({
                                                        ...show,
                                                        key: `ledger-${show.voucherId}`,
                                                    })),
                                                    {
                                                        voucherDate: '',
                                                        transactionDescription: '[월 계]',
                                                        clientCode: '',
                                                        clientName: '',
                                                        debitAmount: entry.monthlyTotalDebitAmount,
                                                        creditAmount: entry.monthlyTotalCreditAmount,
                                                        cashAmount: '',  // 월계는 잔액 표시 없음
                                                        voucherNumber: '',
                                                        voucherRegistrationTime: '',
                                                        departmentName: '',
                                                        voucherManagerName: '',
                                                        isSummary: true,
                                                        key: `monthly-summary-${index}`,
                                                    },
                                                    {
                                                        voucherDate: '',
                                                        transactionDescription: '[누 계]',
                                                        clientCode: '',
                                                        clientName: '',
                                                        debitAmount: entry.cumulativeTotalDebitAmount,
                                                        creditAmount: entry.cumulativeTotalCreditAmount,
                                                        cashAmount: entry.cumulativeTotalCashAmount,
                                                        voucherNumber: '',
                                                        voucherRegistrationTime: '',
                                                        departmentName: '',
                                                        voucherManagerName: '',
                                                        isSummary: true,
                                                        key: `cumulative-summary-${index}`,
                                                    }
                                                ])
                                            ]}
                                            columns={[
                                                {
                                                    title: <div className="title-text">일자</div>,
                                                    dataIndex: 'voucherDate',
                                                    key: 'voucherDate',
                                                    align: 'center',
                                                    render: (text) => text ? <div className="small-text">{new Date(text).toLocaleDateString()}</div> : ''
                                                },
                                                {
                                                    title: <div className="title-text">적요</div>,
                                                    dataIndex: 'transactionDescription',
                                                    key: 'transactionDescription',
                                                    align: 'center',
                                                    render: (text, record) => record.isSummary ?
                                                        <div className="medium-text">{text}</div> :
                                                        <div className="small-text">{text}</div>
                                                },
                                                {
                                                    title: <div className="title-text">거래처</div>,
                                                    dataIndex: 'clientCode',
                                                    key: 'clientCode',
                                                    align: 'center',
                                                    render: (text, record) => text ? <div className="small-text">[{text.padStart(5, '0')}] {record.clientName}</div> : ''
                                                },
                                                {
                                                    title: <div className="title-text">차변</div>,
                                                    dataIndex: 'debitAmount',
                                                    key: 'debitAmount',
                                                    align: 'center',
                                                    render: (text, record) => record.isSummary ?
                                                        <div className="medium-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()}</div> :
                                                        <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()}</div>
                                                },
                                                {
                                                    title: <div className="title-text">대변</div>,
                                                    dataIndex: 'creditAmount',
                                                    key: 'creditAmount',
                                                    align: 'center',
                                                    render: (text, record) => record.isSummary ?
                                                        <div className="medium-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()}</div> :
                                                        <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()}</div>
                                                },
                                                {
                                                    title: <div className="title-text">잔액</div>,
                                                    dataIndex: 'cashAmount',
                                                    key: 'cashAmount',
                                                    align: 'center',
                                                    render: (text, record) => record.isSummary ?
                                                        <div className="medium-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()}</div> :
                                                        <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()}</div>
                                                },
                                                {
                                                    title: <div className="title-text">전표번호</div>,
                                                    dataIndex: 'voucherNumber',
                                                    key: 'voucherNumber',
                                                    align: 'center',
                                                    render: (text) => <div className="small-text">{text}</div>
                                                },
                                                {
                                                    title: <div className="title-text">등록일시</div>,
                                                    dataIndex: 'voucherRegistrationTime',
                                                    key: 'voucherRegistrationTime',
                                                    align: 'center',
                                                    render: (text) => text ? <div className="small-text">{new Date(text).toLocaleString()}</div> : ''
                                                },
                                                {
                                                    title: <div className="title-text">부서명</div>,
                                                    dataIndex: 'departmentName',
                                                    key: 'departmentName',
                                                    align: 'center',
                                                    render: (text, record) => {
                                                        if (text) {
                                                            let color;
                                                            let value = text; // 기본적으로 text 값 사용

                                                            switch (text) {
                                                                case '재무부':
                                                                    color = 'red';
                                                                    value = '재무';
                                                                    break;
                                                                case '인사부':
                                                                    color = 'green';
                                                                    value = '인사';
                                                                    break;
                                                                case '생산부':
                                                                    color = 'blue';
                                                                    value = '생산';
                                                                    break;
                                                                case '물류부':
                                                                    color = 'orange';
                                                                    value = '물류';
                                                                    break;
                                                                default:
                                                                    color = 'gray'; // 기본 색상
                                                            }

                                                            return <Tag style={{ marginLeft: '5px' }} color={color}>{value}</Tag>;
                                                        }
                                                        return '';
                                                    }
                                                },
                                                {
                                                    title: <div className="title-text">담당자</div>,
                                                    dataIndex: 'voucherManagerCode',
                                                    key: 'voucherManagerCode',
                                                    align: 'center',
                                                    render: (text, record) => text ? <div className="small-text">[{text}] {record.voucherManagerName}</div> : ''
                                                }
                                            ]}
                                            pagination={ false }
                                            size={'small'}
                                            rowClassName={(record) => {
                                                if (record.isSummary) return 'summary-row';
                                                return '';
                                            }}
                                        />
                                    </Grid>
                                </Paper>
                            </Grow>
                        </Grid>
                    ) : (<></>)}
                </Grid>
            )}

            {/* 모달창 */}
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
                        {currentField === 'startAccountCode' && (
                            <>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                    계정과목 시작 코드 선택
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
                                            title: <div className="title-text">이름</div>,
                                            dataIndex: 'name',
                                            key: 'name',
                                            align: 'center',
                                            render: (text) => <div className="small-text">{text}</div>
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
                            </>
                        )}
                        {currentField === 'endAccountCode' && (
                            <>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                    계정과목 끝 코드 선택
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
                                <Table
                                    columns={[
                                        {
                                            title: <div className="title-text">코드</div>,
                                            dataIndex: 'code',
                                            key: 'code',
                                            align: 'center'
                                        },
                                        {
                                            title: <div className="title-text">이름</div>,
                                            dataIndex: 'name',
                                            key: 'name',
                                            align: 'center'
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
    );
};

export default AccountLedgerPage;