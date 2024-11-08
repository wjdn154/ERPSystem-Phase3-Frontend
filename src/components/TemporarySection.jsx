import {Typography, Paper} from "@mui/material";
import {notification} from "antd";
import React, {useEffect} from "react";

const TemporarySection = () => {

    useEffect(() => {
        notification.error({
            message: '미구현 기능',
            description: (
                <>
                    이 기능은 현재 준비 중입니다.<br />
                    추가 정보나 업데이트는{' '}
                    <a href="https://github.com/wjdn154/ERPSystem" target="_blank" rel="noopener noreferrer">
                        여기를 클릭
                    </a>
                    에서 확인하실 수 있습니다.
                </>
            ),
            placement: 'top',
        });
    }, []);

    return (
        <Paper elevation={3} sx={{ height: '100%' }}>
            <Typography variant="h6" sx={{ padding: '20px' }} >임시 영역</Typography>
        </Paper>
    )
}

export default TemporarySection;