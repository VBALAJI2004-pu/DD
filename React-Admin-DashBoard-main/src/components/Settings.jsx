import React from "react";
import { BsCheck } from "react-icons/bs";
import { FiSun, FiMoon } from "react-icons/fi";
import { useStateContext } from "../contexts/ContextProvider";
import { themeColors } from "../data/dummy";

const Settings = () => {
  const { setColor, setMode, currentMode, currentColor } = useStateContext();


  return (
    <div className="space-y-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pb-4">
      {/* Theme Toggle Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-base sm:text-lg dark:text-gray-200">
          Theme
        </h3>

        {/* Styled Theme Toggle */}
        <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <FiSun
              className={`text-base sm:text-lg md:text-xl ${
                currentMode === "Light" ? "text-yellow-500" : "text-gray-400"
              }`}
            />
            <span className="font-medium text-xs sm:text-sm md:text-base dark:text-gray-200">
              Light
            </span>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              id="theme-toggle"
              className="sr-only"
              checked={currentMode === "Dark"}
              onChange={(e) =>
                setMode({
                  target: { value: e.target.checked ? "Dark" : "Light" },
                })
              }
            />
            <label
              htmlFor="theme-toggle"
              className={`relative inline-flex h-4 w-8 sm:h-5 sm:w-10 md:h-6 md:w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                currentMode === "Dark" ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  currentMode === "Dark"
                    ? "translate-x-4 sm:translate-x-5 md:translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </label>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <span className="font-medium text-xs sm:text-sm md:text-base dark:text-gray-200">
              Dark
            </span>
            <FiMoon
              className={`text-base sm:text-lg md:text-xl ${
                currentMode === "Dark" ? "text-blue-500" : "text-gray-400"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Theme Colors Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-base sm:text-lg dark:text-gray-200">
          Theme Colors
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {themeColors.map((item, index) => (
            <button
              key={index}
              type="button"
              className={`relative h-10 sm:h-12 w-full rounded-lg transition-all duration-200 hover:scale-105 ${
                item.color === currentColor
                  ? "ring-2 ring-offset-1 sm:ring-offset-2 ring-blue-500"
                  : ""
              }`}
              style={{ backgroundColor: item.color }}
              onClick={() => setColor(item.color)}
            >
              {item.color === currentColor && (
                <BsCheck className="absolute inset-0 m-auto text-white text-lg sm:text-xl" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
