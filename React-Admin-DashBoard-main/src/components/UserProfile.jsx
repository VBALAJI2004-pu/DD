import React, { useState, useRef } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { FiSettings, FiUsers } from "react-icons/fi";
import { BiCategory } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
import { Button } from ".";
import { useStateContext } from "../contexts/ContextProvider";
import { useAuth } from "../contexts/AuthContext";
import { useRole } from "../contexts/RoleContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import avatar from "../data/avatar.jpg";
import Settings from "./Settings";
import { getImageBaseUrl } from "../Library/Axios";

const UserProfile = () => {
  const { currentColor, setIsClicked, isClicked } = useStateContext();
  const { user, logout } = useAuth();
  const { permissions } = useRole();
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsClicked({ ...isClicked, userProfile: false });
    toast.success("Logged out successfully!");
    navigate('/login');
  };


  return (
    <>
    <div className="nav-item absolute z-[60] bg-white dark:bg-[#42464D] p-3 sm:p-4 md:p-8 rounded-lg w-72 sm:w-80 md:w-96 shadow-lg border border-gray-200 dark:border-gray-600 profile-dropdown max-h-[80vh] overflow-visible">
      <div className="justify-between flex items-center">
        <p className="font-semibold text-lg dark:text-gray-200">
          {showSettings ? "Settings" : "User Profile"}
        </p>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
          onClick={() => setIsClicked({ ...isClicked, userProfile: false })}
        />
      </div>

      {showSettings === false ? (
        <>
          <div className="flex gap-3 sm:gap-5 items-center mt-4 sm:mt-6 border-color border-b-1 pb-4 sm:pb-6">
            <img
              className="rounded-full h-16 w-16 sm:h-24 sm:w-24"
              src={user?.profilePictureUrl || (user?.profilePicture ? `${getImageBaseUrl()}/uploads/${user.profilePicture}` : avatar)}
              alt="user-profile"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-lg sm:text-xl text-gray-200 truncate">
                {user?.name || 'Guest User'}
              </p>
              <p className={`text-sm font-semibold px-2 py-1 rounded-full text-center ${
                user?.role === 'admin' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                  : user?.role === 'accountant'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {user?.role === 'admin' ? 'Administrator' : user?.role === 'accountant' ? 'Accountant' : user?.role === 'staff' ? 'Staff' : 'User'}
              </p>
              <p className="text-gray-500 text-sm font-semibold dark:text-gray-400 truncate">
                {user?.email || 'No email'}
              </p>
            </div>
          </div>

          {/* Settings Button */}
          <div className="mt-4 sm:mt-5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSettings(true);
              }}
              className="flex gap-3 sm:gap-5 items-center w-full p-3 sm:p-4 hover:bg-light-gray cursor-pointer dark:hover:bg-[#42464D] rounded-lg transition-colors duration-200 z-10 relative bg-transparent border-none outline-none"
            >
              <div
                style={{ color: "#03C9D7", backgroundColor: "#E5FAFB" }}
                className="text-lg sm:text-xl rounded-lg p-2 sm:p-3 hover:bg-ligth-gray flex-shrink-0"
              >
                <FiSettings />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-semibold dark:text-gray-200 text-sm sm:text-base">
                  Settings
                </p>
                <p className="text-gray-500 text-xs sm:text-sm dark:text-gray-400">
                  Theme & Preferences
                </p>
              </div>
            </button>
          </div>

          {/* Manage Categories Button - Only for Admin */}
          {user?.role === 'admin' && (
            <div className="mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsClicked({ ...isClicked, userProfile: false });
                  navigate('/manage-categories');
                }}
                className="flex gap-3 sm:gap-5 items-center w-full p-3 sm:p-4 hover:bg-light-gray cursor-pointer dark:hover:bg-[#42464D] rounded-lg transition-colors duration-200 z-10 relative bg-transparent border-none outline-none"
              >
                <div
                  style={{ color: "#FF5722", backgroundColor: "#FFF3E0" }}
                  className="text-lg sm:text-xl rounded-lg p-2 sm:p-3 hover:bg-ligth-gray flex-shrink-0"
                >
                  <BiCategory />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-semibold dark:text-gray-200 text-sm sm:text-base">
                    Manage Categories
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm dark:text-gray-400">
                    Add & Edit Expense Categories
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Manage Users Button - Only for Admin */}
          {user?.role === 'admin' && (
            <div className="mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsClicked({ ...isClicked, userProfile: false });
                  navigate('/manage-users');
                }}
                className="flex gap-3 sm:gap-5 items-center w-full p-3 sm:p-4 hover:bg-light-gray cursor-pointer dark:hover:bg-[#42464D] rounded-lg transition-colors duration-200 z-10 relative bg-transparent border-none outline-none"
              >
                <div
                  style={{ color: "#4CAF50", backgroundColor: "#E8F5E8" }}
                  className="text-lg sm:text-xl rounded-lg p-2 sm:p-3 hover:bg-ligth-gray flex-shrink-0"
                >
                  <FiUsers />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-semibold dark:text-gray-200 text-sm sm:text-base">
                    Manage Users
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm dark:text-gray-400">
                    Add & Edit System Users
                  </p>
                </div>
              </button>
            </div>
          )}

          <div className="mt-4 sm:mt-5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLogout();
              }}
              className="w-full px-4 py-2 text-white font-medium rounded-lg bg-[#03C9D7] hover:bg-[#03C9D7]/90 transition-colors duration-200"
              style={{ backgroundColor: currentColor }}
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="mt-3 sm:mt-4 md:mt-6 flex flex-col">
          <div className="flex-1">
            <Settings />
          </div>
          <div className="mt-4 sm:mt-6 flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowSettings(false)}
              className="flex-1 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 transition-colors duration-200"
            >
              Back
            </button>
            <Button
              color="white"
              bgColor={currentColor}
              text="Save"
              borderRadius="10px"
              width="auto"
            />
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default UserProfile;
