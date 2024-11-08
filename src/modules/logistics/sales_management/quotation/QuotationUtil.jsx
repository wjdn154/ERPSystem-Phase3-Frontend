import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '견적서 목록',
            children: (
                <Typography>
                    작성된 모든 견적서를 조회하고 수정 및 삭제할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '견적서 입력',
            children: (
                <Typography>
                    새로운 견적서를 작성하는 탭으로, 고객 정보와 견적 항목을 입력할 수 있음.
                </Typography>
            ),
        },
    ];
}