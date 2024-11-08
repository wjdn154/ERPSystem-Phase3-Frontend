import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '입고 예정 품목 목록',
            children: (
                <Typography>
                    현재 진행 중이거나 완료된 입고 처리 내역을 조회할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '입고 대기 품목',
            children: (
                <Typography>
                    입고된 물품의 수량과 입고 날짜를 입력하고, 처리 상태를 업데이트할 수 있음.
                </Typography>
            ),
        },
    ];
}