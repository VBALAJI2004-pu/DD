import React, { useEffect, useRef } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { useRole } from "../contexts/RoleContext";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MdOutlineCancel } from "react-icons/md";
import { SiShopware } from "react-icons/si";
import { AiOutlineMenu, AiOutlinePlusCircle } from "react-icons/ai";
import { FiDatabase, FiCalendar } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { links } from "../data/dummy";
// Removed: import gsap from "gsap";

const Sidebar = () => {
  const { currentColor, setActiveMenu, activeMenu, screenSize } =
    useStateContext();
  const { permissions } = useRole();
  const sidebarRef = useRef(null);
  const location = useLocation();

  // Removed GSAP animation for sidebar open/close
  // Removed GSAP animation for active link highlight

  const handleCloseSidebar = () => {
    if (activeMenu !== undefined && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const activeLink =
    "sidebar-active-link flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-white text-md m-2";
  const normalLink =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2";

  return (
    <div
      ref={sidebarRef}
      className="h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10 flex flex-col justify-between fixed z-50 left-0 top-0 bg-white dark:bg-[#23272e] transition-all duration-300"
      style={{
        minWidth: 220,
        maxWidth: 260,
        transform: activeMenu ? "translateX(0)" : "translateX(-300px)",
        opacity: activeMenu ? 1 : 0,
      }}
    >
      {activeMenu && (
        <>
          {/* Mobile/Tablet Collapse Button - Only visible on smaller screens */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
            <Link
              to="/"
              onClick={handleCloseSidebar}
              className="items-center gap-3 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900 whitespace-nowrap"
            >
              <img src="/dashboard.png" alt="Daily Docket" className="w-8 h-8" />
              <span>Daily Docket</span>
            </Link>
            <TooltipComponent content="Close Sidebar" position="BottomCenter">
              <button
                type="button"
                onClick={() => setActiveMenu(false)}
                style={{ color: currentColor }}
                className="text-2xl rounded-full p-2 hover:bg-light-gray"
              >
                <MdOutlineCancel />
              </button>
            </TooltipComponent>
          </div>

          {/* Desktop Logo - Only visible on larger screens */}
          <div className="hidden md:flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <Link
              to="/"
              onClick={handleCloseSidebar}
              className="items-center gap-3 flex text-2xl font-extrabold tracking-tight dark:text-white text-slate-900 whitespace-nowrap"
            >
              <img src="/dashboard.png" alt="Daily Docket" className="w-10 h-10" />
              <span>Daily Docket</span>
            </Link>
          </div>

          <div className="mt-6 flex-1">
            {links.map((item) => (
              <div key={item.title}>
                <p className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase">
                  {item.title}
                </p>
                {item.links.map((link) => {
                  // Role-based visibility logic
                  if (link.linkTo === 'expenses' && !permissions.canViewExpenseData) return null;
                  if (link.linkTo === 'sales-data' && !permissions.canViewSalesData) return null;
                  if (link.linkTo === 'manage-categories' && !permissions.canManageCategories) return null;
                  if (link.linkTo === 'manage-users' && !permissions.canManageUsers) return null;
                  
                  return (
                    <NavLink
                      to={`/${link.linkTo}`}
                      key={link.name}
                      onClick={handleCloseSidebar}
                      style={({ isActive }) => ({
                        backgroundColor: isActive ? currentColor : "",
                      })}
                      className={({ isActive }) =>
                        isActive ? activeLink : normalLink
                      }
                    >
                      {link.icon}
                      <span className="capitalize">{link.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
          {/* Action buttons at the bottom */}
          <div className="mb-4 flex flex-col gap-2 px-4">
            {permissions.canAddExpense && (
              <Link
                to="/add-expense"
                onClick={handleCloseSidebar}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white shadow-lg"
                style={{ background: currentColor }}
              >
                <AiOutlinePlusCircle className="text-xl" />
                <span>Add Expense</span>
              </Link>
            )}
            {permissions.canAddSale && (
              <Link
                to="/daily-sale"
                onClick={handleCloseSidebar}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white shadow-lg"
                style={{ background: currentColor }}
              >
                <AiOutlinePlusCircle className="text-xl" />
                <span>Add Sale</span>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
