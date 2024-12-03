import axios from "axios";
import Cookies from 'js-cookie';

export const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? "https://omz-erp.click" // 운영 환경
    : "http://localhost:8080"; // 개발 환경

// 공통
export const COMMON_API = {
    LOGIN_API: `${API_BASE_URL}/api/hr/auth/login`, // 로그인 API
    REFRESH_TOKEN_API: `${API_BASE_URL}/api/hr/auth/refresh-token`, // 토큰 갱신 API
    COMPANY_LIST_API: `${API_BASE_URL}/api/financial/company/`, // 회사 목록 조회 API
    COMPANY_SEARCH_API: `${API_BASE_URL}/api/financial/company/search`, // 회사 검색 API
    REGISTER_API: `${API_BASE_URL}/api/hr/auth/register`, // 회원가입 API
    DASHBOARD_API: `${API_BASE_URL}/api/integrated/dashboard`, // 대시보드 조회 API
    GET_USER_SUBSCRIPTION_INFO_API: (employeeId, isAdmin) => `${API_BASE_URL}/api/notifications/get-user-subscription-info?employeeId=${employeeId}&isAdmin=${isAdmin}`, // 사용자 구독 정보 조회 API
    NOTIFICATION_SUBSCRIBE_API: (employeeId, tenantId, module, permission) => `${API_BASE_URL}/api/notifications/subscribe?employeeId=${employeeId}&tenantId=${tenantId}&module=${module}&permission=${permission}`, // 알림 구독 API
    NOTIFICATION_UNSUBSCRIBE_API: `${API_BASE_URL}/api/notifications/unsubscribe`, // 알림 구독 취소 API
    CREATE_NOTIFICATION_API: (employeeId, module, permission) => `${API_BASE_URL}/api/notifications/create-notification?employeeId=${employeeId}&module=${module}&permission=${permission}`, // 알림 생성 및 조회 API
    MARK_AS_READ_NOTIFICATION_API: (employeeId, notificationId) => `${API_BASE_URL}/api/notifications/mark-as-read?employeeId=${employeeId}&notificationId=${notificationId}`, // 알림 읽음 처리 API
};

