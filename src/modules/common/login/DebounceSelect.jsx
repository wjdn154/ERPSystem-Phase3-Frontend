import React, { useState, useEffect } from "react";
import { Select } from "antd"; // Ant Design의 Select 컴포넌트를 사용
import debounce from "lodash/debounce"; // Lodash의 debounce 함수 사용

const DebounceSelect = ({
                            fetchInitialOptions, // 초기 데이터를 가져오는 함수
                            fetchSearchOptions,  // 검색어 입력 시 데이터를 가져오는 함수
                            onChange,            // 선택 값 변경 핸들러
                            value,               // 현재 선택된 값
                            placeholder,         // 플레이스홀더 텍스트
                            style,               // 스타일
                        }) => {
    const [options, setOptions] = useState([]); // 옵션 목록
    const [loading, setLoading] = useState(false); // 로딩 상태

    // 초기 데이터 로드
    useEffect(() => {
        const loadInitialOptions = async () => {
            setLoading(true);
            const initialOptions = await fetchInitialOptions();
            setOptions(initialOptions);
            setLoading(false);
        };
        loadInitialOptions();
    }, [fetchInitialOptions]);

    // 디바운스 검색 함수
    const handleSearch = debounce(async (searchText) => {
        setLoading(true);
        const searchOptions = await fetchSearchOptions(searchText);
        setOptions(searchOptions);
        setLoading(false);
    }, 300); // 300ms 지연

    return (
        <Select
            showSearch
            value={value}
            placeholder={placeholder}
            filterOption={false} // 기본 필터링 비활성화 (검색어 입력 시 직접 필터링 수행)
            onSearch={handleSearch} // 검색어 입력 핸들러
            onChange={onChange} // 값 변경 핸들러
            options={options} // 옵션 목록
            loading={loading} // 로딩 상태 표시
            style={style} // 스타일
        />
    );
};

export default DebounceSelect;
