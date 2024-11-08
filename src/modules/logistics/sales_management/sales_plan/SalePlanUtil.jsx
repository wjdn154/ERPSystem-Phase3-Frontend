import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '판매계획 목록',
            children: (
                <Typography>
                    완료된 판매계획 기록을 조회하고, 필요한 경우 수정 및 삭제할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '판매계획 입력',
            children: (
                <Typography>
                    새로운 판매계획을 등록할 수 있는 탭으로, 판매 목표와 예쌍 매출을 입력할 수 있음.
                </Typography>
            ),
        },
    ];
}