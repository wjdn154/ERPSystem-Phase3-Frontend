import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '발주서 목록',
            children: (
                <Typography>
                    작성된 발주서를 조회하고, 수정 및 삭제할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '발주서 작성',
            children: (
                <Typography>
                    새로운 발주서를 작성하는 탭으로, 물품명, 수량, 가격 등의 정보를 입력할 수 있음.
                </Typography>
            ),
        },
    ];
}