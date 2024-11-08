import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '주생산계획 목록',
            children: (
                <Typography>
                    현재 설정된 주생산계획을 조회하고, 각 계획의 상태를 확인할 수 있음.
                </Typography>
            ),
        },

    ];
}