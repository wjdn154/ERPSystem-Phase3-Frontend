import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '품목 목록',
            children: (
                <Typography>
                    현재 등록된 모든 품목을 조회할 수 있으며, 각 품목을 선택하여 수정하거나 삭제할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '품목 등록',
            children: (
                <Typography>
                    새로운 품목을 등록할 수 있는 탭으로, 품목명, 카테고리, 가격, 재고 등의 정보를 입력 가능함.
                </Typography>
            ),
        },
    ];
}