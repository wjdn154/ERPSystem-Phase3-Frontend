import {Tag} from "antd";

export const accountSubjectColumn = [
    {
        title: <span>코드</span>,  // 컬럼 제목
        dataIndex: 'code',  // 데이터 인덱스: 이 필드는 데이터 객체의 'code' 속성과 연결됩니다.
        width: '10%',  // 컬럼 너비 설정
        align: 'center',
    },
    {
        title: <span>계정과목명</span>,  // 컬럼 제목
        dataIndex: 'name',  // 데이터 인덱스: 이 필드는 데이터 객체의 'name' 속성과 연결됩니다.
        width: '30%',  // 컬럼 너비 설정
        align: 'center',
    },
    {
        title: <span>성격</span>,  // 컬럼 제목
        dataIndex: 'natureName',  // 데이터 인덱스: 이 필드는 데이터 객체의 'natureCode' 속성과 연결됩니다.
        width: '25%',  // 컬럼 너비 설정
        align: 'center',
    },
    {
        title: <span>관계</span>,  // 컬럼 제목
        dataIndex: 'parentCode',  // 데이터 인덱스: 이 필드는 데이터 객체의 'parentCode' 속성과 연결됩니다.
        width: '10%',  // 컬럼 너비 설정
        align: 'center',
    },
    {
        title: <span>수정</span>,
        dataIndex: 'modificationType',
        width: '15%',
        align: 'center',
        render: (text, record) => (
            record.modificationType === false ? (
                <Tag style={{ marginLeft: '5px' }} color="red">불가</Tag>
            ) : (
                <Tag style={{ marginLeft: '5px' }} color="green">가능</Tag>
            )
        ),
    },
];