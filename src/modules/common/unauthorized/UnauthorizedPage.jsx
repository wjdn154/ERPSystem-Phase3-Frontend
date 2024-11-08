import React from 'react';
import { Box, Button, Typography } from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';

const UnauthorizedPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 전달된 state에서 requiredPermission, userPermission 추출
    const { permissionLevel, userPermission } = location.state || { permissionLevel: '알 수 없음', userPermission: '알 수 없음' };

    const requiredPermissions = permissionLevel === 'ADMIN' ? '관리자' : '사용자'
    const currentPermissions = userPermission === 'ADMIN' ? '관리자' : userPermission === 'GENERAL' ? '사용자' : '권한 없음';

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                width: '100vw',
                marginRight: '140px',            // 사이드바
                backgroundColor: '#fafafa',
                textAlign: 'center',
                padding: '20px',
            }}
        >
            {/* 에러 코드 및 권한 정보 출력 */}
            <Typography variant="h1" sx={{ fontWeight: 'bold', marginBottom: '16px', color: '#FF6F61', fontSize: '100px' }}>
                권한이 없습니다
            </Typography>

            {/* 에러 메시지 */}
            <Typography variant="h5" sx={{ marginBottom: '24px', color: '#333', fontSize: '22px' }}>
                이 페이지에 접근할 권한이 없습니다. 관리자에게 문의하세요.<br/>
            </Typography>

            {/* 추가 메시지 */}
            <Typography sx={{ marginBottom: '40px', color: '#555', fontSize: '18px' }}>
                필요한 권한: {requiredPermissions}<br/>
                현재 권한: {currentPermissions}
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
};

export default UnauthorizedPage;