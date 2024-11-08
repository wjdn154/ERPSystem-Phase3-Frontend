import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '급여 환경 설정',
            children: (
                <Typography>
                    직책, 호봉별 급여 테이블을 설정하고, 변경이력을 관리할 수 있음.
                </Typography>
            ),
        },
    ];
}