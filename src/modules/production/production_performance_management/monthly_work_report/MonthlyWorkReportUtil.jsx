import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '월보 목록',
            children: (
                <Typography>
                    월보 목록: 현재까지 등록된 월간 생산 실적을 조회하고, 각 월보의 세부 내용을 확인할 수 있음.
                </Typography>
            ),
        },
        // {
        //     key: '2',
        //     label: '월보 등록',
        //     children: (
        //         <Typography>
        //             월보 등록: 새로운 월간 생산 실적을 등록하고, 월간 생산량과 작업 결과를 입력할 수 있음.
        //         </Typography>
        //     ),
        // },
    ];
}