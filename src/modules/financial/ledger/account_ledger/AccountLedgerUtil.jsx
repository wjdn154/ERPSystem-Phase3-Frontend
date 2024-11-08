import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '계정과목별 거래내역',
            children: (
                <Typography>
                    각 계정과목의 거래 내역을 조회하고, 날짜별로 필터링할 수 있음.
                </Typography>
            ),
        },
    ];
}