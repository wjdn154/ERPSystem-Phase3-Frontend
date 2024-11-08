import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '휴가 내역 조회',
            children: (
                <Typography>
                    사원의 휴가 신청 내역과 남은 휴가 일수를 조회할 수 있음.
                </Typography>
            ),
        },
    ];
}