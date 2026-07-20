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

// Theme initializer component
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
                      <Route path="/department" element={<DepartmentMaster />} />
                      <Route path="/designation" element={<DesignationMaster />} />



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
