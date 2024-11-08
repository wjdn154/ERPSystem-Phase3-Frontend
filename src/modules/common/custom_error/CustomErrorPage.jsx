import React, { Component } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// 커스텀 에러 페이지 디자인
function CustomErrorPage({ errorCode, errorMessage }) {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100vh - 128px)',  // 헤더
                marginRight: '140px',            // 사이드바
                backgroundColor: '#fafafa',
                textAlign: 'center',
                padding: '20px',
            }}
        >
            {/* 에러 코드 */}
            <Typography variant="h1" sx={{ fontWeight: 'bold', marginBottom: '16px', color: '#FF6F61', fontSize: '120px' }}>
                {errorCode}
            </Typography>

            {/* 에러 메시지 */}
            <Typography variant="h5" sx={{ marginBottom: '24px', color: '#333', fontSize: '22px' }}>
                {errorMessage}
            </Typography>

            {/* 추가 메시지 */}
            <Typography sx={{ marginBottom: '40px', color: '#555', fontSize: '18px' }}>
                페이지를 새로고침하거나, 메인 페이지로 돌아가 주세요.
            </Typography>

            {/* 버튼 섹션 */}
            <Box sx={{ display: 'flex', gap: '16px' }}>
                <Button
                    variant="outlined"
                    onClick={() => window.location.reload()}
                    sx={{
                        borderColor: '#1976D2',
                        color: '#1565C0',
                        padding: '10px 24px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        textTransform: 'none',
                        '&:hover': { borderColor: '#1565C0' },
                    }}
                >
                    새로고침
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    sx={{
                        padding: '10px 24px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        color: '#FF6F61',
                        borderColor: '#FF6F61',
                        textTransform: 'none',
                        '&:hover': { borderColor: '#FF4C4C', color: '#FF4C4C' },
                    }}
                >
                    메인 페이지로 이동
                </Button>
            </Box>
        </Box>
    );
}

export default CustomErrorPage;