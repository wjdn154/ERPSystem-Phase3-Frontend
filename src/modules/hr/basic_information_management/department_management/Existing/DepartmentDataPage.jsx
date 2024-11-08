import React, {useMemo} from 'react';
import { Box, Grid, Grow } from '@mui/material';
import {departmentDataHook} from "./DepartmentDataHook.jsx"
import DepartmentDataListSection from "./DepartmentDataListSection.jsx"
import {departmentDataListColumn} from "./DepartmentDataListColumn.jsx"

const DepartmentDataPage = ({initialData}) => {

    const departmentMemoizedData = useMemo(() => initialData, [initialData])

    const{
        data,
        showDetail,
        handleSelectedRow,
        handleRowSelection,
        departmentDataDetail,
        setDepartmentDataDetail

    } = departmentDataHook(initialData);
    console.log('rendered data:',data);

    return (
        <Box sx={{flewGrow: 1, p:3}}>
            <Grid container spacing={2} sx={{marginTop: 2}}>
                {/* 부서정보 리스트 영역 */}
                <Grid item xs={12}>
                    <Grow in={true} timeout={200}>
                        <div>
                            <DepartmentDataListSection
                                columns={departmentDataListColumn}
                                data={data}
                                handleRowSelection={{handleRowSelection}}
                                handleSelectedRow={{handleSelectedRow}}
                            />
                        </div>
                    </Grow>
                </Grid>
            </Grid>
            {/* 부서정보 상세 영역 */}
            {showDetail && ( // showDetail이 true일 때만 렌더링
                <Grid item xs={12}>
                    <Grow in={showDetail} timeout={200} key={departmentDataDetail?.id}>
                        <div>
                            {departmentDataDetail && (
                                <DepartmentDataDetailSection
                                    data={data}
                                    usersDataDetail={departmentDataDetail}
                                    handlePopupClick={handlePopupClick}
                                    isFinancialStatementModalVisible={isFinancialStatementModalVisible}
                                    isRelationCodeModalVisible={isRelationCodeModalVisible}
                                    handleClose={handleClose}
                                    selectFinancialStatement={selectFinancialStatement}
                                    handleInputChange={handleInputChange}
                                    handleInputChange2={handleInputChange2}
                                    handleDeleteMemo={handleDeleteMemo}
                                    handleAddNewMemo={handleAddNewMemo}
                                    setEquipmentDataDetail={setEquipmentDataDetail}
                                    selectRelationCode={selectRelationCode}
                                    handleSave={handleSave}
                                    deleteRelationCode={deleteRelationCode}
                                />
                            )}
                        </div>
                    </Grow>
                </Grid>
            )}
        </Box>
    )
}

export default DepartmentDataPage;