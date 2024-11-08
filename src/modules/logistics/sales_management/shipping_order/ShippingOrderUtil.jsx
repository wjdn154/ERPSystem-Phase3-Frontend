import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '출하지시서 목록',
            children: (
                <Typography>
                    출하된 상품의 기록을 조회하고, 필요한 경우 수정할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '출하지시서 등록',
            children: (
                <Typography>
                    새로운 출하를 등록하는 탭으로, 출하지시서와 연동하여 출하 정보를 입력할 수 있음.
                </Typography>
            ),
        },
    ];
}