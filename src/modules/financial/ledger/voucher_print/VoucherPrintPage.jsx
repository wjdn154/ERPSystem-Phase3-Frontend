import React, {useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './VoucherPrintUtil.jsx';
import {Typography} from '@mui/material';
import {Tag, Button, Col, DatePicker, Form, Input, Modal, Row, Select, Space, Spin, Table} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {FINANCIAL_API} from "../../../../config/apiConstants.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;

const VoucherPrintPage = () => {
    const notify = useNotificationContext();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchData, setSearchData] = useState([]);
    const [isFocusedAccount, setIsFocusedAccount] = useState(false);
    const [isFocusedVoucherNumber, setIsFocusedVoucherNumber] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [searchParams, setSearchParams] = useState({
        startDate: null,
        endDate: null,
        voucherType: '',
        voucherKind: '',
        startAccountCode: '',
        endAccountCode: '',
        startVoucherNumber: '',
        endVoucherNumber: ''
    });
    const [displayValues, setDisplayValues] = useState({
        startAccountCode: '',
        endAccountCode: ''
    });

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    // 입력 필드 클릭 시 모달 열기
    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setModalData(null);
        setInitialModalData(null);
        fetchModalData();
        setIsModalVisible(true);
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
        const { startDate, endDate, voucherType, voucherKind, startVoucherNumber, endVoucherNumber, startAccountCode, endAccountCode } = searchParams;

        // 입력값 검증
        if (!startDate || !endDate || !voucherType || !voucherKind || !startVoucherNumber || !endVoucherNumber || !startAccountCode || !endAccountCode) {
            notify('warning', '입력 오류', '모든 필드를 입력해 주세요.', 'bottomRight');
            return;
        }

        // 전표번호 범위 검증
        if (Number(startVoucherNumber) > Number(endVoucherNumber)) {
            notify('warning', '입력 오류', '시작 전표번호는 종료 번호보다 작아야 합니다.', 'bottomRight');
            return;
        }

        // 계정과목 코드 범위 검증
        if (Number(startAccountCode) > Number(endAccountCode)) {
            notify('warning', '입력 오류', '시작 계정과목 코드는 종료 코드보다 작아야 합니다.', 'bottomRight');
            return;
        }

        try {
            const response = await apiClient.post(FINANCIAL_API.VOUCHER_PRINT_SEARCH_API, searchParams);
            setSearchData(response.data);
            console.log(response.data);
            notify('success', '조회 성공', '전표 조회 성공.', 'bottomRight');
        } catch (error) {
            notify('error', '조회 오류', '전표 조회 중 오류가 발생했습니다.', 'top');
        }
    };

    const handleVoucherTypeChange = (value) => {
        setSearchParams(prevParams => ({
            ...prevParams,
            voucherType: value
        }));
    };

    const handleVoucherKindChange = (value) => {
        setSearchParams(prevParams => ({
            ...prevParams,
            voucherKind: value
        }));
    };

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="전표 출력"
                        description={(
                            <Typography>
                                전표 출력 페이지는 <span>승인된 모든 전표를 조회</span>할 수 있는 기능을 제공함. <br/>
                                사용자는 재무 보고서나 기타 문서 작성을 위해 <span>전표를 모두 조회</span>. 이를 통해 재무 데이터를 <span>효율적으로 기록 및 보관</span>할 수 있음.
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
                    <Grid item xs={12} md={10} sx={{ minWidth: '1400px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >전표 출력</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form layout="vertical">
                                        <Row gutter={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                                            <Col>
                                                <Form.Item
                                                    label="전표구분"
                                                    tooltip="조회할 전표의 구분(전체, 입금, 출금, 차변, 대변)을 선택하세요"
                                                    required
                                                    style={{ width: '200px' }}
                                                >
                                                    <Select
                                                        placeholder="전표구분"
                                                        style={{ width: '100%' }}
                                                        value={searchParams.voucherType || "선택"}
                                                        onChange={handleVoucherTypeChange}
                                                    >
                                                        <Select.Option value='null'>전체</Select.Option>
                                                        <Select.Option value='Deposit'>입금</Select.Option>
                                                        <Select.Option value='Withdrawal'>출금</Select.Option>
                                                        <Select.Option value='Debit'>차변</Select.Option>
                                                        <Select.Option value='Credit'>대변</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Form.Item
                                                    label="전표유형"
                                                    tooltip="조회할 전표의 유형(전체, 일반전표, 매출매입전표)을 선택하세요"
                                                    required
                                                    style={{ width: '200px' }}
                                                >
                                                    <Select
                                                        placeholder="전표구분"
                                                        style={{ width: '100%' }}
                                                        value={searchParams.voucherKind || "선택"}
                                                        onChange={handleVoucherKindChange}
                                                    >
                                                        <Select.Option value='null'>전체</Select.Option>
                                                        <Select.Option value='General'>일반전표</Select.Option>
                                                        <Select.Option value='Sale_and_Purchase'>매출매입전표</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col flex="1">
                                                <Form.Item
                                                    label="전표번호 범위"
                                                    required
                                                    tooltip="검색할 전표의 시작 번호와 끝 번호를 입력하세요"
                                                >
                                                    <Space.Compact style={{ width: '100%' }}>
                                                        <Form.Item
                                                            noStyle
                                                            rules={[{ required: true, message: '시작 번호를 입력하세요' }]}
                                                        >
                                                            <Input
                                                                placeholder="시작 번호"
                                                                value={searchParams.startVoucherNumber}
                                                                onChange={(e) => {
                                                                    if (!/^\d*$/.test(e.target.value)) return;

                                                                    setSearchParams(prev => ({
                                                                        ...prev,
                                                                        startVoucherNumber: e.target.value
                                                                    }));
                                                                }}
                                                                className="search-input"
                                                                style={{ width: '47.5%' }}
                                                                onKeyPress={(e) => {
                                                                    // 숫자 이외의 키 입력을 막음
                                                                    if (!/^\d+$/.test(e.key)) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Item>
                                                        <Input
                                                            style={{ width: '5%', padding: 0, textAlign: 'center', borderLeft: 0, pointerEvents: 'none', fontSize: '0.8rem', backgroundColor: '#fff' }}
                                                            placeholder="~"
                                                            disabled
                                                        />
                                                        <Form.Item
                                                            noStyle
                                                            rules={[{ required: true, message: '끝 번호를 입력하세요' }]}
                                                        >
                                                            <Input
                                                                placeholder="끝 번호"
                                                                value={searchParams.endVoucherNumber}
                                                                onChange={(e) => {
                                                                    if (!/^\d*$/.test(e.target.value)) return;

                                                                    setSearchParams(prev => ({
                                                                        ...prev,
                                                                        endVoucherNumber: e.target.value
                                                                    }));
                                                                }}
                                                                onFocus={() => setIsFocusedVoucherNumber(true)}
                                                                onBlur={() => setIsFocusedVoucherNumber(false)}
                                                                className="search-input"
                                                                style={{
                                                                    width: '47.5%',
                                                                    borderLeft: isFocusedVoucherNumber ? '1px solid #4096FF' : '1px solid #fff',
                                                                }}
                                                                onKeyPress={(e) => {
                                                                    // 숫자 이외의 키 입력을 막음
                                                                    if (!/^\d+$/.test(e.key)) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Item>
                                                    </Space.Compact>
                                                </Form.Item>
                                            </Col>
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
                                                                value={displayValues.startAccountCode}
                                                                onClick={() => handleInputClick('startAccountCode')}
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
                                                                value={displayValues.endAccountCode}
                                                                onClick={() => handleInputClick('endAccountCode')}
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
                                        dataSource={searchData}  // 제공된 데이터로 변경
                                        columns={[
                                            {
                                                title: <div className="title-text">전표일자</div>,
                                                dataIndex: 'voucherDate',
                                                key: 'voucherDate',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text}</div> : ''
                                            },
                                            {
                                                title: <div className="title-text">전표번호</div>,
                                                dataIndex: 'voucherNumber',
                                                key: 'voucherNumber',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text}</div> : ''
                                            },
                                            {
                                                title: <div className="title-text">구분</div>,
                                                dataIndex: 'voucherType',
                                                key: 'voucherType',
                                                align: 'center',
                                                render: (text, record) => {
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
                                                render: (text, record) => text ? <div className="small-text">[{text.padStart(5, '0')}] {record.accountSubjectName}</div> : ''
                                            },
                                            {
                                                title: (
                                                    <div className="title-text">금액</div>
                                                ),
                                                align: 'center',
                                                children: [
                                                    {
                                                        title: <div className="title-text">차변</div>,
                                                        dataIndex: 'debitAmount',
                                                        key: 'debitAmount',
                                                        align: 'center',
                                                        render: (text) => text ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : ''
                                                    },
                                                    {
                                                        title: <div className="title-text">대변</div>,
                                                        dataIndex: 'creditAmount',
                                                        key: 'creditAmount',
                                                        align: 'center',
                                                        render: (text) => text ? <div className="small-text" style={{ textAlign: 'right' }}>{text.toLocaleString()}</div> : ''
                                                    },
                                                ],
                                            },
                                            {
                                                title: <div className="title-text">적요</div>,
                                                dataIndex: 'transactionDescription',
                                                key: 'transactionDescription',
                                                align: 'center',
                                                render: (text) => text ? <div className="small-text">{text}</div> : ''
                                            },
                                            {
                                                title: <div className="title-text">거래처</div>,
                                                dataIndex: 'clientCode',
                                                key: 'clientCode',
                                                align: 'center',
                                                render: (text, record) => text ? <div className="small-text">[{text.padStart(5, '0')}] {record.clientName}</div> : ''
                                            },
                                            {
                                                title: <div className="title-text">등록번호</div>,
                                                dataIndex: 'clientRegisterNumber',
                                                key: 'clientRegisterNumber',
                                                align: 'center',
                                                render: (text, record) => text ? <div className="small-text">{text}</div> : ''
                                            },
                                            {
                                                title: <div className="title-text">담당자</div>,
                                                dataIndex: 'voucherManagerCode',
                                                key: 'voucherManagerCode',
                                                align: 'center',
                                                render: (text, record) => text ? <div className="small-text">[{text}] {record.voucherManagerName}</div> : ''
                                            },
                                            {
                                                title: <div className="title-text">유형</div>,
                                                dataIndex: 'voucherKind',
                                                key: 'voucherKind',
                                                align: 'center',
                                                render: (text, record) => {
                                                    let color;
                                                    let value;
                                                    switch (text) {
                                                        case 'SALE_AND_PURCHASE':
                                                            color = 'blue';
                                                            value = '매출매입전표';
                                                            break;
                                                        case 'GENERAL':
                                                            color = 'orange';
                                                            value = '일반전표';
                                                            break;
                                                        default:
                                                            color = 'gray';
                                                            value = text;
                                                    }
                                                    return <Tag style={{ marginLeft: '5px' }} color={color}>{value}</Tag>;
                                                }
                                            },
                                        ]}
                                        rowKey="voucherId"
                                        style={{ marginBottom: '20px' }}
                                        pagination={ false }
                                        size={'small'}
                                        bordered={true}
                                        summary={() => (
                                            searchData && searchData.length > 0 ? (
                                                <Table.Summary.Row style={{ textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                                                    <Table.Summary.Cell index={0}><div className="medium-text">합계</div></Table.Summary.Cell>
                                                    <Table.Summary.Cell index={1} />
                                                    <Table.Summary.Cell index={2} />
                                                    <Table.Summary.Cell index={3} />
                                                    <Table.Summary.Cell index={4}> <div style={{ textAlign: 'right' }} className="medium-text"> {Number(searchData.reduce((acc, curr) => acc + curr.debitAmount, 0)).toLocaleString()} </div> </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={5}> <div style={{ textAlign: 'right' }} className="medium-text"> {Number(searchData.reduce((acc, curr) => acc + curr.creditAmount, 0)).toLocaleString()} </div> </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={6} />
                                                    <Table.Summary.Cell index={7} />
                                                    <Table.Summary.Cell index={8} />
                                                    <Table.Summary.Cell index={9} />
                                                    <Table.Summary.Cell index={10} />
                                                </Table.Summary.Row>
                                            ) : null
                                        )}
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

export default VoucherPrintPage;