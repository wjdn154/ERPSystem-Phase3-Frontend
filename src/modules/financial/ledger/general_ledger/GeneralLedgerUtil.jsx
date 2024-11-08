import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '총계정원장 조회',
            children: (
                <Typography>
                    모든 계정과목의 총괄 거래 내역을 조회 할 수 있는 탭임.
                </Typography>
            ),
        },
    ];
}