import React, {useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './TaxInvoiceStatusUtil.jsx';
import {Typography} from '@mui/material';
import {Space, Button, Col, DatePicker, Input, Modal, Row, Select, Spin, Table, Form} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import dayjs from "dayjs";
import {FINANCIAL_API} from "../../../../config/apiConstants.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";
const { RangePicker } = DatePicker;

const TaxInvoiceStatusPage = () => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [currentField, setCurrentField] = useState('');
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchData, setSearchData] = useState([]);
    const [isFocusedClient, setIsFocusedClient] = useState(false);
    const [searchParams, setSearchParams] = useState({
        startDate: null,
        endDate: null,
        transactionType: '',
        startClientCode: '',
        endClientCode: ''
    });
    const [displayValues, setDisplayValues] = useState({
        startClientCode: '',
        endClientCode: ''
    });

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    // 입력 필드 클릭 시 모달 열기
    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setModalData(null);
        setInitialModalData(null);
        fetchModalData(fieldName);
        setIsModalVisible(true);
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

    const handleModalCancel = () => {
        setIsModalVisible(false);  // 모달창 닫기
    };

    // 검색 처리
    const handleSearch = async () => {
        const { startDate, endDate, transactionType, startClientCode, endClientCode } = searchParams;

        // 입력값 검증
        if (!startDate || !endDate || !transactionType || !startClientCode || !endClientCode) {
            notify('warning', '입력 오류', '모든 필드를 입력해 주세요.', 'bottomRight');
            return;
        }

        // 거래처 코드 순서 검증
        if (Number(startClientCode) > Number(endClientCode)) {
            notify('warning', '입력 오류', '거래처 시작 코드는 종료 코드보다 작아야 합니다.', 'bottomRight');
            return;
        }


        try {
            console.log(searchParams);
            const response = await apiClient.post(FINANCIAL_API.TAX_INVOICE_LEDGER_API, searchParams);
            const data = response.data;
            setSearchData(data);
            console.log(data);
        } catch (error) {
            notify('error', '조회 오류', '세금계산서(계산서) 조회 중 오류가 발생했습니다.', 'top');
        }
    };

    const handleTransactionTypeChange = (value) => {
        setSearchParams(prevParams => ({
            ...prevParams,
            transactionType: value
        }));
    };

    const allMonths = Array.from(new Set(searchData.flatMap(item => item.allShows.map(show => show.month))));

    const dynamicColumns = allMonths.map(month => ({
        title: <div className="title-text">{month}월</div>,
        key: `month-${month}`,
        align: 'center',
        children: [
            {
                title: <div className="title-text">전표 건수</div>,
                key: `voucherCount-${month}`,
                align: 'center',
                render: (text, record) => {
                    const showData = record.allShows.find(show => show.month === month);
                    return record.clientCode === '합계' ? <div className="medium-text">{showData.voucherCount} 건</div> : <div className="small-text">{showData.voucherCount} 건</div>;
                }
            },
            {
                title: <div className="title-text">공급 가액</div>,
                key: `supplyAmount-${month}`,
                align: 'center',
                render: (text, record) => {
                    const showData = record.allShows.find(show => show.month === month);
                    return record.clientCode === '합계' ?  <div className="medium-text" style={{ textAlign: 'right' }}>{showData.supplyAmount.toLocaleString()}</div> : <div className="small-text" style={{ textAlign: 'right' }}>{showData.supplyAmount.toLocaleString()}</div>;
                }
            },
            {
                title: <div className="title-text">부가세</div>,
                key: `vatAmount-${month}`,
                align: 'center',
                render: (text, record) => {
                    const showData = record.allShows.find(show => show.month === month);
                    return record.clientCode === '합계' ? <div className="medium-text" style={{ textAlign: 'right' }}>{showData.vatAmount.toLocaleString()}</div> : <div className="small-text" style={{ textAlign: 'right' }}>{showData.vatAmount.toLocaleString()}</div>;
                }
            }
        ]
    }));

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="세금계산서 현황"
                        description={(
                            <Typography>
                                세금계산서 현황 페이지는 <span>기업이 발행한 모든 세금계산서</span>를 관리하는 기능을 제공함. <br/>
                                이 페이지를 통해 <span>세금계산서의 발행 내역</span>을 조회하고, 발행 상태 및 내용을 관리할 수 있음. 이를 통해 <span>세무 신고 및 결산</span>에 필요한 자료를 효율적으로 관리 가능함.
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
                    <Grid item xs={12} md={10} sx={{ minWidth: '1400px' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >세금계산서 조회</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form layout="vertical">
                                        <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                                            <Col>
                                                <Form.Item
                                                    label="거래구분"
                                                    tooltip="조회할 세금계산서의 거래구분(매입, 매출)을 선택하세요"
                                                    required
                                                    style={{ width: '200px' }}
                                                >
                                                    <Select
                                                        placeholder="거래구분"
                                                        style={{ width: '100%' }}
                                                        value={searchParams.transactionType || "선택"}
                                                        onChange={handleTransactionTypeChange}
                                                    >
                                                        <Select.Option value="Sales">매출</Select.Option>
                                                        <Select.Option value="Purchase">매입</Select.Option>
                                                    </Select>
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
                                            <Col flex="1">
                                                <Form.Item
                                                    label="조회 기간"
                                                    required
                                                    tooltip="검색할 기간의 시작일과 종료일을 선택하세요"
                                                >
                                                    <RangePicker
                                                        disabledDate={(current) => current && current.year() !== 2024}
                                                        onChange={handleDateChange}
                                                        style={{ width: '250px' }}
                                                        defaultValue={[
                                                            searchParams.startDate ? dayjs(searchParams.startDate, 'YYYY-MM-DD') : null,
                                                            searchParams.endDate ? dayjs(searchParams.endDate, 'YYYY-MM-DD') : null,
                                                        ]}
                                                        format="YYYY-MM-DD"
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
                                    <Table
                                        dataSource={searchData}  // 제공된 데이터
                                        columns={[
                                            {
                                                title: <div className="title-text">거래처</div>,
                                                dataIndex: 'clientCode',
                                                key: 'clientCode',
                                                align: 'center',
                                                fixed: 'left',
                                                render: (text, record) => text === '합계' ? '': <div className="small-text">[{text.padStart(5, '0')}] {record.clientName}</div>
                                            },
                                            {
                                                title: <div className="title-text">사업자등록번호</div>,
                                                dataIndex: 'clientNumber',
                                                key: 'clientNumber',
                                                align: 'center',
                                                fixed: 'left',
                                                render: (text, record) => text === '합계' ? <div className="medium-text">{text}</div> : <div className="small-text">{text}</div>
                                            },
                                            {
                                                title: <div className="title-text">합계</div>,
                                                align: 'center',
                                                children: [
                                                    {
                                                        title: <div className="title-text">전표 건수</div>,
                                                        key: 'totalVoucherCount',
                                                        align: 'center',
                                                        fixed: 'left',
                                                        render: (text, record) => record.clientCode === '합계' ? <div className="medium-text">{record.totalVoucherCount} 건</div> : <div className="small-text">{record.totalVoucherCount} 건</div>
                                                    },
                                                    {
                                                        title: <div className="title-text">공급 가액</div>,
                                                        key: 'totalSupplyAmount',
                                                        align: 'center',
                                                        fixed: 'left',
                                                        render: (text, record) => record.clientCode === '합계' ? <div className="medium-text" style={{ textAlign: 'right' }}>{record.totalSupplyAmount.toLocaleString()}</div> : <div className="small-text" style={{ textAlign: 'right' }}>{record.totalSupplyAmount.toLocaleString()}</div>
                                                    },
                                                    {
                                                        title: <div className="title-text">부가세</div>,
                                                        key: 'totalVatAmount',
                                                        align: 'center',
                                                        fixed: 'left',
                                                        render: (text, record) => record.clientCode === '합계' ? <div className="medium-text" style={{ textAlign: 'right' }}>{record.totalVatAmount.toLocaleString()}</div> : <div className="small-text" style={{ textAlign: 'right' }}>{record.totalVatAmount.toLocaleString()}</div>
                                                    },
                                                ]
                                            },
                                            ...dynamicColumns
                                        ]}
                                        rowKey="clientCode"
                                        scroll={{ x: 'max-content' }}
                                        pagination={ false }
                                        bordered={ true }
                                        style={{ marginBottom: '100px' }}
                                        size={'small'}
                                        rowClassName={(record) => { return record.clientCode === '합계' ? 'summary-row' : ''; }}
                                    />
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

export default TaxInvoiceStatusPage;