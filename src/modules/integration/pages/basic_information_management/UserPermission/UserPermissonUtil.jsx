import { Tag, Checkbox, Input, Button, Space } from 'antd';
import { Typography } from '@mui/material';
import { SearchOutlined } from "@ant-design/icons";
import {jwtDecode} from "jwt-decode";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '내 권한 조회',
            children: (
                <Typography>
                    이 페이지에서는 사용자가 자신의 권한을 조회할 수 있음.<br/>
                    사용자는 시스템 내에서 자신에게 부여된 권한을 확인하고, 각 권한에 따라 접근할 수 있는 기능을 이해할 수 있음.<br/>
                    권한 변경을 원할 경우 관리자에게 문의해야 함.
                </Typography>
            ),
        },
        {
            key: '2',
            label: '사용자 권한 관리',
            children: (
                <Typography>
                    이 페이지에서는 사용자의 권한을 관리하고, 역할에 따른 권한을 설정할 수 있음.<br/>
                    관리자는 특정 기능에 대한 접근 권한을 제어하여, 각 사용자가 자신의 직무에 맞는 기능만을 사용할 수 있도록 할 수 있음.
                </Typography>
            ),
        },
    ];
};

// 권한 관련 데이터
export const getPermissionData = (permissions) => [
    { key: 'adminPermission', label: '관리자 권한', value: permissions.adminPermission },
    { key: 'clientRegistrationPermission', label: '거래처 등록 권한', value: permissions.clientRegistrationPermission },
    { key: 'accountSubjectPermission', label: '계정과목 및 적요 등록 권한', value: permissions.accountSubjectPermission },
    { key: 'generalVoucherPermission', label: '일반전표 입력 권한', value: permissions.generalVoucherPermission },
    { key: 'taxInvoicePermission', label: '세금계산서(계산서) 현황 권한', value: permissions.taxInvoicePermission },
    { key: 'environmentPermission', label: '환경 등록 권한', value: permissions.environmentPermission },
    { key: 'salesPurchaseVoucherPermission', label: '매입매출 전표 입력 권한', value: permissions.salesPurchaseVoucherPermission },
    { key: 'electronicTaxPermission', label: '전자세금계산서 발행 권한', value: permissions.electronicTaxPermission },
    { key: 'clientLedgerPermission', label: '거래처 원장 권한', value: permissions.clientLedgerPermission },
    { key: 'clientAccountLedgerPermission', label: '거래처별 계정과목별 원장 권한', value: permissions.clientAccountLedgerPermission },
    { key: 'accountLedgerPermission', label: '계정별 원장 권한', value: permissions.accountLedgerPermission },
    { key: 'cashBookPermission', label: '현금 출납장 권한', value: permissions.cashBookPermission },
    { key: 'dailyMonthlyPermission', label: '일계표/월계표 권한', value: permissions.dailyMonthlyPermission },
    { key: 'journalPermission', label: '분개장 권한', value: permissions.journalPermission },
    { key: 'generalLedgerPermission', label: '총계정원장 권한', value: permissions.generalLedgerPermission },
    { key: 'salesPurchaseLedgerPermission', label: '매입매출장 권한', value: permissions.salesPurchaseLedgerPermission },
    { key: 'voucherPrintPermission', label: '전표 출력 권한', value: permissions.voucherPrintPermission },
    { key: 'closingDataPermission', label: '결산자료 입력 권한', value: permissions.closingDataPermission },
    { key: 'trialBalancePermission', label: '합계잔액시산표 권한', value: permissions.trialBalancePermission },
    { key: 'financialPositionPermission', label: '재무상태표 권한', value: permissions.financialPositionPermission },
    { key: 'incomeStatementPermission', label: '손익계산서 권한', value: permissions.incomeStatementPermission },
    { key: 'costStatementPermission', label: '제조원가명세서 권한', value: permissions.costStatementPermission },
    { key: 'profitDistributionPermission', label: '이익잉여금처분계산서 권한', value: permissions.profitDistributionPermission },
    { key: 'cashFlowPermission', label: '현금흐름표 권한', value: permissions.cashFlowPermission },
    { key: 'equityChangesPermission', label: '자본변동표 권한', value: permissions.equityChangesPermission },
    { key: 'closingAnnexPermission', label: '결산부속명세서 권한', value: permissions.closingAnnexPermission },
    { key: 'previousFinancialPositionPermission', label: '전기분 재무상태표 권한', value: permissions.previousFinancialPositionPermission },
    { key: 'previousIncomeStatementPermission', label: '전기분 손익계산서 권한', value: permissions.previousIncomeStatementPermission },
    { key: 'previousCostStatementPermission', label: '전기분 원가명세서 권한', value: permissions.previousCostStatementPermission },
    { key: 'previousProfitDistributionPermission', label: '전기분 이익잉여금처분계산서 권한', value: permissions.previousProfitDistributionPermission },
    { key: 'clientInitialPermission', label: '거래처별 초기이월 권한', value: permissions.clientInitialPermission },
    { key: 'closingCarryoverPermission', label: '마감후 이월 권한', value: permissions.closingCarryoverPermission },
    { key: 'fixedAssetRegisterPermission', label: '고정자산 등록 권한', value: permissions.fixedAssetRegisterPermission },
    { key: 'undepreciatedPermission', label: '미상각분 감가상각비 권한', value: permissions.undepreciatedPermission },
    { key: 'transferredDepreciationPermission', label: '양도자산 감가상각비 권한', value: permissions.transferredDepreciationPermission },
    { key: 'registerBookPermission', label: '고정자산관리대장 권한', value: permissions.registerBookPermission },
    { key: 'billsReceivablePermission', label: '받을어음 현황 권한', value: permissions.billsReceivablePermission },
    { key: 'billsPayablePermission', label: '지급어음 현황 권한', value: permissions.billsPayablePermission },
    { key: 'dailyFinancePermission', label: '일일자금명세 권한', value: permissions.dailyFinancePermission },
    { key: 'depositsStatusPermission', label: '예적금현황 권한', value: permissions.depositsStatusPermission },
    { key: 'employeeManagementPermission', label: '사원 관리 권한', value: permissions.employeeManagementPermission },
    { key: 'userManagementPermission', label: '사용자 관리 권한', value: permissions.userManagementPermission },
    { key: 'departmentManagementPermission', label: '부서 관리 권한', value: permissions.departmentManagementPermission },
    { key: 'assignmentManagementPermission', label: '발령 관리 권한', value: permissions.assignmentManagementPermission },
    { key: 'performanceEvaluationPermission', label: '성과 평가 관리 권한', value: permissions.performanceEvaluationPermission },
    { key: 'retirementManagementPermission', label: '퇴사자 관리 권한', value: permissions.retirementManagementPermission },
    { key: 'timeManagementPermission', label: '근태 관리 권한', value: permissions.timeManagementPermission },
    { key: 'leaveManagementPermission', label: '휴가 관리 권한', value: permissions.leaveManagementPermission },
    { key: 'overtimeManagementPermission', label: '초과근무 관리 권한', value: permissions.overtimeManagementPermission },
    { key: 'jobPostingsPermission', label: '채용 공고 관리 권한', value: permissions.jobPostingsPermission },
    { key: 'applicantManagementPermission', label: '지원자 관리 권한', value: permissions.applicantManagementPermission },
    { key: 'applicationManagementPermission', label: '지원서 관리 권한', value: permissions.applicationManagementPermission },
    { key: 'interviewManagementPermission', label: '인터뷰 관리 권한', value: permissions.interviewManagementPermission },
    { key: 'jobOffersPermission', label: '채용 제안 관리 권한', value: permissions.jobOffersPermission },
    { key: 'itemManagementPermission', label: '품목 관리 권한', value: permissions.itemManagementPermission },
    { key: 'itemGroupManagementPermission', label: '품목 그룹 관리 권한', value: permissions.itemGroupManagementPermission },
    { key: 'warehouseRegistrationPermission', label: '창고 등록 권한', value: permissions.warehouseRegistrationPermission },
    { key: 'quotationPermission', label: '견적서 권한', value: permissions.quotationPermission },
    { key: 'orderPermission', label: '주문서 권한', value: permissions.orderPermission },
    { key: 'salePermission', label: '판매 권한', value: permissions.salePermission },
    { key: 'shippingOrderPermission', label: '출하지시서 권한', value: permissions.shippingOrderPermission },
    { key: 'shipmentPermission', label: '출하 권한', value: permissions.shipmentPermission },
    { key: 'purchaseRequestPermission', label: '발주 요청 권한', value: permissions.purchaseRequestPermission },
    { key: 'purchasePlanPermission', label: '발주 계획 권한', value: permissions.purchasePlanPermission },
    { key: 'priceRequestPermission', label: '단가 요청 권한', value: permissions.priceRequestPermission },
    { key: 'purchaseOrderPermission', label: '발주서 권한', value: permissions.purchaseOrderPermission },
    { key: 'purchasePermission', label: '구매 권한', value: permissions.purchasePermission },
    { key: 'inboundOrderPermission', label: '입고지시서 권한', value: permissions.inboundOrderPermission },
    { key: 'returnsReceptionPermission', label: '반품 접수 권한', value: permissions.returnsReceptionPermission },
    { key: 'returnsStatusPermission', label: '반품 현황 권한', value: permissions.returnsStatusPermission },
    { key: 'shippingOrderViewPermission', label: '출하지시서 조회 권한', value: permissions.shippingOrderViewPermission },
    { key: 'shippingOrderInputPermission', label: '출하지시서 입력 권한', value: permissions.shippingOrderInputPermission },
    { key: 'shipmentViewPermission', label: '출하 조회 권한', value: permissions.shipmentViewPermission },
    { key: 'shipmentInputPermission', label: '출하 입력 권한', value: permissions.shipmentInputPermission },
    { key: 'shipmentStatusPermission', label: '출하 현황 권한', value: permissions.shipmentStatusPermission },
    { key: 'inboundExpectedPermission', label: '입고예정 권한', value: permissions.inboundExpectedPermission },
    { key: 'inboundProcessingPermission', label: '입고처리 권한', value: permissions.inboundProcessingPermission },
    { key: 'outboundExpectedPermission', label: '출고예정 권한', value: permissions.outboundExpectedPermission },
    { key: 'outboundExpectedStatusPermission', label: '출고예정현황 권한', value: permissions.outboundExpectedStatusPermission },
    { key: 'outboundProcessingPermission', label: '출고처리 권한', value: permissions.outboundProcessingPermission },
    { key: 'inventoryAdjustmentStepsPermission', label: '재고조정진행단계 권한', value: permissions.inventoryAdjustmentStepsPermission },
    { key: 'inventoryInspectionViewPermission', label: '재고실사조회 권한', value: permissions.inventoryInspectionViewPermission },
    { key: 'inventoryInspectionStatusPermission', label: '재고실사현황 권한', value: permissions.inventoryInspectionStatusPermission },
    { key: 'inventoryAdjustmentStatusPermission', label: '재고조정현황 권한', value: permissions.inventoryAdjustmentStatusPermission },
    { key: 'workcenterManagementPermission', label: '작업장 관리 권한', value: permissions.workcenterManagementPermission },
    { key: 'processDetailsPermission', label: '공정 세부정보 관리 권한', value: permissions.processDetailsPermission },
    { key: 'routingManagementPermission', label: 'Routing 관리 권한', value: permissions.routingManagementPermission },
    { key: 'bomManagementPermission', label: 'BOM 관리 권한', value: permissions.bomManagementPermission },
    { key: 'workerManagementPermission', label: '작업자 관리 권한', value: permissions.workerManagementPermission },
    { key: 'materialManagementPermission', label: '자재 정보 관리 권한', value: permissions.materialManagementPermission },
    { key: 'equipmentManagementPermission', label: '설비 정보 관리 권한', value: permissions.equipmentManagementPermission },
    { key: 'maintenanceHistoryPermission', label: '유지보수 이력 관리 권한', value: permissions.maintenanceHistoryPermission },
    { key: 'wasteManagementPermission', label: '폐기물 관리 권한', value: permissions.wasteManagementPermission },
];

