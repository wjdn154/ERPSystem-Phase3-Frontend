import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '지시 등록',
            children: (
                <Typography>
                    작업 지시 목록: 현재 진행 중인 작업 지시 목록을 확인하고, 각 지시의 세부 정보를 수정할 수 있음.
                </Typography>
            ),
        },

    ];
}