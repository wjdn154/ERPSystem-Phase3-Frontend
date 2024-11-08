import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '일보 목록',
            children: (
                <Typography>
                    일보 목록: 현재까지 등록된 일간 생산 일보를 확인하고, 각 일보의 세부 정보를 조회할 수 있음.
                </Typography>
            ),
        },

    ];
}