// 수정 불가능한 계정과목의 행을 빨간색으로 표시하기 위한 클래스 이름 반환
import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '매입매출전표 승인',
            children: (
                <Typography>
                    승인 대기 중인 매입매출 전표를 확인하고 검토할 수 있음.<br/>
                    전표별 거래 내역을 조회하고 필요한 경우 전표를 승인하거나 반려할 수 있음.<br/>
                </Typography>
            ),
        },
    ];
}