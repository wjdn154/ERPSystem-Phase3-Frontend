import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '설비 목록',
            children: (
                <Typography>
                    현재 사용 중인 설비 목록을 조회하고, 각 설비의 정보를 수정 및 삭제할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '설비 등록',
            children: (
                <Typography>
                    새로운 설비를 등록하는 탭으로, 모델명, 위치, 상태 등의 세부 정보를 입력할 수 있음.
                </Typography>
            ),
        },
    ];
}