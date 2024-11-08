import {useEffect, useMemo, useState} from "react";
import {
    fetchDepartmentData,
    fetchDepartmentDataDetail,
} from "./DepartmentDataApi.jsx"

export const departmentDataHook = (initialData) => {
    const [data, setData] = useState(initialData);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [departmentDataDetail, setDepartmentDataDetail] = useState(initialData.departmentDataDetail);

    const departmentMemoizedData = useMemo(() => data, [data]);

    useEffect(() => {
        if (departmentDataDetail) {
            setShowDetail(false);
            setTimeout(() => {
                setShowDetail(true);
            }, 0);
        }
    }, [departmentDataDetail]);
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
            const detail = await fetchDepartmentDataDetail(selectedRow.id);
            setDepartmentDataDetail(detail);
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
        departmentMemoizedData,
        setDepartmentDataDetail
    };

};