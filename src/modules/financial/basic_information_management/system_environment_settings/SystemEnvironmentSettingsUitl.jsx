// 수정 불가능한 계정과목의 행을 빨간색으로 표시하기 위한 클래스 이름 반환
import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '회계 환경 설정',
            children: (
                <Typography>
                    매출매입전표의 자동분계 기준을 설정하여 재무 처리 기준을 명확하게 함.<br/>
                </Typography>
            ),
        },
    ];
}