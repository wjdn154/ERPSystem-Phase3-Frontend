import React, {useEffect, useState} from 'react';
import { ActionButtons, showDeleteConfirm } from '../../../common/commonActions.jsx';  // 공통 버튼 및 다이얼로그
import {Box, Grid, Grow, Paper} from '@mui/material';
import { Typography } from '@mui/material';
import {
    Space,
    Tag,
    Form,
    Table,
    Button,
    Col,
    Input,
    Row,
    Checkbox,
    Modal,
    DatePicker,
    Spin,
    Select,
    notification,
    Divider
} from 'antd';
import {useNotificationContext} from "../../../../../config/NotificationContext.jsx";
import { LOGISTICS_API, PRODUCTION_API } from "../../../../../config/apiConstants.jsx";
import apiClient from "../../../../../config/apiClient.jsx";
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";
import {fetchWorkcenter} from "../WorkcenterApi.jsx";
import * as equipment from "date-fns/locale";
const SelectedWorkcenterSection = ({
                                     workcenter,
                                     handleInputChange,
                                     handleSave,
                                     handleDeleteWorkcenter,
                                       handleWorkcenterTypeChange,
                                       handleFormSubmit,
                                   }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [form] = Form.useForm(); // 폼 인스턴스 생성
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [currentField, setCurrentField] = useState(''); // 모달 분기 할 필드 상태
    const [modalData, setModalData] = useState(null); // 모달 데이터 상태
    const [initialModalData, setInitialModalData] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 활성화 여부 상태
    const [displayValues, setDisplayValues] = useState({
        factory: '',
        process: '',
        equipment: '',
    });
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const [fetchWorkcenterData, setFetchWorkcenterData] = useState(false); // 거래처 조회한 정보 상태
    const [workcenterParam, setWorkcenterParam] = useState({}); // 수정 할 거래처 정보 상태
    const [workerAssignments, setWorkerAssignments] = useState([]); // 초기값 빈 배열
    const [selectedEquipments, setSelectedEquipments] = useState([]);
    const [equipmentData, setEquipmentData] = useState([]); // 설비 테이블에 표시할 데이터
    const [searchTerm, setSearchTerm] = useState(''); // 검색 필드 상태

    useEffect(() => {
        if (Object.keys(workcenterParam).length > 0) {
            form.setFieldsValue(workcenterParam); // 폼에 값 반영
        }
    }, [workcenterParam]);

    // 설비 데이터 로드 함수
    const fetchEquipmentData = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.post(PRODUCTION_API.EQUIPMENT_DATA_API);
            setEquipmentData(response.data);
        } catch (error) {
            notification.error({
                message: '조회 오류',
                description: '설비 데이터 조회 중 오류가 발생했습니다.',
            });
            console.error('설비 데이터 조회 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 초기 마운트 시 설비 데이터 로드
    useEffect(() => {
        fetchEquipmentData();
    }, []);

    // 설비 선택 테이블의 Row 선택 설정
    const equipmentRowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedEquipments(selectedRows);
        },
        selectedRowKeys: selectedEquipments.map((equipment) => equipment.id),
    };

    // 검색어로 테이블 데이터 필터링
    const filteredEquipmentData = equipmentData.filter((item) => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return (
            (item.equipmentNum && item.equipmentNum.toLowerCase().includes(lowercasedSearchTerm)) ||
            (item.equipmentName && item.equipmentName.toLowerCase().includes(lowercasedSearchTerm)) ||
            (item.modelName && item.modelName.toLowerCase().includes(lowercasedSearchTerm))
        );
    });

    // 작업장 데이터 가져오기 및 폼 초기화
    useEffect(() => {
        const fetchWorkcenterData = async () => {
            if (!workcenter) return;

            try {
                const fetchedWorkcenter = await fetchWorkcenter(workcenter.code); // API 호출 후 데이터 가져오기
                console.log('fetchWorkcenterData:', fetchedWorkcenter);

                // 폼 필드에 값 설정
                form.setFieldsValue(fetchedWorkcenter);

                // 선택된 작업장 정보를 상태에 저장
                setWorkcenterParam(fetchedWorkcenter);

                // equipmentIds에 해당하는 설비들을 필터링하여 선택된 설비로 설정
                const selected = equipmentData.filter(equipment =>
                    fetchedWorkcenter.equipmentIds.includes(equipment.id)
                );

                console.log('Selected Equipments:', selected);
                setSelectedEquipments(selected); // 선택된 설비 설정

                // 표시할 값 설정
                setDisplayValues({
                    workcenterType: fetchedWorkcenter.workcenterType || '미등록',  // 작업장 유형

                    factory: fetchedWorkcenter.factoryCode && fetchedWorkcenter.factoryName
                        ? `[${String(fetchedWorkcenter.factoryCode).padStart(5, '0')}] ${fetchedWorkcenter.factoryName}`
                        : '미등록',  // 공정 정보
                    process: fetchedWorkcenter.processCode && fetchedWorkcenter.processName
                        ? `[${String(fetchedWorkcenter.processCode).padStart(5, '0')}] ${fetchedWorkcenter.processName}`
                        : '미등록',  // 공정 정보

                    // 오늘 작업자 수와 작업자 이름들을 처리
                    todayWorkerCount: fetchedWorkcenter.todayWorkerCount || '0명',
                    // todayWorkers: fetchedWorkcenter.todayWorkers && fetchedWorkcenter.todayWorkers.length > 0
                    //     ? fetchedWorkcenter.todayWorkers.join(', ')
                    //     : '배정된 작업자 없음',

                    equipment: selected.length > 0
                        ? selected.map(equip => `${equip.equipmentName} (${equip.modelName})`).join(', ')
                        : '선택된 설비 없음',
                });

            } catch (error) {
                console.error('작업장 데이터 가져오기 실패:', error);
            }
        };

        fetchWorkcenterData(); // 비동기 데이터 호출 함수 실행
    }, [workcenter, equipmentData, form]);

    const fetchWorkerAssignments = async (workcenterCode) => {
        try {
            const response = await apiClient.post(PRODUCTION_API.WORKER_ASSIGNMENT_WORKCENTER_DETAIL_API(workcenterCode));

            if (response.status === 200) {
                setWorkerAssignments(response.data);
            } else {
                console.warn('fetchWorkerAssignments API 응답 오류: ', response.data);
                setWorkerAssignments([]); // 비정상 응답 시 빈 배열 설정
            }

        } catch (error) {
            console.error('작업장별 작업자 배정 조회 오류:', error);
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
            setWorkerAssignments([]); // 오류 발생 시 빈 배열 설정

        }
    }

    // 설비 데이터가 로드된 후 selectedEquipments 동기화
    useEffect(() => {
        const selectedIds = selectedEquipments.map(equipment => equipment.id);
        console.log('Selected Equipment IDs:', selectedIds);
    }, [selectedEquipments]);

    // 작업장 코드가 변경될 때마다 작업자 배정 데이터 가져오기
    useEffect(() => {
        if (workcenter && workcenter.code) {
            fetchWorkerAssignments(workcenter.code); // 작업장 코드로 데이터 로드
        }
    }, [workcenter]);

    useEffect(() => {
        console.log('workerAssignments 상태:', workerAssignments);
    }, [workerAssignments]);

    useEffect(() => {
        console.log("Updated workcenterParam:", workcenterParam);
    }, [workcenterParam]);


    // 모달창 선택 핸들러
    const handleModalSelect = (record) => {
        let updatedDisplayValues = { ...displayValues };

        switch (currentField) {
            case 'factory':
                const factoryValue = `[${record.code.toString().padStart(5, '0')}] ${record.name}`;
                setWorkcenterParam((prevParams) => ({
                    ...prevParams,
                    factoryCode: record.code,
                    factoryName: record.name,
                }));
                updatedDisplayValues.factory = factoryValue;
                form.setFieldsValue({ factoryName: record.name }); // 폼 동기화
                break;

            case 'process':
                const processValue = `[${record.code.toString().padStart(5, '0')}] ${record.name}`;
                setWorkcenterParam((prevParams) => ({
                    ...prevParams,
                    processCode: record.code,
                    processName: record.name,
                }));
                updatedDisplayValues.process = processValue;
                form.setFieldsValue({ processName: record.name }); // 폼 동기화
                break;
        }

        setDisplayValues(updatedDisplayValues); // 화면에 표시할 값 업데이트
        handleModalCancel(); // 모달 닫기
    };


    // 모달창 열기 핸들러
    const handleInputClick = (fieldName) => {``
        setCurrentField(fieldName);
        setModalData(null);
        setInitialModalData(null);
        fetchModalData(fieldName);  // 모달 데이터 가져오기 호출
        setIsModalVisible(true)  // 모달창 열기

    };

    // 모달창 닫기 핸들러
    const handleModalCancel = () => setIsModalVisible(false);

    // 모달창 데이터 가져오기 함수
    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;
        if (fieldName === 'factory') apiPath = LOGISTICS_API.WAREHOUSE_LIST_API;
        if(fieldName === 'process') apiPath = PRODUCTION_API.PROCESS_LIST_API;
        if(fieldName === 'equipment') apiPath = PRODUCTION_API.EQUIPMENT_DATA_API;

        try {
            const response = await apiClient.post(apiPath);
            console.log('fetchModalData 응답 데이터:', response.data);  // 응답 데이터 확인

            let resultData;
            // 공장 데이터만 필터링 적용
            if (fieldName === 'factory') {

                let filteredData = response.data.filter(
                    (item) => item.warehouseType === 'FACTORY' || item.warehouseType === 'OUTSOURCING_FACTORY'
                );

                resultData = filteredData.map((item) => ({
                    id: item.id,
                    code: item.code,
                    name: item.name,
                }))

            } else {
                resultData = response.data;
            }

            console.log('최종 데이터:', resultData);  // 최종 데이터 확인
            setModalData(resultData);
            setInitialModalData(resultData);

        } catch (error) {
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
            console.error('공장 데이터 조회 실패:', error);

        } finally {
            setIsLoading(false);
        }
    };

    // 삭제 확인 다이얼로그 호출
  const handleDelete = () => {
    showDeleteConfirm(
        '이 작업은 되돌릴 수 없습니다. 정말로 삭제하시겠습니까?',
        () => handleDeleteWorkcenter(workcenter.code)
    );
  };

  return (
      <Grid item xs={12} md={12} sx={{ minWidth: '1000px !important', maxWidth: '1200px !important' }}>
          <Grow in={true} timeout={200}>
              <Paper elevation={3} sx={{ height: '100%' }}>
                  <Typography variant="h6" sx={{ padding: '20px' }} >작업장 등록 및 수정</Typography>
                  <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                    <Form
                        initialValues={workcenter}
                        form={form}
                        // onFinish={(values) => { handleFormSubmit(values, 'update') }}
                        onFinish={(values) => {
                            console.log("onFinish form.getFieldsValue():", values)
                            values.selectedEquipments = selectedEquipments; // 선택된 설비를 폼 데이터에 포함
                            console.log("onFinish selectedEquipments, ", selectedEquipments)
                            console.log('Form 제출 값:', values);  // 폼 데이터 확인
                            handleFormSubmit(values, 'update');
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={5}>
                                <Form.Item name="code" rules={[{ required: true, message: '작업장 코드를 입력하세요.' }]}>
                                    <Input readOnly addonBefore="작업장 코드"/>
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item name="name" rules={[{ required: true, message: '작업장 이름을 입력하세요.' }]}>
                                    <Input addonBefore="작업장명" />
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item name="workcenterType" rules={[{ required: true, message: '작업장 유형을 선택하세요.' }]}>
                                    <Space.Compact>
                                        <Input style={{ width: '40%', backgroundColor: '#FAFAFA', color: '#000', textAlign: 'center' }} defaultValue="작업장유형" disabled />
                                        <Select
                                            name="workcenterType"
                                            style={{ width: '60%' }}
                                            value={workcenterParam.workcenterType}
                                            onChange={(value) => {
                                                const updatedParam = { ...workcenterParam, workcenterType: value };
                                                setWorkcenterParam(updatedParam);  // 상태 업데이트
                                                form.setFieldsValue(updatedParam); // 폼에 바로 반영
                                            }}
                                        >
                                            <Select.Option value="Press">프레스</Select.Option>
                                            <Select.Option value="Welding">용접</Select.Option>
                                            <Select.Option value="Paint">도장</Select.Option>
                                            <Select.Option value="Machining">정밀 가공</Select.Option>
                                            <Select.Option value="Assembly">조립</Select.Option>
                                            <Select.Option value="Quality Inspection">품질 검사</Select.Option>
                                            <Select.Option value="Casting">주조</Select.Option>
                                            <Select.Option value="Forging">단조</Select.Option>
                                            <Select.Option value="Heat Treatment">열처리</Select.Option>
                                            <Select.Option value="Plastic Molding">플라스틱 성형</Select.Option>
                                        </Select>
                                    </Space.Compact>
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item name="isActive" valuePropName="checked">
                                    <Checkbox>작업장 활성화 여부</Checkbox>
                                </Form.Item>
                            </Col>
                        </Row>
                        {/* 공장, 생산공정, 설비 등록 (모달 선택) */}
                        <Row gutter={16}>
                            <Col span={5}>
                                <Form.Item name="factoryName">
                                    <Input
                                        addonBefore="공장"
                                        placeholder="공장 선택"
                                        onClick={() => handleInputClick('factory')}
                                        value={displayValues.factory}
                                        onFocus={(e) => e.target.blur()}
                                        suffix={<DownSquareOutlined />}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item name="processName">
                                    <Input
                                        addonBefore="생산공정"
                                        placeholder="생산공정 선택"
                                        onClick={() => handleInputClick('process')}
                                        value={displayValues.process}
                                        onFocus={(e) => e.target.blur()}
                                        suffix={<DownSquareOutlined />}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        {/* 설비 선택 테이블 */}
                        <Row gutter={16}>
                            <Col span={15}>
                                <Form.Item name="description">
                                    <Input addonBefore="설명" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>설비 선택</Divider>
                        <Row gutter={12}>
                            <Col span={15}>
                                <Form.Item name="equipment">

                                    <Input
                                        placeholder="설비 검색"
                                        prefix={<SearchOutlined />}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ marginBottom: 16 }}
                                    />
                                    <Table
                                        rowSelection={equipmentRowSelection}
                                        columns={[
                                            {
                                                title: '설비번호',
                                                dataIndex: 'equipmentNum',
                                                key: 'equipmentNum',
                                                align: 'center',
                                            },
                                            {
                                                title: '설비명',
                                                dataIndex: 'equipmentName',
                                                key: 'equipmentName',
                                                align: 'center',
                                            },
                                            {
                                                title: '모델명',
                                                dataIndex: 'modelName',
                                                key: 'modelName',
                                                align: 'center',
                                            },
                                        ]}
                                        dataSource={filteredEquipmentData}
                                        rowKey={(record) => record.id}
                                        size="small"
                                        pagination={{
                                            pageSize: 5,
                                            position: ['bottomCenter'],
                                            showSizeChanger: false,
                                            showTotal: (total) => `총 ${total}개`,
                                        }}
                                        loading={isLoading}
                                        style={{ width: '100%' }} // 너비 조정
                                        onRow={(record) => ({
                                            onClick: () => {
                                                const alreadySelected = selectedEquipments.some((equipment) => equipment.id === record.id);
                                                if (alreadySelected) {
                                                    setSelectedEquipments(selectedEquipments.filter((equipment) => equipment.id !== record.id));
                                                } else {
                                                    setSelectedEquipments([...selectedEquipments, record]);
                                                }
                                            }
                                        })}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                {/* 선택된 설비 */}
                                <Form.Item label="">
                                    <>
                                        {selectedEquipments.length > 0 ? (
                                            selectedEquipments.map(equipment => (
                                                <Tag key={equipment.id} color="green" style={{ marginBottom: '8px' }}>
                                                    {equipment.equipmentName} ({equipment.modelName})
                                                </Tag>
                                            ))
                                        ) : (
                                            <Typography>선택된 설비가 없습니다.</Typography>
                                        )}
                                    </>
                                </Form.Item>
                            </Col>
                        </Row>


                        <Divider orientation={'left'} orientationMargin="0" style={{ marginTop: '0px', fontWeight: 600 }}>작업자배정</Divider>
                        <Row gutter={12}>
                            <Col span={15}>
                                <Form.Item>
                                    <Table
                                        dataSource={workerAssignments || []} // 안전하게 빈 배열로 설정
                                        size={'small'}
                                        pagination={{
                                            pageSize: 5,
                                            position: ['bottomCenter'],
                                            showSizeChanger: false,
                                            showTotal: (total) => `총 ${total}건`,
                                        }}
                                        loading={isLoading}
                                        columns={[
                                            {
                                                title: <div className="title-text">작업지시</div>,
                                                dataIndex: 'productionOrderName',
                                                key: 'productionOrderName',
                                                align: 'center',
                                                render: (text) => <div>{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">교대유형</div>,
                                                dataIndex: 'shiftTypeName',
                                                key: 'shiftTypeName',
                                                align: 'center',
                                                render: (text) => <div>{text}</div>,
                                            },
                                            {
                                                title: <div className="title-text">작업자(사번)</div>,
                                                dataIndex: 'workerName',
                                                key: 'workerName',
                                                align: 'center',
                                                render: (text, record) => (
                                                    <div>{text} ({record.employeeNumber})</div>
                                                ),
                                            },
                                            {
                                                title: <div className="title-text">배정일자</div>,
                                                dataIndex: 'assignmentDate',
                                                key: 'assignmentDate',
                                                align: 'center',
                                            },
                                    ]}></Table>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                            <Button type="primary" htmlType="submit">
                            저장
                            </Button>
                            <Button type="default" onClick={handleDelete} style={{ marginLeft: '10px' }} danger>
                            삭제
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
                                {currentField === 'process' && (
                                    <>
                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                            생산공정 선택
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
                                                        align: 'center'
                                                    },
                                                    {
                                                        title: <div className="title-text">생산공정명</div>,
                                                        dataIndex: 'name',
                                                        key: 'name',
                                                        align: 'center'
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
                                {currentField === 'factory' && (
                                    <>
                                        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: '20px' }}>
                                            공장 선택
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
                                                        align: 'center'
                                                    },
                                                    {
                                                        title: <div className="title-text">이름</div>,
                                                        dataIndex: 'name',
                                                        key: 'name',
                                                        align: 'center',
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
                    </Form>
                  </Grid>
              </Paper>
          </Grow>
      </Grid>

  );
};

export default SelectedWorkcenterSection;
