import React, { Component } from 'react';
import {Result, Button, Typography} from 'antd';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainContentHook from './MainContentHook.jsx';
import AntdSkeleton from "./AntdSkeleton.jsx";
import AccountSubjectPage from "../../financial/basic_information_management/account_subject/AccountSubjectPage.jsx";
import EquipmentDataPage from "../../production/resource_data_management/equipment_data_management/EquipmentDataPage.jsx";
import MaintenanceHistoryPage from "../../production/resource_data_management/maintenance_history_management/MaintenanceHistoryPage.jsx";
import ClientRegistrationPage
    from "../../financial/basic_information_management/client_registration/ClientRegistrationPage.jsx";
import UserPermissionPage
    from "../../integration/pages/basic_information_management/UserPermission/UserPermissionPage.jsx";
import PendingVoucherApprovalPage
    from "../../financial/voucher_entry/pending_voucher_approval/PendingVoucherApprovalPage.jsx";
import AccountLedgerPage from "../../financial/ledger/account_ledger/AccountLedgerPage.jsx";
import ClientLedgerPage from "../../financial/ledger/client_ledger/ClientLedgerPage.jsx";
import UserManagementPage from "../../hr/basic_information_management/user_management/UserManagementPage.jsx";
import PerformanceEvaluationPage
    from "../../hr/basic_information_management/performance_evaluation/PerformanceEvaluationPage.jsx";
import AttendanceManagementPage
    from "../../hr/attendance_management/attendance_management/AttendanceManagementPage.jsx";
import SocialInsurancePage from "../../hr/payroll_management/social_insurance/SocialInsurancePage.jsx";
import GeneralLedgerPage from "../../financial/ledger/general_ledger/GeneralLedgerPage.jsx";
import PendingVoucherInputPage
    from "../../financial/voucher_entry/pending_voucher_input/PendingVoucherInputPage.jsx";
import DailyMonthlyReportPage from "../../financial/ledger/daily_monthly_report/DailyMonthlyReportPage.jsx";
import VoucherListPage from "../../financial/voucher_entry/voucher_list/VoucherListPage.jsx";
import DepartmentManagementPage
    from "../../hr/basic_information_management/department_management/DepartmentManagementPage.jsx";
import JournalPage from "../../financial/ledger/journal/JournalPage.jsx";
import AssignmentManagementPage
    from "../../hr/basic_information_management/assignment_management/AssignmentManagementPage.jsx";
import ClientAccountLedgerPage from "../../financial/ledger/client_account_ledger/ClientAccountLedgerPage.jsx";
import TaxInvoiceStatusPage from "../../financial/ledger/tax_invoice_status/TaxInvoiceStatusPage.jsx";
import IntegrationDashboardPage from "../../integration/pages/DashBoard/DashboardPage.jsx";
import WorkerPage from "../../production/resource_data_management/worker_management/WorkerPage.jsx";
import VoucherPrintPage from "../../financial/ledger/voucher_print/VoucherPrintPage.jsx";
import BomPage from "../../production/basic_information_management/bom_management/BomPage.jsx";
import SystemEnvironmentSettingsPage
    from "../../financial/basic_information_management/system_environment_settings/SystemEnvironmentSettingsPage.jsx";
import PendingSalesPurchaseVoucherInputPage from "../../financial/voucher_entry/pending_sales_purchase_voucher_input/PendingSalesPurchaseVoucherInputPage.jsx";
import CashBookPage from "../../financial/ledger/cash_book/CashBookPage.jsx";
import FinancialPositionPage
    from "../../financial/closing_financial_statements/financial_position/FinancialPositionPage.jsx";
import SalesPurchaseLedgerPage from "../../financial/ledger/sales_purchase_ledger/SalesPurchaseLedgerPage.jsx";
import IncomeStatementPage
    from "../../financial/closing_financial_statements/income_statement/IncomeStatementPage.jsx";
import EmployeeManagementPage
    from "../../hr/basic_information_management/employee_management/EmployeeManagementPage.jsx";
