import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '자산/부채 조회',
            children: (
                <Typography>
                    기업의 자산과 부채 항목을 조회하고, 현재의 재무 상태를 확인할 수 있는 탭임.
                </Typography>
            ),
        },
    ];
}