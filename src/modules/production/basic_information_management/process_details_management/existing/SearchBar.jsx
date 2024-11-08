import React, { useState } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

const SearchBar = ({ onSearch }) => {
    const [searchText, setSearchText] = useState('');

    const handleSearch = (value) => {
        if (onSearch) {
            onSearch(value);
        }
    };

    return (
        <Search
            placeholder="검색어를 입력하세요"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
        />
    );
};

export default SearchBar;
