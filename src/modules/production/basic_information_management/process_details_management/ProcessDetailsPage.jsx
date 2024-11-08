import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import {Typography} from '@mui/material';
import {Button, Col, Form, Modal, notification, Row, Table} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import {useProcessDetails} from "./ProcessDetailsHook.jsx";
import SelectedProcessDetailsSection from "./SelectedProcessDetailsSection.jsx";
import {getRowClassName, tabItems, processDetailsColumn, removeComma} from "./ProcessDetailsUtil.jsx";
import {useNotificationContext} from "../../../../config/NotificationContext.jsx";
import {fetchProcessDetail} from "./ProcessDetailsApi.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {PRODUCTION_API} from "../../../../config/apiConstants.jsx";
import {fetchProcessDetails } from "./ProcessDetailsApi.jsx";

const ProcessDetailsPage = ({ initialData }) => {

    const notify = useNotificationContext(); // 알림 컨텍스트 사용
    const [form] = Form.useForm(); // 폼 인스턴스 생성
    const [registrationForm] = Form.useForm(); // 폼 인스턴스 생성
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 상태 관리
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const [displayValues, setDisplayValues] = useState({});
    const [processDetailsData, setProcessDetailsData] = useState(null); // 선택된 데이터 관리
    const [processDetailsParam, setProcessDetailsParam] = useState({});
    const [processList, setProcessList] = useState([]);

    const {
        data,
        setData,
        handleSelectedRow,
        handleDeleteProcessDetail,
        isProcessModalVisible,
        handleClose,
        handleInputChange,
        handleAddProcess,
        handleSearch,
        searchData,
        isSearchActive,

    } = useProcessDetails(initialData);

    const reloadProcessList = async () => {
        try {
            const fetchedData  = await fetchProcessDetails(); // 리스트 조회
            setProcessList(fetchedData ); // 상태 갱신
            setData(fetchedData ); // 테이블에 사용되는 데이터 상태도 갱신
        } catch (error) {
            console.error('리스트 갱신 실패:', error);
            notify('error', '리스트 갱신 실패', '공정 리스트를 갱신하는 중 오류가 발생했습니다.', 'top');
        }
    };


    useEffect(() => {
        console.log("현재 activeTabKey: ", activeTabKey);
    }, [activeTabKey]);

    const handleTabChange = (key) => {
        console.log("Tab 변경됨:", key);  // 디버그 로그 추가
        setActiveTabKey(key);
    };

    const handleFormSubmit = async (values, type) => {
        console.log('폼 제출 값:', values); // 객체 내용 확인
        if (typeof values !== 'object') {
            console.error('Error: values가 객체가 아님', values);
            return;
        }
        Modal.confirm({
            title: '저장 확인',
            // content: `저장할 데이터: ${JSON.stringify(values, null, 2)}`, // 객체를 JSON 문자열로 변환
            content: '정말로 저장하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                try {
                    // API 경로 선택 (저장 / 업데이트)
                    const API_PATH = type === 'update'
                        ? PRODUCTION_API.UPDATE_PROCESS_API(values.code)
                        : PRODUCTION_API.SAVE_PROCESS_API;

                    // 불필요한 값 정리 및 변환
                    const preparedValues = {
                        ...values,
                        defectRate: parseFloat(values.defectRate),  // 불량률을 숫자로 변환
                        cost: removeComma(values.cost), // 콤마 제거 후 숫자로 변환
                        duration: parseFloat(values.duration),  // 소요시간 실수 변환
                        isOutsourced: !!values.isOutsourced,  // Boolean 변환 명시적 적용
                        isUsed: values.isUsed || false,  // 사용 여부 기본값 처리
                    };
                    console.log('preparedValues 전송할 데이터:', preparedValues); // API에 전달될 값 로그

                    // API 호출 및 데이터 처리
                    const response = await apiClient.post(API_PATH, preparedValues);
                    const updatedProcessDetail = response.data;

                    console.log('updatedProcessDetail 응답 데이터:', updatedProcessDetail); // API 응답 확인


                    // 성공 알림 및 상태 업데이트
                    setProcessDetailsData((prev) => ({
                        ...prev,
                        ...updatedProcessDetail,
                    }));

                    await reloadProcessList(); // 새롭게 추가된 부분


                    notify(
                        'success',
                        type === 'update' ? '공정 수정 성공' : '공정 저장 성공',
                        '공정 정보가 성공적으로 처리되었습니다.',
                        'bottomRight'
                    );

                    // 폼 초기화 (필요한 경우)
                    form.resetFields();

                } catch (error) {
                    console.error('저장 실패:', error);
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


    // console.log('ProcessDetailsPage processDetail:', processDetail);
    console.log('ProcessDetailsPage processDetailsData:', processDetailsData);
    // console.log('ProcessDetailsPage selectedProcessDetail:', selectedProcessDetail);

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="공정세부정보 관리"
                        description={(
                            <Typography>
                                공정세부정보 관리 페이지는 <span>각 제품의 공정에 필요한 세부 정보를 관리</span>하는 곳임. 이 페이지에서는 <span>공정 비용, 소요 시간, 필요 설비</span> 등을 입력하고 관리할 수 있음. 제품의 <span>생산 흐름</span>을 최적화하기 위해 공정 정보를 체계적으로 정리하고, <span>각 공정의 효율성</span>을 분석할 수 있음.
                            </Typography>
                        )}
                        tabItems={tabItems()}
                        activeTabKey={activeTabKey}
                        handleTabChange={handleTabChange}
                    />
                </Grid>
            </Grid>

            {activeTabKey === '1' && (
                <Grid sx={{ padding: '0px 20px 0px 20px', minWidth: '700px !important', maxWidth: '1200px' }} container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                {/* 기본 데이터 목록 */}
                                <Typography variant="h6" sx={{ padding: '20px' }} >생산공정 목록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Table
                                        columns={processDetailsColumn}
                                        dataSource={data}
                                        // dataSource={processList} // 수정된 리스트로 데이터 소스 변경
                                        rowClassName={getRowClassName}
                                        pagination={{ pageSize: 15, position: ['bottomCenter'], showSizeChanger: false }}
                                        size="small"
                                        rowKey="code"
                                        rowSelection={{
                                            type: 'radio', // 선택 방식 (radio or checkbox)
                                            selectedRowKeys: selectedRowKeys, // 선택된 행의 키들
                                            onChange: (newSelectedRowKeys) => {
                                                console.log('새로운 Row Keys:', newSelectedRowKeys); // 디버그용 로그
                                                setSelectedRowKeys(newSelectedRowKeys); // 선택된 행의 키 업데이트
                                            },
                                        }}
                                        onRow={(record) => ({
                                            style: { cursor: 'pointer' },
                                            onClick: async () => {
                                                setSelectedRowKeys([record.code]); // 클릭한 행의 키로 상태 업데이트
                                                console.log('selectedRowKeys: ', selectedRowKeys);
                                                try {
                                                    // 공정 상세 정보 가져오기 (API 호출)
                                                    const detail = await fetchProcessDetail([record.code]);
                                                    console.log('onRow fetchProcessDetail 응답 데이터:', detail);

                                                    setProcessDetailsData(detail); // 선택된 작업장 데이터 설정
                                                    // setProcessDetailsParam(detail);
                                                    notify('success', '조회', '생산공정 정보 조회 성공.', 'bottomRight');
                                                } catch (error) {
                                                    console.error("생산공정 정보 조회 실패:", error);
                                                    notify('error', '조회 오류', '생산공정 정보 조회 중 오류가 발생했습니다.', 'top');
                                                }
                                                // handleFormSubmit(record);
                                            },
                                        })}
                                    />
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                    {/* 생산공정 등록 및 수정 */}
                    {processDetailsData && (
                        <SelectedProcessDetailsSection
                            // key={processDetailsData.code}
                            processDetailsData={processDetailsData}
                            setProcessDetailsData={setProcessDetailsData} // 상태 변경 함수 전달
                            handleInputChange={handleInputChange}
                            handleClose={() => setProcessDetailsData(null)} // 닫기 핸들러
                            handleSelectedRow={handleSelectedRow}
                            handleDeleteProcessDetail={handleDeleteProcessDetail}
                            rowClassName={getRowClassName}
                            handleFormSubmit={handleFormSubmit}
                        />
                    )}
                </Grid>
            )}

            {/*{activeTabKey === '2' && (*/}
            {/*    <Grid sx={{padding: '0px 20px 0px 20px'}} container spacing={3}>*/}
            {/*        <Grid item xs={12} md={5} sx={{minWidth: '500px !important', maxWidth: '700px !important'}}>*/}
            {/*            <Grow in={true} timeout={200}>*/}
            {/*                <div>*/}
            {/*                    <TemporarySection/>*/}
            {/*                </div>*/}
            {/*            </Grow>*/}
            {/*        </Grid>*/}
            {/*    </Grid>*/}
            {/*)}*/}

        </Box>
    );
};

export default ProcessDetailsPage;