import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '입고지시서 목록',
            children: (
                <Typography>
                    생성된 입고지시서를 조회하고, 수정 및 삭제할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '입고지시서 작성',
            children: (
                <Typography>
                    새로운 입고지시서를 작성하는 탭으로, 입고할 물품과 입고 장소를 지정할 수 있음.
                </Typography>
            ),
        },
    ];
}