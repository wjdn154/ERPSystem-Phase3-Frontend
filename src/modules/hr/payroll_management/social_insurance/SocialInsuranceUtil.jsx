import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '고용보험',
            children: (
                <Typography>
                    사원의 고용보험 가입 현황과 납부 내역을 조회하고 관리할 수 있습니다.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '건강보험',
            children: (
                <Typography>
                    새로운 건강보험 항목을 조회하고 기존 내역을 수정할 수 있음.
                </Typography>
            ),
        },
        {
            key: '3',
            label: '장기요양보험',
            children: (
                <Typography>
                    새로운 장기요양보험 항목을 조회하고 기존 내역을 수정할 수 있음.
                </Typography>
            ),
        },
        {
            key: '4',
            label: '국민연금',
            children: (
                <Typography>
                    새로운 국민연금 항목을 조회하고 기존 내역을 수정할 수 있음.
                </Typography>
            ),
        },
        {
            key: '5',
            label: '소득세',
            children: (
                <Typography>
                    새로운 소득세 항목을 조회하고 기존 내역을 수정할 수 있음.
                </Typography>
            ),
        },
    ];
}