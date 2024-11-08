import React from 'react';
import { Box } from '@mui/material'; // Material-UI의 Box 컴포넌트 가져옴

// ContentWrapper 컴포넌트는 자식 요소를 감싸고 레이아웃 및 스타일링을 적용하는 역할을 함
function ContentWrapper({ children }) {
    return (
        <Box sx={{ backgroundColor: '#FAFAFB', minHeight: 'calc(100vh - 64px)', flexGrow: 1 }}>
            {children} {/* 전달된 자식 요소들을 이 위치에 렌더링 */}
        </Box>
    );
}

export default ContentWrapper;