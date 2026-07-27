import CountryMaster from "../components/masters/country/CountryMaster";
import MastersList from "../components/masters/MasterList";
import Dashboard from "../pages/DashBoard";
import StateMaster from "../components/masters/state/StateMaster";
import CityMaster from "../components/masters/city/CityMaster";
import DepartmentMaster from "../components/masters/Department/DepartmentMaster";
import DesignationMaster from "../components/masters/Designation/DesignationMaster";
import FinYear from "../components/masters/finyear/Finyear";
import ScreenNames from "../components/masters/screens/ScreenNames";
import ScreenAccess from "../components/masters/screenAccess/screenAccess";
import CreateCompanyPage from "../components/masters/createCompany/companyMaster";
import BranchMaster from "../components/masters/branch/BranchMaster";
import RolesAndResponsibilitySetup from "../components/masters/rolesResponsibilities/RolesAndResponsibilitySetup";
import LocationMaster from "../components/masters/location/LocationMaster";
import PartyMaster from "../components/masters/party/PartyMaster";
import ItemMaster from "../components/masters/item/ItemMaster";
import EmployeeMaster from "../components/masters/employee/EmployeeMaster";
import CompanyMaster from "../components/masters/company/CompanyMaster";
import FinancialYearMaster from "../components/masters/financialYear/FinancialYearMaster";
import UnitMaster from "../components/masters/unit/UnitMaster";
import UnitConversionMaster from "../components/masters/unitConversion/UnitConversionMaster";
import Profile from "../components/settings/Profile";
import ListMaster from "../components/masters/listofvalues/ListMaster";
import Currency from "../components/masters/currency/Currency";
import GSTState from "../components/masters/gstState/GSTState";
import GSTRate from "../components/masters/gstrate/GSTRate";
import TransportMaster from "../components/masters/transport/TransportMaster";
import DocTypeMaster from "../components/masters/docType/DocTypeMaster";
import DocTypeMappingMaster from "../components/masters/DocTypeMapping/DocTypeMappingMaster";
import DailyExchangeRateMaster from "../components/masters/DailyExchangeRate/DailyExchangeRateMaster";
import HsnSacMaster from "../components/masters/hsnsac/HsnSacMaster";
import CalendarMaster from "../components/masters/calendar/CalendarMaster";
import PartyAccountMappingMaster from "../components/masters/partyAccountMapping/PartyAccountMappingMaster";
import ExchangeRateMaster from "../components/masters/exchangeRate/ExchangeRateMaster";
import ExchangeRateUpdateMaster from "../components/masters/exchangeRateUpdate/ExchangeRateUpdateMaster";
import SalesZoneMaster from "../components/masters/salesZone/SalesZoneMaster";
import LMEMaster from "../components/masters/LmeRate/LMEMaster";
import BankMaster from "../components/masters/bankMaster/BankMaster";
import TaxRateMaster from "../components/masters/taxRate/TaxRateMaster";
import TaxDefinationMaster from "../components/masters/taxDefination/TaxDefinationMaster";
import SalesList from "../components/sales/SalesList";

export const routesConfig = [
  { path: "/", label: "Dashboard", element: <Dashboard /> },

  // WMS Routes
  { path: "/masters", label: "Masters", element: <MastersList /> },
  { path: "/Sales", label: "Masters", element: <SalesList /> },
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
    label: "Party Account Mapping",
    element: <PartyAccountMappingMaster />,
  },
  {
    path: "/exchangerate",
    label: "Exchange Rate Master",
    element: <ExchangeRateMaster />,
  },
  {
    path: "/exchangerateupdate",
    label: "Exchange Rate Update",
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
    label: "Document Type Mapping",
    element: <DocTypeMappingMaster />,
  },
  {
    path: "/dailyexchangerate",
    label: "Daily Exchange Rate",
    element: <DailyExchangeRateMaster />,
  },
  { path: "/item", label: "Item Master", element: <ItemMaster /> },
  { path: "/unit", label: "Unit Master", element: <UnitMaster /> },
  {
    path: "/unitconversion",
    label: "Unit Conversion Master",
    element: <UnitConversionMaster />,
  },
  {
    path: "/listofvalues",
    label: "List of Values",
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
  { path: "/currency", label: "Currency", element: <Currency /> },
  {
    path: "/hsnsac",
    label: "HSN/SAC Master",
    keywords: ["hsn", "sac", "gst code"],
    element: <HsnSacMaster />,
  },
  { path: "/calendar", label: "Calendar Master", element: <CalendarMaster /> },
  { path: "/gst_state", label: "GST State", element: <GSTState /> },
  { path: "/gst_rate", label: "GST Rate", element: <GSTRate /> },
  { path: "/employee", label: "Employee Master", element: <EmployeeMaster /> },
  { path: "/financial-year", label: "Financial Year", element: <FinYear /> },
  { path: "/screens", label: "Screen Names", element: <ScreenNames /> },
  { path: "/screen-access", label: "Screen Access", element: <ScreenAccess /> },
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
];
