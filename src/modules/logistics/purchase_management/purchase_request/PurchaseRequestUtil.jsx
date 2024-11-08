import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '발주 요청 목록',
            children: (
                <Typography>
                    생성된 모든 발주 요청서를 조회하고, 수정 및 삭제할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '발주 요청 등록',
            children: (
                <Typography>
                    새로운 발주 요청서를 작성하는 탭으로, 물품 정보와 요청 수량, 납기일 등을 입력할 수 있음.
                </Typography>
            ),
        },
    ];
}