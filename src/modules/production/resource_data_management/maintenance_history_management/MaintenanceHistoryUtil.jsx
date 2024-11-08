import {Typography} from "antd";

export const maintenanceTabItems = () => {
    return [
        {
            key: '1',
            label: '유지보수 이력 목록',
            children: <Typography>유지보수 이력 목록을 조회하고, 각 유지보수 이력 정보를 수정 및 삭제할 수 있음. </Typography>, // 탭 클릭 시 보여질 내용
        },
        {
            key: '2',
            label: '유지보수 이력 등록',
            children: <Typography>유지보수 이력 정보를 등록할 수 있음. </Typography>, // 탭 클릭 시 보여질 내용
        }
    ];
}