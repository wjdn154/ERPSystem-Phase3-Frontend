import React, {useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './ClientAccountLedgerUtil.jsx';
import {Typography} from '@mui/material';
import {Space, Button, DatePicker, Form, Input, Modal, Spin, Table, Tag, Tooltip, Col, Row} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {FINANCIAL_API} from "../../../../config/apiConstants.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import dayjs from "dayjs";
import {BookOutlined, DownSquareOutlined, InfoCircleOutlined, SearchOutlined} from "@ant-design/icons";
const { RangePicker } = DatePicker;

const ClientAccountLedgerPage = () => {
    const notify = useNotificationContext();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [clientAndAccountLedgerData, setClientAndAccountLedgerData] = useState(null);
    const [clientAndAccountLedgerDetailData, setClientAndAccountLedgerDetailData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocusedAccount, setIsFocusedAccount] = useState(false);
    const [isFocusedClient, setIsFocusedClient] = useState(false);
    const [searchParams, setSearchParams] = useState({
        startDate: null,
        endDate: null,
        startAccountSubjectCode: '',
        endAccountSubjectCode: '',
        startClientCode: '',
        endClientCode: ''
    });
    const [searchDetailParams, setSearchDetailParams] = useState({
        startDate : null,
        endDate : null,
        startAccountSubjectCode : '',
        endAccountSubjectCode : '',
        clientId :  '',
    });
    const [displayValues, setDisplayValues] = useState({
        startAccountSubjectCode: '',
        endAccountSubjectCode: '',
        startClientCode: '',
        endClientCode: ''
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };


    // 입력 필드 클릭 시 모달 열기
    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setModalData(null); // 모달 열기 전에 데이터를 초기화
        setInitialModalData(null);
        fetchModalData(fieldName);  // 모달 데이터 가져오기 호출
        setIsModalVisible(true);  // 모달창 열기
    };

    // 모달 데이터 가져오기
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        const apiPath = (fieldName === 'startAccountSubjectCode' || fieldName === 'endAccountSubjectCode')
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

    // 모달에서 선택한 값 searchParams에 반영
    const handleModalSelect = (record) => {
        const formattedValue = `[${record.code}] ${record.name || record.printClientName}`;

        setSearchParams((prevParams) => ({
            ...prevParams,
            [currentField]: record.code, // 선택한 필드에 따라 값을 할당
        }));

        setSearchDetailParams((prevParams) => ({
            ...prevParams,
            [currentField]: record.code,
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

    // 검색 처리
    const handleSearch = async () => {
        console.log(searchParams);
        const { startDate, endDate, startAccountSubjectCode, endAccountSubjectCode, startClientCode, endClientCode } = searchParams;
        // 입력값 검증
        if (!startDate || !endDate || !startAccountSubjectCode || !endAccountSubjectCode || !startClientCode || !endClientCode) {
            notify('warning', '입력 오류', '모든 필드를 입력해 주세요.', 'bottomRight');
            return;
        }

        // 계정과목 코드 순서 검증
        if (Number(startAccountSubjectCode) > Number(endAccountSubjectCode)) {
            notify('warning', '입력 오류', '계정과목 시작 코드는 종료 코드보다 작아야 합니다.', 'bottomRight');
            return;
        }

        // 거래처 코드 순서 검증
        if (Number(startClientCode) > Number(endClientCode)) {
            notify('warning', '입력 오류', '거래처 시작 코드는 종료 코드보다 작아야 합니다.', 'bottomRight');
            return;
        }


        try {
            const response = await apiClient.post(FINANCIAL_API.CLIENT_AND_ACCOUNT_SUBJECT_LEDGER_API, searchParams);
            const data = response.data;
            setClientAndAccountLedgerData(data);
            notify('success', '조회 성공', '거래처별 계정과목별 조회 성공.', 'bottomRight');
        } catch (error) {
            notify('error', '조회 오류', '거래처별 계정과목별 원장 조회 중 오류가 발생했습니다.', 'top');
        }
    };

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="거래처별 계정과목별 원장"
                        description={(
                            <Typography>
                                이 페이지는 <span>거래처별로 각 계정과목에 따라 거래 내역을 관리</span>하는 기능을 제공함. <br/>
                                기업은 특정 거래처와 <span>각 계정과목에 따른 재무 내역</span>을 정확히 파악할 수 있음. 이를 통해 <span>거래처별로 세분화된 재무 상황</span>을 분석하고 필요한 조치를 취할 수 있음.
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
                    <Grid item xs={12} md={6} sx={{ minWidth: '610px' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >거래처별 계정과목별 원장 조회</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form layout="vertical">
                                        <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                                            <Col flex="1">
                                                <Form.Item
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
                                                                value={displayValues.startAccountSubjectCode}
                                                                onClick={() => handleInputClick('startAccountSubjectCode')}
                                                                className="search-input"
                                                                style={{ width: '47.5%' }}
                                                                suffix={<DownSquareOutlined />}
                                                            />
                                                        </Form.Item>
                                                        <Input
                                                            style={{ width: '5%', padding: 0, textAlign: 'center', borderLeft: 0, pointerEvents: 'none', fontSize: '0.8rem', backgroundColor: '#fff' }}
                                                            placeholder="~"
                                                            disabled
                                                        />
                                                        <Form.Item
                                                            noStyle
                                                            rules={[{ required: true, message: '끝 코드를 선택하세요' }]}
                                                        >
                                                            <Input
                                                                placeholder="끝 코드"
                                                                value={displayValues.endAccountSubjectCode}
                                                                onClick={() => handleInputClick('endAccountSubjectCode')}
                                                                onFocus={() => setIsFocusedAccount(true)}
                                                                onBlur={() => setIsFocusedAccount(false)}
                                                                className="search-input"
                                                                style={{
                                                                    width: '47.5%',
                                                                    borderLeft: isFocusedAccount ? '1px solid #4096FF' : '1px solid #fff',
                                                                }}
                                                                suffix={<DownSquareOutlined />}
                                                            />
                                                        </Form.Item>
                                                    </Space.Compact>
                                                </Form.Item>
                                            </Col>
                                            <Col flex="1">
                                                <Form.Item
                                                    label="거래처 코드 범위"
                                                    required
                                                    tooltip="검색할 거래처의 시작 코드와 끝 코드를 선택하세요"
                                                >
                                                    <Space.Compact style={{ width: '100%' }}>
                                                        <Form.Item
                                                            noStyle
                                                            rules={[{ required: true, message: '시작 코드를 선택하세요' }]}
                                                        >
                                                            <Input
                                                                placeholder="시작 코드"
                                                                value={displayValues.startClientCode}
                                                                onClick={() => handleInputClick('startClientCode')}
                                                                className="search-input"
                                                                style={{ width: '47.5%' }}
                                                                suffix={<DownSquareOutlined />}
                                                            />
                                                        </Form.Item>
                                                        <Input
                                                            style={{ width: '5%', padding: 0, textAlign: 'center', borderLeft: 0, pointerEvents: 'none', fontSize: '0.8rem', backgroundColor: '#fff' }}
                                                            placeholder="~"
                                                            disabled
                                                        />
                                                        <Form.Item
                                                            noStyle
                                                            rules={[{ required: true, message: '끝 코드를 선택하세요' }]}
                                                        >
                                                            <Input
                                                                placeholder="끝 코드"
                                                                value={displayValues.endClientCode}
                                                                onClick={() => handleInputClick('endClientCode')}
                                                                onFocus={() => setIsFocusedClient(true)}
                                                                onBlur={() => setIsFocusedClient(false)}
                                                                className="search-input"
                                                                style={{
                                                                    borderLeft: isFocusedClient ? '1px solid #4096FF' : '1px solid #fff',
                                                                    width: '47.5%',
                                                                }}
                                                                suffix={<DownSquareOutlined />}
                                                            />
                                                        </Form.Item>
                                                    </Space.Compact>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                                            <Col>
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
                                                        style={{ width: '250px' }}
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
                                </Grid>

                                <Grid sx={{ margin: '20px' }}>
                                    <Table
                                        dataSource={clientAndAccountLedgerData}
                                        columns={[
                                            {
                                                title: <div className="title-text">거래처</div>,
                                                dataIndex: 'clientCode',
                                                key: 'clientCode',
                                                align: 'center',
                                                render: (text, record) => <div className="small-text">[{text.padStart(5, '0')}] {record.clientName} </div>
                                            },
                                            {
                                                title: <div className="title-text">등록번호</div>,
                                                dataIndex: 'clientRegisterNumber',
                                                key: 'clientRegisterNumber',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>
                                            },
                                            {
                                                title: <div className="title-text">대표자명</div>,
                                                dataIndex: 'ownerName',
                                                key: 'ownerName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>
                                            }
                                        ]}
                                        rowKey="clientCode"
                                        rowSelection={{
                                            type: 'radio',
                                            selectedRowKeys,
                                            onChange: (newSelectedRowKeys) => {
                                                setSelectedRowKeys(newSelectedRowKeys);
                                            }
                                        }}
                                        pagination={{ pageSize: 10, position: ['bottomCenter'], showSizeChanger: false }}
                                        size={'small'}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: async () => {
                                                // 행 클릭 시 상태 업데이트 및 API 호출
                                                setSelectedRowKeys([record.clientCode]); // 클릭한 행의 키로 상태 업데이트

                                                try {
                                                    const updatedParams = {
                                                        ...searchDetailParams,
                                                        clientId: record.clientId,
                                                    };
                                                    // API 호출 시 updatedParams 사용
                                                    const response = await apiClient.post(FINANCIAL_API.CLIENT_AND_ACCOUNT_SUBJECT_LEDGER_DETAIL_API, { ...updatedParams });
                                                    setClientAndAccountLedgerDetailData(response.data);
                                                    console.log(response.data);
                                                    notify('success', '조회 성공', '데이터를 성공적으로 조회했습니다.', 'bottomRight');
                                                } catch (error) {
                                                    notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
                                                }
                                            }
                                        })}
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                    { clientAndAccountLedgerDetailData ? (
                        <Grid item xs={12} md={6} sx={{ minWidth: '610px' }}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{ height: '100%' }}>
                                    <Typography variant="h6" sx={{ padding: '20px' }}>거래처별 계정과목별 원장 상세 조회</Typography>
                                    <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                        <Table
                                            dataSource={clientAndAccountLedgerDetailData?.detailList}
                                            columns={[
                                                {
                                                    title: <div className="title-text">계정과목</div>,
                                                    dataIndex: 'accountSubjectCode',
                                                    key: 'accountSubjectCode',
                                                    align: 'center',
                                                    render: (text, record) => text ? <div className="small-text">[{text.padStart(5, '0')}] {record.accountSubjectName}</div> : ''
                                                },
                                                {
                                                    title: <div className="title-text">전기이월</div>,
                                                    dataIndex: 'previousTotalCash',
                                                    key: 'previousTotalCash',
                                                    align: 'center',
                                                    render: (text) => text ? <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()}</div> : <div className="small-text" style={{ textAlign: 'right' }}>0</div>
                                                },
                                                {
                                                    title: <div className="title-text">차변</div>,
                                                    dataIndex: 'totalDebitAmount',
                                                    key: 'totalDebitAmount',
                                                    align: 'center',
                                                    render: (text) => text ? <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()}</div> : <div className="small-text" style={{ textAlign: 'right' }}>0</div>
                                                },
                                                {
                                                    title: <div className="title-text">대변</div>,
                                                    dataIndex: 'totalCreditAmount',
                                                    key: 'totalCreditAmount',
                                                    align: 'center',
                                                    render: (text) => text ? <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()}</div> : <div className="small-text" style={{ textAlign: 'right' }}>0</div>
                                                },
                                                {
                                                    title: <div className="title-text">잔액</div>,
                                                    dataIndex: 'totalCashAmount',
                                                    key: 'totalCashAmount',
                                                    align: 'center',
                                                    render: (text) => text ? <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()}</div> : <div className="small-text" style={{textAlign: 'right'}}>0</div>
                                                },
                                            ]}
                                            pagination={{ pageSize: 15, position: ['bottomCenter'], showSizeChanger: false }}
                                            rowKey="accountSubjectCode"
                                            size={'small'}
                                            summary={() => (
                                                <Table.Summary.Row style={{ textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                                                    <Table.Summary.Cell index={0}><div className="medium-text">합계</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={1}><div className="medium-text" style={{ textAlign: 'right' }}>{Number(clientAndAccountLedgerDetailData?.totalSumPreviousCash).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={2}><div className="medium-text" style={{ textAlign: 'right' }}>{Number(clientAndAccountLedgerDetailData?.totalSumDebitAmount).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={3}><div className="medium-text" style={{ textAlign: 'right' }}>{Number(clientAndAccountLedgerDetailData?.totalSumCreditAmount).toLocaleString()}</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={4}><div className="medium-text" style={{ textAlign: 'right' }}>{Number(clientAndAccountLedgerDetailData?.totalSumCashAmount).toLocaleString()}</div></Table.Summary.Cell>
                                                </Table.Summary.Row>
                                            )}
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
                        {currentField === 'startAccountSubjectCode' && (
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
                                )}
                            </>
                        )}
                        {currentField === 'endAccountSubjectCode' && (
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
                                )}
                            </>
                        )}

                        {currentField === 'startClientCode' && (
                            <>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                    거래처 시작 코드 선택
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

                        {currentField === 'endClientCode' && (
                            <>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                    거래처 끝 코드 선택
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

export default ClientAccountLedgerPage;