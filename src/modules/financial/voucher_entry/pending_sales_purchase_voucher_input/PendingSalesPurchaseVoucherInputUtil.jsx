// 수정 불가능한 계정과목의 행을 빨간색으로 표시하기 위한 클래스 이름 반환
import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '매입매출전표 입력',
            children: (
                <Typography>
                    구매한 물품이나 서비스에 대한 내역을 기록하는 탭임. 공급업체 정보와 지출 금액 등을 입력하여 매입 내역을 관리함.
                </Typography>
            ),
        },
    ];
}