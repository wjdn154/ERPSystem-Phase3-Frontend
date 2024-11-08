import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '현금출납장 조회',
            children: (
                <Typography>
                    일자별로 현금의 입출금 내역을 조회할 수 있는 탭임. 각 거래의 금액과 거래처를 함께 확인할 수 있음.
                </Typography>
            ),
        },
    ];
}