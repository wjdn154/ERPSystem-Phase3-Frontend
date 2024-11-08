import { Typography } from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '작업 지시 목록',
            children: (
                <Typography>
                    확정된 작업 지시들을 확인하고, 각 지시의 상세 정보를 조회할 수 있음.
                </Typography>
            ),
        },
    ];
};