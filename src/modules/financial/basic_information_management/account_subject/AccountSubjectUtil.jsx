// 수정 불가능한 계정과목의 행을 빨간색으로 표시하기 위한 클래스 이름 반환
import {Typography} from "@mui/material";

export const getRowClassName = (record) => {
    return record.modificationType === false ? 'red-text' : '';
};

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '계정과목 목록',
            children: <Typography>재무회계에서 사용되는 모든 계정과목을 리스트 형태로 보여주는 부분으로, 기업의 모든 거래 및 재무 데이터를 분류하고 관리하는 데 필수적인 역할을 함.</Typography>, // 탭 클릭 시 보여질 내용
        },
        {
            key: '2',
            label: '계정과목 체계',
            children: <Typography>회사의 재무 기록을 체계적으로 분류하고 관리하기 위해 사용되는 구조적 체계임.</Typography>,
        },
    ];
}