import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '진행 단계 목록',
            children: (
                <Typography>
                    현재 진행 중인 재고 조정 작업의 단계를 확인할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '실사 등록',
            children: (
                <Typography>
                    신규 실사를 등록할 수 있음.
                </Typography>
            ),
        },
    ];
}