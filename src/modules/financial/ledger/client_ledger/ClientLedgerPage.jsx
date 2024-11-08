import React, { useState } from 'react';
import { Box, Grid, Grow, Paper, Typography } from '@mui/material';
import {Spin, Table, Button, DatePicker, Input, Modal, Tag, Row, Form, Space, Col} from 'antd';
import dayjs from 'dayjs';
import apiClient from "../../../../config/apiClient.jsx";
import { FINANCIAL_API } from "../../../../config/apiConstants.jsx";
import { useNotificationContext } from "../../../../config/NotificationContext.jsx";
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './ClientLedgerUtil.jsx';
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";
const { RangePicker } = DatePicker;

const ClientLedgerPage = () => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [ledgerData, setLedgerData] = useState(null);
    const [totals, setTotals] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocusedClient, setIsFocusedClient] = useState(false);
    const [searchParams, setSearchParams] = useState({
        startDate: null,
        endDate: null,
        accountCode: '',
        clientStartCode: '',
        clientEndCode: ''
    });
    const [displayValues, setDisplayValues] = useState({
        accountCode: '',
        clientStartCode: '',
        clientEndCode: ''
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);

    // 탭 변경 처리
    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    // 입력 필드 클릭 시 모달 열기
    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setModalData(null);  // 모달 데이터 초기화
        setInitialModalData(null); // 모달 열기 전에 데이터를 초기화
        fetchModalData(fieldName);  // 모달 데이터 가져오기 호출
        setIsModalVisible(true);  // 모달창 열기
    };

    // 모달 데이터 가져오기
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        const apiPath = fieldName === 'accountCode' ? FINANCIAL_API.ACCOUNT_SUBJECTS_SEARCH_API : FINANCIAL_API.CLIENT_SEARCH_API;
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
        }
    };

    // 검색 처리
    const handleSearch = async () => {
        const { startDate, endDate, accountCode, clientStartCode, clientEndCode } = searchParams;

        // 입력값 검증
        if (!startDate || !endDate || !accountCode || !clientStartCode || !clientEndCode) {
            notify('warning', '입력 오류', '모든 필드를 입력해 주세요.', 'bottomRight');
            return;
        }

        // 거래처 코드 순서 검증
        if (Number(clientStartCode) > Number(clientEndCode)) {
            notify('warning', '입력 오류', '거래처 시작 코드는 종료 코드보다 작아야 합니다.', 'bottomRight');
            return;
        }


        try {
            const response = await apiClient.post(FINANCIAL_API.CLIENT_LEDGER_API, searchParams);
            const data = response.data;
            setLedgerData(data.clientLedgerShowAllDTO);
            setTotals({
                totalSumPreviousCash: data.totalSumPreviousCash,
                totalSumDebitAmount: data.totalSumDebitAmount,
                totalSumCreditAmount: data.totalSumCreditAmount,
                totalSumTotalCashAmount: data.totalSumTotalCashAmount
            });
            notify('success', '조회 성공', '거래처 원장 조회 성공.', 'bottomRight');
        } catch (error) {
            notify('error', '조회 오류', '거래처 원장 조회 중 오류가 발생했습니다.', 'top');
        }
    };

    const ClientLedgerColumns = [
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
        },
        {
            title: <div className="title-text">전기이월</div>,
            dataIndex: 'previousCash',
            key: 'previousCash',
            align: 'center',
            render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()}</div>
        },
        {
            title: <div className="title-text">차변</div>,
            dataIndex: 'debitTotalAmount',
            key: 'debitTotalAmount',
            align: 'center',
            render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()}</div>
        },
        {
            title: <div className="title-text">대변</div>,
            dataIndex: 'creditTotalAmount',
            key: 'creditTotalAmount',
            align: 'center',
            render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()}</div>
        },
        {
            title: <div className="title-text">잔액</div>,
            dataIndex: 'cashTotalAmount',
            key: 'cashTotalAmount',
            align: 'center',
            render: (text) => <div className="small-text" style={{ textAlign: 'right' }}>{Number(text).toLocaleString()}</div>
        },
        {
            title: <div className="title-text">담당 부서명</div>,
            dataIndex: 'managerDepartment',
            key: 'managerDepartment',
            align: 'center',
            render: (text, record) => {
                let color;
                let value;
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
                return <Tag style={{marginLeft: '5px'}} color={color}>{value}</Tag>;
            }
        },
        {
            title: <div className="title-text">담당자</div>,
            dataIndex: 'managerCode',
            key: 'managerCode',
            align: 'center',
            render: (text, record) => <div className="small-text">[{text}] {record.managerName}</div>
        },
    ];

    const summaryRow = totals ? (
        ledgerData && ledgerData.length > 0 &&
        <Table.Summary.Row style={{ textAlign: 'center', backgroundColor: '#FAFAFA' }}>
            <Table.Summary.Cell index={0}><div className="medium-text">합계</div></Table.Summary.Cell>
            <Table.Summary.Cell index={1}></Table.Summary.Cell>
            <Table.Summary.Cell index={2}></Table.Summary.Cell>
            <Table.Summary.Cell index={3}><div className="medium-text" style={{ textAlign: 'right' }}>{totals.totalSumPreviousCash.toLocaleString()}</div></Table.Summary.Cell>
            <Table.Summary.Cell index={4}><div className="medium-text" style={{ textAlign: 'right' }}>{totals.totalSumDebitAmount.toLocaleString()}</div></Table.Summary.Cell>
            <Table.Summary.Cell index={5}><div className="medium-text" style={{ textAlign: 'right' }}>{totals.totalSumCreditAmount.toLocaleString()}</div></Table.Summary.Cell>
            <Table.Summary.Cell index={6}><div className="medium-text" style={{ textAlign: 'right' }}>{totals.totalSumTotalCashAmount.toLocaleString()}</div></Table.Summary.Cell>
            <Table.Summary.Cell index={7}><div className="medium-text" style={{ textAlign: 'right' }}></div></Table.Summary.Cell>
            <Table.Summary.Cell index={8}><div className="medium-text" style={{ textAlign: 'right' }}></div></Table.Summary.Cell>
        </Table.Summary.Row>
    ) : null;

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="거래처 원장"
                        description={(
                            <Typography>
                                거래처 원장 페이지는 <span>거래처별로 발생한 거래 내역을 관리</span>하는 기능을 제공함.<br/>
                                기업은 각 거래처와의 <span>거래 기록을 한눈에 확인</span>할 수 있으며, <span>매출, 매입, 미수금, 미지급금</span> 등 모든 거래 내역을 체계적으로 관리할 수 있음.<br/>
                                이 페이지를 통해 <span>각 거래처와의 재무 상태</span>를 명확히 파악할 수 있음.
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
                    <Grid item xs={12} md={8} sx={{ minWidth: '1000px' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >거래처 원장 조회</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form layout="vertical">
                                        <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                                            <Col flex="1">
                                                <Form.Item
                                                    label="계정과목 코드"
                                                    required
                                                    tooltip="검색할 계정과목의 코드를 선택하세요"
                                                >
                                                    <Form.Item
                                                        noStyle
                                                        rules={[{ required: true, message: '시작 코드를 선택하세요' }]}
                                                    >
                                                        <Input
                                                            placeholder="계정과목 코드"
                                                            value={displayValues.accountCode}
                                                            onClick={() => handleInputClick('accountCode')}
                                                            className="search-input"
                                                            style={{ width: '100%' }}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
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
                                                                value={displayValues.clientStartCode}
                                                                onClick={() => handleInputClick('clientStartCode')}
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
                                                                value={displayValues.clientEndCode}
                                                                onClick={() => handleInputClick('clientEndCode')}
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
                                        dataSource={ledgerData}
                                        columns={ClientLedgerColumns}
                                        rowKey="clientCode"
                                        pagination={false}
                                        size={'small'}
                                        summary={() => summaryRow}
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
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
                        {currentField === 'accountCode' && (
                            <>
                                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                    계정과목 코드 선택
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
                                            showTotal: (total) => `총 ${total}개`,  // 총 개수 표시
                                        }}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: () => handleModalSelect(record), // 선택 시 처리
                                        })}
                                    />
                                )}
                            </>
                        )}

                        {currentField === 'clientStartCode' && (
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
                                                dataIndex: 'printClientName',  // 데이터 인덱스를 printClientName으로 수정
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
                                            showTotal: (total) => `총 ${total}개`,  // 총 개수 표시
                                        }}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: () => handleModalSelect(record), // 선택 시 처리
                                        })}
                                    />
                                )}
                            </>
                        )}

                        {currentField === 'clientEndCode' && (
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
                                            showTotal: (total) => `총 ${total}개`,  // 총 개수 표시
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

export default ClientLedgerPage;