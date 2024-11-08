import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '급여 정산 목록',
            children: (
                <Typography>
                    사원의 월별 급여 내역을 확인하고, 급여 정산 내역을 조회할 수 있음.
                </Typography>
            ),
        },
    ];
}