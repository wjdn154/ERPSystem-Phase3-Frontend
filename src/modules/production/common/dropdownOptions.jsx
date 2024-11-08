// 활성 상태 드롭다운 옵션
import {Select} from "antd";

export const isTrueOptions = [
    { value: true, label: 'Y' },
    { value: false, label: 'N' },
];

// 작업장 유형(Enum) 드롭다운 옵션
export const workcenterTypeOptions = [
    { value: 'PRESS', label: '프레스' },
    { value: 'WELDING', label: '용접' },
    { value: 'PAINT', label: '도장' },
    { value: 'MACHINING', label: '정밀 가공' },
    { value: 'ASSEMBLY', label: '조립' },
    { value: 'QUALITY_INSPECTION', label: '품질 검사' },
    { value: 'CASTING', label: '주조' },
    { value: 'FORGING', label: '단조' },
    { value: 'HEAT_TREATMENT', label: '열처리' },
    { value: 'PLASTIC_MOLDING', label: '플라스틱 성형' },
];

// 사용 예시: 드롭다운 옵션으로 enum 값 선택
const workcenterTypeDropdown = (
    <Select
        options={workcenterTypeOptions}
        defaultValue="" // 기본값
        onChange={(value) => console.log('선택한 유형:', value)}
    />
);

// 선택할 수 있는 기타 드롭다운 옵션들 추가 가능
