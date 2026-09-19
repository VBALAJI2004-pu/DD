import React, { useEffect, useState, useRef } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { FiShoppingCart } from "react-icons/fi";
import { BsChatLeft } from "react-icons/bs";
import { RiNotification3Line } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

import avatar from "../data/avatar.jpg";
import { Cart, Chat, Notification, UserProfile } from ".";
import { useStateContext } from "../contexts/ContextProvider";
import { getImageBaseUrl } from "../Library/Axios";
import { useRole } from "../contexts/RoleContext";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import DateRangeFilter from "./DateRangeFilter";
import useExpenseStore from "../Store/ExpenseStore";

const months = [
  "All",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const years = [2025, 2026, 2027, 2028, 2029, 2030];

const NavButton = ({ title, customFunc, icon, color, dotColor }) => {
  return (
    <TooltipComponent
      content={title}
      position="BottomCenter"
      cssClass="my-tooltip"
    >
      <button
        type="button"
        onClick={() => customFunc()}
        style={{ color }}
        className="relative text-xl rounded-full p-3 hover:bg-light-gray"
      >
        <span
          style={{ background: dotColor }}
          className="absolute inline-flex rounded-full h-2 w-2 top-2 right-2"
        ></span>
        {icon}
      </button>
    </TooltipComponent>
  );
};

const Navbar = () => {
  const {
    currentColor,
    currentMode,
    activeMenu,
    setActiveMenu,
    handleClick,
    isClicked,
    setIsClicked,
    setScreenSize,
    screenSize,
  } = useStateContext();
  const { permissions } = useRole();
  const { user } = useAuth();
  const {
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    isDateRangeActive,
  } = useExpenseStore();
  const location = useLocation();
  const profileRef = useRef(null);

  // Check if we're on management pages where date filters should be hidden
  const isManagementPage = location.pathname === '/manage-categories' || 
                           location.pathname === '/manage-users' || 
                           location.pathname === '/add-expense' || 
                           location.pathname === '/daily-sale' ||
                           !permissions.canSeeFilters;
  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize]);

  // Handle click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking inside the profile dropdown
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        // Add a small delay to allow button clicks to register
        setTimeout(() => {
          setIsClicked({ ...isClicked, userProfile: false });
        }, 100);
      }
    };

    if (isClicked.userProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isClicked.userProfile, setIsClicked]);

  const handleActiveMenu = () => setActiveMenu(!activeMenu);

  return (
    <div
      className={`fixed top-0 z-40 bg-white dark:bg-secondary-dark-bg shadow-md border-b border-gray-200 dark:border-gray-700 navbar-container transition-all duration-300 ${
        activeMenu ? "sidebar-expanded" : "sidebar-collapsed"
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between p-1 sm:p-2 md:mr-6 md:ml-6 relative gap-1 sm:gap-2 navbar-mobile w-full">
        {/* Top row for mobile - Sidebar button and Profile */}
        <div className="flex sm:hidden justify-between items-center w-full">
          <button
            type="button"
            onClick={() => setActiveMenu(!activeMenu)}
            style={{ color: currentColor }}
            className="text-xl rounded-full p-1 hover:bg-light-gray flex-shrink-0"
          >
            <AiOutlineMenu />
          </button>

          {/* Mobile Profile section - Top right */}
          <div className="flex items-center gap-1 relative" ref={profileRef}>
            <TooltipComponent content="Profile" position="BottomCenter">
              <div
                className="flex items-center cursor-pointer p-1 hover:bg-light-gray rounded-lg"
                onClick={() => handleClick("userProfile")}
              >
                <img
                  className="rounded-full w-7 h-7"
                  src={user?.profilePictureUrl || (user?.profilePicture ? `${getImageBaseUrl()}/uploads/${user.profilePicture}` : avatar)}
                  alt="user-profile"
                />
                <MdKeyboardArrowDown className="text-gray-400 text-xs ml-1" />
              </div>
            </TooltipComponent>

            {/* Mobile Profile dropdown */}
            {isClicked.userProfile && (
              <div className="sm:hidden profile-dropdown">
                <UserProfile />
              </div>
            )}
          </div>
        </div>

        {/* Desktop sidebar button */}
        <button
          type="button"
          onClick={() => setActiveMenu(!activeMenu)}
          style={{ color: currentColor }}
          className="hidden sm:block text-xl sm:text-2xl rounded-full p-1 sm:p-2 hover:bg-light-gray flex-shrink-0"
        >
          <AiOutlineMenu />
        </button>

        {/* Main content section */}
        <div className="navbar-left-section flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 flex-1 min-w-0 px-1 sm:px-0 justify-between sm:justify-start">
          {/* Hide date filters on management pages */}
          {!isManagementPage && (
            <>
              {/* Month/Year Dropdowns - Hidden when date range is active */}
              {!isDateRangeActive && (
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className={`px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm ${
                      currentMode === "Dark"
                        ? "bg-[#23272e] text-gray-100 border-gray-600"
                        : "bg-white text-gray-900 border-gray-300"
                    }`}
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className={`px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm ${
                      currentMode === "Dark"
                        ? "bg-[#23272e] text-gray-100 border-gray-600"
                        : "bg-white text-gray-900 border-gray-300"
                    }`}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Range Filter - Hidden for Staff users */}
              {user?.role !== 'staff' && (
                <div className="flex flex-row items-center gap-1 sm:gap-2 date-inputs-mobile flex-shrink-0">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                    Date Range:
                  </div>
                  <DateRangeFilter isNavbar={true} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Desktop Profile section - Right side */}
        <div
          className="hidden sm:flex navbar-right-section items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto relative"
          ref={profileRef}
        >
          <TooltipComponent content="Profile" position="BottomCenter">
            <div
              className="flex items-center gap-1 sm:gap-2 cursor-pointer p-1 hover:bg-light-gray rounded-lg"
              onClick={() => handleClick("userProfile")}
            >
              <img
                className="rounded-full w-7 h-7 sm:w-8 sm:h-8"
                src={user?.profilePictureUrl || (user?.profilePicture ? `${getImageBaseUrl()}/uploads/${user.profilePicture}` : avatar)}
                alt="user-profile"
              />
              <p>
                <span className="text-gray-400 text-14">Hi,</span>{" "}
                <span className="text-gray-400 font-bold ml-1 text-14">
                  {user?.name || 'User'}
                </span>
              </p>
              <MdKeyboardArrowDown className="text-gray-400 text-14" />
            </div>
          </TooltipComponent>

          {/* Desktop Profile dropdown */}
          {isClicked.userProfile && (
            <div className="hidden sm:block profile-dropdown">
              <UserProfile />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
