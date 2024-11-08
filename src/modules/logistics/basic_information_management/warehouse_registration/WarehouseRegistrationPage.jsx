import React, {useState, useEffect, useCallback} from 'react';
import {Box, Grid, Card, Paper, Typography, Divider, Grow} from '@mui/material';
import {
    Table,
    Tag,
    Input,
    Form,
    Space,
    Button,
    Modal,
    Tree,
    Select,
    Row,
    Col,
    Checkbox,
    Spin,
    notification
} from 'antd';
import {LOGISTICS_API, PRODUCTION_API} from '../../../../config/apiConstants';
import apiClient from '../../../../config/apiClient';
import {useNotificationContext} from '../../../../config/NotificationContext';
import {tabItems} from "./WarehouseUtil.jsx";
import WelcomeSection from "../../../../components/WelcomeSection.jsx";
import dayjs from "dayjs";
import {DownSquareOutlined, SearchOutlined} from "@ant-design/icons";
import TemporarySection from "../../../../components/TemporarySection.jsx";
import {id} from "date-fns/locale";

const {Option} = Select;
const {confirm} = Modal;

const WarehouseRegistrationPage = ({initialData}) => {
    const notify = useNotificationContext(); // 알림 메시지 컨텍스트 사용
    const [isLoading, setIsLoading] = useState(false);
    const [warehouseList, setWarehouseList] = useState(initialData); // 창고 목록
    const [hierarchyWarehouseList, setHierarchyWarehouseList] = useState(false);
    const [warehouseDetail, setWarehouseDetail] = useState(false);
    const [editWarehouse, setEditWarehouse] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 선택된 행 키 상태
    const [form] = Form.useForm(); // 폼 인스턴스 생성
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [warehouseParam, setWarehouseParam] = useState(false);
    const [displayValues, setDisplayValues] = useState({});
    const [currentField, setCurrentField] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);
    const [initialModalRequests, setInitialModalRequests] = useState([]);
    const [checkedKeys, setCheckedKeys] = useState([]); // Keys for checked groups in Tree
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [hierarchyGroups, setHierarchyGroups] = useState([]);
    const [activeTabKey, setActiveTabKey] = useState('1'); // 활성화된 탭 키

    const handleFormSubmit = async (values) => {
        confirm({
            title: '수정 확인',
            content: '정말로 수정하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                const warehouseId = warehouseParam.id;

                const warehouseData = {
                    code: values.code,
                    name: values.name,
                    warehouseType: values.warehouseType,
                    processDetailId: warehouseParam.productionProcess.id,
                    hierarchyGroups: warehouseParam.hierarchyGroups.map((group) => ({
                        id: group.id,
                        code: group.code,
                        name: group.name,
                    })),
                    isActive: values.isActive,
                };
                try {
                    // 서버에 PUT 요청 전송하여 데이터 업데이트
                    const API_PATH = LOGISTICS_API.WAREHOUSE_UPDATE_API(warehouseId);
                    await apiClient.put(API_PATH, warehouseData);
                    setEditWarehouse(false);
                    // 성공 알림
                    notify('success', '창고 수정', '창고 수정이 성공적으로 수정되었습니다.', 'bottomRight');
                } catch (error) {
                    // 오류 알림
                    notify('error', '수정 실패', '창고를 수정하는 중 오류가 발생했습니다.', 'top');
                }
            },
            onCancel() {
                notification.warning({
                    message: '수정 취소',
                    description: '수정이 취소되었습니다.',
                    placement: 'bottomRight',
                });
            },
        });
    }


    const handleTabChange = (key) => {
        setActiveTabKey(key); // 선택된 탭으로 변경
    };

    const handleInputClick = (fieldName) => {
        setCurrentField(fieldName);
        setModalData(null);
        setInitialModalData(null);
        fetchModalData(fieldName);
        setIsModalVisible(true);
    }

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const fetchModalData = async (fieldName) => {
        setIsLoading(true);
        let apiPath;
        if (fieldName === 'productionProcess') apiPath = PRODUCTION_API.PROCESS_LIST_API;
        if (fieldName === 'hierarchyGroupName') apiPath = LOGISTICS_API.HIERARCHY_GROUP_LIST_API;

        try {
            const response = await apiClient.post(apiPath);

            let data = response.data;
            if (typeof data === 'string' && data.startsWith('[') && data.endsWith(']')) {
                data = JSON.parse(data);
            }

            const modalData = Array.isArray(data) ? data : [data];

            setModalData(modalData);
            setInitialModalData(modalData);

            // 트리 모든 노드의 키를 가져와 expandedKeys에 설정
            setExpandedKeys(getAllKeys(modalData));
        } catch (error) {
            notify('error', '조회 오류', '데이터 조회 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    }

    // 트리의 모든 키를 가져오는 함수
    const getAllKeys = (data) => {
        const keys = [];
        const findKeys = (nodes) => {
            nodes.forEach((node) => {
                keys.push(node.key); // key를 가져옵니다.
                if (node.children) findKeys(node.children);
            });
        };
        findKeys(data);
        return keys;
    };


    useEffect(() => {
        if (isModalVisible && modalData) {
            // 모달이 열릴 때 트리를 모두 펼칩니다.
            setExpandedKeys(getAllKeys(convertToTreeData(modalData)));
        }
    }, [isModalVisible, modalData]);

    const handleModalSelect = (record) => {
        if (currentField === 'productionProcess') {
            setWarehouseParam((prevParams) => ({
                ...prevParams,
                productionProcess: {
                    id: record.id,
                    code: record.code,
                    name: record.name,
                },
            }));
            setDisplayValues((prevValues) => ({
                ...prevValues,
                productionProcess: `[${record.code}] ${record.name}`,
            }));
            form.setFieldsValue({
                productionProcess: `[${record.code}] ${record.name}`,
            });
            setIsModalVisible(false); // productionProcess 선택 후 모달 닫기
        } else if (currentField === 'hierarchyGroupName') {
            // hierarchyGroupName 처리 부분 수정
            setWarehouseParam((prevParams) => ({
                ...prevParams,
                hierarchyGroups: [
                    ...(prevParams.hierarchyGroups || []),
                    {
                        id: record.id,
                        code: record.hierarchyGroupCode,
                        name: record.hierarchyGroupName,
                    },
                ],
            }));
            setDisplayValues((prevValues) => ({
                ...prevValues,
                hierarchyGroups: [
                    ...(prevValues.hierarchyGroups || []),
                    {
                        id: record.id,
                        code: record.hierarchyGroupCode,
                        name: record.hierarchyGroupName,
                    },
                ],
            }));
            // 여기서 form.setFieldsValue는 사용하지 않아 Input에 값이 들어가지 않게 함
        }
    };

    const fetchHierarchyGroups = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.post(LOGISTICS_API.HIERARCHY_GROUP_LIST_API);
            const data = response.data;

            const formattedData = Array.isArray(data) ? data : [data]; // 데이터가 배열이 아닌 경우 배열로 변환
            setHierarchyGroups(formattedData); // 가져온 데이터를 상태에 설정

            setExpandedKeys(getAllKeys(formattedData));

        } catch (error) {
            notify('error', '조회 오류', '계층 그룹 정보를 불러오는 중 오류가 발생했습니다.', 'top');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        setExpandedKeys(getAllKeys(convertToTreeData(hierarchyGroups)))
    }, [hierarchyGroups])

    // 계층 그룹 선택 함수
    const handleGroupSelect = async (selectedKeys, info) => {

        if (selectedKeys.length > 0) {
            const groupId = info.node.id; // 클릭한 계층 그룹 ID 가져오기
            setIsLoading(true);
            try {
                const response = await apiClient.post(LOGISTICS_API.HIERARCHY_GROUP_WAREHOUSES_API(groupId));
                setHierarchyWarehouseList(response.data); // 조회된 창고 목록 설정
            } catch (error) {
                notify('error', '창고 목록 조회 실패', '계층 그룹에 속한 창고 목록을 조회하는 중 오류가 발생했습니다.', 'top');
            } finally {
                setIsLoading(false);
            }
        }
    };


    // 트리 데이터를 변환하는 함수
    const convertToTreeData = (data, parentKey = '') =>
        data.map((item) => ({
            title: `[${item.hierarchyGroupCode}] ${item.hierarchyGroupName}`, // 표시될 제목
            key: `${parentKey}-${item.id.toString()}`, // 부모 key와 현재 id 결합
            id: item.id, // 각 노드에 id 추가
            hierarchyGroupCode: item.hierarchyGroupCode, // 코드 추가
            hierarchyGroupName: item.hierarchyGroupName, // 이름 추가
            children: item.childGroups ? convertToTreeData(item.childGroups, `${parentKey}-${item.id.toString()}`) : [],
        }));

    // Tree onCheck 핸들러 수정
    const handleTreeCheck = (checkedKeysValue, {checkedNodes}) => {
        setCheckedKeys(checkedKeysValue);
        const selectedGroups = checkedNodes.map(node => ({
            id: node.key,
            code: node.hierarchyGroupCode,
            name: node.hierarchyGroupName,
        }));
        setDisplayValues((prevValues) => ({
            ...prevValues,
            hierarchyGroups: selectedGroups,
        }));
    };

    const handleTagRemove = (id) => {
        setDisplayValues((prevValues) => ({
            ...prevValues,
            hierarchyGroups: prevValues.hierarchyGroups
                ? prevValues.hierarchyGroups.filter((group) => group.id !== id)
                : [],
        }));

        setWarehouseParam((prevParams) => ({
            ...prevParams,
            hierarchyGroups: prevParams.hierarchyGroups
                ? prevParams.hierarchyGroups.filter((group) => group.id !== id)
                : [],
        }));
    };


    useEffect(() => {
        if (!warehouseDetail) return;

        form.setFieldsValue({
            ...warehouseDetail,
            productionProcess: warehouseDetail.productionProcess
                ? `[${warehouseDetail.productionProcess.code}] ${warehouseDetail.productionProcess.name}`
                : '',
            hierarchyGroups: warehouseDetail.hierarchyGroups.map(group => ({
                id: group.id,
                code: group.code,
                name: group.name,
            })),
        });

        // displayValues 설정
        setDisplayValues({
            productionProcessDisplay: warehouseDetail.productionProcess
                ? `[${warehouseDetail.productionProcess.code}] ${warehouseDetail.productionProcess.name}`
                : '',
            hierarchyGroups: warehouseDetail.hierarchyGroups,
        });
    }, [warehouseDetail, form]);

    // activeTabKey가 "2"일 때 계층 그룹 목록 데이터를 가져옴
    useEffect(() => {
        if (activeTabKey === '2') {
            fetchHierarchyGroups();
        }
    }, [activeTabKey]);


    return (
        <Box sx={{margin: '20px'}} className="warehouse-registration-page">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <WelcomeSection
                        title="창고 등록"
                        description={(
                            <Typography className="welcome-section-description">
                                창고 등록 페이지는 <span>회사의 창고 정보를 관리</span>하는 페이지로, 창고를 <span>추가, 수정, 삭제</span>할 수 있음.
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
                    <Grid item xs={12} md={12} sx={{minWidth: '1000px !important', maxWidth: '1500px !important'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{height: '100%'}}>
                                <Typography variant="h6" sx={{padding: '20px'}}>창고 조회</Typography>
                                <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                    <Table
                                        dataSource={warehouseList}
                                        columns={[
                                            {
                                                title: <div className="title-text">창고 코드</div>,
                                                dataIndex: 'code',
                                                key: 'code',
                                                align: 'center'
                                            },
                                            {
                                                title: <div className="title-text">창고 이름</div>,
                                                dataIndex: 'name',
                                                key: 'name',
                                                align: 'center'
                                            },
                                            {
                                                title: <div className="title-text">창고 유형</div>,
                                                dataIndex: 'warehouseType',
                                                key: 'warehouseType',
                                                align: 'center',
                                                render: (type) => (
                                                    <Tag color={type === 'WAREHOUSE' ? 'green' : 'blue'}>
                                                        {type === 'WAREHOUSE' ? '창고' : '공장'}
                                                    </Tag>
                                                ),
                                            },
                                            {
                                                title: <div className="title-text">생산공정명</div>,
                                                dataIndex: 'productionProcess',
                                                key: 'productionProcess',
                                                align: 'center'
                                            },
                                            {
                                                title: <div className="title-text">활성화 여부</div>,
                                                dataIndex: 'isActive',
                                                key: 'isActive',
                                                align: 'center',
                                                render: (isActive) => (
                                                    <Tag color={isActive ? 'green' : 'red'}>
                                                        {isActive ? '사용중' : '사용중단'}
                                                    </Tag>
                                                ),
                                            },
                                        ]}
                                        rowKey={(record) => record.id}
                                        pagination={{
                                            pageSize: 15,
                                            position: ['bottomCenter'],
                                            showSizeChanger: false
                                        }}
                                        size="small"
                                        rowSelection={{
                                            type: 'radio',
                                            selectedRowKeys,
                                            onChange: (newSelectedRowKeys) => {
                                                setSelectedRowKeys(newSelectedRowKeys);
                                            }
                                        }}
                                        onRow={(record) => ({
                                            style: {cursor: 'pointer'},
                                            onClick: async () => {
                                                setSelectedRowKeys([record.id]); // 클릭한 행의 키로 상태 업데이트
                                                const id = record.id;
                                                try {
                                                    const response = await apiClient.post(LOGISTICS_API.WAREHOUSE_DETAIL_API(id));
                                                    setWarehouseParam(response.data);
                                                    setWarehouseDetail(response.data);
                                                    setModalData(null);
                                                    setEditWarehouse(true);
                                                    setDisplayValues({});
                                                    notify('success', '품목 조회', '품목 정보 조회 성공.', 'bottomRight')
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
                    {editWarehouse && (
                        <Grid item xs={12} md={12}
                              sx={{minWidth: '1000px !important', maxWidth: '1500px !important'}}>
                            <Grow in={true} timeout={200}>
                                <Paper elevation={3} sx={{height: '100%'}}>
                                    <Typography variant="h6" sx={{padding: '20px'}}>창고 상세 정보</Typography>
                                    <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                        <Form
                                            initialValues={warehouseDetail}
                                            form={form}
                                            onFinish={(values) => {
                                                handleFormSubmit(values);
                                            }}
                                        >
                                            <Form.Item name="code">
                                                <Input placeholder="창고 코드" addonBefore="창고 코드"/>
                                            </Form.Item>
                                            <Form.Item name="name">
                                                <Input placeholder="창고 이름" addonBefore="창고 이름"/>
                                            </Form.Item>
                                            <Form.Item name="warehouseType">
                                                <Space.Compact>
                                                    <Input style={{
                                                        width: '30%',
                                                        backgroundColor: '#FAFAFA',
                                                        color: '#000',
                                                        textAlign: 'center'
                                                    }} defaultValue="창고유형"/>
                                                    <Select
                                                        style={{width: '60%'}}
                                                        value={warehouseDetail.warehouseType}
                                                        onChange={(value) => {
                                                            setWarehouseParam((prevState) => ({
                                                                ...prevState,
                                                                warehouseType: value
                                                            }))
                                                        }}
                                                    >
                                                        <Option value="WAREHOUSE">창고</Option>
                                                        <Option value="FACTORY">공장</Option>
                                                        <Option value="OUTSOURCING_FACTORY">외주 공장</Option>
                                                    </Select>
                                                </Space.Compact>
                                            </Form.Item>
                                            <Form.Item name="productionProcess">
                                                <Input
                                                    addonBefore="생산공정"
                                                    value={displayValues.productionProcessDisplay || ''}
                                                    onClick={() => handleInputClick('productionProcess')}
                                                    onFocus={(e) => e.target.blur()}
                                                    suffix={<DownSquareOutlined/>}
                                                />
                                            </Form.Item>
                                            <Form.Item name="hierarchyGroupName">
                                                <Input
                                                    addonBefore="계층그룹"
                                                    onClick={() => handleInputClick('hierarchyGroupName')} // 클릭 시 모달 표시
                                                    prefix={
                                                        displayValues.hierarchyGroups && displayValues.hierarchyGroups.length > 0
                                                            ? displayValues.hierarchyGroups.map((group) => (
                                                                <Tag
                                                                    key={group.id}
                                                                    color="blue"
                                                                    closable={true} // closable을 true로 설정
                                                                    onClose={() => handleTagRemove(group.id)} // 태그 삭제 핸들러 추가
                                                                >
                                                                    [{group.code}] {group.name}
                                                                </Tag>
                                                            ))
                                                            : null // 선택된 항목이 없을 때는 태그가 표시되지 않음
                                                    }
                                                    value="" // Input의 value를 비워둬서 텍스트로 들어가지 않도록 함
                                                    onFocus={(e) => e.target.blur()}
                                                    suffix={<DownSquareOutlined/>}
                                                />
                                            </Form.Item>
                                            <Form.Item name="isActive" valuePropName="checked">
                                                <Checkbox>활성화 여부</Checkbox>
                                            </Form.Item>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                marginBottom: '20px'
                                            }}>
                                                <Button type="primary" htmlType="submit">
                                                    저장
                                                </Button>
                                            </Box>
                                            <Modal
                                                open={isModalVisible}
                                                onCancel={handleModalCancel}
                                                width="40vw"
                                                footer={null}
                                            >
                                                {isLoading ? (
                                                    <Spin/>
                                                ) : (
                                                    <>
                                                        {currentField === 'productionProcess' && (
                                                            <>
                                                                <Typography id="modal-modal-title" variant="h6"
                                                                            component="h2"
                                                                            sx={{marginBottom: '20px'}}>
                                                                    생산공정 선택
                                                                </Typography>
                                                                <Input
                                                                    placeholder="검색"
                                                                    prefix={<SearchOutlined/>}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value.toLowerCase(); // 입력값을 소문자로 변환
                                                                        if (!value) {
                                                                            setModalData(initialModalData);
                                                                        } else {
                                                                            const filtered = initialModalData.filter((item) => {
                                                                                return (
                                                                                    (item.id && item.id.toString().toLowerCase().includes(value)) ||
                                                                                    (item.printClientName && item.printClientName.toLowerCase().includes(value))
                                                                                );
                                                                            });
                                                                            setModalData(filtered);
                                                                        }
                                                                    }}
                                                                    style={{marginBottom: 16}}
                                                                />
                                                                {modalData && (
                                                                    <>
                                                                        <Table
                                                                            columns={[
                                                                                {
                                                                                    title: '코드',
                                                                                    dataIndex: 'code',
                                                                                    key: 'code',
                                                                                    align: 'center'
                                                                                },
                                                                                {
                                                                                    title: '이름',
                                                                                    dataIndex: 'name',
                                                                                    key: 'name',
                                                                                    align: 'center'
                                                                                }
                                                                            ]}
                                                                            dataSource={modalData}
                                                                            rowKey="id"
                                                                            size="small"
                                                                            pagination={{
                                                                                pageSize: 15,
                                                                                position: ['bottomCenter'],
                                                                                showSizeChanger: false
                                                                            }}
                                                                            onRow={(record) => ({
                                                                                style: {cursor: 'pointer'},
                                                                                onClick: () => handleModalSelect(record) // 선택 시 처리
                                                                            })}
                                                                        />
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                        // Modal 내부 Tree 설정 부분 수정
                                                        {currentField === 'hierarchyGroupName' && (
                                                            <>
                                                                <Typography id="modal-modal-title" variant="h6"
                                                                            component="h2"
                                                                            sx={{marginBottom: '20px'}}>
                                                                    계층그룹 선택
                                                                </Typography>
                                                                <Input
                                                                    placeholder="검색"
                                                                    prefix={<SearchOutlined/>}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value.toLowerCase();
                                                                        if (!value) {
                                                                            setModalData(initialModalData);
                                                                        } else {
                                                                            const filtered = initialModalData.filter((item) => {
                                                                                return (
                                                                                    (item.id && item.id.toString().toLowerCase().includes(value)) ||
                                                                                    (item.printClientName && item.printClientName.toLowerCase().includes(value))
                                                                                );
                                                                            });
                                                                            setModalData(filtered);
                                                                        }
                                                                    }}
                                                                    style={{marginBottom: 16}}
                                                                />
                                                                {modalData && (
                                                                    <>
                                                                        <Tree
                                                                            checkable
                                                                            checkStrictly={true} // 상위-하위 개별 선택이 가능하도록 설정
                                                                            expandedKeys={expandedKeys}
                                                                            checkedKeys={checkedKeys}
                                                                            onExpand={(keys) => setExpandedKeys(keys)}
                                                                            onCheck={handleTreeCheck} // 수정된 핸들러 사용
                                                                            treeData={convertToTreeData(modalData)}
                                                                        />

                                                                    </>
                                                                )}
                                                            </>
                                                        )}

                                                        <Box sx={{
                                                            mt: 2,
                                                            display: 'flex',
                                                            justifyContent: 'flex-end',
                                                            gap: 1
                                                        }}>
                                                            <Button onClick={handleModalCancel} variant="contained"
                                                                    type="danger" sx={{mr: 1}}>
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
                <Grid sx={{padding: '0px 20px 0px 20px'}} container spacing={3}>
                            <Grid item xs={12} md={4} sx={{minWidth: '400px !important', maxWidth: '500px !important'}}>
                                <Grow in={true} timeout={200}>
                                    <Paper elevation={3} sx={{height: '100%'}}>
                                        <Typography variant="h6" sx={{padding: '20px'}}>계층 그룹 목록</Typography>
                                        <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                            <Tree
                                                style={{marginBottom: '20px'}}
                                                expandedKeys={expandedKeys}
                                                onExpand={(keys) => setExpandedKeys(keys)}
                                                treeData={convertToTreeData(hierarchyGroups)}
                                                onSelect={handleGroupSelect} // 계층 그룹 클릭 이벤트
                                            />
                                        </Grid>
                                    </Paper>
                                </Grow>
                            </Grid>
                    <Grid item xs={12} md={6}
                          sx={{minWidth: '400px !important', maxWidth: '800px !important'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{height: '100%'}}>
                                <Typography variant="h6" sx={{padding: '20px'}}>창고 목록</Typography>
                                <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                    <Table
                                        dataSource={hierarchyWarehouseList}
                                        columns={[
                                            {
                                                title: <div className="title-text">창고 유형</div>,
                                                dataIndex: 'warehouseType',
                                                key: 'warehouseType',
                                                align: 'center',
                                                render: (type) => (
                                                    <Tag color={type === 'WAREHOUSE' ? 'green' : 'blue'}>
                                                        {type === 'WAREHOUSE' ? '창고' : '공장'}
                                                    </Tag>
                                                ),
                                            },
                                            {
                                                title: <div className="title-text">창고 코드</div>,
                                                        dataIndex: 'warehouseCode',
                                                        key: 'warehouseCode',
                                                        align: 'center',
                                                    },
                                                    {
                                                        title: <div className="title-text">창고 이름</div>,
                                                        dataIndex: 'warehouseName',
                                                        key: 'warehouseName',
                                                        align: 'center',
                                                    }
                                                ]}
                                                rowKey={(record) => record.id}
                                                pagination={{pageSize: 15, position: ['bottomCenter'], showSizeChanger: false}}
                                                size="small"
                                            />
                                        </Grid>
                                    </Paper>
                                </Grow>
                            </Grid>
                </Grid>
            )}

        </Box>
    );
};
;

export default WarehouseRegistrationPage;