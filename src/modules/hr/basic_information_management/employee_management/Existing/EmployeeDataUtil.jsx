// 수정 불가능한 사원번호의 행을 빨간색으로 표시하기 위한 클래스 이름 반환
export const getRowClassName = (record) => {
    console.log('getRowClassName');
    return record.modificationType === false ? 'red-text' : '';
};