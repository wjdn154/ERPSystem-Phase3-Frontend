import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '주문서 목록',
            children: (
                <Typography>
                    현재 등록된 주문서들을 조회하고, 필요한 경우 수정 및 삭제할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '주문서 작성',
            children: (
                <Typography>
                    새로운 주문서를 작성하는 탭으로, 견적서와 연동하여 내용을 가져올 수 있으며, 직접 입력도 가능함.
                </Typography>
            ),
        },
    ];
}