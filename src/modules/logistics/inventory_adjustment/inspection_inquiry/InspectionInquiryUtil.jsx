import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '재고 실사 목록',
            children: (
                <Typography>
                    현재 진행 중이거나 완료된 재고 실사의 목록을 조회할 수 있음.
                </Typography>
            ),
        },
    ];
}