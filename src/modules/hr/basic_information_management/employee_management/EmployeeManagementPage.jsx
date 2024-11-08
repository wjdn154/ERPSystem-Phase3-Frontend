import React, { useEffect, useState } from 'react';
import { Box, Grid, Grow, Paper, Typography } from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './EmployeeManagementUti.jsx';
import {Space, Tag, Form, Table, Button, Col, Input, Row, Checkbox, Modal, Spin, Select, notification, Upload} from 'antd';
import apiClient from '../../../../config/apiClient.jsx';
import {EMPLOYEE_API, FINANCIAL_API} from '../../../../config/apiConstants.jsx';
import { Divider } from 'antd';
import { useNotificationContext } from "../../../../config/NotificationContext.jsx";
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";
import defaultImage from "../../../../assets/img/uploads/defaultImage.png";
import CloudUploadIcon from "@mui/icons-material/CloudUpload.js";

const { Option } = Select;
const { confirm } = Modal;

const EmployeeManagementPage = ({ initialData }) => {
    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [form] = Form.useForm(); // 폼 인스턴스 생성
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [employeeList, setEmployeeList] = useState(initialData); // 사원 목록 상태
    const [activeTabKey, setActiveTabKey] = useState('1'); // 활성 탭 키 상태
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 선택된 행 키 상태
    const [editEmployee, setEditEmployee] = useState(false); // 사원 수정 탭 활성화 여부 상태
    const [fetchEmployeeData, setFetchEmployeeData] = useState(false); // 사원 조회한 정보 상태
    const [employeeParam, setEmployeeParam] = useState(false); // 수정할 사원 정보 상태
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const [selectedFile, setSelectedFile] = useState(null);
    const [currentField, setCurrentField] = useState(''); // 모달 분기할 필드 상태
    const [modalData, setModalData] = useState(null); // 모달 데이터 상태
    const [departments, setDepartments] = useState([]); // 부서 데이터 상태
    const [positions, setPositions] = useState([]);
    const [jobTitles, setJobTitles] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 활성화 여부
    const [displayValues, setDisplayValues] = useState({});
    const [initialModalData, setInitialModalData] = useState(null);

    const fetchJobTitles = async () => {
        try{
            const response = await apiClient.post(EMPLOYEE_API.JOB_TITLE_DATA_API);
            console.log("API Response for Transfer Types:", response.data);

            setJobTitles(response.data);

        } catch(error){
            notification.error({
                message: '직책 목록 조회 실패',
                description: '직책 목록을 불러오는 중 오류가 발생했습니다.',
            });
        }
    };

    useEffect(()=>{
        fetchJobTitles();
    }, []);

    // 부서 목록 가져오는 함수
    const fetchDepartments = async () => {
        try {
            const response = await apiClient.post(EMPLOYEE_API.DEPARTMENT_DATA_API); // 부서 목록 API 호출
            setDepartments(response.data); // 부서 목록 저장
            console.log("부서 API", response.data);
        } catch (error) {
            notification.error({
                message: ' 목록 조회 실패',
                description: '부서 목록을 불러오는 중 오류가 발생했습니다.',
            });
        }
    };

    useEffect(() => {
        fetchDepartments(); // 컴포넌트 로드 시 부서 목록 가져오기
    }, []);

    const fetchPositions = async () => {
        try{
            const response = await apiClient.post(EMPLOYEE_API.POSITION_DATA_API);
            setPositions(response.data);
        } catch(error){
            notification.error({
                message: '직위 목록 조회 실패',
                description: '직위 목록을 불러오는 중 오류가 발생했습니다.',
            })
        }
    }
    useEffect(() => {
        fetchPositions();
    }, []);

    useEffect(() => {
        if (!fetchEmployeeData) return; // 선택된 사원 데이터가 없으면 종료
        console.log('Fetched Employee Data:', fetchEmployeeData); // Employee 데이터 확인

        // firstName과 lastName을 조합해서 employeeName 필드에 설정
        form.setFieldsValue({
            ...fetchEmployeeData,
            employeeName: `${fetchEmployeeData.lastName}${fetchEmployeeData.firstName}`
        });
        setEmployeeParam(fetchEmployeeData);

        setDisplayValues({
            department: `[${fetchEmployeeData.departmentCode}] ${fetchEmployeeData.departmentName}`,
            employee: fetchEmployeeData.employmentStatus === 'ACTIVE' ? '재직 중' :
                fetchEmployeeData.employmentStatus === 'ON_LEAVE' ? '휴직 중' : '퇴직',
            bank: fetchEmployeeData.bankAccountDTO
                ? `[${fetchEmployeeData.bankAccountDTO.code.toString().padStart(5, '0')}] ${fetchEmployeeData.bankAccountDTO.name}`
                : '은행 정보 없음', // 은행 정보가 없는 경우 처리
            position: `[${fetchEmployeeData.positionCode}] ${fetchEmployeeData.positionName}`,
            jobTitle: `[${fetchEmployeeData.titleCode}] ${fetchEmployeeData.titleName}`,
        });
    }, [fetchEmployeeData, form]);


    // 모달창 열기 핸들러
    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setModalData(null); // 모달 열기 전에 데이터를 초기화
        setInitialModalData(null);
        fetchModalData(fieldName); // 모달 데이터 가져오기 호출
        setIsModalVisible(true); // 모달창 열기
    };

    // 모달창 닫기 핸들러
    const handleModalCancel = () => setIsModalVisible(false);

    // 모달창 데이터 가져오기 함수
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;
        if(fieldName === 'department') apiPath = EMPLOYEE_API.DEPARTMENT_DATA_API;
        if(fieldName === 'bank') apiPath = FINANCIAL_API.FETCH_BANK_LIST_API;
        if(fieldName === 'position') apiPath = EMPLOYEE_API.POSITION_DATA_API;
        if(fieldName === 'jobTitle') apiPath = EMPLOYEE_API.JOB_TITLE_DATA_API;

        try {
            const response = await apiClient.post(apiPath);
            setModalData(response.data);
            setInitialModalData(response.data);
        } catch (error) {
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    };

    // 모달창 선택 핸들러
    const handleModalSelect = (record) => {
        switch (currentField) {
            case 'department':
            setEmployeeParam((prevParams) => ({
                ...prevParams,
                department: {
                    id: record.id,
                    departmentCode: record.departmentCode,
                    departmentName: record.departmentName,
                },
            }));
            setDisplayValues((prevValues) => ({
                ...prevValues,
                department: `[${record.departmentCode}] ${record.departmentName}`,
            }));
            break;
            case 'position':
                setEmployeeParam((prevParams) => ({
                    ...prevParams,
                    position: {
                        id: record.id,
                        positionCode: record.positionCode || '',
                        positionName: record.positionName || '',
                    },
            }));
            setDisplayValues((prevValues) => ({
                ...prevValues,
                position:`[${record.positionCode}] ${record.positionName}`,
            }));
            break;
            case 'jobTitle':
                setEmployeeParam((prevParams)=>({
                    ...prevParams,
                    jobTitle: {
                        id: record.id,
                        titleCode: record.titleCode || '',
                        titleName: record.titleName || '',
                    },
                }));
                setDisplayValues((prevValues)=> ({
                    ...prevValues,
                    jobTitle: `[${record.titleCode}] ${record.titleName}`,
                }));
            break;
            case 'bank':
                setEmployeeParam((prevParams) => ({
                    ...prevParams,
                    bankAccountDTO: { // 금융 정보 객체
                        bankId: record.id,
                        name: prevParams.bankAccountDTO?.name || '',
                        code: prevParams.bankAccountDTO?.code || '',
                        accountNumber: prevParams.bankAccountDTO?.accountNumber || '',
                    },
                }));
                setDisplayValues((prevValues) => ({
                    ...prevValues,
                    bank: `[${record.code.toString().padStart(5, '0')}] ${record.name}`,
                }));
                break;
        }
        // 모달창 닫기
        setIsModalVisible(false);
    };

    const handleFormSubmit = async (values, type) => {
        console.log('employeeParam: ', employeeParam)

        confirm({
            title: '저장 확인',
            content: '정말로 저장하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                const employeeName = values.employeeName || '';
                const lastName = employeeName.slice(0, 1); // 첫 글자를 성으로 설정
                const firstName = employeeName.slice(1); // 나머지 글자를 이름으로 설정
                const departmentName = Array.isArray(employeeParam.departmentName) && employeeParam.departmentName.length > 0
                    ? employeeParam.departmentName[employeeParam.departmentName.length - 1]
                    : employeeParam.departmentName;

                console.log("employeeParam",employeeParam);
                console.log("values",values);
                const formattedValues = {
                    firstName: firstName,
                    lastName: lastName,
                    phoneNumber: values.phoneNumber,
                    employmentStatus: employeeParam.employmentStatus,
                    employmentType: employeeParam.employmentType,
                    email: values.email,
                    address: values.address,
                    isHouseholdHead: values.isHouseholdHead, // 체크박스 값 처리
                    hireDate: values.hireDate,
                    profilePicture: employeeParam.profilePicture, // 프로필 URL
                    registrationNumber: values.registrationNumber,
                    departmentId: employeeParam.departmentId,
                    departmentName: employeeParam.departmentName,
                    departmentCode: employeeParam.departmentCode,
                    positionId: employeeParam.position ? employeeParam.position.id : employeeParam.positionId,
                    positionCode: employeeParam.position ? employeeParam.position.positionCode : employeeParam.positionCode,
                    positionName: employeeParam.position ? employeeParam.position.positionName : employeeParam.positionName,
                    titleId: employeeParam.jobTitle ? employeeParam.jobTitle.id : employeeParam.titleId,
                    titleName: employeeParam.jobTitle ? employeeParam.jobTitle.titleName : employeeParam.titleName,
                    titleCode: employeeParam.jobTitle ? employeeParam.jobTitle.titleCode : employeeParam.titleCode,
                    bankId: employeeParam.bankAccountDTO.bankId,
                    accountNumber: employeeParam.bankAccountDTO.accountNumber, // 입력된 계좌번호
                    name: employeeParam.bankAccountDTO.name,
                    code: employeeParam.bankAccountDTO.code,

                };
                console.log("만수이",formattedValues);
                 // console.log(" sss:"  +values);
                 // console.log(values);
                console.log("employeeParam2",employeeParam);
                console.log("values2",values);
                //FormData 객체 생성
                const formData = new FormData();
                formData.append("formattedValues", JSON.stringify(formattedValues));  // JSON으로 변환 후 추가
                if (selectedFile) {  // 파일이 존재할 때만 추가
                    formData.append("imageFile", selectedFile);
                }

                try {
                    //console.log(formattedValues);
                    const API_PATH = type === 'update' ? EMPLOYEE_API.UPDATE_EMPLOYEE_DATA_API(employeeParam.id ) : EMPLOYEE_API.SAVE_EMPLOYEE_DATA_API;
                    const response = await apiClient.post(API_PATH,formData,{
                         headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    const updatedData = response.data;
                    console.log("만수이 2",updatedData)
                    if (type === 'update') {
                        setEmployeeList((prevList) =>
                            prevList.map((employee) => employee.id === updatedData.id ? updatedData : employee)
                        );
                        console.log('Updated Employee List:', employeeList);
                    } else {
                        setEmployeeList((prevList) => [...prevList, updatedData]);
                        registrationForm.resetFields();
                        console.log('New Employee List:', employeeList);
                    }
                    setEditEmployee(false);
                    setFetchEmployeeData(null);
                    setEmployeeParam({employmentStatus: '',});
                    setDisplayValues({});
                    setSelectedFile(null);

                    type === 'update'
                        ? notify('success', '사원 수정', '사원 정보 수정 성공.', 'bottomRight')
                        : (notify('success', '사원 저장', '사원 정보 저장 성공.', 'bottomRight'), registrationForm.resetFields());
                } catch (error) {
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
    // 사업자등록번호, 주민등록번호, 전화번호, 팩스번호 포맷 함수
    const formatPhoneNumber = (value) => {
        if (!value) return '';
        const cleanValue = value.replace(/[^\d]/g, ''); // 숫자 외의 모든 문자 제거
        if (cleanValue.length <= 3) return cleanValue;
        if (cleanValue.length <= 7) return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
        return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 7)}-${cleanValue.slice(7)}`;
    };
    // 탭 변경 핸들러
    const handleTabChange = (key) => {
        setEditEmployee(false);
        setFetchEmployeeData(null);
        setEmployeeParam({
            employmentStatus: "",
        });
        setDisplayValues({});
        form.resetFields();
        registrationForm.resetFields(); // 2탭 폼 초기화
        registrationForm.setFieldValue('isHouseholdHead', true);
        setActiveTabKey(key);
    };


    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="사원 관리"
                        description={
                            <Typography>
                                사원 관리 페이지는 <span>기업의 모든 사원 정보를 체계적으로 관리</span>하는 기능을 제공함.<br />
                                이 페이지에서는 <span>사원의 인적 사항, 직책, 직위, 부서 등</span>의 정보를 등록하고 조회할 수 있으며, <span>사원별로 세부 정보를 업데이트</span>할 수 있음.<br />
                                또한 사원의 <span>변경 사항을 기록</span>하고, <span>현재 인사 상태</span>를 정확히 파악할 수 있음.
                            </Typography>
                        }
                        tabItems={tabItems()}
                        activeTabKey={activeTabKey}
                        handleTabChange={handleTabChange}
                    />
                </Grid>
            </Grid>

            {activeTabKey === '1' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }}>사원 목록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Table
                                        dataSource={employeeList}
                                        columns={[
                                            {
                                                title: <div className="title-text">이미지</div>,
                                                dataIndex: 'imagePath',
                                                key: 'imagePath',
                                                align: 'center',
                                                render: (text, record) => (
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        padding: '5px', // padding 추가
                                                        backgroundColor: '#f9f9f9', // 약간의 배경색 추가
                                                        borderRadius: '8px' // 테두리 둥글게
                                                    }}>
                                                        <img
                                                            src={record.imagePath ? record.imagePath: defaultImage}
                                                            alt="이미지"
                                                            style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                objectFit: 'contain', // contain으로 설정하여 비율 유지
                                                                borderRadius: '5px',
                                                            }}
                                                        />
                                                    </div>
                                                ),
                                            },
                                            {
                                                title: <div className="title-text">입사일자</div>,
                                                dataIndex: 'hireDate',
                                                key: 'hireDate',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">부서번호</div>,
                                                dataIndex: 'departmentCode',
                                                key: 'departmentCode',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">부서명</div>,
                                                dataIndex: 'departmentName',
                                                key: 'departmentName',
                                                align: 'center',
                                                render: (text) => {
                                                    let color;
                                                    switch (text) {
                                                        case '인사부':
                                                            color = 'purple';
                                                            break;
                                                        case '재무부':
                                                            color = 'green';
                                                            break;
                                                        case '생산부':
                                                            color = 'red';
                                                            break;
                                                        case '물류부':
                                                            color = 'blue';
                                                            break;
                                                        default:
                                                            color = 'gray'; // 기본 색상
                                                    }
                                                    return <Tag style={{ marginLeft: '5px' }} color={color}>{text}</Tag>;
                                                },
                                            },
                                            {
                                                title: <div className="title-text">사원번호</div>,
                                                dataIndex: 'employeeNumber',
                                                key: 'employeeNumber',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">사원이름</div>,
                                                dataIndex: 'fullName',
                                                key: 'fullName',
                                                align: 'center',
                                                render: (text, record) => (
                                                    <div className="small-text">
                                                        {record.lastName}{record.firstName}
                                                    </div>
                                                ),
                                            },
                                            {
                                                title: <div className="title-text">고용상태</div>,
                                                dataIndex: 'employmentStatus',
                                                key: 'employmentStatus',
                                                align: 'center',
                                                render: (text) => {
                                                    let color;
                                                    let value;
                                                    switch (text) {
                                                        case 'ACTIVE':
                                                            color = 'green';
                                                            value = '재직 중';
                                                            break;
                                                        case 'ON_LEAVE':
                                                            color = 'blue';
                                                            value = '휴직 중';
                                                            break;
                                                        case 'RESIGNED':
                                                            color = 'orange';
                                                            value = '퇴직';
                                                            break;
                                                        default:
                                                            color = 'gray'; // 기본 색상
                                                    }
                                                    return <Tag style={{ marginLeft: '5px' }} color={color}>{value}</Tag>;
                                                },
                                            },
                                            {
                                                title: <div className="title-text">고용유형</div>,
                                                dataIndex: 'employmentType',
                                                key: 'employmentType',
                                                align: 'center',
                                                render: (text) => {
                                                    let value;
                                                    switch (text) {
                                                        case 'FULL_TIME':
                                                            value = '정규직';
                                                            break;
                                                        case 'CONTRACT':
                                                            value = '계약직';
                                                            break;
                                                        case 'PART_TIME':
                                                            value = '파트타임';
                                                            break;
                                                        case 'TEMPORARY':
                                                            value = '임시직';
                                                            break;
                                                        case 'INTERN':
                                                            value = '인턴';
                                                            break;
                                                        case 'CASUAL':
                                                            value = '일용직';
                                                            break;
                                                        case 'FREELANCE':
                                                            value = '프리랜서';
                                                            break;
                                                    }
                                                    return <div className="small-text">{value}</div>;
                                                },
                                            },
                                            {
                                                title: <div className="title-text">직위</div>,
                                                dataIndex: 'positionName',
                                                key: 'positionName',
                                                align: 'center',
                                                render: (text) => <div className={"small-text"}>{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">직책</div>,
                                                dataIndex: 'titleName',
                                                key: 'titleName',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">이메일</div>,
                                                dataIndex: 'email',
                                                key: 'email',
                                                align: 'center',
                                                render: (text) => <div className="small-text">{text}</div>,
                                            }
                                        ]}
                                        rowKey={(record) => record.id}
                                        pagination={{ pageSize: 10, position: ['bottomCenter'], showSizeChanger: false }}
                                        size="small"
                                        rowSelection={{
                                            type: 'radio',
                                            selectedRowKeys,
                                            onChange: async (newSelectedRowKeys) => {
                                                setSelectedRowKeys(newSelectedRowKeys);
                                                const id = newSelectedRowKeys[0];
                                                try {
                                                    const response = await apiClient.get(EMPLOYEE_API.EMPLOYEE_DATA_DETAIL_API(id));
                                                    setFetchEmployeeData(response.data);
                                                    setEditEmployee(true);
                                                    notify('success', '사원 조회', '사원 정보 조회 성공.', 'bottomRight')
                                                } catch (error) {
                                                    notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
                                                }
                                            }
                                        }}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: async () => {
                                                setSelectedRowKeys([record.id]); // 클릭한 행의 키로 상태 업데이트
                                                const id = record.id;
                                                try {
                                                    const response = await apiClient.get(EMPLOYEE_API.EMPLOYEE_DATA_DETAIL_API(id));
                                                    setFetchEmployeeData(response.data);
                                                    setEditEmployee(true);
                                                    notify('success', '사원 조회', '사원 정보 조회 성공.', 'bottomRight')
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
                    {editEmployee && (
                        <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1500px !important' }}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{ height: '100%' }}>
                                    <Typography variant="h6" sx={{ padding: '20px' }}>사원 수정</Typography>
                                    <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                        <Form
                                            initialValues={fetchEmployeeData}
                                            form={form}
                                            onFinish={(values) => { handleFormSubmit(values, 'update'); }}
                                        >

                                            {/* 기본 정보 */}
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>기본 정보</Divider>
                                            <Row gutter={8}>
                                                <Col span={3.5}>
                                                    <Form.Item>
                                                        <div style={{ marginBottom: '1px' }}>
                                                            <img
                                                                src={selectedFile
                                                                    ? URL.createObjectURL(selectedFile)
                                                                    : fetchEmployeeData?.profilePicture
                                                                        ? fetchEmployeeData?.profilePicture
                                                                        : '/src/assets/img/uploads/defaultImage.png'}
                                                                alt="미리보기 이미지"
                                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                    </Form.Item>

                                                    <Form.Item name="imageFile">
                                                        <Upload
                                                            beforeUpload={() => false}
                                                            onChange={(info) => {
                                                                const file = info.fileList[info.fileList.length - 1]?.originFileObj;
                                                                setSelectedFile(file);
                                                            }}
                                                            fileList={selectedFile ? [{ uid: '-1', name: selectedFile.name, status: 'done', url: selectedFile.url }] : []}
                                                        >
                                                            <Button icon={<CloudUploadIcon />}>파일 선택</Button>
                                                        </Upload>
                                                    </Form.Item>
                                                </Col>

                                                {/* 나머지 입력 필드를 2개씩 위아래로 배치 */}
                                                <Col span={18}>
                                                    <Row gutter={18} style={{ marginTop: '10px' }}> {/* 두 번째 줄 */}
                                                        <Col span={12}>
                                                            <Form.Item name="employeeName" rules={[{ required: true, message: '성명을 입력하세요.' }]}>
                                                                <Input
                                                                    addonBefore="성명"
                                                                    onChange={(e) => {
                                                                        const [lastName = '', firstName = ''] = e.target.value.split(' ');
                                                                        form.setFieldsValue({ lastName, firstName });
                                                                    }}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item name="registrationNumber" rules={[{ required: true, message: '주민등록번호를 입력하세요.' }]}>
                                                                <Input addonBefore="주민등록번호" disabled={'registrationNumber'}/>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                    <Row gutter={18}>
                                                        <Col span={12}>
                                                            <Form.Item name="hireDate" rules={[{ required: true, message: '입사일자를 입력하세요.' }]}>
                                                                <Input addonBefore="입사일자" disabled={'hireDate'}/>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item name="employeeNumber">
                                                                <Input addonBefore="사원번호" disabled={'employeeNumber'} placeholder ="입사일자에 맞춰 사원번호 자동 지정"/>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                </Col>
                                            </Row>
                                            <Divider />
                                            {/* 연락처 정보 */}
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>
                                                연락처 정보
                                            </Divider>
                                            <Row gutter={16}>
                                                <Col span={6}>
                                                    <Form.Item name="address" rules={[{ required: true, message: '주소를 입력하세요.' }]}>
                                                        <Input addonBefore="주소" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item name='phoneNumber' rules={[{ required: true, message: '전화번호를 입력하세요.' }]}>
                                                        <Input addonBefore="전화번호" onChange={(e) => form.setFieldValue( 'phoneNumber', formatPhoneNumber(e.target.value))} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item name="email" rules={[{ required: true, message: '이메일을 입력하세요.' }]}>
                                                        <Input addonBefore="이메일" />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            {/* 고용 정보 */}
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>
                                                고용 정보
                                            </Divider>
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item name="department">
                                                        <Space.Compact>
                                                            <Input
                                                                style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }}
                                                                value="부서명"
                                                                disabled
                                                            />
                                                            <Select
                                                                style={{ width: '60%' }}
                                                                value={employeeParam.departmentCode}
                                                                onChange={(value, option) => {
                                                                    setEmployeeParam((prevState) => ({
                                                                        ...prevState,
                                                                        departmentCode: value, // 부서 코드 설정
                                                                        departmentName: option.children[3], // 부서명 설정
                                                                    }));
                                                                }}
                                                            >
                                                                {departments.map((dept) => (
                                                                    <Option key={dept.departmentCode} value={dept.departmentCode}>
                                                                        [{dept.departmentCode}] {dept.departmentName}
                                                                    </Option>
                                                                ))}
                                                            </Select>
                                                        </Space.Compact>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item>
                                                        <Input
                                                            addonBefore="직위"
                                                            value={displayValues.position}
                                                            onClick={() => handleInputClick('position')}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={4}>
                                                    <Form.Item>
                                                        <Input
                                                            addonBefore="직책"
                                                            value={displayValues.jobTitle}
                                                            onClick={() => handleInputClick('jobTitle')}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item name="employmentStatus">
                                                        <Space.Compact>
                                                            <Input style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="고용 상태" disabled />
                                                            <Select
                                                                style={{ width: '60%' }}
                                                                value={employeeParam.employmentStatus}
                                                                onChange={(value) => {
                                                                    setEmployeeParam((prevState) => ({
                                                                        ...prevState,
                                                                        employmentStatus: value,
                                                                    }));
                                                                }}
                                                            >
                                                                <Option value="ACTIVE">재직 중</Option>
                                                                <Option value="ON_LEAVE">휴직 중</Option>
                                                                <Option value="RESIGNED">퇴직</Option>
                                                            </Select>
                                                        </Space.Compact>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item name="employmentType">
                                                        <Space.Compact>
                                                            <Input style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="고용 유형" disabled />
                                                            <Select
                                                                style={{ width: '60%' }}
                                                                value={employeeParam.employmentType}
                                                                onChange={(value) => {
                                                                    setEmployeeParam((prevState) => ({
                                                                        ...prevState,
                                                                        employmentType: value,
                                                                    }));
                                                                }}
                                                            >
                                                                <Option value="FULL_TIME">정규직</Option>
                                                                <Option value="CONTRACT">계약직</Option>
                                                                <Option value="PART_TIME">파트타임</Option>
                                                                <Option value="TEMPORARY">임시직</Option>
                                                                <Option value="INTERN">인턴</Option>
                                                                <Option value="CASUAL">일용직</Option>
                                                                <Option value="FREELANCE">프리랜서</Option>
                                                            </Select>
                                                        </Space.Compact>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            {/* 금융 정보 */}
                                            <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>
                                                금융 정보
                                            </Divider>
                                            <Row gutter={16}>
                                                <Col span={4}>
                                                    <Form.Item>
                                                        <Input
                                                            addonBefore="은행명"
                                                            value={displayValues.bank}
                                                            onClick={() => handleInputClick('bank')}
                                                            onFocus={(e) => e.target.blur()}
                                                            suffix={<DownSquareOutlined />}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item name={['bankAccountDTO', 'accountNumber']} rules={[{ required: true, message: '계좌번호를 입력하세요.' }]}>
                                                        <Input
                                                            addonBefore="계좌번호"
                                                            value={employeeParam.bankAccountDTO?.accountNumber || ''} // 계좌번호 입력 필드
                                                            onChange={(e) => {
                                                                const accountNumber = e.target.value;
                                                                setEmployeeParam((prevParams) => ({
                                                                    ...prevParams,
                                                                    bankAccountDTO: {
                                                                        ...prevParams.bankAccountDTO,
                                                                        accountNumber: accountNumber, // 입력한 계좌번호 업데이트
                                                                    },
                                                                }));
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item name="isHouseholdHead" valuePropName="checked">
                                                        <Checkbox>세대주 여부</Checkbox>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            {/* 저장 버튼 */}
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                                <Button type="primary" htmlType="submit">
                                                    저장
                                                </Button>
                                            </Box>

                                            {/* 모달창 */}
                                            <Modal
                                                open={isModalVisible}
                                                onCancel={handleModalCancel}
                                                width="40vw"
                                                footer={null}
                                            >{isLoading ? (
                                                <Spin />  // 로딩 스피너
                                            ) : (
                                                <>
                                                    {currentField === 'bank' && (
                                                        <>
                                                            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                                은행 선택
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
                                                                            title: <div className="title-text">은행명</div>,
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
                                                                        pageSize: 10,
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
                                                    {currentField === 'position' && (
                                                        <>
                                                            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                                직위 선택
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
                                                                                (item.positionCode && item.positionCode.toLowerCase().includes(value)) ||
                                                                                (item.positionName && item.positionName.toLowerCase().includes(value))
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
                                                                            title: <div className="title-text">직위코드</div>,
                                                                            dataIndex: 'positionCode',
                                                                            key: 'positionCode',
                                                                            align: 'center',
                                                                            render: (text) => <div className="small-text">{text}</div>
                                                                        },
                                                                        {
                                                                            title: <div className="title-text">직위명</div>,
                                                                            dataIndex: 'positionName',
                                                                            key: 'positionName',
                                                                            align: 'center',
                                                                            render: (text) => <div className="small-text">{text}</div>
                                                                        },
                                                                    ]}
                                                                    dataSource={modalData}
                                                                    rowKey="positionCode"
                                                                    size={'small'}
                                                                    pagination={{
                                                                        pageSize: 10,
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
                                                    {currentField === 'jobTitle' && (
                                                        <>
                                                            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                                직책 선택
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
                                                                                (item.titleCode && item.titleCode.toLowerCase().includes(value)) ||
                                                                                (item.titleName && item.titleName.toLowerCase().includes(value))
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
                                                                            title: <div className="title-text">직책코드</div>,
                                                                            dataIndex: 'titleCode',
                                                                            key: 'titleCode',
                                                                            align: 'center',
                                                                            render: (text) => <div className="small-text">{text}</div>
                                                                        },
                                                                        {
                                                                            title: <div className="title-text">직책명</div>,
                                                                            dataIndex: 'titleName',
                                                                            key: 'titleName',
                                                                            align: 'center',
                                                                            render: (text) => <div className="small-text">{text}</div>
                                                                        },
                                                                    ]}
                                                                    dataSource={modalData}
                                                                    rowKey="titleCode"
                                                                    size={'small'}
                                                                    pagination={{
                                                                        pageSize: 10,
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
                                        </Form>
                                    </Grid>
                                </Paper>
                            </Grow>
                        </Grid>
                    )}
                </Grid>
            )}

            {activeTabKey === '2' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={12} sx={{ minWidth: '500px !important', maxWidth: '1500px !important' }}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                <Typography variant="h6" sx={{ padding: '20px' }}>사원 등록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Form
                                        layout="vertical"
                                        onFinish={(values) => {
                                            console.log("저장직전 : " ,values);
                                            handleFormSubmit(values, 'register') }}
                                        form={registrationForm}
                                    >
                                        {/* 기본 정보 */}
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>기본 정보</Divider>
                                        <Row gutter={8}>
                                            <Col span={3.5}>
                                                <Form.Item>
                                                    <div style={{ marginBottom: '1px' }}>
                                                        <img
                                                            src={selectedFile
                                                                ? URL.createObjectURL(selectedFile)
                                                                : fetchEmployeeData?.profilePicture
                                                                    ? fetchEmployeeData?.profilePicture
                                                                    : '/src/assets/img/uploads/defaultImage.png'}
                                                            alt="미리보기 이미지"
                                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                </Form.Item>

                                                <Form.Item name="imageFile">
                                                    <Upload
                                                        beforeUpload={() => false}
                                                        onChange={(info) => {
                                                            const file = info.fileList[info.fileList.length - 1]?.originFileObj;
                                                            setSelectedFile(file);
                                                        }}
                                                        fileList={selectedFile ? [{ uid: '-1', name: selectedFile.name, status: 'done', url: selectedFile.url }] : []}
                                                    >
                                                        <Button icon={<CloudUploadIcon />}>파일 선택</Button>
                                                    </Upload>
                                                </Form.Item>
                                            </Col>

                                            {/* 나머지 입력 필드를 2개씩 위아래로 배치 */}
                                            <Col span={18}>
                                                <Row gutter={18} style={{ marginTop: '10px' }}> {/* 두 번째 줄 */}
                                                    <Col span={12}>
                                                        <Form.Item name="employeeName" rules={[{ required: true, message: '성명을 입력하세요.' }]}>
                                                            <Input
                                                                addonBefore="성명"
                                                                onChange={(e) => {
                                                                    const [lastName = '', firstName = ''] = e.target.value.split(' ');
                                                                    form.setFieldsValue({ lastName, firstName });
                                                                }}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item name="registrationNumber" rules={[{ required: true, message: '주민등록번호를 입력하세요.' }]}>
                                                            <Input addonBefore="주민등록번호"/>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                                <Row gutter={18}>
                                                    <Col span={12}>
                                                        <Form.Item name="hireDate" rules={[{ required: true, message: '입사일자를 입력하세요.' }]}>
                                                            <Input addonBefore="입사일자"/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item name="employeeNumber">
                                                            <Input addonBefore="사원번호" disabled={'employeeNumber'} placeholder ="입사일자에 맞춰 사원번호 지정"/>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                            </Col>
                                        </Row>
                                        {/* 연락처 정보 */}
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>연락처 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Form.Item name="address" rules={[{ required: true, message: '주소를 입력하세요.' }]}>
                                                    <Input addonBefore="주소" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name="phoneNumber" rules={[{ required: true, message: '휴대폰 번호를 입력하세요.' }]}>
                                                    <Input addonBefore="휴대폰 번호" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="email" rules={[{ required: true, message: '이메일을 입력하세요.' }]}>
                                                    <Input addonBefore="이메일" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        {/* 고용 정보 */}
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>고용 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item name="department">
                                                    <Space.Compact>
                                                        <Input
                                                            style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }}
                                                            value="부서명"
                                                            disabled
                                                        />
                                                        <Select
                                                            style={{ width: '60%' }}
                                                            value={employeeParam.departmentCode}
                                                            onChange={(value, option) => {
                                                                console.log("Selected Value:", value);
                                                                console.log("Selected Option:", option);

                                                                setEmployeeParam((prevState) => ({
                                                                    ...prevState,
                                                                    departmentId: option.id, // `data-*` 속성을 사용해 부서 ID 설정
                                                                    departmentCode: value, // 부서 코드 설정
                                                                    departmentName: option.departmentName, // 부서명 설정
                                                                }));
                                                                console.log("확인",departments);
                                                            }}
                                                        >
                                                            {departments.map((dept) => (
                                                                <Option
                                                                    key={dept.departmentCode}
                                                                    value={dept.departmentCode}  // departmentCode만 `value`로 전달
                                                                    id={dept.id}
                                                                    departmentname={dept.departmentName}
                                                                >
                                                                    [{dept.departmentCode}] {dept.departmentName}
                                                                </Option>
                                                            ))}
                                                        </Select>
                                                    </Space.Compact>
                                                </Form.Item>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="직위"
                                                        value={displayValues.position}
                                                        onClick={() => handleInputClick('position')}
                                                        onFocus={(e) => e.target.blur()}
                                                        suffix={<DownSquareOutlined />}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="직책"
                                                        value={displayValues.jobTitle}
                                                        onClick={() => handleInputClick('jobTitle')}
                                                        onFocus={(e) => e.target.blur()}
                                                        suffix={<DownSquareOutlined />}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item name="employmentStatus">
                                                    <Space.Compact>
                                                        <Input style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="고용 상태" disabled />
                                                        <Select
                                                            style={{ width: '60%' }}
                                                            value={employeeParam.employmentStatus}
                                                            onChange={(value) => {
                                                                setEmployeeParam((prevState) => ({
                                                                    ...prevState,
                                                                    employmentStatus: value,
                                                                }));
                                                            }}
                                                        >
                                                            <Option value="ACTIVE">재직 중</Option>
                                                            <Option value="ON_LEAVE">휴직 중</Option>
                                                            <Option value="RESIGNED">퇴직</Option>
                                                        </Select>
                                                    </Space.Compact>
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name="employmentType">
                                                    <Space.Compact>
                                                        <Input style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="고용 유형" disabled />
                                                        <Select
                                                            style={{ width: '60%' }}
                                                            value={employeeParam.employmentType}
                                                            onChange={(value) => {
                                                                setEmployeeParam((prevState) => ({
                                                                    ...prevState,
                                                                    employmentType: value,
                                                                }));
                                                            }}
                                                        >
                                                            <Option value="FULL_TIME">정규직</Option>
                                                            <Option value="CONTRACT">계약직</Option>
                                                            <Option value="PART_TIME">파트타임</Option>
                                                            <Option value="TEMPORARY">임시직</Option>
                                                            <Option value="INTERN">인턴</Option>
                                                            <Option value="CASUAL">일용직</Option>
                                                            <Option value="FREELANCE">프리랜서</Option>
                                                        </Select>
                                                    </Space.Compact>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        {/* 금융 정보 */}
                                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>금융 정보</Divider>
                                        <Row gutter={16}>
                                            <Col span={4}>
                                                <Form.Item>
                                                    <Input
                                                        addonBefore="은행명"
                                                        value={displayValues.bank}
                                                        onClick={() => handleInputClick('bank')}
                                                        onFocus={(e) => e.target.blur()}
                                                        suffix={<DownSquareOutlined />}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name={['bankAccountDTO', 'accountNumber']} rules={[{ required: true, message: '계좌번호를 입력하세요.' }]}>
                                                    <Input
                                                        addonBefore="계좌번호"
                                                        value={employeeParam.bankAccountDTO?.accountNumber || ''} // 계좌번호 입력 필드
                                                        onChange={(e) => {
                                                            const accountNumber = e.target.value;
                                                            setEmployeeParam((prevParams) => ({
                                                                ...prevParams,
                                                                bankAccountDTO: {
                                                                    ...prevParams.bankAccountDTO,
                                                                    accountNumber: accountNumber, // 입력한 계좌번호 업데이트
                                                                },
                                                            }));
                                                        }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item name="isHouseholdHead" valuePropName="checked">
                                                    <Checkbox>세대주 여부</Checkbox>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                            <Button type="primary" htmlType="submit">
                                                저장
                                            </Button>
                                        </Box>

                                        {/* 모달창 */}
                                        <Modal
                                            open={isModalVisible}
                                            onCancel={handleModalCancel}
                                            width="40vw"
                                            footer={null}
                                        >{isLoading ? (
                                            <Spin />  // 로딩 스피너
                                        ) : (
                                            <>
                                                {currentField === 'bank' && (
                                                    <>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                            은행 선택
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
                                                                        title: <div className="title-text">은행명</div>,
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
                                                                    pageSize: 10,
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
                                                {currentField === 'position' && (
                                                    <>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                            직위 선택
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
                                                                            (item.positionCode && item.positionCode.toLowerCase().includes(value)) ||
                                                                            (item.positionName && item.positionName.toLowerCase().includes(value))
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
                                                                        title: <div className="title-text">직위코드</div>,
                                                                        dataIndex: 'positionCode',
                                                                        key: 'positionCode',
                                                                        align: 'center',
                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                    },
                                                                    {
                                                                        title: <div className="title-text">직위명</div>,
                                                                        dataIndex: 'positionName',
                                                                        key: 'positionName',
                                                                        align: 'center',
                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                    },
                                                                ]}
                                                                dataSource={modalData}
                                                                rowKey="positionCode"
                                                                size={'small'}
                                                                pagination={{
                                                                    pageSize: 10,
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
                                                {currentField === 'jobTitle' && (
                                                    <>
                                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                                            직책 선택
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
                                                                            (item.titleCode && item.titleCode.toLowerCase().includes(value)) ||
                                                                            (item.titleName && item.titleName.toLowerCase().includes(value))
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
                                                                        title: <div className="title-text">직책코드</div>,
                                                                        dataIndex: 'titleCode',
                                                                        key: 'titleCode',
                                                                        align: 'center',
                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                    },
                                                                    {
                                                                        title: <div className="title-text">직책명</div>,
                                                                        dataIndex: 'titleName',
                                                                        key: 'titleName',
                                                                        align: 'center',
                                                                        render: (text) => <div className="small-text">{text}</div>
                                                                    },
                                                                ]}
                                                                dataSource={modalData}
                                                                rowKey="titleCode"
                                                                size={'small'}
                                                                pagination={{
                                                                    pageSize: 10,
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

export default EmployeeManagementPage;
