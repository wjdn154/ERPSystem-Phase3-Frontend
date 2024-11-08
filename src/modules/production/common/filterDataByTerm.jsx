export const filterDataByTerm = (data, term, searchFields) => {
    if (!term) return data;

    return data.filter(item =>
        searchFields.some(field =>
            String(item[field]).toLowerCase().includes(term.toLowerCase())
        )
    );
};
