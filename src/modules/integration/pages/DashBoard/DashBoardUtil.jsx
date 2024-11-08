import {Typography} from "@mui/material";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '현황 요약',
            children: (
                <Typography>
                    각 모듈별 주요 데이터를 요약하여 제공하는 탭임. 사용자에게 기업의 전반적인 상황을 한눈에 파악할 수 있게 함.<br/>
                </Typography>
            ),
        },
        {
            key: '2',
            label: '세부 분석',
            children: (
                <Typography>
                    모듈별 세부 데이터 및 통계를 보여주며, 필터링 기능을 통해 더 깊이 있는 분석을 할 수 있음.
                </Typography>
            ),
        },
    ];
};