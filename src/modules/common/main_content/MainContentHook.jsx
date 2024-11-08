import React, { useState, useRef } from "react";
import axios from "axios";
import lodash from "lodash";
import apiClient from "../../../config/apiClient.jsx";  // lodash 사용

const MainContentHook = (selectedSubSubMenu) => {
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const prevSubSubMenuRef = useRef();  // 이전 값을 저장

    const handleDataFetch = () => {
        // 이전 값과 같은지 체크
        if (lodash.isEqual(prevSubSubMenuRef.current, selectedSubSubMenu)) return;

        prevSubSubMenuRef.current = selectedSubSubMenu;  // 이전 값 업데이트

        // 로딩 상태 설정
        setLoading(true);

        if(selectedSubSubMenu.apiPath === undefined) {
            setInitialData(null);
            setError(null);
            setLoading(false);
            return;
        }

        if (selectedSubSubMenu.apiPath) {
            apiClient
                .post(selectedSubSubMenu.apiPath)
                .then((response) => {
                    setInitialData(response.data);
                    setError(null);
                })
                .catch((err) => {
                    setError("데이터 로딩 중 오류가 발생했습니다.");
                    setInitialData(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    // 상태가 변경되면 강제로 데이터를 가져옴
    handleDataFetch();

    return { initialData, error, loading };
};

export default MainContentHook;