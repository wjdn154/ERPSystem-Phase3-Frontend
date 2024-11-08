import { useState } from 'react';

export const useSearch = (data, filterFunction) => {
    const [searchData, setSearchData] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);

    const handleSearch = (term) => {
        try {
            setIsSearchActive(true);
            const filteredData = filterFunction(data, term);
            setSearchData(filteredData);
        } catch (error) {
            console.error("검색 중 오류 발생:", error);
            setSearchData([]); // 검색 오류 시 빈 결과로 설정
        }
    };

    return {
        searchData,
        isSearchActive,
        handleSearch,
        setIsSearchActive,
        setSearchData,
    };
};
