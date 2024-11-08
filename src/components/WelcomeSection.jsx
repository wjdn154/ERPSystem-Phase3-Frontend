import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { Tabs } from 'antd';

const WelcomeSection = ({
                            title = '기본 제목',         // 제목을 기본으로 받아올 수 있도록 설정
                            description = '기본 설명',   // 설명 부분도 동적으로 변경 가능
                            tabItems = [],               // 탭 항목도 외부에서 동적으로 받아올 수 있게 수정
                            activeTabKey,                // 활성화된 탭 키
                            handleTabChange              // 탭 변경 핸들러
                        }) => {
    return (
        <div style={{ padding: '20px' }}>
            {/* 제목 부분 */}
            <Typography sx={{ color: '#000' }} variant="h4" component="h1">
                {title}
            </Typography>

            {/* 설명 부분 */}
            <Box sx={{ color: '#000', display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Box className="welcome-section-description">
                    {description}
                </Box>
            </Box>

            <Divider sx={{ marginTop: '20px' }}/>

            <Box sx={{ mt: 3 }}>
                {/* 탭 네비게이션 */}
                <Tabs activeKey={activeTabKey} onChange={handleTabChange} items={tabItems} />
            </Box>
        </div>
    );
};

export default WelcomeSection;