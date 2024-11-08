import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '출하 입력',
            children: (
                <Typography>
                    출하지시서와 연동하여 출하할 품목과 수량, 출하일을 입력할 수 있음.
                </Typography>
            ),
        },
    ];
}