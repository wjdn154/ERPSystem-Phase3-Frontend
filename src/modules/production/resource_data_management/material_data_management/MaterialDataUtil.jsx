import {Typography} from "antd";

export const materialTabItems = () => {
    return [
        {
            key: '1',
            label: '자재 목록',
            children: <Typography>등록된 자재 목록을 조회하고, 각 자재의 정보를 수정 및 삭제할 수 있음.</Typography>, // 탭 클릭 시 보여질 내용
        },
        // {
        //     key: '2',
        //     label: '자재 등록',
        //     children: <Typography>신규 자재를 등록할 수 있음.</Typography>, // 탭 클릭 시 보여질 내용
        // }
    ];
}
