import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '진행 중인 출하',
            children: (
                <Typography>
                    현재 진행 중인 출하 내역을 조회하고, 상태를 실시간으로 업데이트할 수 있음.
                </Typography>
            ),
        },
    ];
}