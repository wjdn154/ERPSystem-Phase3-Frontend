import React, {useState, useMemo, useEffect} from 'react';
import { Select, Spin } from 'antd';
import { debounce } from 'lodash';

const DebounceSelect = ({
                            fetchInitialOptions,  // 초기값 API 호출 함수
                            fetchSearchOptions,   // 검색 API 호출 함수
                            debounceTimeout = 300,
                            onChange, // 선택한 값이 변경될 때 호출되는 핸들러
                            ...props
                        }) => {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState([]);
    const [value, setValue] = useState(null); // 선택한 값을 관리하는 state 추가

    // 초기값 호출
    useEffect(() => {
        const loadInitialOptions = async () => {
            setFetching(true);
            const initialOptions = await fetchInitialOptions();
            setOptions(initialOptions);
            setFetching(false);
        };
        loadInitialOptions();
    }, [fetchInitialOptions]);

    // 검색값 호출
    const debounceFetcher = useMemo(() => {
        const loadOptions = async (searchText) => {
            setFetching(true);
            const newOptions = await fetchSearchOptions(searchText);
            setOptions(newOptions);
            setFetching(false);
        };

        return debounce(loadOptions, debounceTimeout);
    }, [debounceTimeout, fetchSearchOptions]);

    // 옵션 선택 시 선택된 값 관리
    const handleChange = (selectedValue) => {
        setValue(selectedValue);  // 선택된 값 업데이트
        if (onChange) {
            onChange(selectedValue);  // 선택한 값이 변경되면 onChange 핸들러 호출
        }
    };

    return (
        <Select
            showSearch
            value={value} // 선택한 값을 Select 컴포넌트에 반영
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            onChange={handleChange} // 선택한 값이 변경되었을 때 호출되는 핸들러
            {...props}
            options={options}
        />
    );
};

export default DebounceSelect;