import { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import LoginForm from "./components/Auth/LoginForm";
import Layout from "./components/Layout/Layout";
import CountryMaster from "./components/masters/country/CountryMaster";
import MastersList from "./components/masters/MasterList";
import Setup from "./components/masters/Setup";
import ProfileSettings from "./components/settings/Profile";
import SettingsDashboard from "./components/settings/SettingsDashboard";
import UserManagement from "./components/settings/UserManagement";
import Dashboard from "./pages/DashBoard";
import { store } from "./store";
import "./styles/globals.css";
import ChatWidget from "./utils/ChatWidget";
import { ToastProvider } from "./components/Toast/ToastContext";
import StateMaster from "./components/masters/state/StateMaster";
import CityMaster from "./components/masters/city/CityMaster";
import DepartmentMaster from "./components/masters/Department/DepartmentMaster";
import DesignationMaster from "./components/masters/Designation/DesignationMaster";
import User from "./components/masters/user/User";
import FinYear from "./components/masters/finyear/Finyear";
import ScreenNames from "./components/masters/screens/ScreenNames";
import ScreenAccess from "./components/masters/screenAccess/screenAccess";
import CreateCompanyPage from "./components/masters/createCompany/companyMaster";
import BranchMaster from "./components/masters/branch/BranchMaster";
import RolesAndResponsibilitySetup from "./components/masters/rolesResponsibilities/RolesAndResponsibilitySetup";
import LocationMasterList from "./components/masters/location/LocationMasterList";
import CompanyMasterList from "./components/masters/company/CompanyMasterList";
import FinancialYearMasterList from "./components/masters/financialYear/FinancialYearMasterList";
import PartyMasterList from "./components/masters/party/PartyMasterList";
import ItemMasterList from "./components/masters/item/ItemMasterList";
import UnitMasterList from "./components/masters/unit/UnitMasterList";
import UnitConversionMasterList from "./components/masters/unitConversion/UnitConversionMasterList";
import EmployeeMasterList from "./components/masters/employee/EmployeeMasterList";
import LocationMaster from "./components/masters/location/LocationMaster";
import PartyMaster from "./components/masters/party/PartyMaster";
import ItemMaster from "./components/masters/item/ItemMaster";
import EmployeeMaster from "./components/masters/employee/EmployeeMaster";
import CompanyMaster from "./components/masters/company/CompanyMaster";
import FinancialYearMaster from "./components/masters/financialYear/FinancialYearMaster";
import UnitMaster from "./components/masters/unit/UnitMaster";
import UnitConversionMaster from "./components/masters/unitConversion/UnitConversionMaster";
import Profile from "./components/settings/Profile";
import ListMaster from "./components/masters/listofvalues/ListMaster";
import Currency from "./components/masters/currency/Currency";
import GSTState from "./components/masters/gstState/GSTState";
import GSTRate from "./components/masters/gstrate/GSTRate";
import TransportMaster from "./components/masters/transport/TransportMaster";
import DocTypeMaster from "./components/masters/docType/DocTypeMaster";

const ThemeInitializer = () => {
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  return null;
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/" />;
};

const AppContent = () => {
  return (
    <>
      <ThemeInitializer />
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />

                      {/* WMS Routes */}
                      <Route path="/masters" element={<MastersList />} />
                      <Route path="/country" element={<CountryMaster />} />
                      <Route path="/state" element={<StateMaster />} />
                      <Route path="/city" element={<CityMaster />} />
                      <Route
                        path="/department"
                        element={<DepartmentMaster />}
                      />
                      <Route
                        path="/designation"
                        element={<DesignationMaster />}
                      />
                      <Route path="/location" element={<LocationMaster />} />
                      {/* <Route path="/location" element={<LocationMasterList/>} /> */}
                      <Route path="/company" element={<CompanyMaster />} />
                      <Route
                        path="/financialyear"
                        element={<FinancialYearMaster />}
                      />
                      <Route path="/party" element={<PartyMaster />} />
                      <Route
                        path="/transporter"
                        element={<TransportMaster />}
                      />
                      <Route path="/documenttype" element={<DocTypeMaster />} />
                      <Route path="/item" element={<ItemMaster />} />
                      <Route path="/unit" element={<UnitMaster />} />
                      <Route
                        path="/unitconversion"
                        element={<UnitConversionMaster />}
                      />
                      <Route path="/listofvalues" element={<ListMaster />} />
                      <Route path="/currency" element={<Currency />} />
                      <Route path="/gst_state" element={<GSTState />} />
                      <Route path="/gst_rate" element={<GSTRate />} />

                      <Route path="/employee" element={<EmployeeMaster />} />

                      <Route path="/financial-year" element={<FinYear />} />

                      <Route path="/screens" element={<ScreenNames />} />

                      <Route path="/screen-access" element={<ScreenAccess />} />

                      <Route
                        path="/new-entries"
                        element={<CreateCompanyPage />}
                      />

                      <Route path="/branch" element={<BranchMaster />} />

                      <Route
                        path="/roles"
                        element={<RolesAndResponsibilitySetup />}
                      />
                      <Route path="/myprofile" element={<Profile />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ToastProvider>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      {/* <ChatWidget /> */}
      <AppContent />
    </Provider>
  );
}

export default App;
