import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '출고 처리 목록',
            children: (
                <Typography>
                    현재 진행 중이거나 완료된 출고 처리 내역을 확인할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '출고 대기',
            children: (
                <Typography>
                    출고된 상품의 수량과 출고 일자를 입력하고, 처리 상태를 업데이트할 수 있음.
                </Typography>
            ),
        },
    ];
}