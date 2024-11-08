import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '부서 조회/수정',
            children: (
                <Typography>
                    등록된 부서를 목록으로 조회하고, 기존 부서 정보를 수정하고, 부서별로 소속 직원을 확인할 수 있는 탭임.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '부서 등록',
            children: (
                <Typography>
                    새로운 부서를 등록할 수 있는 탭임.
                </Typography>
            ),
        },
    ];
}