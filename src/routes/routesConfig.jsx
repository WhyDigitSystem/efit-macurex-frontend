import PpcList from "../components/PPC/PpcList";
import BomCorrectionRequestMaster from "../components/PPC/bomCorrectionRequest/BomCorrectionRequestMaster";
import DrawingAttachmentMaster from "../components/PPC/drawingAttachment/DrawingAttachmentMaster";
import MaterialPlanningMaster from "../components/PPC/materialPlanning/MaterialPlanningMaster";
import TransferOrderMaster from "../components/PPC/transferOrder/TransferOrderMaster";
import ProductionList from "../components/Production/ProductionList";
import TdcList from "../components/TDC/TdcList";
import EcnMaster from "../components/TDC/engineeringChangeNote/EcnMaster";
import EcrMaster from "../components/TDC/engineeringChangeRecord/EcrMaster";
import EngineeringDeviationRequestMaster from "../components/TDC/engineeringDeviationRequest/EngineeringDeviationRequestMaster";
import InspectionRequisitionNoteMaster from "../components/TDC/inspectionRequisitionNote/InspectionRequisitionNoteMaster";
import SupplierChangeRequestMaster from "../components/TDC/supplierChangeRequest/SupplierChangeRequestMaster";
import ImportGRNMaster from "../components/inventory/ImportGRN/ImportGRNMaster";
import InventoryList from "../components/inventory/InventoryList";
import LabourChargesList from "../components/labourCharges/LabourChargesList";
import DailyExchangeRateMaster from "../components/masters/DailyExchangeRate/DailyExchangeRateMaster";
import DepartmentMaster from "../components/masters/Department/DepartmentMaster";
import DesignationMaster from "../components/masters/Designation/DesignationMaster";
import DocTypeMappingMaster from "../components/masters/DocTypeMapping/DocTypeMappingMaster";
import LMEMaster from "../components/masters/LmeRate/LMEMaster";
import MastersList from "../components/masters/MasterList";
import BankMaster from "../components/masters/bankMaster/BankMaster";
import BranchMaster from "../components/masters/branch/BranchMaster";
import CalendarMaster from "../components/masters/calendar/CalendarMaster";
import CityMaster from "../components/masters/city/CityMaster";
import CompanyMaster from "../components/masters/company/CompanyMaster";
import CountryMaster from "../components/masters/country/CountryMaster";
import CreateCompanyPage from "../components/masters/createCompany/companyMaster";
import Currency from "../components/masters/currency/Currency";
import DocTypeMaster from "../components/masters/docType/DocTypeMaster";
import EmployeeMaster from "../components/masters/employee/EmployeeMaster";
import ExchangeRateMaster from "../components/masters/exchangeRate/ExchangeRateMaster";
import ExchangeRateUpdateMaster from "../components/masters/exchangeRateUpdate/ExchangeRateUpdateMaster";
import FinancialYearMaster from "../components/masters/financialYear/FinancialYearMaster";
import FinYear from "../components/masters/finyear/Finyear";
import GSTState from "../components/masters/gstState/GSTState";
import GSTRate from "../components/masters/gstrate/GSTRate";
import HolidayMaster from "../components/masters/holiday/HolidayMaster";
import HsnSacMaster from "../components/masters/hsnsac/HsnSacMaster";
import ItemMaster from "../components/masters/item/ItemMaster";
import ItemGradeMaster from "../components/masters/itemGrade/ItemGradeMaster";
import ListMaster from "../components/masters/listofvalues/ListMaster";
import LocationMaster from "../components/masters/location/LocationMaster";
import PartyMaster from "../components/masters/party/PartyMaster";
import PartyAccountMappingMaster from "../components/masters/partyAccountMapping/PartyAccountMappingMaster";
import RolesAndResponsibilitySetup from "../components/masters/rolesResponsibilities/RolesAndResponsibilitySetup";
import SalesZoneMaster from "../components/masters/salesZone/SalesZoneMaster";
import ScreenAccess from "../components/masters/screenAccess/screenAccess";
import ScreenNames from "../components/masters/screens/ScreenNames";
import ServicesAccountingMaster from "../components/masters/servicesAccounting/ServicesAccountingMaster";
import StateMaster from "../components/masters/state/StateMaster";
import TaxDefinationMaster from "../components/masters/taxDefination/TaxDefinationMaster";
import TaxRateMaster from "../components/masters/taxRate/TaxRateMaster";
import TransportMaster from "../components/masters/transport/TransportMaster";
import UnitMaster from "../components/masters/unit/UnitMaster";
import UnitConversionMaster from "../components/masters/unitConversion/UnitConversionMaster";
import UserCreation from "../components/masters/userCreation/UserCreationMaster";
import PlantMaintenanceList from "../components/plantMaintenance/PlantMaintenanceList";
import PurchaseContractAmendment from "../components/purchase/PurchaseContractAmendment/PurchaseContractAmendmentMaster";
import PurchaseOrderAmendment from "../components/purchase/PurchaseOrderAmendment/PurchaseOrderAmendmentMaster";
import PurchaseList from "../components/purchase/purchaseList";
import QualityList from "../components/quality/QualityList";
import ControlPlan from "../components/quality/controlPlan/ControlPlan";
import DeliveryChallanCumGatePassMaster from "../components/quality/deliveryChallanCumGatePass/DeliveryChallanCumGatePassMaster";
import EightDisciplineEntryMaster from "../components/quality/eightDisciplineEntry/EightDisciplineEntryMaster";
import InitialPlanning from "../components/quality/initialPlanning/InitialPlanning";
import InwardInspectionMaster from "../components/quality/inwardInspection/InwardInspectionMaster";
import ParameterMaster from "../components/quality/parameterMaster/ParameterMaster";
import PreDeliveryInspectionReportMaster from "../components/quality/preDeliveryInspectionReport/PreDeliveryInspectionReportMaster";
import QualityScrapNoteMaster from "../components/quality/qualityScrapNote/QualityScrapNoteMaster";
import RootCauseAnalysisMaster from "../components/quality/rootCauseAnalysis/RootCauseAnalysisMaster";
import SetUpApprovalMaster from "../components/quality/setUpApproval/SetUpApprovalMaster";
import ZeroKmFailureMaster from "../components/quality/zeroKmFailure/ZeroKmFailureMaster";
import InitialStageInspectionMaster from "../components/quality/initialStageInspection/InitialStageInspectionMaster";
import InitialSampleInspectionMaster from "../components/quality/initialSampleInspection/InitialSampleInspectionMaster";
import ProblemSolvingEntryMaster from "../components/quality/problemSolvingEntry/ProblemSolvingEntryMaster";
import InProcessInspectionMaster from "../components/quality/inProcessInspection/InProcessInspectionMaster";
import InstrumentCalibrationMaster from "../components/quality/instrumentCalibration/InstrumentCalibrationMaster";
import VendorComplaintMaster from "../components/quality/vendorComplaint/VendorComplaintMaster";
import SupplierResponseMaster from "../components/quality/supplierResponse/SupplierResponseMaster";
import DICRMaster from "../components/quality/dailyInspectionCumRejectionData/DICRMaster";
import SalesContractAmendment from "../components/sales/SalesContractAmendment/SalesContractAmendmentMaster";
import SalesList from "../components/sales/SalesList";
import SalesOrderAmendment from "../components/sales/SalesOrderAmendment/SalesOrderAmendmentMaster";
import Profile from "../components/settings/Profile";
import SubContractList from "../components/subContract/SubContractList";
import AdvEntryMaster from "../components/subContract/advEntry/AdvEntryMaster";
import DcForCapitalItemsMaster from "../components/subContract/dcForCapitalItems/DcForCapitalItemsMaster";
import JobOrderMaster from "../components/subContract/jobOrder/JobOrderMaster";
import JobOrderAmendmentMaster from "../components/subContract/jobOrderAmendment/JobOrderAmendmentMaster";
import JobOrderShortCloseMaster from "../components/subContract/jobOrderShortClose/JobOrderShortCloseMaster";
import ScBillMaster from "../components/subContract/scBill/ScBillMaster";
import ScrapMaterialReturnMaster from "../components/subContract/scrapMaterialReturn/ScrapMaterialReturnMaster";
import SubContractReconciliationMaster from "../components/subContract/subContractReconciliation/SubContractReconciliationMaster";
import SubContractSupplyScheduleMaster from "../components/subContract/subContractSupplySchedule/SubContractSupplyScheduleMaster";
import SubContractingDcMaster from "../components/subContract/subContractingDc/SubContractingDcMaster";
import SupplierRateContractMaster from "../components/subContract/supplierRateContract/SupplierRateContractMaster";
import SupplierRateContractAmendmentMaster from "../components/subContract/supplierRateContractAmendment/SupplierRateContractAmendmentMaster";
import Dashboard from "../pages/DashBoard";
import inventoryRoutes from "./inventoryRoutes";
import purchaseRoutes from "./purchaseRoutes";
// sales
import ServiceAccounting from "../components/masters/servicesAccounting/ServiceAccounting";
import FlashNcReport from "../components/quality/flashNcReport/flashNcReport";
import DespatchInstruction from "../components/sales/despatchinstruction/DespatchInstruction";
import DocketInvoiceDetailsMaster from "../components/sales/docketInvoiceDetails/DocketInvoiceDetailsMaster";
import Enquiry from "../components/sales/enquiry/Enquiry";
import OrderAcceptance from "../components/sales/orderacceptance/OrderAcceptance";
import OtherSalesInvoiceMasterScreen from "../components/sales/othersalesinvoice/OtherSalesInvoiceMasterScreen";
import ProformaInvoice from "../components/sales/proformainvoice/ProformaInvoice";
import Quotation from "../components/sales/quotation/Quotation";
import SalesContract from "../components/sales/salescontract/SalesContract";
import SalesDelivery from "../components/sales/salesdeliveryschedule/SalesDelivery";
import StockTransferChallanMaster from "../components/sales/stockTransferChallan/StockTransferChallanMaster";
import TransportBillMaster from "../components/sales/transportBill/TransportBillMaster";
import salesRoutes from "./salesRoutes";
import securityRoutes from "./securityRoutes";
export const routesConfig = [
  { path: "/", label: "Dashboard", element: <Dashboard /> },

  // WMS Routes
  { path: "/masters", label: "Masters", element: <MastersList /> },
  { path: "/Sales", label: "Sales", element: <SalesList /> },
  { path: "/purchase", label: "Purchase", element: <PurchaseList /> },
  {
    path: "/purchaseorderamendment",
    label: "Purchase Order Amendment",
    element: <PurchaseOrderAmendment />,
  },
  {
    path: "/purchasecontractamendment",
    label: "Purchase Contract Amendment",
    element: <PurchaseContractAmendment />,
  },
  {
    path: "/importgrn",
    label: "Import GRN",
    keywords: ["grn", "goods receipt"],
    element: <ImportGRNMaster />,
  },
  {
    path: "/salescontractamendment",
    label: "Sales Contract Amendment",
    element: <SalesContractAmendment />,
  },
  {
    path: "/salesorderamendment",
    label: "Sales Order Amendment",
    element: <SalesOrderAmendment />,
  },
  { path: "/inventory", label: "Inventory", element: <InventoryList /> },
  { path: "/subcontract", label: "Sub Contract", element: <SubContractList /> },
  {
    path: "/scrapmaterialreturn",
    label: "Scrap/Material Return/Rejection From S.C.",
    element: <ScrapMaterialReturnMaster />,
  },
  {
    path: "/supplierratecontract",
    label: "Supplier Rate Contract",
    element: <SupplierRateContractMaster />,
  },
  {
    path: "/joborder",
    label: "Job Order",
    element: <JobOrderMaster />,
  },
  {
    path: "/joborderamendment",
    label: "Job Order Amendment",
    element: <JobOrderAmendmentMaster />,
  },
  {
    path: "/dcforsubcontracting",
    label: "D.C For Sub Contracting (JO)",
    element: <SubContractingDcMaster />,
  },
  {
    path: "/scbill",
    label: "S.C. Bill",
    element: <ScBillMaster />,
  },
  {
    path: "/subcontractsupplyschedule",
    label: "Sub Contract Supply Schedule",
    element: <SubContractSupplyScheduleMaster />,
  },
  {
    path: "/supplierratecontractamendment",
    label: "Supplier Rate Contract Amendment",
    element: <SupplierRateContractAmendmentMaster />,
  },
  {
    path: "/subcontractreconciliation",
    label: "Sub Contract Re-Conciliation",
    element: <SubContractReconciliationMaster />,
  },
  {
    path: "/jobordershortclose",
    label: "Job Order Short Close",
    element: <JobOrderShortCloseMaster />,
  },
  {
    path: "/advforstores",
    label: "ADV For Stores",
    element: <AdvEntryMaster />,
  },
  {
    path: "/dcforcapitalitems",
    label: "DC For Capital Items",
    element: <DcForCapitalItemsMaster />,
  },
  { path: "/ppc", label: "PPC", element: <PpcList /> },
  {
    path: "/materialplan",
    label: "Material Plan",
    element: <MaterialPlanningMaster />,
  },
  {
    path: "/transferorders",
    label: "Transfer Orders",
    element: <TransferOrderMaster />,
  },
  {
    path: "/bomcorrectionrequest",
    label: "BOM Correction Request/Note",
    element: <BomCorrectionRequestMaster />,
  },
  {
    path: "/drawingattachments",
    label: "Drawing Attachments",
    element: <DrawingAttachmentMaster />,
  },
  { path: "/TDC", label: "TDC", element: <TdcList /> },
  {
    path: "/engineeringchangerecord",
    label: "Engineering Change Record",
    element: <EcrMaster />,
  },
  {
    path: "/engineeringchangenote",
    label: "Engineering Change Note",
    element: <EcnMaster />,
  },
  {
    path: "/engineeringdeviationrequest",
    label: "Engineering Deviation Request/Note",
    element: <EngineeringDeviationRequestMaster />,
  },
  {
    path: "/supplierchangerequest",
    label: "Supplier Change Request",
    element: <SupplierChangeRequestMaster />,
  },
  {
    path: "/inspectionrequisitionnote",
    label: "Inspection Requisition Note",
    element: <InspectionRequisitionNoteMaster />,
  },
  { path: "/production", label: "Production", element: <ProductionList /> },
  {
    path: "/plantmaintenance",
    label: "Plant Maintenance",
    element: <PlantMaintenanceList />,
  },
  {
    path: "/quality",
    label: "Quality",
    element: <QualityList />,
  },
  {
    path: "/parametermaster",
    label: "Parameter Master",
    keywords: ["parameter", "quality"],
    element: <ParameterMaster />,
  },
  {
    path: "/initialplanning",
    label: "Initial Planning",
    keywords: ["initial planning", "planning", "quality"],
    element: <InitialPlanning />,
  },
  {
    path: "/controlplan",
    label: "Control Plan",
    keywords: ["control plan", "quality"],
    element: <ControlPlan />,
  },
  {
    path: "/flashncreport",
    label: "FlashNc Report",
    keywords: ["flashNc Report", "quality"],
    element: <FlashNcReport />,
  },
  {
    path: "/deliverychallancumgatepass",
    label: "Delivery Challan Cum Gate Pass",
    keywords: ["delivery challan", "gate pass", "quality"],
    element: <DeliveryChallanCumGatePassMaster />,
  },
  {
    path: "/qualityscrapnote",
    label: "Quality Scrap Note",
    keywords: ["quality scrap", "scrap note", "quality"],
    element: <QualityScrapNoteMaster />,
  },
  {
    path: "/predeliveryinspectionreport",
    label: "Pre Delivery Inspection Report",
    keywords: ["pre delivery", "inspection", "quality"],
    element: <PreDeliveryInspectionReportMaster />,
  },
  {
    path: "/inwardinspection",
    label: "Inward Inspection",
    keywords: ["inward", "inspection", "quality"],
    element: <InwardInspectionMaster />,
  },
  {
    path: "/setupapproval",
    label: "Set Up Approval",
    keywords: ["set up", "approval", "quality"],
    element: <SetUpApprovalMaster />,
  },
  {
    path: "/8disciplineentry",
    label: "8-Discipline Entry",
    keywords: ["8 discipline", "8d", "quality"],
    element: <EightDisciplineEntryMaster />,
  },
  {
    path: "/rootcauseanalysis",
    label: "Root Cause Analysis",
    keywords: ["root cause", "rca", "quality"],
    element: <RootCauseAnalysisMaster />,
  },
  {
    path: "/zerokmfailureentry",
    label: "Zero Km Failure Entry",
    keywords: ["zero km", "failure", "quality"],
    element: <ZeroKmFailureMaster />,
  },
  {
    path: "/initialstageinspection",
    label: "Initial Stage Inspection",
    keywords: ["initial stage", "inspection", "quality"],
    element: <InitialStageInspectionMaster />,
  },
  {
    path: "/initialsampleinspection",
    label: "Initial Sample Inspection",
    keywords: ["initial sample", "inspection", "quality"],
    element: <InitialSampleInspectionMaster />,
  },
  {
    path: "/problemsolvingentry",
    label: "Problem Solving Entry",
    keywords: ["problem solving", "quality"],
    element: <ProblemSolvingEntryMaster />,
  },
  {
    path: "/inprocessinspection",
    label: "In-Process Inspection",
    keywords: ["in process", "inspection", "quality"],
    element: <InProcessInspectionMaster />,
  },
  {
    path: "/instrumentcalibration",
    label: "Instrument Calibration",
    keywords: ["instrument", "calibration", "quality"],
    element: <InstrumentCalibrationMaster />,
  },
  {
    path: "/vendorcomplaintentry",
    label: "Vendor Complaint Entry",
    keywords: ["vendor", "complaint", "supplier", "quality"],
    element: <VendorComplaintMaster />,
  },
  {
    path: "/supplierresponseentry",
    label: "Supplier Response Entry",
    keywords: ["supplier", "response", "complaint", "quality"],
    element: <SupplierResponseMaster />,
  },
  {
    path: "/dailyinspectioncumrejectiondata",
    label: "Daily Inspection Cum Rejection Data",
    keywords: ["daily", "inspection", "rejection", "scrap", "quality"],
    element: <DICRMaster />,
  },
  {
    path: "/labourcharges",
    label: "Labour Charges",
    element: <LabourChargesList />,
  },
  { path: "/country", label: "Country Master", element: <CountryMaster /> },
  { path: "/state", label: "State Master", element: <StateMaster /> },
  { path: "/city", label: "City Master", element: <CityMaster /> },
  {
    path: "/department",
    label: "Department Master",
    element: <DepartmentMaster />,
  },
  {
    path: "/designation",
    label: "Designation Master",
    element: <DesignationMaster />,
  },
  { path: "/location", label: "Location Master", element: <LocationMaster /> },
  { path: "/company", label: "Company Master", element: <CompanyMaster /> },
  {
    path: "/financialyear",
    label: "Financial Year Master",
    element: <FinancialYearMaster />,
  },
  { path: "/party", label: "Party Master", element: <PartyMaster /> },
  {
    path: "/transporter",
    label: "Transport Master",
    keywords: ["transporter"],
    element: <TransportMaster />,
  },
  {
    path: "/partymappingaccount",
    label: "Party Account Mapping Master",
    element: <PartyAccountMappingMaster />,
  },
  {
    path: "/exchangerate",
    label: "Exchange Rate Master",
    element: <ExchangeRateMaster />,
  },
  {
    path: "/exchangerateupdate",
    label: "Exchange Rate Update Master",
    element: <ExchangeRateUpdateMaster />,
  },
  {
    path: "/saleszone",
    label: "Sales Zone Master",
    element: <SalesZoneMaster />,
  },
  {
    path: "/documenttype",
    label: "Document Type Master",
    keywords: ["doc type"],
    element: <DocTypeMaster />,
  },
  {
    path: "/documenttypemapping",
    label: "Document Type Mapping Master",
    element: <DocTypeMappingMaster />,
  },
  {
    path: "/dailyexchangerate",
    label: "Daily Exchange Rate Master",
    element: <DailyExchangeRateMaster />,
  },
  { path: "/item", label: "Item Master", element: <ItemMaster /> },
  {
    path: "/itemgrade",
    label: "Item Grade Master",
    keywords: ["grade"],
    element: <ItemGradeMaster />,
  },
  { path: "/unit", label: "Unit Master", element: <UnitMaster /> },
  {
    path: "/unitconversion",
    label: "Unit Conversion Master",
    element: <UnitConversionMaster />,
  },
  {
    path: "/listofvalues",
    label: "List of Values Master",
    keywords: ["lov"],
    element: <ListMaster />,
  },
  {
    path: "/lmtrate",
    label: "LME Rate Master",
    keywords: ["lme"],
    element: <LMEMaster />,
  },
  { path: "/bank", label: "Bank Master", element: <BankMaster /> },
  { path: "/taxRate", label: "Tax Rate Master", element: <TaxRateMaster /> },
  {
    path: "/taxDefination",
    label: "Tax Definition Master",
    keywords: ["tax definition"],
    element: <TaxDefinationMaster />,
  },
  { path: "/currency", label: "Currency Master", element: <Currency /> },
  {
    path: "/hsnsac",
    label: "HSN/SAC Master",
    keywords: ["hsn", "sac", "gst code"],
    element: <HsnSacMaster />,
  },
  { path: "/calendar", label: "Calendar Master", element: <CalendarMaster /> },
  { path: "/holiday", label: "Holiday Master", element: <HolidayMaster /> },
  {
    path: "/services-accounting",
    label: "Services Accounting Master",
    element: <ServiceAccounting />,
  },
  {
    path: "/services-accounting",
    label: "Services Accounting Master",
    element: <ServicesAccountingMaster />,
  },
  { path: "/gst_state", label: "GST State Master", element: <GSTState /> },
  { path: "/gst_rate", label: "GST Rate Master", element: <GSTRate /> },
  { path: "/employee", label: "Employee Master", element: <EmployeeMaster /> },
  { path: "/userCreation", label: "User Creation", element: <UserCreation /> },
  {
    path: "/financial-year",
    label: "Financial Year Master",
    element: <FinYear />,
  },
  { path: "/screens", label: "Screen Names Master", element: <ScreenNames /> },
  {
    path: "/screen-access",
    label: "Screen Access Master",
    element: <ScreenAccess />,
  },
  {
    path: "/new-entries",
    label: "Create Company",
    element: <CreateCompanyPage />,
  },
  { path: "/branch", label: "Branch Master", element: <BranchMaster /> },
  {
    path: "/roles",
    label: "Roles & Responsibilities",
    keywords: ["role"],
    element: <RolesAndResponsibilitySetup />,
  },
  {
    path: "/myprofile",
    label: "My Profile",
    keywords: ["profile", "account"],
    element: <Profile />,
  },
  // sales module
  {
    path: "/sales/enquiry",
    label: "Enquiry",
    keywords: ["enquiry"],
    element: <Enquiry />,
  },
  {
    path: "/sales/quotation",
    label: "Quotation",
    keywords: ["quotation"],
    element: <Quotation />,
  },
  {
    path: "/sales/salesdelivery",
    label: "Sales Delivery Schedule",
    keywords: ["salesdelivery"],
    element: <SalesDelivery />,
  },
  {
    path: "/sales/despatchinstruction",
    label: "Despatch Instruction",
    keywords: ["despatchinstruction"],
    element: <DespatchInstruction />,
  },
  {
    path: "/sales/orderacceptance",
    label: "Order Acceptance",
    keywords: ["orderacceptance"],
    element: <OrderAcceptance />,
  },
  {
    path: "/sales/salescontract",
    label: "Sales Contract",
    keywords: ["salescontract"],
    element: <SalesContract />,
  },
  {
    path: "/sales/proformainvoice",
    label: "Proforma Invoice",
    keywords: ["proformainvoice"],
    element: <ProformaInvoice />,
  },
  {
    path: "/stocktransferchallan",
    label: "Stock Transfer Challan",
    keywords: ["stocktransferchallan"],
    element: <StockTransferChallanMaster />,
  },
  {
    path: "/othersalesinvoice",
    label: "Other Sales Invoice",
    keywords: ["othersalesinvoice", "sales invoice"],
    element: <OtherSalesInvoiceMasterScreen />,
  },
  {
    path: "/transportbill",
    label: "Transport Bill",
    keywords: ["transportbill", "transport"],
    element: <TransportBillMaster />,
  },
  {
    path: "/docketinvoicedetails",
    label: "Docket/Invoice Details",
    keywords: ["docketinvoicedetails", "docket"],
    element: <DocketInvoiceDetailsMaster />,
  },
  ...purchaseRoutes,
  ...inventoryRoutes,
  ...salesRoutes,
  ...securityRoutes,
];
