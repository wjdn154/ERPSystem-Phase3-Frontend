import { Typography } from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '작업 지시 마감 목록',
            children: (
                <Typography>
                    마감된 작업 지시들을 확인하고, 각 마감된 지시의 상세 정보를 조회 및 등록할 수 있음.
                </Typography>
            ),
        },
    ];
};