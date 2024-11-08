import {Typography} from "@mui/material";

export const getRowClassName = (record) => {
    return record.modificationType === false ? 'red-text' : '';
};

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '창고 목록',
            children: (
                <Typography>
                    등록된 창고들을 조회하고, 창고별로 재고 정보를 확인할 수 있음.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '계층 그룹',
            children: (
                <Typography>
                    계층 그룹을 관리할 수 있음. 계층 그룹별로 창고들을 조회할 수 있음.
                </Typography>
            ),
        },
    ];
}