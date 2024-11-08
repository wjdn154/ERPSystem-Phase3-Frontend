export const fixedMemoColumn = [
    {
        title: <span>적요번호</span>,  // 적요번호 컬럼의 제목
        dataIndex: 'code', // 데이터 객체의 'id' 속성과 연결, 각 행의 고유 번호를 나타냄
        align: 'center', // 셀 내용을 중앙 정렬
        width: '20%', // 이 컬럼의 너비를 전체 테이블 너비의 20%로 설정
    },
    {
        title: <span>구분</span>, // 구분 컬럼의 제목, 각 적요의 카테고리나 유형을 나타냄
        dataIndex: 'category', // 데이터 객체의 'category' 속성과 연결, 적요의 카테고리를 표시
        align: 'center', // 셀 내용을 중앙 정렬
        width: '20%', // 이 컬럼의 너비를 전체 테이블 너비의 20%로 설정
    },
    {
        title: <span>내용</span>, // 고정적요 컬럼의 제목, 적요 내용을 표시
        dataIndex: 'content', // 데이터 객체의 'content' 속성과 연결, 적요의 상세 내용을 나타냄
        align: 'center', // 셀 내용을 중앙 정렬
        width: '60%', // 이 컬럼의 너비를 전체 테이블 너비의 60%로 설정
    },
];