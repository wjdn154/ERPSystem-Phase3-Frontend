import React, {useEffect, useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../../components/WelcomeSection.jsx';
import {Typography} from '@mui/material';
import {Button, Col, Modal, Row} from 'antd';
import TemporarySection from "../../../../../components/TemporarySection.jsx";
import {useProcessDetails} from "../ProcessDetailsHook.jsx";
import SearchBar from "./SearchBar.jsx";
import ProcessDetailsListSection from "../ProcessDetailsListSection.jsx";
import SelectedProcessDetailsSection from "../SelectedProcessDetailsSection.jsx";
import {getRowClassName, tabItems, processDetailsColumn} from "../ProcessDetailsUtil.jsx";

const PrevProcessDetailsPage = ({ initialData }) => {

    const [activeTabKey, setActiveTabKey] = useState('1');
    const {
        data,
        processDetail,
        handleSave,
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

    useEffect(() => {
        console.log("현재 activeTabKey: ", activeTabKey);
    }, [activeTabKey]);

    const handleTabChange = (key) => {
        console.log("Tab 변경됨:", key);  // 디버그 로그 추가
        setActiveTabKey(key);
    };

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="공정세부정보 관리"
                        description={(
                            <Typography>
                                공정세부정보 관리 페이지는 <span>각 제품의 공정에 필요한 세부 정보를 관리</span>하는 곳임. 이 페이지에서는 <span>공정 단계, 소요 시간, 필요 설비</span> 등을 입력하고 관리할 수 있음. 제품의 <span>생산 흐름</span>을 최적화하기 위해 공정 정보를 체계적으로 정리하고, <span>각 공정의 효율성</span>을 분석할 수 있음.
                            </Typography>
                        )}
                        tabItems={tabItems()}
                        activeTabKey={activeTabKey}
                        handleTabChange={handleTabChange}
                    />
                </Grid>
            </Grid>

            {activeTabKey === '1' && (
                <Grid sx={{ padding: '0px 20px 0px 20px', minWidth: '1400px !important', maxWidth: '1700px' }} container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{ height: '100%' }}>
                                {/*/!* 검색 바 *!/*/}
                                {/*<Row gutter={16} style={{marginBottom: '16px'}}>*/}
                                {/*    <Col span={8}>*/}
                                {/*        <SearchBar onSearch={handleSearch}/>*/}
                                {/*    </Col>*/}
                                {/*</Row>*/}

                                {/*/!* 검색 결과 목록 또는 경고 메시지 *!/*/}
                                {/*{isSearchActive && (*/}
                                {/*    <>*/}
                                {/*        {searchData && searchData.length > 0 ? (*/}
                                {/*            <Row gutter={16} style={{marginBottom: '16px'}}>*/}
                                {/*                <Col span={24}>*/}
                                {/*                    <ProcessDetailsListSection*/}
                                {/*                        columns={processDetailsColumn}*/}
                                {/*                        data={searchData}*/}
                                {/*                        handleSelectedRow={handleSelectedRow}*/}
                                {/*                        rowClassName={getRowClassName}*/}
                                {/*                    />*/}
                                {/*                </Col>*/}
                                {/*            </Row>*/}
                                {/*        ) : (*/}
                                {/*            <Text type="warning">검색하신 공정명을 찾을 수 없습니다.</Text>*/}
                                {/*        )}*/}
                                {/*    </>*/}
                                {/*)}*/}

                                {/* 기본 데이터 목록 */}
                                <Typography variant="h6" sx={{ padding: '20px' }} >생산공정 목록</Typography>
                                <Grid sx={{ padding: '0px 20px 0px 20px' }}>
                                    <Row gutter={16}
                                         style={{marginTop: isSearchActive && searchData && searchData.length > 0 ? '16px' : '0'}}>
                                        <Col span={24}>
                                            <ProcessDetailsListSection
                                                columns={processDetailsColumn}
                                                data={data}
                                                handleSelectedRow={handleSelectedRow}
                                                rowClassName={getRowClassName}
                                            />
                                        </Col>
                                    </Row>
                                    {/* 모달 컴포넌트 */}
                                    {processDetail && (
                                        <Modal
                                            visible={isProcessModalVisible} // 모달 상태에 따라 표시
                                            onCancel={handleClose} // 모달을 닫는 함수
                                            footer={null} // 모달의 하단 버튼 제거
                                        >
                                            <SelectedProcessDetailsSection
                                                processDetail={processDetail}
                                                handleClose={handleClose}
                                                handleInputChange={handleInputChange}
                                                handleSave={handleSave}
                                                handleDeleteProcessDetail={handleDeleteProcessDetail}
                                            />
                                        </Modal>
                                    )}
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

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

export default PrevProcessDetailsPage;