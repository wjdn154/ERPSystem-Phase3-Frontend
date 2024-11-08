import React, {useMemo} from "react";
import {Box, Grid, Grow, Typography} from "@mui/material";
import {workerHook} from './WorkerHook.jsx';
import WorkerListSection from "./WorkerListSection.jsx";
import {workerListColumn} from "./WorkerListColumn.jsx"
import WelcomeSection from "../../../../components/WelcomeSection.jsx";
import {workerTabItems} from "./WorkerUtil.jsx";
import WorkerAttendanceListSection from "./WorkerAttendanceListSection.jsx";
import {workerAttendanceListColumn} from "./WorkerAttendanceListColumn.jsx";
import {workerListSecondColumn} from "./WorkerListSecondColumn.jsx";
import WorkerDetailSection from "./WorkerDetailSection.jsx";


const WorkerPage = ({initialData}) => {

    const workerMemoizedData = useMemo(() => initialData, [initialData]);
    console.log(initialData);


    const {
        data,
        showDetail,
        selectedRow,
        handleSelectedRow,
        handleRowSelection,
        workerDetail,
        setWorkerDetail,
        handleInputChange,
        showUpdateModal,
        handleUpdateOk,
        handleUpdateCancel,
        isUpdateModalVisible,
        activeTabKey,
        handleTabChange,
        handleSelectedAttendanceRow,
        setWorkerAttendanceDetail,
        workerAttendanceDetail,
        handleUpdate,

    } = workerHook(initialData);


    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
           {/*       sx={{ marginTop: 2 }}*/}
           {/*       justifyContent="center"  // 수평 중앙 정렬*/}
           {/*       alignItems="center"      // 수직 중앙 정렬*/}
           {/*>*/}
                    <Grid item xs={12} md={12}>
                        <WelcomeSection
                            title="작업자 관리"
                            description={(
                                <Typography>
                                    작업자 관리 페이지는 <span>생산 현장에서 일하는 작업자의 정보</span>를 관리하는 곳임.
                                    이 페이지에서는 <span>작업자 수정</span>이 가능하며, 각 작업자의 <span>역할, 담당 공정, 근무 시간</span> 등을 기록을 확인할 수 있음. <br/>작업자들의
                                    배치와 작업량을 효율적으로 조정하여 <span>생산성과 작업 효율성</span>을 극대화하는 데 도움이 됨.
                                </Typography>
                            )}
                            tabItems={workerTabItems()}
                            activeTabKey={activeTabKey}
                            handleTabChange={handleTabChange}
                        />
                    </Grid>
                </Grid>

                {/* 작업자 목록 및 상세내용 영역 */}
                {activeTabKey === '1' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={10} md={10}>
                        <Grow in={true} timeout={200}>
                            <div>
                                <WorkerListSection
                                    columns={workerListColumn}
                                    data={data}
                                    workerDetail={workerDetail}
                                    setWorkerDetail={setWorkerDetail}
                                    handleRowSelection={handleRowSelection}
                                    handleSelectedRow={handleSelectedRow}
                                    handleUpdateOk={handleUpdateOk}
                                    handleUpdateCancel={handleUpdateCancel}
                                    isUpdateModalVisible={isUpdateModalVisible}
                                    handleInputChange={handleInputChange}
                                    showUpdateModal={showUpdateModal}
                                />
                            </div>
                        </Grow>
                    </Grid>
                    {workerDetail &&(
                    <Grid item xs={10} md={10}>
                        <Grow in={true} timeout={200}>
                            <div>
                                <WorkerDetailSection
                                    columns={workerListColumn}
                                    data={data}
                                    workerDetail={workerDetail}
                                    setWorkerDetail={setWorkerDetail}
                                    handleRowSelection={handleRowSelection}
                                    handleSelectedRow={handleSelectedRow}
                                    handleUpdateOk={handleUpdateOk}
                                    handleUpdateCancel={handleUpdateCancel}
                                    isUpdateModalVisible={isUpdateModalVisible}
                                    handleInputChange={handleInputChange}
                                    showUpdateModal={showUpdateModal}
                                    handleUpdate={handleUpdate}
                                />
                            </div>
                        </Grow>
                    </Grid>
                        )}
                </Grid>

            )}

            {/* 작업자 작업배치 및 근태목록 영역 */}
            {activeTabKey === '2' &&  (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12}>
                        <Grow in={true} timeout={200}>
                            <div>
                                <WorkerAttendanceListSection
                                    columns={workerListSecondColumn}
                                    workerAttendanceListColumn={workerAttendanceListColumn}
                                    data={data}
                                    workerDetail={workerDetail}
                                    setWorkerDetail={setWorkerDetail}
                                    handleRowSelection={handleRowSelection}
                                    handleSelectedAttendanceRow={handleSelectedAttendanceRow}
                                    handleUpdateOk={handleUpdateOk}
                                    handleUpdateCancel={handleUpdateCancel}
                                    isUpdateModalVisible={isUpdateModalVisible}
                                    handleInputChange={handleInputChange}
                                    showUpdateModal={showUpdateModal}
                                    setWorkerAttendanceDetail={setWorkerAttendanceDetail}
                                    workerAttendanceDetail={workerAttendanceDetail}
                                />
                            </div>
                        </Grow>
                    </Grid>
                </Grid>
            )}
        </Box>
    )
}




export default WorkerPage;