
import {Typography} from "@mui/material";



export const workerTabItems = () => {
    return [
        {
            key: '1',
            label: '작업자 목록 및 상세 내용',
            children: (
                <Typography>
                    생산 현장에서 일하는 작업자 목록을 조회하고, 각 작업자 정보를 수정할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '작업자 작업 배치 및 근태 목록',
            children: (
                <Typography>
                    각 작업자의 작업배치, 근태내역을 조회할 수 있음.
                </Typography>
            ),
        }
    ];
}


