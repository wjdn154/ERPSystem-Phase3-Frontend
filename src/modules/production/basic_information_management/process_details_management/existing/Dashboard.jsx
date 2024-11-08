import React, { useEffect, useState } from "react";

function Dashboard() {
    const [processDetails, setProcessDetails] = useState([]);

    useEffect(() => {
        const loadProcessDetails = async () => {
            try {
                const data = await fetchProcessDetails();
                setProcessDetails(data);
            } catch (error) {
                console.error("생산공정 데이터를 불러오는 중 오류 발생:",  error);
            }
        };

        loadProcessDetails();
    }, []);  // 의존성 배열 추가
}

export default Dashboard;