import LeaveManagementPage from "../../hr/attendance_management/leave_management/LeaveManagementPage.jsx";
import SalarySettlementPage from "../../hr/payroll_management/salary_settlement/SalarySettlementPage.jsx";
import CustomErrorPage from "../custom_error/CustomErrorPage.jsx";
import ProductManagementPage from "../../logistics/basic_information_management/product_management/ProductManagementPage.jsx";
import WarehouseRegistrationPage from "../../logistics/basic_information_management/warehouse_registration/WarehouseRegistrationPage.jsx";
import QuotationPage from "../../logistics/sales_management/quotation/QuotationPage.jsx";
import OrderFormPage from "../../logistics/sales_management/order_form/OrderFormPage.jsx";
import SalesPage from "../../logistics/sales_management/sales/SalesPage.jsx";
import ShippingOrderPage from "../../logistics/sales_management/shipping_order/ShippingOrderPage.jsx";
import PurchaseRequestPage from "../../logistics/purchase_management/purchase_request/PurchaseRequestPage.jsx";
import PurchaseOrderPage from "../../logistics/purchase_management/purchase_order/PurchaseOrderPage.jsx";
import PurchasePage from "../../logistics/purchase_management/purchase/PurchasePage.jsx";
import ReceivingOrderPage
    from "../../logistics/purchase_management/receiving_order/ReceivingOrderPage.jsx";
import ShipmentInquiryPage from "../../logistics/shipment/shipment_inquiry/ShipmentInquiryPage.jsx";
import ShipmentEntryPage from "../../logistics/shipment/shipment_entry/ShipmentEntryPage.jsx";
import ShipmentStatusPage from "../../logistics/shipment/shipment_status/ShipmentStatusPage.jsx";
import IncomingSchedulePage from "../../logistics/incoming_management/incoming_schedule/IncomingSchedulePage.jsx";
import IncomingProcessingPage from "../../logistics/incoming_management/incoming_processing/IncomingProcessingPage.jsx";
import OutgoingSchedulePage from "../../logistics/outgoing_management/outgoing_schedule/OutgoingSchedulePage.jsx";
import OutgoingStatusPage from "../../logistics/outgoing_management/outgoing_status/OutgoingStatusPage.jsx";
import OutgoingProcessingPage from "../../logistics/outgoing_management/outgoing_processing/OutgoingProcessingPage.jsx";
import AdjustmentProgressPage
    from "../../logistics/inventory_adjustment/adjustment_progress/AdjustmentProgressPage.jsx";
import InspectionInquiryPage from "../../logistics/inventory_adjustment/inspection_inquiry/InspectionInquiryPage.jsx";
import InspectionStatusPage from "../../logistics/inventory_adjustment/inspection_status/InspectionStatusPage.jsx";
import AdjustmentStatusPage from "../../logistics/inventory_adjustment/adjustment_status/AdjustmentStatusPage.jsx";
import WorkcenterManagementPage
    from "../../production/basic_information_management/workcenter_management/WorkcenterManagementPage.jsx";
import ProcessDetailsPage
    from "../../production/basic_information_management/process_details_management/ProcessDetailsPage.jsx";
import RoutingManagementPage
    from "../../production/basic_information_management/routing_management/RoutingManagementPage.jsx";
import MaterialDataPage from "../../production/resource_data_management/material_data_management/MaterialDataPage.jsx";
import ProductionRequestPage
    from "../../production/production_schedule_management/production_request/ProductionRequestPage.jsx";
import MasterProductionPage
    from "../../production/production_schedule_management/master_production_schedule/MasterProductionPage.jsx";
import ProductionOrderConfirmationPage from "../../production/work_order_management/production_order_confirmation/ProductionOrderConfirmationPage.jsx";
import ProductionOrderRegistrationPage
    from "../../production/work_order_management/production_order_registration/ProductionOrderRegistrationPage.jsx";
import MonthlyWorkReportPage
    from "../../production/production_performance_management/monthly_work_report/MonthlyWorkReportPage.jsx";
import DailyWorkReportPage
    from "../../production/production_performance_management/daily_work_report/DailyWorkReportPage.jsx";
import PendingSalesPurchaseVoucherApprovalPage
    from "../../financial/voucher_entry/pending_sales_purchase_voucher_approval/PendingSalesPurchaseVoucherApprovalPage.jsx";
import SalaryEnvironmentSettingsPage
    from "../../hr/basic_information_management/salary_environment_setting/SalaryEnvironmentSettingsPage.jsx";

