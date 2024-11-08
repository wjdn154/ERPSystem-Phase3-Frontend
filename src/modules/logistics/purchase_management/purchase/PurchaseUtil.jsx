import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '구매 내역',
            children: (
                <Typography>
                    완료된 구매 내역을 조회하고, 필요한 경우 수정할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '구매 입력',
            children: (
                <Typography>
                    진행 중인 구매를 관리하며, 상태를 업데이트하거나 필요한 정보를 입력할 수 있음.
                </Typography>
            ),
        },
    ];
}