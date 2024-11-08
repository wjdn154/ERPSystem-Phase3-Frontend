import React, {useMemo} from 'react';
import { Box, Grid, Grow } from '@mui/material';
import {usersDataHook} from "./UsersDataHook.jsx";
import UsersDataListSection from "./UsersDataListSection.jsx";
import {usersDataListColumn} from "./UsersDataListColumn.jsx";
//import UsersDataDetailSection from "../components/Users/UsersDataDetailSection.jsx";
//import {getRowClassName} from "../utils/UsersData/UsersDataListColumn.jsx";



const UsersDataPage = ({initialData}) => {

    const usersMemoizedData = useMemo(() => initialData, [initialData]);

    const{
        data,
        showDetail,
        handleSelectedRow,
        handleRowSelection,
        usersDataDetail,
        setUsersDataDetail

    } = usersDataHook(initialData);

    return (
        <Box sx={{flewGrow: 1, p:3}}>
            <Grid container spacing={2} sx={{marginTop: 2}}>
                {/* 사용자정보 리스트 영역 */}
                <Grid item xs={12}>
                    <Grow in={true} timeout={200}>
                        <div>
                            <UsersDataListSection
                                columns={usersDataListColumn}
                                data={data}
                                handleRowSelection={{handleRowSelection}}
                                handleSelectedRow={{handleSelectedRow}}
                            />
                        </div>
                    </Grow>
                </Grid>
            </Grid>

            {/* 사용자정보 상세 영역 */}
            {showDetail && ( // showDetail이 true일 때만 렌더링
                <Grid item xs={12}>
                    <Grow in={showDetail} timeout={200} key={usersDataDetail?.id}>
                        <div>
                            {usersDataDetail && (
                                <UsersDataDetailSection
                                    data={data}
                                    usersDataDetail={usersDataDetail}
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

export default UsersDataPage;