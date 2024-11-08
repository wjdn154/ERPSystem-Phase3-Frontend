import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '조정 현황',
            children: (
                <Typography>
                    재고 조정 작업의 전체적인 진행 상태를 확인하고, 각 작업의 결과를 조회할 수 있음.
                </Typography>
            ),
        }
    ];
}