// 사용자 테이블 컬럼 설정
export const userColumns = [
    {
        title: <div className="title-text">사원번호</div>,
        dataIndex: 'employeeNumber',
        align: 'center',
        render: (text, record) => <div style={{ fontSize: '0.7rem' }}>{record.employeeNumber}</div>,
    },
            {
                title: <div className="title-text">이름</div>,
                dataIndex: 'firstName',
                align: 'center',
                render: (text, record) => <div style={{fontSize: '0.7rem'}}>{record.lastName}{record.firstName}</div>,
    },
    {
        title: <div className="title-text">직위</div>,
        dataIndex: 'positionName',
        align: 'center',
        render: (text, record) => <div style={{ fontSize: '0.7rem' }}>{record.positionName}</div>,
    },
            {
                title: <div className="title-text">직책</div>,
                dataIndex: 'jobTitleName',
                align: 'center',
                render: (text, record) => <div style={{fontSize: '0.7rem'}}>{record.jobTitleName}</div>,
    },
    {
        title: <div className="title-text">부서</div>,
        dataIndex: 'departmentName',
        align: 'center',
        width: '20%',
        render: (text, record) => {
            let color;
            let value;
            switch (record.departmentName) {
                case '재무부':
                    color = 'red';
                    value = '재무';
                    break;
                case '인사부':
                    color = 'green';
                    value = '인사';
                    break;
                case '생산부':
                    color = 'blue';
                    value = '생산';
                    break;
                case '물류부':
                    color = 'orange';
                    value = '물류';
                    break;
                default:
                    color = 'gray'; // 기본 색상
            }
            return <Tag style={{ marginLeft: '5px' }} color={color}>{value}</Tag>;
        }
    },
];

