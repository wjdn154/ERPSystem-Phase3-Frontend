import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './SystemEnvironmentSettingsUitl.jsx';
import {Typography} from '@mui/material';
import {
    Button,
    Checkbox,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    Modal,
    notification,
    Row,
    Select,
    Space,
    Spin,
    Table
} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import dayjs from "dayjs";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {EMPLOYEE_API, FINANCIAL_API} from "../../../../config/apiConstants.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {SearchOutlined} from "@ant-design/icons";
const { confirm } = Modal;

const SystemEnvironmentSettingsPage = ({initialData}) => {
    const notify = useNotificationContext();
    const [form] = Form.useForm();
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [fetchJournalEntryType, setFetchJournalEntryType] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [displayValues, setDisplayValues] = useState({});
    const [currentField, setCurrentField] = useState('');

    useEffect(() => {
        const newDisplayValues = {};
        fetchJournalEntryType.forEach((entry) => { newDisplayValues[entry.journalEntryTypeId] = `[${entry.accountSubjectCode}] ${entry.accountSubjectName}`; });
        setDisplayValues(newDisplayValues);
    }, [fetchJournalEntryType]);

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    const handleInputClick = (fieldId) => {
        setCurrentField(fieldId);
        setModalData(null);
        setInitialModalData(null);
        fetchModalData();  // 모달 데이터 가져오기 호출
        setIsModalVisible(true);  // 모달창 열기
    };

    const fetchModalData = async () => {
        setIsLoading(true);

        try {
            const response = await apiClient.post(FINANCIAL_API.ACCOUNT_SUBJECTS_SEARCH_API, {});
            setModalData(response.data);
            setInitialModalData(response.data);
        } catch (error) {
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };

    const handleModalSelect = (record) => {
        const formattedValue = `[${record.code}] ${record.name || record.printClientName}`;

        setFetchJournalEntryType((prevParams) =>
            prevParams.map((entry) =>
                entry.journalEntryTypeId === currentField ? {
                        ...entry,
                        accountSubjectCode: record.code,
                        accountSubjectName: record.name,
                    } : entry
            )
        );

        setDisplayValues((prevValues) => ({
            ...prevValues,
            [currentField]: formattedValue,
        }));

        setIsModalVisible(false);
    };

    const handleFormSubmit = async (values, type) => {
        confirm({
            title: '저장 확인',
            content: '정말로 저장하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                try {
                    // 필요한 필드만 추출
                    const journalEntryTypes = fetchJournalEntryType.map((entry) => ({
                        journalEntryTypeId: entry.journalEntryTypeId,
                        accountSubjectCode: entry.accountSubjectCode,
                    }));

                    const response = await apiClient.post(FINANCIAL_API.JOURNAL_ENTRY_TYPE_UPDATE_API, journalEntryTypes);
                    setFetchJournalEntryType(response.data);
                    notify('success', '분개유형 수정', '분개유형 정보 수정 성공.', 'bottomRight');
                } catch (error) {
                    console.log(error);
                    if(error.response === '해당 계정과목은 다른 분개 유형에서 사용 중이므로 변경할 수 없습니다.'){
                        notify('error', '저장 실패', error.response, 'bottomRight');
                    }
                    notify('error', '저장 실패', '데이터 저장 중 오류가 발생했습니다.', 'top');
                }
            },
            onCancel() {
                notification.warning({
                    message: '저장 취소',
                    description: '저장이 취소되었습니다.',
                    placement: 'bottomRight',
                });
            },
        });
    };


    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="환경설정관리"
                        description={(
                            <Typography>
                                환경설정관리 페이지는 <span>회계시스템의 기본 설정과 환경을 관리</span>하는 기능을 제공함.<br/>
                                회사 정보, 회계 기간, 세금 설정 등을 관리할 수 있으며, 이러한 설정은 시스템 전반에 걸쳐 재무 처리를 정확하고 일관되게 유지하는 데 도움을 줌.<br/>
                                <span>환경 설정</span>을 통해 시스템의 효율성과 정확성을 높일 수 있음.<br/>
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
                    <Grid item xs={12} md={6} sx={{ minWidth: '900px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }} >회계 환경 설정</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form
                                        initialValues={fetchJournalEntryType} // 초기값 설정
                                        form={form}
                                        onFinish={(values) => { handleFormSubmit(values, 'update') }} // 폼 제출 처리
                                    >
                                        {/* 기초 정보 */}
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight:600 }}>분개유형 설정</Divider>
                                        <Row gutter={16}>
                                            {fetchJournalEntryType.map((entry, index) => (
                                                <Col span={8} key={index}> {/* 각 항목이 가로로 배치되도록 span 값을 조절 */}
                                                    <Form.Item>
                                                        <Input
                                                            addonBefore={entry.journalEntryTypeName}
                                                            value={displayValues[entry.journalEntryTypeId]}
                                                            onClick={() => handleInputClick(entry.journalEntryTypeId)}
                                                            onFocus={(e) => e.target.blur()}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            ))}
                                        </Row>

                                        <Divider />

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                            <Button type="primary" htmlType="submit">
                                                저장
                                            </Button>
                                        </Box>

                                        {/* 모달창 */}
                                        <Modal
                                            open={isModalVisible}
                                            onCancel={() => setIsModalVisible(false)}
                                            width="40vw"
                                            footer={null}
                                        >
                                            {isLoading ? (
                                                <Spin />  // 로딩 스피너
                                            ) : (
                                                <>
                                                    <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                        분개유형 선택
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
                                                                    title: <div className="title-text">계정과목명</div>,
                                                                    dataIndex: 'name',
                                                                    key: 'name',
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

                                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                                        <Button onClick={() => setIsModalVisible(false)} variant="contained" type="danger" sx={{ mr: 1 }}>
                                                            닫기
                                                        </Button>
                                                    </Box>
                                                </>
                                            )}
                                        </Modal>
                                    </Form>
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default SystemEnvironmentSettingsPage;