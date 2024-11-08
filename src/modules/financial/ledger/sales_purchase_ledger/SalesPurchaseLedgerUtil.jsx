import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '매입매출장 조회',
            children: (
                <Typography>
                    기업이 구매한 상품과 서비스에 대한 내역을 조회할 수 있는 탭임.
                </Typography>
            ),
        },
    ];
}