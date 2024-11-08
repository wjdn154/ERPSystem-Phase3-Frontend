import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '사원 조회/수정',
            children: (
                <Typography>
                    등록된 사원 목록을 조회하고 각 사원의 세부 정보를 확인하고 기존 사원의 정보를 수정할 수 있는 탭임.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '사원 등록',
            children: (
                <Typography>
                    신규 사원을 등록할 수 있는 탭임.
                </Typography>
            ),
        },
    ];
}