import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '손익계산서 조회',
            children: (
                <Typography>
                    수익과 비용을 항목별로 조회하여 해당 기간 동안의 경영 성과를 파악할 수 있는 탭임.
                </Typography>
            ),
        },
    ];
}