// 개인 권한 테이블 컬럼 설정
export const personalPermissionColumns = () => [
    {
        title: '권한명',
        dataIndex: 'label',
        key: 'label',
        align: 'center',
    },
    {
        title: '상태',
        dataIndex: 'value',
        key: 'value',
        align: 'center',
        render: (text, record) => {
            let color;
            let value;
            switch (text) {
                case 'ADMIN':
                    color = 'blue';
                    value = '관리자';
                    break;
                case 'GENERAL':
                    color = 'green';
                    value = '사용자';
                    break;
                case 'NO_ACCESS':
                    color = 'gray';
                    value = '접근 불가';
                    break;
                default:
                    color = 'gray';
                    value = text;
            }
            return <Tag style={{ marginLeft: '5px' }} color={color}>{value}</Tag>;
        }
    },
];

// 권한 관리 테이블 컬럼 설정
export const permissionColumns = (permissions, setPermissions, selectedUser, isAdmin, adminEmployee, token) => [
    {
        title: '권한명',
        dataIndex: 'label',
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder="권한명 검색"
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={confirm}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={confirm}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        검색
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters();
                            setSelectedKeys([]);
                            confirm();
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        초기화
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: <SearchOutlined style={{ color: '#000' }} />,
        onFilter: (value, record) => record.label.toLowerCase().includes(value.toLowerCase()),
    },
    {
        title: '사용자',
        align: 'center',
        width: '15%',
        render: (_, record) => (
            record.key === 'adminPermission' ? null : (
                <Checkbox
                    checked={permissions[record.key] === 'GENERAL'}
                    onChange={(e) => setPermissions(prev => ({
                        ...prev,
                        [record.key]: e.target.checked ? 'GENERAL' : 'NO_ACCESS',
                    }))}
                    disabled={
                        (isAdmin && selectedUser.email === jwtDecode(token).sub)
                        || (!isAdmin && selectedUser.email === adminEmployee)
                        || (!isAdmin && (selectedUser.email !== jwtDecode(token).sub) && permissions['adminPermission'] === 'ADMIN')
                    }
                />
            )
        ),
    },
    {
        title: '관리자',
        align: 'center',
        width: '15%',
        render: (_, record) => (
            <Checkbox
                checked={permissions[record.key] === 'ADMIN'}
                onChange={(e) => setPermissions(prev => ({
                    ...prev,
                    [record.key]: e.target.checked ? 'ADMIN' : 'NO_ACCESS',
                }))}
                disabled={
                    (isAdmin && selectedUser.email === jwtDecode(token).sub)
                    || (!isAdmin && record.key === 'adminPermission')
                    || (!isAdmin && (selectedUser.email !== jwtDecode(token).sub) && permissions['adminPermission'] === 'ADMIN')
                    || (!isAdmin && selectedUser.email === adminEmployee)
                }
            />
        ),
    },
];