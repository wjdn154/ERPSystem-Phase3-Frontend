import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '세금계산서 조회',
            children: (
                <Typography>
                    세금계산서 내역을 조회할 수 있는 탭임. 날짜, 거래처별로 필터링하여 필요한 자료를 쉽게 찾을 수 있음.<br/>
                </Typography>
            ),
        },
    ];
}