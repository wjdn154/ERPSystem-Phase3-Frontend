import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '전표 출력',
            children: (
                <Typography>
                    전표 번호나 날짜로 필터링하여 조회 할 수 있음.
                </Typography>
            ),
        },
    ];
}