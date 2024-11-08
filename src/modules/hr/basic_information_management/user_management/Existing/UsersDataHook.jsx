import {useEffect, useMemo, useState} from "react";
import {
    fetchUsersData,
    fetchUsersDataDetail,
} from "./UsersDataApi.jsx"

export const usersDataHook = (initialData) => {
    const [data, setData] = useState(initialData);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [usersDataDetail, setUsersDataDetail] = useState(initialData.usersDataDetail);

    const usersMemoizedData = useMemo(() => data, [data]);

    useEffect(() => {
        if (usersDataDetail) {
            setShowDetail(false);
            setTimeout(() => {
                setShowDetail(true);
            }, 0);
        }
    }, [usersDataDetail]);
// 행 선택 핸들러 설정
    const handleRowSelection = {
        type: 'radio',
        selectedRowKeys: selectedRow ? [selectedRow.id] : [],
        onChange: (selectedRowKeys, selectedRows) => {
            if (selectedRowKeys.length > 0) {
                handleSelectedRow(selectedRows[0]);
            }
        },
    };

// 행 선택 시 사용자정보 상세 정보를 가져오는 로직
const handleSelectedRow = async (selectedRow) => {
    setSelectedRow(selectedRow);
    try{
        const detail = await fetchUsersDataDetail(selectedRow.id);
        setUsersDataDetail(detail);
    } catch (error) {
        console.error("API에서 데이터를 가져오는 중 오류 발생:" ,error);
    }
}

return {
    data,
    showDetail,
    selectedRow,
    handleSelectedRow,
    handleRowSelection,
    usersMemoizedData,
    setUsersDataDetail
};

};