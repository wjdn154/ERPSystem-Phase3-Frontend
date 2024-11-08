export const themeSettings = {
    palette: {
        primary: {
            main: '#556cd6', // 메인 색상
        },
        secondary: {
            main: '#19857b', // 보조 색상
        },
        error: {
            main: '#ff1744', // 에러 색상
        },
        background: {
            default: '#f5f5f5', // 기본 배경색
        },
    },
    typography: {
        fontFamily: 'NotoSansKR, Arial', // 기본 폰트 설정
        fontSize: 14, // 기본 폰트 크기
        button: {
            textTransform: 'none' // 버튼 텍스트 변환 설정 (대문자 등)
        }
    },
    components: {
        MuiButton: { // MUI 버튼 커스텀 스타일
            styleOverrides: {
                root: {
                    borderRadius: 8, // 버튼 둥글기 설정
                },
            },
        },
    },
};