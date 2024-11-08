import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '일계표',
            children: (
                <Typography>
                    일별 재무 데이터를 집계 하여 거래 내역을 요약한 표를 보여주는 탭임.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '월계표',
            children: (
                <Typography>
                    월별 재무 데이터를 집계 하여 더 큰 그림에서 기업의 재무 상황을 파악할 수 있는 탭임.
                </Typography>
            ),
        },
    ];
}