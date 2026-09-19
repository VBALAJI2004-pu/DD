import React, { useEffect } from "react";
import { Navbar, Sidebar, Footer, ThemeSettings, ProtectedRoute, RoleProtectedRoute } from "./components";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useStateContext } from "./contexts/ContextProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProvider } from "./contexts/RoleContext";
import {
  Ecommerce,
  Pie,
  AddExpense,
  Login,
  DailySale,
  SalesData,
  ManageCategories,
  ManageUsers,
} from "./pages";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiSettings } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

export const App = () => {
  const {
    currentColor,
    setCurrentColor,
    currentMode,
    setCurrentMode,
    activeMenu,
  } = useStateContext();

  useEffect(() => {
    const currentThemeColor = localStorage.getItem("colorMode");
    const currentThemeMode = localStorage.getItem("themeMode");
    if ((currentThemeColor, currentThemeMode)) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);

  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      <BrowserRouter>
        <AuthProvider>
          <RoleProvider>
            <Routes>
            {/* Login Page - Main Landing */}
            <Route path="/login" element={<Login />} />

            {/* Dashboard Routes - Protected */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div className="flex relative dark:bg-main-dark-bg">
                    <Sidebar />
                    <div
                      className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full transition-all duration-300 ${
                        activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
                      }`}
                    >
                      <Navbar />
                      <div className="pt-0">
                        <Ecommerce />
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div className="flex relative dark:bg-main-dark-bg">
                    <Sidebar />
                    <div
                      className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full transition-all duration-300 ${
                        activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
                      }`}
                    >
                      <Navbar />
                      <div className="pt-0">
                        <Ecommerce />
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

          {/* Other Dashboard Routes */}
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="canViewExpenseData">
                  <div className="flex relative dark:bg-main-dark-bg">
                    <Sidebar />
                    <div
                      className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full transition-all duration-300 ${
                        activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
                      }`}
                    >
                      <Navbar />
                      <div className="pt-0">
                        <Pie />
                      </div>
                    </div>
                  </div>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-expense"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="canAddExpense">
                  <div className="flex relative dark:bg-main-dark-bg">
                    <Sidebar />
                    <div
                      className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full transition-all duration-300 ${
                        activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
                      }`}
                    >
                      <Navbar />
                      <div className="pt-0">
                        <AddExpense />
                      </div>
                    </div>
                  </div>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/daily-sale"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="canAddSale">
                  <div className="flex relative dark:bg-main-dark-bg">
                    <Sidebar />
                    <div
                      className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full transition-all duration-300 ${
                        activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
                      }`}
                    >
                      <Navbar />
                      <div className="pt-0">
                        <DailySale />
                      </div>
                    </div>
                  </div>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-data"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="canViewSalesData">
                  <div className="flex relative dark:bg-main-dark-bg">
                    <Sidebar />
                    <div
                      className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full transition-all duration-300 ${
                        activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
                      }`}
                    >
                      <Navbar />
                      <div className="pt-0">
                        <SalesData />
                      </div>
                    </div>
                  </div>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-categories"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="canManageCategories">
                  <div className="flex relative dark:bg-main-dark-bg">
                    <Sidebar />
                    <div
                      className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full transition-all duration-300 ${
                        activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
                      }`}
                    >
                      <Navbar />
                      <div className="pt-0">
                        <ManageCategories />
                      </div>
                    </div>
                  </div>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-users"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="canManageUsers">
                  <div className="flex relative dark:bg-main-dark-bg">
                    <Sidebar />
                    <div
                      className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full transition-all duration-300 ${
                        activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
                      }`}
                    >
                      <Navbar />
                      <div className="pt-0">
                        <ManageUsers />
                      </div>
                    </div>
                  </div>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          </Routes>
          </RoleProvider>
        </AuthProvider>
      </BrowserRouter>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={currentMode === "Dark" ? "dark" : "light"}
      />
    </div>
  );
};
