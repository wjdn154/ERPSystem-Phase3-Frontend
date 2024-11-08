import React, {useMemo, useState} from 'react';
import { Box, Grid, Grow } from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import { tabItems } from './VoucherListUtil.jsx';
import {Typography} from '@mui/material';
import {Button} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";

const VoucherListPage = () => {
    const [activeTabKey, setActiveTabKey] = useState('1');

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    return (
        <Box sx={{ margin: '20px' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="전표 조회"
                        description={(
                            <Typography>
                                전표 조회 페이지는 <span>각종 전표를 조회</span>하는 데 사용됨. 기업의 다양한 거래 내역을 전표 형태로 기록하며, 사용자는 <span>입력된 전표를 손쉽게 검색하고 확인</span>할 수 있음.<br/>
                                전표는 <span>매출, 매입, 경비 처리</span>와 같은 재무 활동을 기록하는 중요한 문서로, 정확한 재무 관리에 필수적임.<br/>
                                전표 조회 페이지에서는 <span>날짜, 거래처, 전표 번호</span> 등 여러 조건으로 전표를 검색할 수 있으며, <span>필요시 수정</span>하거나 <span>삭제</span>할 수 있는 기능도 제공됨.
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
                    <Grid item xs={12} md={5} sx={{ minWidth: '500px !important', maxWidth: '700px !important' }}>
                        <Grow in={true} timeout={200}>
                            <div>
                                <TemporarySection />
                            </div>
                        </Grow>
                    </Grid>
                </Grid>
            )}

            {activeTabKey === '2' && (
                <Grid sx={{ padding: '0px 20px 0px 20px' }} container spacing={3}>
                    <Grid item xs={12} md={5} sx={{ minWidth: '500px !important', maxWidth: '700px !important' }}>
                        <Grow in={true} timeout={200}>
                            <div>
                                <TemporarySection />
                            </div>
                        </Grow>
                    </Grid>
                </Grid>
            )}

        </Box>
    );
};

export default VoucherListPage;