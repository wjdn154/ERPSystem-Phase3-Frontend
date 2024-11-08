// getRowClassName 함수 정의
import {Typography} from "antd";

export const getRowClassName = (record) => {
    return record.isActive ? 'active-row' : 'inactive-row';
};


export const tabItems = () => {
    return [
        {
            key: '1',
            label: '작업장 목록 및 상세 내용',
            children: (
                <Typography>
                    작업장에서 사용되는 모든 작업장을 리스트 형태로 보여주는 부분으로, 각 작업장의 상태와 세부 정보를 관리하는 데 필수적인 역할을 함.
                </Typography>
            ),
        },
        // {
        //     key: '2',
        //     label: '작업장 등록',
        //     children: (
        //         <Typography>
        //             새로운 작업장을 등록하는 탭으로, 위치, 담당자 정보, 설비 정보 등을 입력 가능함.
        //         </Typography>
        //     ),
        // },
        {
            key: '3',
            label: '오늘의 작업자 명단',
            children: (
                <Typography>
                    작업장별 금일 배정된 작업자 명단으로, 배정일자와 작업지시 및 교대유형 등으로 배정된 작업자 명단을 조회함.
                </Typography>
            ),
        },
    ];
};