// 수정 불가능한 계정과목의 행을 빨간색으로 표시하기 위한 클래스 이름 반환
import {Typography} from "antd";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '전표 목록',
            children: (
                <Typography>
                    입력된 모든 전표를 조회할 수 있는 탭임. 날짜, 거래처, 금액 등으로 필터링할 수 있어 빠르고 정확한 검색이 가능함.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '전표 상세 보기',
            children: (
                <Typography>
                    선택한 전표의 상세 내역을 확인할 수 있는 탭임. 여기서 전표 내용을 확인하고 수정 및 삭제할 수 있음.
                </Typography>
            ),
        },
    ];
}