// 재무회계
export const FINANCIAL_API = {
    // 환경설정
    JOURNAL_ENTRY_TYPE_API: `${API_BASE_URL}/api/financial/journal_entry_type_setup/show`, // 분개유형 목록 조회 API
    JOURNAL_ENTRY_TYPE_UPDATE_API: `${API_BASE_URL}/api/financial/journal_entry_type_setup/update`, // 분개유형 수정 API

    // 계정과목 관련 API
    ACCOUNT_SUBJECTS_API: `${API_BASE_URL}/api/financial/accountSubjects/`, // 계정과목 목록 조회 API
    ACCOUNT_SUBJECTS_SEARCH_API: `${API_BASE_URL}/api/financial/accountSubjects/search`, // 계정과목 검색 API
    ACCOUNT_SUBJECT_DETAIL_API: (code) => `${API_BASE_URL}/api/financial/accountSubjects/${code}`, // 계정과목 상세 조회 API
    SAVE_ACCOUNT_SUBJECT_API: `${API_BASE_URL}/api/financial/accountSubjects/save`, // 계정과목 저장 API
    UPDATE_ACCOUNT_SUBJECT_API: (code) => `${API_BASE_URL}/api/financial/accountSubjects/update/${code}`, // 계정과목 수정 API
    DELETE_ACCOUNT_SUBJECT_API: (code) => `${API_BASE_URL}/api/financial/accountSubjects/delete/${code}`, // 계정과목 삭제 API
    SAVE_MEMO_API: (code) => `${API_BASE_URL}/api/financial/accountSubjects/saveMemo/${code}`, // 적요 저장 API

    // 거래처 관련 API
    // CLIENT_SEARCH_API: `${API_BASE_URL}/api/financial/client/search`, // 거래처 검색 API
    CLIENT_SEARCH_API: `${API_BASE_URL}/api/financial/client/searchClientList`, // 거래처 목록 조회 API
    FETCH_CLIENT_LIST_API: `${API_BASE_URL}/api/financial/client/fetchClientList`, // 거래처 목록 조회 API
    FETCH_CLIENT_API: (id) => `${API_BASE_URL}/api/financial/client/fetchClient/${id}`, // 거래처 조회 API
    SAVE_CLIENT_API: `${API_BASE_URL}/api/financial/client/save`, // 거래처 저장 API
    UPDATE_CLIENT_API: `${API_BASE_URL}/api/financial/client/update`, // 거래처 수정 API

    // 은행, 주류, 카테고리 목록 조회 API
    FETCH_BANK_LIST_API: `${API_BASE_URL}/api/financial/client/fetchBankList`, // 은행 목록 조회 API
    FETCH_LIQUOR_LIST_API: `${API_BASE_URL}/api/financial/client/fetchLiquorList`, // 주류 목록 조회 API
    FETCH_CATEGORY_LIST_API: `${API_BASE_URL}/api/financial/client/fetchCategoryList`, // 카테고리 목록 조회 API

    // 전표 관련 API
    UNRESOLVED_VOUCHER_SEARCH_API: `${API_BASE_URL}/api/financial/general-voucher-entry/showUnresolvedVoucher`, // 미결 전표 조회 API
    SAVE_UNRESOLVED_VOUCHER_API: `${API_BASE_URL}/api/financial/general-voucher-entry/unresolvedVoucherEntry`, // 미결 전표 저장 API
    SALE_END_PURCHASE_RESOLVED_VOUCHER_SEARCH_API: `${API_BASE_URL}/api/financial/sale-end-purchase-unresolved-voucher/shows`, // 매입매출 전표 조회 API
    SALE_END_PURCHASE_RESOLVED_VOUCHER_APPROVE_SEARCH_API: `${API_BASE_URL}/api/financial/sale-end-purchase-unresolved-voucher/approveSearch`, // 매입매출 전표 승인 조회 API
    SALE_END_PURCHASE_RESOLVED_VOUCHER_ENTRY_SEARCH_API: `${API_BASE_URL}/api/financial/sale-and-purchase-resolved-voucher/show/entryShow`,
    SALE_END_PURCHASE_RESOLVED_VOUCHER_ENTRY_API: `${API_BASE_URL}/api/financial/sale-end-purchase-unresolved-voucher/entryShow`,
    VAT_TYPE_SEARCH_API: `${API_BASE_URL}/api/financial/vatType/show`, // 부가세유형 목록 조회 API
    APPROVAL_UNRESOLVED_VOUCHER_API: `${API_BASE_URL}/api/financial/general-voucher-entry/approvalUnresolvedVoucher`,  // 미결 전표 승인 API
    UNRESOLVED_VOUCHER_APPROVAL_SEARCH_API: `${API_BASE_URL}/api/financial/general-voucher-entry/approvalSearch`,  // 미결 전표 승인탭 조회 API
    VOUCHER_PRINT_SEARCH_API: `${API_BASE_URL}/api/financial/ledger/VoucherPrint/show`,  // 전표 출력 조회 API
    VAT_AMOUNT_QUANTITY_PRICE_API: `${API_BASE_URL}/api/financial/vatType/vatAmount/quantityPrice`, // 수량, 단가로 부가세 계산 API
    VAT_AMOUNT_SUPPLY_AMOUNT_API: `${API_BASE_URL}/api/financial/vatType/vatAmount/supplyAmount`, // 공급가액으로 부가세 계산 API
    SALE_AND_PURCHASE_UNRESOLVED_VOUCHER_ENTRY_API: `${API_BASE_URL}/api/financial/sale-and-purchase-unresolved-voucher/entry`, // 매입매출 미결전표 등록 API
    SALE_AND_PURCHASE_UNRESOLVED_VOUCHER_APPROVE_API: `${API_BASE_URL}/api/financial/sale-end-purchase-unresolved-voucher/approve`, // 매입매출 미결전표 승인 API
    VAT_TYPE_ID_API: `${API_BASE_URL}/api/financial/vatType/vatType/id`, // 부가세유형 ID로 조회 API

    // 거래처 및 계정과목별 원장 API
    CLIENT_LEDGER_API: `${API_BASE_URL}/api/financial/ledger/clientLedger/show`, // 거래처원장 목록 조회 API
    CLIENT_AND_ACCOUNT_SUBJECT_LEDGER_API: `${API_BASE_URL}/api/financial/ledger/clientAndAccountSubject/show`, // 거래처별 계정과목별 원장 목록 조회 API
    CLIENT_AND_ACCOUNT_SUBJECT_LEDGER_DETAIL_API: `${API_BASE_URL}/api/financial/ledger/clientAndAccountSubject/showDetail`, // 거래처별 계정과목별 원장 상세 조회 API

    // 분개장, 일계표 및 월계표 조회 API
    JOURNAL_LEDGER_API: `${API_BASE_URL}/api/financial/ledger/journal/show`, // 분개장 목록 조회 API
    CASH_JOURNAL_LEDGER_API: `${API_BASE_URL}/api/financial/ledger/cashJournal/show`, // 현금출납장 목록 조회 API
    DAILY_AND_MONTH_JOURNAL_LEDGER_API: `${API_BASE_URL}/api/financial/ledger/dailyAndMonthJournal/dailyShow`, // 일계표, 월계표 조회 API

    // 총계정원장 관련 API
    GENERAL_ACCOUNT_LEDGER_API: `${API_BASE_URL}/api/financial/ledger/general/show`, // 총계정원장 목록 조회 API
    GENERAL_ACCOUNT_LEDGER_DETAIL_API: `${API_BASE_URL}/api/financial/ledger/general/selectShow`, // 총계정원장 상세 조회 API

    // 계정별원장 관련 API
    ACCOUNT_SUBJECT_LEDGER_API: `${API_BASE_URL}/api/financial/ledger/accountLedger/show`, // 계정별원장 목록 조회 API
    ACCOUNT_SUBJECT_LEDGER_DETAIL_API: `${API_BASE_URL}/api/financial/ledger/accountLedger/showDetail`, // 계정별원장 상세 조회 API

    // 매입매출장 관련 API
    PURCHASE_SALES_LEDGER_API: `${API_BASE_URL}/api/financial/ledger/SalesAndPurchase/show`, // 매입매출장 목록 조회 API

    // 전자세금계산서 관련 API
    TAX_INVOICE_LEDGER_API: `${API_BASE_URL}/api/financial/ledger/taxInvoice/show`, // 전자세금계산서 목록 조회 API

    // 결산/재무제표 관련 API
    FINANCIAL_STATEMENTS_API: `${API_BASE_URL}/api/financial/ledger/financialStatements/show`, // 재무상태표 조회 API
    INCOME_STATEMENT_API: `${API_BASE_URL}/api/financial/ledger/incomeStatement/show`, // 손익계산서 조회 API
};

