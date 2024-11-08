import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '의뢰 내역',
            children: (
                <Typography>
                    생산 의뢰 목록: 현재 등록된 생산 의뢰 목록을 조회하고, 각 의뢰의 세부 정보를 수정 및 삭제할 수 있음.
                </Typography>
            ),
        },

    ];
}