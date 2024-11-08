import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '근태 기록 조회',
            children: (
                <Typography>
                    사원의 출퇴근 시간과 근무 상태를 조회 및 기존 데이터를 수정할 수 있음.
                </Typography>
            ),
        },
    ];
}