import SalePlanPage from "../../logistics/sales_management/sales_plan/SalePlanPage.jsx";

import SalaryRegistrationPage from "../../hr/payroll_management/salary_registration/SalaryRegistrationPage.jsx";
import ProductionOrderClosingPage
    from "../../production/work_order_management/production_order_closing/ProductionOrderClosingPage.jsx";


// 필요한 페이지 컴포넌트들

// 컴포넌트 매핑 객체 생성
const componentsMap = { AccountSubjectPage, EquipmentDataPage, MaintenanceHistoryPage, ClientRegistrationPage,
    WorkerPage, IntegrationDashboardPage, PendingVoucherInputPage,
    UserPermissionPage, SystemEnvironmentSettingsPage, PendingVoucherApprovalPage, BomPage, VoucherListPage,
    PendingSalesPurchaseVoucherInputPage, PendingSalesPurchaseVoucherApprovalPage, ClientLedgerPage, ClientAccountLedgerPage,
    AccountLedgerPage, CashBookPage, DailyMonthlyReportPage, JournalPage, GeneralLedgerPage, SalesPurchaseLedgerPage,
    TaxInvoiceStatusPage, VoucherPrintPage, FinancialPositionPage, IncomeStatementPage, EmployeeManagementPage, UserManagementPage,
    DepartmentManagementPage, AssignmentManagementPage, PerformanceEvaluationPage, AttendanceManagementPage,
    LeaveManagementPage, SalarySettlementPage,
    SocialInsurancePage, ProductManagementPage, WarehouseRegistrationPage, QuotationPage,
    OrderFormPage, SalesPage, SalePlanPage , ShippingOrderPage, PurchaseRequestPage, PurchaseOrderPage, PurchasePage, ReceivingOrderPage: ReceivingOrderPage,
    ShipmentInquiryPage, ShipmentEntryPage, ShipmentStatusPage,
    IncomingSchedulePage, IncomingProcessingPage, OutgoingSchedulePage, OutgoingStatusPage, OutgoingProcessingPage, AdjustmentProgressPage,
    InspectionInquiryPage, InspectionStatusPage, AdjustmentStatusPage, WorkcenterManagementPage, ProcessDetailsPage, RoutingManagementPage,
    MaterialDataPage, ProductionRequestPage, MasterProductionPage, ProductionOrderConfirmationPage, ProductionOrderRegistrationPage,
    MonthlyWorkReportPage, DailyWorkReportPage, SalaryEnvironmentSettingsPage, SalaryRegistrationPage, ProductionOrderClosingPage
};

// MainContentPage 컴포넌트
function MainContentPage({ selectedSubSubMenu }) {
    const { initialData, error, loading } = MainContentHook(selectedSubSubMenu);

    const renderContent = () => {
        // 서브메뉴가 선택되지 않았거나, 컴포넌트가 없을 경우
        if (!selectedSubSubMenu || !selectedSubSubMenu.component) {
            return (
                <CustomErrorPage
                    errorCode="404"
                    errorMessage="해당 메뉴에 연결된 컴포넌트를 찾을 수 없습니다."
                />
            );
        }

        // 컴포넌트 이름을 통해 실제 컴포넌트를 가져옴
        const ComponentToRender = componentsMap[selectedSubSubMenu.component];

        // API 경로가 없을 경우
        if (selectedSubSubMenu.apiPath === null) {
            return (
                <CustomErrorPage
                    errorCode="WARNING"
                    errorMessage="데이터를 가져올 API 경로가 정의되어 있지 않습니다."
                />
            );
        }

        // 로딩 상태일 경우
        if (loading) {
            return <AntdSkeleton variant="rectangular" style={{ height: '90vh' }} />;
        }

        // 오류가 발생했을 경우
        if (error) {
            return (
                <CustomErrorPage
                    errorCode="ERROR"
                    errorMessage="데이터 로딩에 실패했습니다."
                />
            );
        }

        // 컴포넌트가 렌더링 가능한 경우
        return ComponentToRender ? (
            <ComponentToRender initialData={initialData} />
        ) : (
            <CustomErrorPage
                errorCode="500"
                errorMessage="해당 페이지의 컴포넌트를 찾을 수 없습니다."
            />
        );
    };

    return (
        <Box>{renderContent()}</Box>
    );
}

export default MainContentPage;