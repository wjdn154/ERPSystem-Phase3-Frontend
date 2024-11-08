import React, { useMemo } from 'react';
import {Box, Grid, Grow, Typography} from '@mui/material';
import AccountSubjectStructureSection from './AccountSubjectStructureSection.jsx';
import AccountSubjectListSection from './AccountSubjectListSection.jsx';
import SelectedAccountSubjectDetailSection from './SelectedAccountSubjectDetailSection.jsx';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { accountSubjectHook } from './AccountSubjectHook.jsx';
import { accountSubjectColumn } from './AccountSubjectColumn.jsx';
import { getRowClassName } from './AccountSubjectUtil.jsx';
import { Button } from 'antd';
import {tabItems} from "./AccountSubjectUtil.jsx";

const AccountSubjectPage = ({ initialData }) => {
    const memoizedData = useMemo(() => initialData, [initialData]);
    const {
        data,
        accountSubjectDetail,
        setAccountSubjectDetail,
        handleRowSelection,
        handleInputChange,
        handleInputChange2,
        handleAddNewMemo,
        handleDeleteMemo,
        handleSelectedRow,
        handlePopupClick,
        isFinancialStatementModalVisible,
        isRelationCodeModalVisible,
        isNatureModalVisible,
        handleClose,
        selectFinancialStatement,
        selectRelationCode,
        selectNature,
        handleSave,
        showDetail,
        deleteRelationCode,
        handleTabChange,
        activeTabKey, // 탭 상태
    } = accountSubjectHook(initialData);

    return (
        <Box sx={{ margin: '20px' }}>
            {/* 계정과목 관리 제목과 환영 메시지 */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="계정과목관리"
                        description={(
                            <Typography>
                                계정과목관리 페이지는 재무 관리 시스템에서{' '}
                                <span>계정과목과 적요</span>
                                (거래의 내역이나 설명)를 <span>관리하고 등록</span>하는 중요한 기능을 제공하는 페이지임.
                                <br/>
                                이 페이지는 기업의 재무 데이터를 정확하게 기록하고 관리하는 데 필수적인 역할을 함.
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
                    {/* 계정과목 리스트 영역 */}
                    <Grid item xs={12} md={5} sx={{ minWidth: '600px !important', maxWidth: '800px !important' }}>
                        <Grow in={true} timeout={200}>
                            <div>
                                <AccountSubjectListSection
                                    accountSubjectColumn={accountSubjectColumn}
                                    data={data}
                                    handleRowSelection={handleRowSelection}
                                    handleSelectedRow={handleSelectedRow}
                                    rowClassName={getRowClassName}
                                />
                            </div>
                        </Grow>
                    </Grid>
                    {/* 계정과목 상세 영역 */}
                    <Grid item xs={12} md={6} sx={{ minWidth: '500px !important', maxWidth: '700px !important' }}>
                        <Grow in={showDetail} timeout={200} key={accountSubjectDetail?.code}>
                            <div>
                                {accountSubjectDetail && (
                                    <SelectedAccountSubjectDetailSection
                                        data={data}
                                        accountSubjectDetail={accountSubjectDetail}
                                        handlePopupClick={handlePopupClick}
                                        isFinancialStatementModalVisible={isFinancialStatementModalVisible}
                                        isRelationCodeModalVisible={isRelationCodeModalVisible}
                                        isNatureModalVisible={isNatureModalVisible}
                                        handleClose={handleClose}
                                        selectFinancialStatement={selectFinancialStatement}
                                        handleInputChange={handleInputChange}
                                        handleInputChange2={handleInputChange2}
                                        handleDeleteMemo={handleDeleteMemo}
                                        handleAddNewMemo={handleAddNewMemo}
                                        setAccountSubjectDetail={setAccountSubjectDetail}
                                        selectRelationCode={selectRelationCode}
                                        selectNature={selectNature}
                                        handleSave={handleSave}
                                        deleteRelationCode={deleteRelationCode}
                                    />
                                )}
                            </div>
                        </Grow>
                    </Grid>
                </Grid>
            )}

            {/* activeTabKey가 2일 때 새로운 레이아웃을 보여줌 */}
            {activeTabKey === '2' && (
                /* 계정과목 체계 영역 */
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={5} sx={{ minWidth: '500px !important', maxWidth: '700px !important' }}>
                        <Grow in={true} timeout={200}>
                            <div>
                                <AccountSubjectStructureSection data={data} />
                            </div>
                        </Grow>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default AccountSubjectPage;