// 인사관리 - 사원
export const EMPLOYEE_API = {
    EMPLOYEE_DATA_API: `${API_BASE_URL}/api/hr/employee/all`, // 사원 목록 조회 API
    EMPLOYEE_ADMIN_PERMISSION_API:(companyId) => `${API_BASE_URL}/api/hr/employee/permission/admin/${companyId}`, // 관리자 권한 직원 조회
    EMPLOYEE_DATA_DETAIL_API:(id) =>`${API_BASE_URL}/api/hr/employee/${id}`, // 사원 상세 조회 API
    SAVE_EMPLOYEE_DATA_API: `${API_BASE_URL}/api/hr/employee/createEmployee`, // 사원 등록 API
    UPDATE_EMPLOYEE_DATA_API:(id)=> `${API_BASE_URL}/api/hr/employee/updateEmployee/${id}`, // 사원 수정 API
    DELETE_EMPLOYEE_DATA_API:(id)=> `${API_BASE_URL}/api/hr/employee/del/${id}`,

    // 인사관리 - 사용자
    USERS_PERMISSION_API: (username) => `${API_BASE_URL}/api/hr/users/permission/${username}`, // 사용자 권한 조회 API
    UPDATE_USERS_PERMISSION_API: `${API_BASE_URL}/api/hr/users/permission/update`,
    USERS_DATA_API: `${API_BASE_URL}/api/hr/users/all`,
    EMPLOYEE_USER_DATA_API: `${API_BASE_URL}/api/hr/employee/user/all`, // ERP 사용자인 Employee 목록 조회 API
    USERS_DATA_DETAIL_API: (id) => `${API_BASE_URL}/api/hr/users/${id}`,
    SAVE_USERS_DATA_API: `${API_BASE_URL}/api/hr/users/create`,
    UPDATE_USERS_DATA_API: (id)=> `${API_BASE_URL}/api/hr/users/put/${id}`,
    DELETE_USERS_DATA_API: (id) =>`${API_BASE_URL}/api/hr/users/del/${id}`,

    // 인사관리 - 부서
    DEPARTMENT_DATA_API: `${API_BASE_URL}/api/hr/department/all`,
    SAVE_DEPARTMENT_DATA_API: `${API_BASE_URL}/api/hr/department/createDepartment`,
    DEPARTMENT_DATA_DETAIL_API:(id) => `${API_BASE_URL}/api/hr/department/${id}`,
    DELETE_DEPARTMENT_DATA_API:(id)=> `${API_BASE_URL}/api/hr/department/delete/${id}`,
    UPDATE_DEPARTMENT_API:(id)=> `${API_BASE_URL}/api/hr/department/update/${id}`,

    ALLOWANCE_DATA_API: `${API_BASE_URL}/api/hr/basicconfiguration/allowance/show`,
    UPDATE_DEPARTMENT_DATA_API:(id)=> `${API_BASE_URL}/api/hr/department/update/${id}`,

    // 인사관리 - 직위
    POSITION_DATA_API: `${API_BASE_URL}/api/hr/positions`,
    POSITION_DATA_DETAIL_API:(id) => `${API_BASE_URL}/api/hr/position/${id}`,
    JOB_TITLE_DATA_API: `${API_BASE_URL}/api/hr/jobTitles`,
    JOB_TITLE_DATA_DETAIL_API:(id) => `${API_BASE_URL}/api/hr/jobTitle/${id}`,

    //  인사관리 - 근태
    ATTENDANCE_DATA_API: `${API_BASE_URL}/api/hr/attendance/records/all`,
    ATTENDANCE_DETAIL_DATA_API:(id) => `${API_BASE_URL}/api/hr/attendance/records/${id}`,
    SAVE_ATTENDANCE_API: `${API_BASE_URL}/api/hr/attendance/check-in`,
    DELETE_ATTENDANCE_API: `${API_BASE_URL}/api/hr/attendance/del`,
    UPDATE_ATTENDANCE_API: `${API_BASE_URL}/api/hr/attendance/update`,

    //  인사관리 - 휴가
    LEAVE_DATA_API: `${API_BASE_URL}/api/hr/leaves/list`,
    LEAVE_DETAIL_DATA_API:(id) => `${API_BASE_URL}/api/hr/api/hr/leaves/${id}`,
    SAVE_LEAVE_API:`${API_BASE_URL}/api/hr/leaves/createLeaves`,

    // 인사관리  - 성과
    PERFORMANCE_DATA_API: `${API_BASE_URL}/api/hr/performance/list`,
    PERFORMANCE_DETAIL_DATA_API:(id)=> `${API_BASE_URL}/api/hr/performance/employee/${id}`,
    SAVE_PERFORMANCE_API:  `${API_BASE_URL}/api/hr/performance/save`,
    UPDATE_PERFORMANCE_API:(performanceId) =>  `${API_BASE_URL}/api/hr/performance/put/${performanceId}`,
    DELETE_PERFORMANCE_API:(performanceId) =>  `${API_BASE_URL}/api/hr/performance/del/${performanceId}`,
    // 인사관리  - 발령
    SAVE_TRANSFER_API: `${API_BASE_URL}/api/hr/transfer/create`,
    TRANSFER_DATA_API: `${API_BASE_URL}/api/hr/transfer/all`,
    UPDATE_TRANSFER_API:(id) => `${API_BASE_URL}/api/hr/transfer/update/${id}`,
    TRANSFER_DETAIL_DATA_API:(id)=> `${API_BASE_URL}/api/hr/transfer/detail/${id}`,


    //  인사관리 - 급여
    POSITION_SALARY_STEP_API: `${API_BASE_URL}/api/hr/basicconfiguration/positionsalarystep/show`,
    POSITION_SALARY_STEP_DATE_CATEGORY_API: `${API_BASE_URL}/api/hr/basicconfiguration/positionsalarystep/datecategoryshow`,
    SALARY_ENTRY_API: `${API_BASE_URL}/api/hr/salary/entry`, // 급여 등록
    SALARY_SHOW_API: `${API_BASE_URL}/api/hr/salary/show`, // 급여 조회
    SALARY_STEP_API: `${API_BASE_URL}/api/hr/basicconfiguration/salarystep/show`, // 호봉 조회

    EMPLOYMENT_INSURANCE_PENSION_API: `${API_BASE_URL}/api/hr/employment_insurance_pension/show`, // 고용보험 조회
    HEALTH_INSURANCE_PENSION_API: `${API_BASE_URL}/api/hr/health_insurance_pension/show`,     // 건강보험 조회
    LONG_TERM_CARE_INSURANCE_PENSION_API: `${API_BASE_URL}/api/hr/long_term_care_insurance_pension/show`, // 장기요양보험 연금 조회
    NATIONAL_PENSION_API: `${API_BASE_URL}/api/hr/national_pension/show`, // 국민연금 조회
    INCOME_TAX_API: `${API_BASE_URL}/api/hr/incometax/show`, // 소득세 조회

    EMPLOYMENT_INSURANCE_PENSION_CALCULATOR_API: `${API_BASE_URL}/api/hr/employment_insurance_pension/calculator`, // 고용보험 연금 계산
    HEALTH_INSURANCE_PENSION_CALCULATOR_API: `${API_BASE_URL}/api/hr/health_insurance_pension/calculator`, // 건강보험 연금 계산
    NATIONAL_PENSION_CALCULATOR_API: `${API_BASE_URL}/api/hr/national_pension/calculator`, // 국민연금 계산

    SALARY_LEDGER_SHOW_API: `${API_BASE_URL}/api/hr/salaryledger/show`, // 급여 조회
    SALARY_LEDGER_UPDATE_API: `${API_BASE_URL}/api/hr/salaryledger/update`, // 급여 수정
    SALARY_LEDGER_CALCULATION_API: `${API_BASE_URL}/api/hr/salaryledger/calculation`, // 급여 자동 계산
    SALARY_LEDGER_DEADLINE_API: `${API_BASE_URL}/api/hr/salaryledger/deadlineon`, // 마감 처리
    SALARY_LEDGER_DEADLINE_OFF_API: `${API_BASE_URL}/api/hr/salaryledger/deadlineoff`, // 마감 해제
    SALARY_LEDGER_DATE_API: `${API_BASE_URL}/api/hr/salaryLedgerDate/show`, // 지급일 목록 조회
}
// 물류관리
export const LOGISTICS_API = {
    WAREHOUSE_LIST_API: `${API_BASE_URL}/api/logistics/warehouse/`, // 창고 목록 조회 API
    PRODUCT_GROUP_LIST_API: `${API_BASE_URL}/api/logistics/product-groups/`, //품목 그룹 목록 조회 API
    PRODUCT_GROUP_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/product-groups/update/${id}`, // 품목 그룹 수정 API
    PRODUCT_GROUP_DELETE_API: (id) => `${API_BASE_URL}/api/logistics/product-groups/delete/${id}`, // 품목 그룹 삭제 API
    PRODUCT_GROUP_CREATE_API: `${API_BASE_URL}/api/logistics/product-groups/save`, //품목 그룹 등록 API
    PRODUCT_LIST_API: `${API_BASE_URL}/api/logistics/products/`,   //품목 목록 조회 API
    PRODUCT_DETAIL_API: (id) => `${API_BASE_URL}/api/logistics/products/${id}`, // 품목 상세 조회 API
    PRODUCT_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/products/update/${id}`,
    PRODUCT_CREATE_API: `${API_BASE_URL}/api/logistics/products/save`,
    WAREHOUSE_DETAIL_API: (id) => `${API_BASE_URL}/api/logistics/warehouse/${id}`, // 창고 상세 조회 API
    WAREHOUSE_CREATE_API: `${API_BASE_URL}/api/logistics/warehouse/createWarehouse`, // 창고 생성 API
    WAREHOUSE_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/warehouse/updateWarehouse/${id}`, // 창고 수정 API
    WAREHOUSE_DELETE_API: (id) => `${API_BASE_URL}/api/logistics/warehouse/deleteWarehouse/${id}`, // 창고 삭제 API
    LOCATION_DETAIL_API: (id) => `${API_BASE_URL}/api/logistics/location/${id}`, // 창고별 로케이션 조회
    HIERARCHY_GROUP_LIST_API: `${API_BASE_URL}/api/logistics/hierarchyGroup/`, // 계층 그룹 목록 조회 API
    HIERARCHY_GROUP_WAREHOUSES_API: (groupId) => `${API_BASE_URL}/api/logistics/hierarchyGroup/${groupId}/warehouses`, // 계층 그룹의 창고 조회 API
    HIERARCHY_GROUP_SAVE_API: `${API_BASE_URL}/api/logistics/hierarchyGroup/saveHierarchyGroup`, // 계층 그룹 저장 API
    HIERARCHY_GROUP_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/hierarchyGroup/test/update/${id}`, // 계층 그룹 수정 API
    HIERARCHY_GROUP_DELETE_API: (id) => `${API_BASE_URL}/api/logistics/hierarchyGroup/deleteHierarchyGroup/${id}`, // 계층 그룹 삭제 API

    // 구매 관리
    PURCHASE_REQUEST_LIST_API: `${API_BASE_URL}/api/logistics/purchase-requests/`, // 발주 요청 목록 조회 API
    PURCHASE_REQUEST_DETAIL_API: (id) => `${API_BASE_URL}/api/logistics/purchase-requests/${id}`, // 발주 요청 상세 정보 조회 API
    PURCHASE_REQUEST_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/purchase-requests/update/${id}`, // 발주 요청 수정 조회 API
    PURCHASE_REQUEST_CREATE_API: `${API_BASE_URL}/api/logistics/purchase-requests/create`, // 발주 요청 등록 API
    
    PURCHASE_ORDER_LIST_API: `${API_BASE_URL}/api/logistics/purchase-orders/`, // 발주서 목록 조회 API
    PURCHASE_ORDER_DETAIL_API: (id) => `${API_BASE_URL}/api/logistics/purchase-orders/${id}`, // 발주서 상세 정보 조회 API
    PURCHASE_ORDER_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/purchase-orders/update/${id}`, // 발주서 수정 조회 API
    PURCHASE_ORDER_CREATE_API: `${API_BASE_URL}/api/logistics/purchase-orders/create`, // 발주서 등록 API
    
    PURCHASE_LIST_API: `${API_BASE_URL}/api/logistics/purchases/`, // 구매서 목록 조회 API
    PURCHASE_DETAIL_API: (id) => `${API_BASE_URL}/api/logistics/purchases/${id}`, // 구매서 상세 정보 조회 API
    PURCHASE_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/purchases/update/${id}`, // 구매서 수정 API
    PURCHASE_CREATE_API: `${API_BASE_URL}/api/logistics/purchases/create`, // 구매서 등록 API
    
    
    RECEIVING_ORDER_LIST_API: `${API_BASE_URL}/api/logistics/receiving-orders/`, // 입고 지시서 목록 조회 API
    RECEIVING_ORDER_DETAIL_API: (id) => `${API_BASE_URL}/api/logistics/receiving-orders/${id}`, // 입고지시서 상세 정보 조회 API
    RECEIVING_ORDER_CREATE_API: `${API_BASE_URL}/api/logistics/receiving-orders/create`, // 입고 지시서 등록 API

    // 영업 관리
    SALE_PLAN_LIST_API: `${API_BASE_URL}/api/logistics/sale-plans/`, // 판매계획 목록 조회 API
    SALE_PLAN_DETAIL_API: (id) => `${API_BASE_URL}/api/logistics/sale-plans/${id}`, // 판매계획 상세 정보 조회 API
    SALE_PLAN_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/sale-plans/update/${id}`, // 판매계획 수정 API
    SALE_PLAN_CREATE_API: `${API_BASE_URL}/api/logistics/sale-plans/create`, // 판매계획 등록 API
    QUOTATION_LIST_API: `${API_BASE_URL}/api/logistics/quotations/`, // 견적서 목록 조회 API
    QUOTATION_DETAIL_API: (id) => `${API_BASE_URL}/api/logistics/quotations/${id}`, // 견적서 상세 정보 조회 API
    QUOTATION_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/quotations/update/${id}`, // 견적서 수정 API
    QUOTATION_CREATE_API: `${API_BASE_URL}/api/logistics/quotations/create`, // 견적서 등록 API

    ORDER_LIST_API: `${API_BASE_URL}/api/logistics/orders/`, // 주문서 목록 조회 API
    ORDER_DETAIL_API: (id) => `${API_BASE_URL}/api/logistics/orders/${id}`, // 주문서 상세 정보 조회 API
    ORDER_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/orders/update/${id}`, // 주문서 수정 조회 API
    ORDER_CREATE_API: `${API_BASE_URL}/api/logistics/orders/create`, // 주문서 등록 API

    SALES_LIST_API: `${API_BASE_URL}/api/logistics/sales/`, // 판매서 목록 조회 API
    SALES_DETAIL_API: (id) => `${API_BASE_URL}/api/logistics/sales/${id}`, // 판매서 상세 정보 조회 API
    SALES_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/sales/update/${id}`, // 판매서 수정 조회 API
    SALES_CREATE_API: `${API_BASE_URL}/api/logistics/sales/create`, // 판매서 목록 조회 API

    SHIPPING_ORDER_LIST_API: `${API_BASE_URL}/api/logistics/shipping-orders/`, // 출하지시서 목록 조회 API
    SHIPPING_ORDER_DETAIL_API: (id) => `${API_BASE_URL}/api/logistics/shipping-orders/${id}`, // 출하지시서 상세 정보 조회 API
    SHIPPING_ORDER_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/shipping-orders/update/${id}`, // 출하지시서 수정 조회 API
    SHIPPING_ORDER_CREATE_API: `${API_BASE_URL}/api/logistics/shipping-orders/create`, // 출하지시서 목록 조회 API


    INVENTORY_API: `${API_BASE_URL}/api/logistics/inventory/`, // 재고 조회 API
    WAREHOUSE_INVENTORY_DETAIL_API: (locationId) => `${API_BASE_URL}/api/logistics/inventory/byLocation/${locationId}`, // 위치별 재고 조회 API


    //재고 실사 조회
    INVENTORY_INSPECTION_LIST_API: (startDate, endDate) => `${API_BASE_URL}/api/logistics/inventory/inspection/?startDate=${startDate}&endDate=${endDate}`,
    INVENTORY_INSPECTION_DETAILS_LIST_API: (startDate, endDate) => `${API_BASE_URL}/api/logistics/inventory/inspection/details?startDate=${startDate}&endDate=${endDate}`,
    INVENTORY_INSPECTION_CREATE_API: `${API_BASE_URL}/api/logistics/inventory/inspection/create`, // 재고 실사 생성 API
    INVENTORY_INSPECTION_DETAIL_API: (id) => `${API_BASE_URL}/api/logistics/inventory/inspection/${id}`, // 재고 실사 상세 조회 API
    INVENTORY_INSPECTION_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/inventory/inspection/update/${id}`, // 재고 실사 수정 API
    INVENTORY_INSPECTION_DELETE_API: (id) => `${API_BASE_URL}/api/logistics/inventory/inspection/delete/${id}`, // 재고 실사 삭제 API
    INVENTORY_INSPECTION_ADJUST_REQUEST_API: (id) => `${API_BASE_URL}/api/logistics/inventory/inspection/adjustRequest/${id}`, // 재고 실사 조정 요청 API

    SHIPMENT_CREATE_API: `${API_BASE_URL}/api/logistics/shipment/create`, // 출하 생성 API
    SHIPMENT_LIST_API: (startDate, endDate) => `${API_BASE_URL}/api/logistics/shipment/?startDate=${startDate}&endDate=${endDate}`, // 출하 목록 조회 API
    SHIPMENT_DETAIL_API: (id) => `${API_BASE_URL}/api/logistics/shipment/${id}`, // 출하 상세 조회 API
    SHIPMENT_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/shipment/update/${id}`, // 출하 수정 API
    SHIPMENT_DELETE_API: (id) => `${API_BASE_URL}/api/logistics/shipment/delete/${id}`, // 출하 삭제 API
    SHIPMENT_ITEMS_API: (startDate, endDate) => `${API_BASE_URL}/api/logistics/shipment/items?startDate=${startDate}&endDate=${endDate}`, // 출하 품목 조회 API

    RECEIVING_SCHEDULE_WAITING_RECEIPT_API: (startDate, endDate) => `${API_BASE_URL}/api/logistics/receivingSchedules/waitingReceipt?startDate=${startDate}&endDate=${endDate}`, // 입고 대기 상태의 입고 스케줄 조회 API
    RECEIVING_ORDER_UPDATE_API: (id) => `${API_BASE_URL}/api/logistics/receiving-orders/update/${id}`, // 특정 입고 지시서 수정 API
    NEXT_INVENTORY_NUMBER_API: `${API_BASE_URL}/api/logistics/inventory/nextInventoryNumber`, // 다음 인벤토리 번호 조회 API
    RECEIVING_SCHEDULE_PROCESS_API: () => `${API_BASE_URL}/api/logistics/receivingSchedules/process`, // 입고 처리 요청 API
    RECEIVING_SCHEDULE_WAITING_API: (startDate, endDate) => `${API_BASE_URL}/api/logistics/receivingSchedules/waiting?startDate=${startDate}&endDate=${endDate}`, // 특정 날짜 범위 내 대기 중인 입고 일정 조회 API
    INVENTORY_BY_LOCATION_API: (locationId) => `${API_BASE_URL}/api/logistics/inventory/byLocation/${locationId}`, // 특정 위치의 재고 조회 API

    INVENTORY_BY_WAREHOUSE_API: (warehouseId) => `${API_BASE_URL}/api/logistics/inventory/warehouse/${warehouseId}`, // 특정 위치의 재고 조회 API
    RECEIVING_SCHEDULE_PROCESS_CREATE_API: (id) => `${API_BASE_URL}/api/logistics/receivingSchedules/process/${id}`, // ReceivingSchedule 입고 처리 API
    SHIPPING_ORDER_DETAILS_API: (startDate, endDate) => `${API_BASE_URL}/api/logistics/shipping-order-details/details?startDate=${startDate}&endDate=${endDate}`, // 특정 날짜 범위의 출하지시서 상세 정보 조회 API
    SHIPPING_PROCESS_REGISTER_API: `${API_BASE_URL}/api/logistics/shipping-process/register`, // ShippingProcessing 등록 API
    SHIPPING_PROCESS_LIST_API: (startDate, endDate) => `${API_BASE_URL}/api/logistics/shipping-process/list?startDate=${startDate}&endDate=${endDate}`, // 출고 처리 목록 조회 API
    SHIPPING_PROCESS_PROCESS_API: (shippingProcessingId) => `${API_BASE_URL}/api/logistics/shipping-process/process/${shippingProcessingId}`, // ShippingProcessing 출고 처리 요청 API

};
// 생산관리
export const PRODUCTION_API = {
    // 기초정보
    WORKCENTER_LIST_API: `${API_BASE_URL}/api/production/workcenters`, // 작업장 목록 조회 API
    WORKCENTER_DETAILS_API: (code) => `${API_BASE_URL}/api/production/workcenters/details/${code}`, // 작업장 세부정보 조회 API
    WORKCENTER_SEARCH_API: (name) => `${API_BASE_URL}/api/production/workcenters/search?name=${name}`, // 작업장 이름검색 API
    SAVE_WORKCENTER_API: `${API_BASE_URL}/api/production/workcenters/new`, // 새 작업장 저장 API
    UPDATE_WORKCENTER_API: (code) =>`${API_BASE_URL}/api/production/workcenters/update/${code}`, // 작업장 수정 API
    DELETE_WORKCENTER_API: (code) => `${API_BASE_URL}/api/production/workcenters/delete?code=${code}`, // 작업장 삭제 API
    SEARCH_FACTORIES_API: `${API_BASE_URL}/api/production/workcenters/factories`,

    PROCESS_LIST_API: `${API_BASE_URL}/api/production/processDetails`, // 생산공정 목록 조회 API
    PROCESS_DETAILS_API: (code) => `${API_BASE_URL}/api/production/processDetails/details/${code}`, // 생산공정 세부정보 조회 API
    PROCESS_SEARCH_API: (name) => `${API_BASE_URL}/api/production/processDetails/search?name=${name}`, // 생산공정 이름검색 API
    SAVE_PROCESS_API: `${API_BASE_URL}/api/production/processDetails/new`, // 새 생산공정 저장 API
    UPDATE_PROCESS_API: (code) => `${API_BASE_URL}/api/production/processDetails/update/${code}`, // 생산공정 수정 API
    DELETE_PROCESS_API: (code) =>`${API_BASE_URL}/api/production/processDetails/delete?code=${code}`, // 생산공정 삭제 API

    ROUTING_LIST_API: `${API_BASE_URL}/api/production/processRouting`, // 전체 processRouting 목록 조회 API
    ROUTING_DETAIL_API: (id) => `${API_BASE_URL}/api/production/processRouting/${id}`, // 특정 processRouting 조회 API
    ROUTING_CREATE_API: `${API_BASE_URL}/api/production/processRouting/new`, // processRouting 생성 API
    ROUTING_UPDATE_API: `${API_BASE_URL}/api/production/processRouting/update`, // processRouting 수정 API
    ROUTING_DELETE_API: (id) => `${API_BASE_URL}/api/production/processRouting/delete/${id}`, // processRouting 삭제 API
    ROUTING_SEARCH_PROCESS_DETAILS_API: `${API_BASE_URL}/api/production/processRouting/searchProcessDetails`, // 생산공정 검색 API
    ROUTING_SEARCH_PRODUCTS_API: `${API_BASE_URL}/api/production/processRouting/searchProducts`, // 제품 검색 API
    ROUTING_PREVIEW_PROCESS_DETAILS_API: (id) => `${API_BASE_URL}/api/production/processRouting/previewProcessDetails/${id}`, // 공정 상세조회 API
    ROUTING_PREVIEW_PRODUCT_API: (id) => `${API_BASE_URL}/api/production/processRouting/previewProduct/${id}`, // 제품 상세조회 API

    S_BOM_LIST_API: `${API_BASE_URL}/api/production/standardBoms`, // 표준 자재명세서 목록 조회 API
    S_BOM_DETAIL_API: (id) => `${API_BASE_URL}/api/production/standardBoms/${id}`, // 특정 표준 자재명세서 조회 API
    S_BOM_CREATE_API: `${API_BASE_URL}/api/production/standardBoms/new`, // 표준 자재명세서 생성 API
    S_BOM_UPDATE_API: (id) => `${API_BASE_URL}/api/production/standardBoms/update/${id}`, // 표준 자재명세서 업데이트 API
    S_BOM_DELETE_API: (id) => `${API_BASE_URL}/api/production/standardBoms/delete/${id}`, // 표준 자재명세서 삭제 API
    S_BOM_FORWARD_EXPLOSION_API: (parentProductId) => `${API_BASE_URL}/api/production/standardBoms/forward-explosion/${parentProductId}`, // 하위 BOM 조회 API
    S_BOM_BACKWARD_EXPLOSION_API: (childProductId) => `${API_BASE_URL}/api/production/standardBoms/backward-explosion/${childProductId}`, // 상위 BOM 조회 API

    // 자원
    WORKER_LIST_API: `${API_BASE_URL}/api/production/workers`,    //작업자 목록 조회 API
    WORKER_DETAIL_API:(id) => `${API_BASE_URL}/api/production/worker/${id}`,  //작업자 상세 조회 API
    UPDATE_WORKER_DETAIL_API: (id) => `${API_BASE_URL}/api/production/worker/updateWorker/${id}`, //작업자 상세 수정 API
    WORKER_ATTENDANCE_ASSIGNMENT_LIST_API: (id) => `${API_BASE_URL}/api/production/worker/attendance/${id}`, //작업자 근태,작업배치 목록 조회 API

    EQUIPMENT_DATA_API: `${API_BASE_URL}/api/production/equipmentDatas`,    //설비정보 목록 조회 API
    EQUIPMENT_DATA_DETAIL_API:(id) => `${API_BASE_URL}/api/production/equipmentData/${id}`,   //설비정보 상세 조회 API
    SAVE_EQUIPMENT_DATA_API: `${API_BASE_URL}/api/production/equipmentData/createEquipment`,         //설비정보 등록 API
    UPDATE_EQUIPMENT_DATA_API: (id) => `${API_BASE_URL}/api/production/equipmentData/updateEquipment/${id}`,  //설비정보 수정 API
    DELETE_EQUIPMENT_DATA_API: (id) => `${API_BASE_URL}/api/production/equipmentData/deleteEquipment/${id}`,  //설비정보 삭제 API

    MAINTENANCE_HISTORY_API: `${API_BASE_URL}/api/production/maintenanceHistorys`,    //유지보수 이력 목록 조회 API
    MAINTENANCE_HISTORY_DETAIL_API:(id) => `${API_BASE_URL}/api/production/maintenanceHistory/${id}`,  //유지보수 이력 상세 조회 API
    SAVE_MAINTENANCE_HISTORY_API: `${API_BASE_URL}/api/production/maintenanceHistory/createMaintenance`,    //유지보수 이력 등록 API
    UPDATE_MAINTENANCE_HISTORY_API: (id) => `${API_BASE_URL}/api/production/maintenanceHistory/updateMaintenance/${id}`, //유지보수 이력 수정 API
    DELETE_MAINTENANCE_HISTORY_API:(id) => `${API_BASE_URL}/api/production/maintenanceHistory/deleteMaintenance/${id}`,  //유지보수 이력 삭제 API

    MATERIAL_LIST_API: `${API_BASE_URL}/api/production/materials`,    //자재 목록 조회 API
    MATERIAL_DETAIL_API:(id) => `${API_BASE_URL}/api/production/material/${id}`,   //특정 자재 상세 조회 API
    UPDATE_MATERIAL_API:(id) => `${API_BASE_URL}/api/production/material/updateMaterial/${id}`,   //자재 리스트 수정 API
    SAVE_MATERIAL_DETAIL_API: `${API_BASE_URL}/api/production/material/createMaterial`,   //자재 상세 등록 API
    DELETE_MATERIAL_API:(id) => `${API_BASE_URL}/api/production/material/deleteMaterial/${id}`,   //자재 삭제 API
    MATERIAL_HAZARDOUS_LIST_API:(materialId) => `${API_BASE_URL}/api/production/material/${materialId}/hazardousMaterials`, //해당 자재 유해물질 리스트 조회 API
    SAVE_MATERIAL_HAZARDOUS_LIST_API:(materialId) => `${API_BASE_URL}/api/production/material/hazardousMaterial/add/${materialId}`,  //해당 자재 유해물질 추가(수정) API
    MATERIAL_PRODUCT_LIST_API:(materialId) => `${API_BASE_URL}/api/production/material/${materialId}/productMaterials`,  //해당 자재 품목 리스트 조회 API
    SAVE_MATERIAL_PRODUCT_LIST_API:(materialId) => `${API_BASE_URL}/api/production/material/productMaterial/add/${materialId}`,  //해당 자재 품목 추가 API
    DELETE_MATERIAL_PRODUCT_API:(materialId, productCode) => `${API_BASE_URL}/api/production/material/${materialId}/productMaterial/${productCode}`, //해당 자재 품목 삭제 API

    HAZARDOUS_MATERIAL_LIST_API: `${API_BASE_URL}/api/production/hazardousMaterials`, //유해물질 목록 조회 API
    SAVE_HAZARDOUS_MATERIAL_API: `${API_BASE_URL}/api/production/hazardousMaterial/createMaterial`, //유해물질 등록 API
    UPDATE_HAZARDOUS_MATERIAL_API:(id) => `${API_BASE_URL}/api/production/hazardousMaterial/updateMaterial/${id}`, //유해물질 수정 API
    DELETE_HAZARDOUS_MATERIAL_API:(id) => `${API_BASE_URL}/api/production/hazardousMaterial/deleteMaterial/${id}`, //유해물질 삭제 API

    // 생산운영 및 계획
    PRODUCTION_REQUEST_LIST_API: `${API_BASE_URL}/api/production/productionRequest`, // 전체 생산 요청 목록 조회 API
    PRODUCTION_REQUEST_DETAIL_API: (id) => `${API_BASE_URL}/api/production/productionRequest/${id}`, // 특정 생산 요청 조회 API
    PRODUCTION_REQUEST_CREATE_API: `${API_BASE_URL}/api/production/productionRequest/create`, // 생산 요청 생성 API
    PRODUCTION_REQUEST_UPDATE_API: (id) => `${API_BASE_URL}/api/production/productionRequest/update/${id}`, // 생산 요청 수정 API
    PRODUCTION_REQUEST_DELETE_API: (id) => `${API_BASE_URL}/api/production/productionRequest/delete/${id}`, // 생산 요청 삭제 API

    MPS_LIST_API: `${API_BASE_URL}/api/production/mps/search`, // 전체 MPS 목록 조회 API
    MPS_CREATE: `${API_BASE_URL}/api/production/mps/new`,             // MPS 생성 API
    MPS_COMPLETE: (id) => `${API_BASE_URL}/api/production/mps/${id}/complete`, // MPS 완료 처리 API
    MPS_CONFIRM: (id) => `${API_BASE_URL}/api/production/mps/${id}/confirm`, // MPS 완료 처리 API
    MPS_DETAIL_ID: (id) => `${API_BASE_URL}/api/production/mps/${id}`, // 특정 MPS 조회 API
    MPS_UPDATE: (id) => `${API_BASE_URL}/api/production/mps/update/${id}`, // MPS 업데이트 API
    MPS_DELETE: (id) => `${API_BASE_URL}/api/production/mps/delete/${id}`, // MPS 삭제 API

    // 작업지시
    SHIFT_TYPE_LIST_API: `${API_BASE_URL}/api/production/shiftType`, // 전체 교대유형 목록 조회 API
    SHIFT_TYPE_DETAIL_API: (id) => `${API_BASE_URL}/api/production/shiftType/${id}`, // 특정 교대유형 조회 API
    SHIFT_TYPE_CREATE_API: `${API_BASE_URL}/api/production/shiftType/new`, // 교대유형 생성 API
    SHIFT_TYPE_UPDATE_API: `${API_BASE_URL}/api/production/shiftType/update`, // 교대유형 수정 API
    SHIFT_TYPE_DELETE_API: (id) => `${API_BASE_URL}/api/production/shiftType/delete/${id}`, // 교대유형 삭제 API

    WORKER_ASSIGNMENT_WORKCENTER_COUNT_API: `${API_BASE_URL}/api/production/workerAssignment/workcenters/count`, // 전체 작업장별 배정된 인원수 조회 API
    WORKER_ASSIGNMENT_WORKCENTER_DETAIL_API: (workcenterCode) => `${API_BASE_URL}/api/production/workerAssignment/workcenter/${workcenterCode}`, // 특정 작업장 배정된 작업자 명단 조회 API
    WORKER_ASSIGNMENT_DATES_API: `${API_BASE_URL}/api/production/workerAssignment/dates`, // 특정 날짜에 작업자 배정 상태 확인 API
    WORKER_ASSIGNMENT_CHECK_API: `${API_BASE_URL}/api/production/workerAssignment/check`, // 특정 날짜에 작업자 배정 상태 확인 API
    WORKER_ASSIGNMENT_DAILY_API: `${API_BASE_URL}/api/production/workerAssignment/daily`, // 일별 모든 작업장의 작업자 배정 이력 조회 API
    WORKER_ASSIGNMENT_MONTHLY_API: `${API_BASE_URL}/api/production/workerAssignment/monthly`, // 월별 모든 작업장의 작업자 배정 이력 조회 API
    WORKER_ASSIGNMENT_TODAY_SUMMARY_API: `${API_BASE_URL}/api/production/workerAssignment/today/summary`, // 오늘의 작업장별 배정인원 상세명단 조회 API
    WORKER_ASSIGNMENT_PRODUCTION_ORDER_SUMMARY_API: (productionOrderId) => `${API_BASE_URL}/api/production/workerAssignment/productionOrder/${productionOrderId}/summary`, // 작업지시별 작업자 명단 조회 API
    WORKER_ASSIGNMENT_WORKER_HISTORY_API: (workerId) => `${API_BASE_URL}/api/production/workerAssignment/worker/${workerId}/assignments`, // 작업자별 배치이력 조회 API

    PRODUCTION_ORDER_LIST_API: `${API_BASE_URL}/api/production/productionOrder/all`, // 전체 작업 지시 목록 조회 API
    PRODUCTION_ORDER_UNCONFIRMED_LIST_API: `${API_BASE_URL}/api/production/productionOrder/unconfirmed`, // 미확정인 전체 작업 지시 목록 조회 API
    PRODUCTION_ORDER_DETAIL_API: (id) => `${API_BASE_URL}/api/production/productionOrder/${id}`, // 특정 작업 지시 조회 API
    PRODUCTION_ORDER_SAVE_API: `${API_BASE_URL}/api/production/productionOrder/save`, // 작업 지시 생성 API
    PRODUCTION_ORDER_ASSIGN_WORKERS_API: (id) => `${API_BASE_URL}/api/production/productionOrder/${id}/assignWorkers`, // 작업 지시 작업자 배정 API
    PRODUCTION_ORDER_UPDATE_API: (id) => `${API_BASE_URL}/api/production/productionOrder/update/${id}`, // 작업 지시 수정 API
    PRODUCTION_ORDER_DELETE_API: (id) => `${API_BASE_URL}/api/production/productionOrder/delete/${id}`, // 작업 지시 삭제 API
    PRODUCTION_ORDER_CLOSE_API: `${API_BASE_URL}/api/production/productionOrder/closure`, // 작업 지시 마감 API
    PRODUCTION_ORDER_CONFIRM_API: (id) => `${API_BASE_URL}/api/production/productionOrder/confirm/${id}`, // 작업 지시 확정 API

    WORK_PERFORMANCE_DAILY_REPORT_API: `${API_BASE_URL}/api/production/workPerformance/dailyReport`, // 생산실적 일일보고 API
    WORK_PERFORMANCE_MONTHLY_REPORT_API: `${API_BASE_URL}/api/production/workPerformance/monthlyReport`, // 생산실적 월간보고 API

    // 생산실적

    // 품질관리

    // 외주/계약관리

    // 기타 메뉴구조도순으로 정렬
};