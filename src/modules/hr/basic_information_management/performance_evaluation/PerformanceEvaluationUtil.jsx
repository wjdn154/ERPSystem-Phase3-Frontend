import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '성과 평가 내역 조회',
            children: (
                <Typography>
                    사원의 성과 평가 내역을 조회하고, 평가 결과를 확인할 수 있는 탭임.
                </Typography>
            ),
        },
    ];
}