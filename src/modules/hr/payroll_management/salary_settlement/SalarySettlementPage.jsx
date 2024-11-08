import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper, Typography} from '@mui/material';
import {Select, Spin, Table, Button, DatePicker, Input, Modal, Tag, Row, Form, Space, Col, Divider} from 'antd';
import dayjs from 'dayjs';
import apiClient from "../../../../config/apiClient.jsx";
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import {tabItems} from './SalarySettlementUtil.jsx';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import {DownSquareOutlined, ReloadOutlined, SearchOutlined} from "@ant-design/icons";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {EMPLOYEE_API} from "../../../../config/apiConstants.jsx";

const {RangePicker} = DatePicker;

const SalarySettlementPage = () => {
    const notify = useNotificationContext();
    const [form] = Form.useForm();
    const [formBackup, setFormBackup] = useState({}); // 폼 백업용 상태 선언

    const [employees, setEmployees] = useState([]);
    const [employeeId, setEmployeeId] = useState(null); // 사원 ID
    const [salaryDates, setSalaryDates] = useState([]);
    const [selectedDateId, setSelectedDateId] = useState(null);
    const [isEditable, setIsEditable] = useState(true);
    const [isFinalized, setIsFinalized] = useState(true); // 마감여부 초기값
    // const [isFinalized, setIsFinalized] = useState(null); // 마감여부 초기값

    const [salaryLedgerData, setSalaryLedgerData] = useState(null);
    const [activeTabKey, setActiveTabKey] = useState('1');

    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [displayValue, setDisplayValue] = useState('');
    const [searchData, setSearchData] = useState([]);

    const [searchParams, setSearchParams] = useState({
        startDate: null,
        endDate: null,
        setSelectedEmployee: '',
        setSalaryDateId: '',
    });

    // 사원 선택 → 급여 조회
    // 조회 결과 표시 → 수정 가능 여부 확인
    // 수정 → 수정된 데이터 저장
    // 자동 계산 → 계산 결과 반영
    // 마감 처리 → 수정 불가 처리

    useEffect(() => {
        if (salaryDates.length > 0) {
            setModalData(salaryDates);  // 초기 데이터 설정
        }
    }, [salaryDates]);

    useEffect(() => {
        if (salaryLedgerData) {
            form.setFieldsValue({
                allowances: salaryLedgerData.allowances || [],
            })
            setIsFinalized(salaryLedgerData.finalized);
            setIsEditable(!salaryLedgerData.finalized); // finalized가 true이면 수정 불가능하게
        }
    }, [salaryLedgerData]);

    // 페이지 로드 시 전체 사원 목록과 급여지급일 목록 조회
    useEffect(() => {
        fetchSalaryDates();
        fetchAllEmployees();
    }, []);

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    const handleReset = () => {
        setSelectedDateId(null);  // 선택한 지급일 코드 초기화
        setSalaryLedgerData({});  // 급여 데이터 초기화
        setDisplayValue(null)
        setSelectedDateId(null);
        setEmployeeId();
        setIsFinalized(false);
        setSelectedRowKeys()
        form.resetFields();  // Form 필드 초기화

        // notify('info', '초기화 완료', '선택한 지급일 코드와 관련 데이터가 초기화되었습니다.', 'bottomRight');
    };

    // 급여 지급일 데이터 가져오기
    const fetchSalaryDates = async () => {
        try {
            const response = await apiClient.post(EMPLOYEE_API.SALARY_LEDGER_DATE_API);
            setSalaryDates(response.data);
        } catch (error) {
            notify('error', '지급일 조회 실패', '지급일 정보를 불러오는 중 오류가 발생했습니다.', 'top');
        }
    };

    // 모든 사원 목록
    const fetchAllEmployees = async () => {
        try {
            const response = await apiClient.post(EMPLOYEE_API.EMPLOYEE_DATA_API);
            setEmployees(response.data);
        } catch (error) {
            notify('error', '사원 조회 실패', '전체 사원 목록을 불러오는 중 오류가 발생했습니다.', 'top');
        }
    };

    // 급여 조회
    const fetchSalaryLedger = async () => {
        if (!employeeId || !selectedDateId) {
            notify('warning', '입력 오류', '사원과 지급일을 선택해 주세요.', 'top');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiClient.post(EMPLOYEE_API.SALARY_LEDGER_SHOW_API, {
                employeeId, // employeeId 자체가 숫자인 경우
                salaryLedgerDateId: selectedDateId,
            });
            const data = response.data;
            form.setFieldsValue(data);


            if (data && typeof data.finalized === "boolean") {
                setSalaryLedgerData(data);
                setIsFinalized(data.finalized); // 정확한 상태 설정
            } else {
            }

        } catch (error) {
            notify('error', '조회 실패', '급여 정보를 조회하는 중 오류가 발생했습니다.', 'top');

        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async (values) => {

        if (isFinalized) {
            notify('warning', '수정 불가', '마감된 급여는 수정할 수 없습니다.');
            return;
        }
        try {
            await apiClient.post(EMPLOYEE_API.SALARY_LEDGER_UPDATE_API, values);
            notify('success', '수정 완료', '급여 정산 정보가 수정되었습니다.');
            fetchSalaryLedger(); // 수정 후 데이터 갱신
        } catch (error) {
            notify('error', '수정 실패', '급여 정보 수정 중 오류가 발생했습니다.', 'top');
        }
    };

    // 금액 포맷 함수
    const formatNumberWithComma = (value) => {
        if (!value) return '';
        const cleanValue = value.toString().replace(/[^\d]/g, '');
        return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // 숫자 입력 핸들러 (숫자만 입력 가능하게 처리)
    const handleNumericInput = (value) => {
        return value.replace(/[^0-9]/g, '');
    };

    // 자동 계산
    const calculateSalary = async () => {
        const currentFormValues = form.getFieldsValue();
        setFormBackup(currentFormValues); // 백업 저장

        if (!salaryLedgerData?.ledgerId) {
            notify('error', '계산 오류', '급여 정보가 존재하지 않습니다.');
            return;
        }

        if (salaryLedgerData?.finalized) {
            notify('warning', '마감된 급여', '이미 마감된 급여는 계산할 수 없습니다.');
            return;
        }

        try {
            const response = await apiClient.post(EMPLOYEE_API.SALARY_LEDGER_CALCULATION_API, {
                salaryLedgerId: salaryLedgerData.ledgerId,
            });


            // 응답 데이터를 상태와 폼에 반영
            const updatedData = {...form.getFieldsValue(), ...response.data}; // 기존 폼 값과 병합
            setSalaryLedgerData(updatedData);
            form.setFieldsValue(updatedData); // 폼 값 동기화
            // 계산 후 finalized 상태 확인
            setIsFinalized(response.data.finalized);

            notify('success', '계산 완료', '급여 자동 계산이 완료되었습니다.', 'bottomRight');
        } catch (error) {
// 에러 발생 시 응답 객체에서 finalized 여부를 확인
            form.setFieldsValue(formBackup);

            const finalized = error?.response?.data?.finalized ?? salaryLedgerData.finalized;

            setIsFinalized(finalized); // 에러 발생 시에도 상태 갱신
            notify('error', '계산 실패', '자동 계산 중 오류가 발생했습니다.', 'top');
        }
    };

    const handleAllowanceChange = (index, value) => {
        const numericValue = parseInt(value || '0', 10);

        const updatedAllowances = [...form.getFieldValue('allowances')];
        updatedAllowances[index].amount = numericValue;

        // 상태와 폼 값 동기화
        form.setFieldsValue({allowances: updatedAllowances});
        setSalaryLedgerData((prev) => ({...prev, allowances: updatedAllowances}));
    };


// 마감 처리
    const handleDeadline = async () => {
        if (!salaryLedgerData?.employeeId || !salaryLedgerData?.ledgerId) {
            notify('warning', '마감 처리 불가', '사원 정보 또는 급여 데이터가 올바르지 않습니다.', 'top');
            return;
        }
        console.log(salaryLedgerData.ledgerId);
        try {
            const response = await apiClient.post(EMPLOYEE_API.SALARY_LEDGER_DEADLINE_API, {
                salaryLedgerId: salaryLedgerData.ledgerId,
            });

            const updatedData = { ...salaryLedgerData, finalized: response.data.finalized };
            setSalaryLedgerData(updatedData); // 상태 갱신
            setIsFinalized(response.data.finalized); // finalized 상태를 동기화

            notify('success', '마감 처리 완료', response.data.message, 'bottomRight');
        } catch (error) {
            notify('error', '마감 실패', '마감 처리 중 오류가 발생했습니다.', 'top');
        }
    };

// 마감 해제 핸들러
    const handleDeadlineOff = async () => {
        if (!salaryLedgerData?.ledgerId) return;
        try {
            const response = await apiClient.post(EMPLOYEE_API.SALARY_LEDGER_DEADLINE_OFF_API, {
                salaryLedgerId: salaryLedgerData.ledgerId,
            });

            const updatedData = {...salaryLedgerData, finalized: response.data.finalized};
            setSalaryLedgerData(updatedData);
            setIsFinalized(response.data.finalized); // 상태 동기화
            notify('success', '마감 해제 완료', response.data.message, 'bottomRight');
        } catch (error) {
            notify('error', '마감 해제 실패', '마감 해제 중 오류가 발생했습니다.', 'top');
        }
    };


    // 지급일 선택 모달 열기
    const handleInputClick = () => {
        setIsModalVisible(true);
    };

    // 사원 선택 시 급여 데이터 조회
    const handleEmployeeSelect = async (employee) => {
        setEmployeeId(employee.id);

        // 급여 지급일 코드가 선택되지 않은 경우 안내
        if (!selectedDateId) {
            notify('warning', '입력 필요', '급여 지급일 코드를 선택해 주세요.', 'top');
            return; // 코드 종료
        }

        try {
            const response = await apiClient.post(EMPLOYEE_API.SALARY_LEDGER_SHOW_API, {
                employeeId: employee.id,
                salaryLedgerDateId: selectedDateId,
            });

            const data = response.data; // response.data를 변수 data에 저장
            setSalaryLedgerData({ ...data, employeeId: employee.id });
            form.setFieldsValue(response.data);
            setIsFinalized(data.finalized || false); // finalized 상태 설정
            notify('success', '조회 성공', '급여 정보를 조회했습니다.', 'bottomRight');
        } catch (error) {
            notify('error', '조회 오류', '급여 정산 정보 조회 중 오류가 발생했습니다.');
        }
    };

    // 모달에서 지급일 코드 선택 시 처리
    const handleDateSelect = (record) => {
        setSelectedDateId(record.id);  // 상태 변경
        setDisplayValue(`[${record.code}] ${record.description}`);  // 표시할 값 설정

        form.resetFields(); // 폼 데이터 초기화
        setSalaryLedgerData(null);
        setIsFinalized(false); // 마감 상태 초기화
        setSelectedRowKeys([]); // 선택한 행 초기화
        setEmployeeId(null); // 사원 ID 초기화

        setTimeout(() => setIsModalVisible(false), 0);

    };



    return (
        <Box sx={{margin: '20px'}}>
            <Grid container spacing={3}>
                {/* 왼쪽: 사원 목록 */}
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="급여 정산"
                        description={(
                            <Typography>
                                급여 정산 페이지는 <span>사원의 근로 시간과 지급 항목</span>을 기반으로 매월 급여를 계산하는 기능을 제공함. 이 페이지에서는 <span>근로 시간, 연장 근무, 야근, 공제 항목</span> 등을
                                입력하여 <span>정확한 급여 계산</span>을 진행할 수 있으며, 자동으로 각종 <span>세금과 보험료</span>가 반영된 금액을 확인할 수 있음.
                                이를 통해 사원의 급여 정산을 효율적으로 관리할 수 있음.
                            </Typography>
                        )}
                        tabItems={tabItems()}
                        activeTabKey={activeTabKey}
                        handleTabChange={handleTabChange}
                    />
                </Grid>
            </Grid>

            {activeTabKey === '1' && (
                <Grid sx={{padding: '0px 20px 0px 20px'}} container spacing={3}>
                    <Grid item xs={12} md={4} sx={{minWidth: '500px'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{height: '100%'}}>
                                <Typography variant="h6" sx={{padding: '20px'}}>급여정산 정보</Typography>
                                <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                    <Form layout="vertical">
                                        <Row gutter={16} style={{
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Col span={16}>
                                                <Form.Item
                                                    label="지급일 코드"
                                                    required
                                                    tooltip="검색할 급여지급일의 코드를 선택하세요"
                                                >
                                                    <Form.Item
                                                        noStyle
                                                        rules={[{required: true, message: '급여지급일 코드를 선택하세요'}]}
                                                    >
                                                        <Input
                                                            placeholder="급여지급일 코드"
                                                            value={displayValue} // 선택된 값 표시
                                                            onClick={handleInputClick} // Input 클릭 시 모달 열기
                                                            className="search-input"
                                                            style={{width: '100%'}}
                                                            suffix={<DownSquareOutlined/>}
                                                        />
                                                    </Form.Item>
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item>
                                                    <Button
                                                        style={{width: '100px'}}
                                                        type="default"
                                                        icon={<ReloadOutlined/>}  // 초기화 아이콘 사용
                                                        onClick={handleReset}  // 초기화 함수 호출
                                                        block
                                                    >
                                                        초기화
                                                    </Button>
                                                </Form.Item>

                                            </Col>
                                        </Row>
                                    </Form>

                                    {/* 지급일 코드 선택 모달 */}
                                    <Modal
                                        open={isModalVisible}
                                        onCancel={() => setIsModalVisible(false)}
                                        width="40vw"
                                        footer={null}
                                    >
                                        {isLoading ? (
                                            <Spin/>
                                        ) : (
                                            <>
                                                <Typography id="modal-modal-title" variant="h6" component="h2"
                                                            sx={{marginBottom: '20px'}}>
                                                    급여지급일 코드 선택
                                                </Typography>
                                                <Input
                                                    placeholder="검색"
                                                    prefix={<SearchOutlined/>}
                                                    onChange={(e) => {
                                                        const value = e.target.value.toLowerCase(); // 입력값을 소문자로 변환
                                                        if (!value) {
                                                            setModalData(salaryDates);
                                                        } else {
                                                            const filtered = salaryDates.filter((item) => {
                                                                const startDate = dayjs(item.startDate).format('YYYY-MM-DD'); // 날짜 포맷 맞추기
                                                                const endDate = dayjs(item.endDate).format('YYYY-MM-DD'); // 날짜 포맷 맞추기

                                                                return (
                                                                    (item.description && item.description.toLowerCase().includes(value)) ||
                                                                    (item.code && item.code.toLowerCase().includes(value)) ||
                                                                    startDate.includes(value) || // 날짜 문자열 포함 여부 확인
                                                                    endDate.includes(value)
                                                                );
                                                            });
                                                            setModalData(filtered); // 필터링된 데이터 설정
                                                        }
                                                    }}

                                                    style={{marginBottom: 16}}
                                                />
                                                {modalData && (
                                                    <Table
                                                        columns={[
                                                            {
                                                                title: <div className="title-text">지급일코드</div>,
                                                                dataIndex: 'code',
                                                                key: 'code',
                                                                align: 'center',
                                                                width: '20%',
                                                                render: (text) => <div
                                                                    className="small-text">{text}</div>
                                                            },
                                                            {
                                                                title: <div className="title-text">설명</div>,
                                                                dataIndex: 'description',
                                                                key: 'description',
                                                                align: 'center',
                                                                render: (text) => <div
                                                                    className="small-text">{text}</div>
                                                            },
                                                            {
                                                                title: <div className="title-text">시작일</div>,
                                                                dataIndex: 'startDate',
                                                                key: 'startDate',
                                                                align: 'center',
                                                                render: (text) => <div
                                                                    className="small-text">{text}</div>
                                                            },
                                                            {
                                                                title: <div className="title-text">마감일</div>,
                                                                dataIndex: 'endDate',
                                                                key: 'endDate',
                                                                align: 'center',
                                                                render: (text) => <div
                                                                    className="small-text">{text}</div>
                                                            },
                                                        ]}
                                                        dataSource={salaryDates}
                                                        rowKey={(record) => record.id}
                                                        size={'small'}
                                                        rowSelection={{
                                                            type: 'radio',
                                                            selectedRowKeys,
                                                            onChange: (newSelectedRowKeys) => {
                                                                setSelectedRowKeys(newSelectedRowKeys);
                                                                form.resetFields();
                                                            },
                                                        }}
                                                        pagination={{
                                                            pageSize: 15,
                                                            position: ['bottomCenter'],
                                                            showSizeChanger: false,
                                                            showTotal: (total) => `총 ${total}개`,
                                                        }}
                                                        onRow={(record) => ({
                                                            style: { cursor: 'pointer' },
                                                            onClick: () => handleDateSelect(record),
                                                        })}
                                                    />
                                                )}
                                            </>
                                        )}
                                        <Box sx={{display: 'flex', justifyContent: 'flex-end', marginTop: '20px'}}>
                                            <Button onClick={() => {
                                                setIsModalVisible(false)
                                            }} type="primary">
                                                닫기
                                            </Button>
                                        </Box>
                                    </Modal>
                                    {/* 사원 정보 테이블 */}
                                    <Typography variant="h6" sx={{padding: '20px'}}>사원 정보</Typography>
                                    <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                        <Table
                                            dataSource={employees} // 필터링된 사원 목록 사용
                                            columns={[
                                                {
                                                    title: <div className="title-text">사원 번호</div>,
                                                    dataIndex: 'employeeNumber',
                                                    key: 'employeeNumber',
                                                    align: 'center',
                                                    render: (text) => text ? <div className="small-text">{text}</div> : ''
                                                },
                                                {
                                                    title: <div className="title-text">사원명</div>,
                                                    dataIndex: 'firstName',
                                                    key: 'firstName',
                                                    align: 'center',
                                                    render: (text, record) => <div className="small-text">{record.lastName + record.firstName}</div>
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

                                                            return <Tag key={record.id} style={{marginLeft: '5px'}} color={color}>{value}</Tag>;
                                                        }
                                                        return '';
                                                    }
                                                },
                                            ]}
                                            rowKey={(record) => record.id}
                                            pagination={{
                                                pageSize: 15,
                                                position: ['bottomCenter'],
                                                showSizeChanger: false
                                            }}
                                            size="small"
                                            style={{marginBottom: '20px'}}
                                            onRow={(record) => ({
                                                style: {cursor: 'pointer'},
                                                onClick: async () => {
                                                    await handleEmployeeSelect(record); // 사원 선택 후 급여 정보 조회
                                                    setSelectedRowKeys([record.id]); // 선택한 행 강조
                                                },
                                            })}
                                            rowSelection={{
                                                type: 'radio',
                                                selectedRowKeys,
                                                onChange: (keys) => setSelectedRowKeys(keys),
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>

                    <Grid item xs={12} md={8} sx={{minWidth: '500px'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{height: '100%'}}>
                                <Typography variant="h6" sx={{padding: '20px'}}>공제항목 및 수당목록</Typography>
                                <Grid sx={{padding: '0px 20px 20px 20px'}}>
                                    <Form
                                        form={form}
                                        onFinish={(values) => handleFormSubmit(values)}
                                    >
                                        <Row gutter={32}>
                                            {/* 공제 항목: 왼쪽에 세로로 배치 */}
                                            <Col span={12}>
                                                <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>공제 항목</Divider>
                                                <Table
                                                    dataSource={[
                                                        { key: '1', name: '국민연금', amount: salaryLedgerData?.nationalPensionAmount || 0, field: 'nationalPensionAmount' },
                                                        { key: '2', name: '사학연금', amount: salaryLedgerData?.privateSchoolPensionAmount || 0, field: 'privateSchoolPensionAmount' },
                                                        { key: '3', name: '건강보험', amount: salaryLedgerData?.healthInsurancePensionAmount || 0, field: 'healthInsurancePensionAmount' },
                                                        { key: '4', name: '고용보험', amount: salaryLedgerData?.employmentInsuranceAmount || 0, field: 'employmentInsuranceAmount' },
                                                        { key: '5', name: '장기요양보험', amount: salaryLedgerData?.longTermCareInsurancePensionAmount || 0, field: 'longTermCareInsurancePensionAmount' },
                                                        { key: '6', name: '소득세', amount: salaryLedgerData?.incomeTaxAmount || 0, field: 'incomeTaxAmount' },
                                                        { key: '7', name: '지방소득세', amount: salaryLedgerData?.localIncomeTaxPensionAmount || 0, field: 'localIncomeTaxPensionAmount' },
                                                    ]}
                                                    columns={[
                                                        {
                                                            title: <div className="title-text">공제 항목명</div>,
                                                            dataIndex: 'name',
                                                            key: 'name',
                                                            align: 'center',
                                                            render: (text) => <div className="small-text">{text}</div>,
                                                        },
                                                        {
                                                            title: <div className="title-text">금액</div>,
                                                            dataIndex: 'amount',
                                                            key: 'amount',
                                                            align: 'center',
                                                            render: (_, record) => (
                                                                <Form.Item name={record.field} style={{ marginBottom: '10px' }}>
                                                                    <Input
                                                                        addonAfter="원"
                                                                        value={form.getFieldValue(record.field)}
                                                                        onChange={(e) => {
                                                                            const numericValue = handleNumericInput(e.target.value);
                                                                            form.setFieldsValue({ [record.field]: numericValue });
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const formattedValue = formatNumberWithComma(e.target.value);
                                                                            form.setFieldsValue({ [record.field]: formattedValue });
                                                                        }}
                                                                        disabled={isFinalized}
                                                                        style={{
                                                                            textAlign: 'right',
                                                                        }}
                                                                    />
                                                                </Form.Item>
                                                            ),
                                                        },
                                                    ]}
                                                    pagination={false}
                                                    size="small"
                                                    bordered
                                                    summary={() => (
                                                        <Table.Summary.Row style={{ textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                                                            <Table.Summary.Cell index={0}>
                                                                <div className="medium-text">공제 총액</div>
                                                            </Table.Summary.Cell>
                                                            <Table.Summary.Cell index={1}>
                                                                <div style={{ textAlign: 'right' }} className="medium-text">
                                                                    {[
                                                                        salaryLedgerData?.nationalPensionAmount || 0,
                                                                        salaryLedgerData?.privateSchoolPensionAmount || 0,
                                                                        salaryLedgerData?.healthInsurancePensionAmount || 0,
                                                                        salaryLedgerData?.employmentInsuranceAmount || 0,
                                                                        salaryLedgerData?.longTermCareInsurancePensionAmount || 0,
                                                                        salaryLedgerData?.incomeTaxAmount || 0,
                                                                        salaryLedgerData?.localIncomeTaxPensionAmount || 0,
                                                                    ]
                                                                        .reduce((acc, curr) => acc + Number(curr), 0)
                                                                        .toLocaleString()} 원
                                                                </div>
                                                            </Table.Summary.Cell>
                                                        </Table.Summary.Row>
                                                    )}
                                                />
                                            </Col>
                                            {/* 수당 항목: 오른쪽에 테이블로 구성 */}
                                            <Col span={12}>
                                                <Divider orientation={'left'} orientationMargin="0"
                                                         style={{marginTop: '0px', fontWeight: 600}}>수당 목록</Divider>
                                                <Table
                                                    dataSource={salaryLedgerData?.allowances || []}
                                                    columns={[
                                                        {
                                                            title: <div className="title-text">수당명</div>,
                                                            dataIndex: 'name',
                                                            key: 'name',
                                                            align: 'center',
                                                            render: (text) => <div className="small-text">{text}</div>
                                                        },
                                                        {
                                                            title: <div className="title-text">금액</div>,
                                                            dataIndex: 'amount',
                                                            key: 'amount',
                                                            align: 'center',
                                                            // render: (text) => `${Number(text).toLocaleString()} 원`,
                                                            render: (_, record, index) => (
                                                                <Form.Item
                                                                    name={['allowances', index, 'amount']}
                                                                    // initialValue={record.amount || 0} initialValues 대신 폼 필드로 값 설정
                                                                    rules={[{required: true, message: '금액을 입력하세요'}]}
                                                                    style={{marginBottom: '10px'}}
                                                                >
                                                                    <Input
                                                                        addonAfter="원"
                                                                        type="text"
                                                                        onChange={(e) => {
                                                                            const numericValue = handleNumericInput(e.target.value);
                                                                            const updatedAllowances = [...form.getFieldValue('allowances')];
                                                                            updatedAllowances[index].amount = numericValue || '0';
                                                                            form.setFieldsValue({allowances: updatedAllowances});
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            const formattedValue = formatNumberWithComma(e.target.value);
                                                                            const updatedAllowances = [...form.getFieldValue('allowances')];
                                                                            updatedAllowances[index].amount = formattedValue;
                                                                            form.setFieldsValue({allowances: updatedAllowances});
                                                                        }}
                                                                        disabled={isFinalized}
                                                                        style={{
                                                                            textAlign: 'right',
                                                                            marginBottom: '-10px'
                                                                        }}
                                                                    />
                                                                </Form.Item>

                                                            ),
                                                        },
                                                    ]}
                                                    rowKey={(record) => record.id}  // 고유한 id 사용
                                                    pagination={false}
                                                    size="small"
                                                    bordered
                                                    style={{
                                                        marginBottom: '10px', // 테이블 하단 여백 줄이기
                                                        maxWidth: '400px', // 테이블 전체 너비 제한
                                                    }}
                                                    rowClassName={() => 'custom-row'} // 줄 간격을 커스터마이즈할 클래스 추가
                                                    summary={() => (
                                                        salaryLedgerData?.allowances?.length > 0 && (
                                                            <Table.Summary.Row style={{
                                                                textAlign: 'center',
                                                                backgroundColor: '#FAFAFA',
                                                            }}
                                                            >
                                                                <Table.Summary.Cell index={0}>
                                                                    <div className="medium-text">합계</div>
                                                                </Table.Summary.Cell>
                                                                <Table.Summary.Cell index={1}>
                                                                    <div style={{textAlign: 'right'}}
                                                                         className="medium-text">
                                                                        {salaryLedgerData?.allowances
                                                                            .reduce((acc, curr) => acc + curr.amount, 0)
                                                                            .toLocaleString()} 원
                                                                    </div>
                                                                </Table.Summary.Cell>
                                                            </Table.Summary.Row>
                                                        )
                                                    )}
                                                    scroll={{ y: 450 }}  // 테이블 세로 스크롤 높이 설정
                                                />

                                            </Col>
                                        </Row>
                                        <Divider orientation={'left'} orientationMargin="0"
                                                 style={{marginTop: '0px', fontWeight: 600}}>합계</Divider>

                                        {/* 집계 항목들 */}
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item name="nonTaxableAmount">
                                                    <Input addonBefore="비과세 금액" readOnly/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="taxableAmount">
                                                    <Input addonBefore="과세 금액" readOnly/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="taxableIncome">
                                                    <Input addonBefore="과세 소득" readOnly/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="netPayment">
                                                    <Input addonBefore="차인지급액" readOnly/>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            marginTop: '20px',
                                            gap: '10px'
                                        }}>
                                            <Button onClick={calculateSalary}>
                                                계산
                                            </Button>
                                            {!isFinalized && (
                                                <Button type="default" onClick={handleDeadline}>
                                                    마감 처리
                                                </Button>
                                            )}
                                            {isFinalized && (
                                                <Button onClick={handleDeadlineOff}>
                                                    마감 해제
                                                </Button>
                                            )}
                                            <Button type="primary" htmlType="submit">
                                                저장
                                            </Button>
                                        </Box>
                                    </Form>
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>


                </Grid>
            )}

            {/*{employeeId && salaryLedgerData && (*/}

            {/*)}*/}

            {activeTabKey === '2' && (
                <Grid sx={{padding: '0px 20px 0px 20px'}} container spacing={3}>
                    <Grid item xs={12} md={5} sx={{minWidth: '500px !important', maxWidth: '700px !important'}}>
                        <Grow in={true} timeout={200}>
                            <div>
                                <TemporarySection/>
                            </div>
                        </Grow>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default SalarySettlementPage;