import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '출하 내역',
            children: (
                <Typography>
                    완료된 출하 기록을 조회하고, 각 출하의 상세 정보를 확인할 수 있음.
                </Typography>
            ),
        }
    ];
}