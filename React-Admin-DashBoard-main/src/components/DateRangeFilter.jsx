import React from "react";
import { useStateContext } from "../contexts/ContextProvider";
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

const DateRangeFilter = ({ isNavbar = false }) => {
  const { currentMode } = useStateContext();
  const {
    fromDate,
    toDate,
    isDateRangeActive,
    setFromDate,
    setToDate,
    setIsDateRangeActive,
    resetDateRange,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
  } = useExpenseStore();

  const handleFromDateChange = (e) => {
    const date = e.target.value;
    setFromDate(date);
    if (date && toDate && date > toDate) {
      setToDate("");
    }
    if (date && toDate) {
      setIsDateRangeActive(true);
    }
  };

  const handleToDateChange = (e) => {
    const date = e.target.value;
    if (date && fromDate && date < fromDate) {
      alert("To date cannot be earlier than from date");
      return;
    }
    setToDate(date);
    if (date && fromDate) {
      setIsDateRangeActive(true);
    }
  };

  const handleReset = () => {
    resetDateRange();
  };

  const today = new Date().toISOString().split("T")[0];

  if (isNavbar) {
    return (
      <div className="flex flex-row items-center gap-2">
        <input
          type="date"
          value={fromDate}
          onChange={handleFromDateChange}
          max={today}
          className={`px-2 py-1 rounded border text-xs ${
            currentMode === "Dark"
              ? "bg-[#23272e] text-gray-100 border-gray-600"
              : "bg-white text-gray-900 border-gray-300"
          }`}
          placeholder="From"
        />
        <input
          type="date"
          value={toDate}
          onChange={handleToDateChange}
          min={fromDate}
          max={today}
          className={`px-2 py-1 rounded border text-xs ${
            currentMode === "Dark"
              ? "bg-[#23272e] text-gray-100 border-gray-600"
              : "bg-white text-gray-900 border-gray-300"
          }`}
          placeholder="To"
        />
        {(fromDate || toDate) && (
          <button
            onClick={handleReset}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-secondary-dark-bg p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
        Date Range Filter
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={handleFromDateChange}
              max={today}
              className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                currentMode === "Dark"
                  ? "bg-[#23272e] text-gray-100 border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={handleToDateChange}
              min={fromDate}
              max={today}
              className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                currentMode === "Dark"
                  ? "bg-[#23272e] text-gray-100 border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            />
          </div>
        </div>

        {isDateRangeActive && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Date range filter is active: {fromDate} to {toDate}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {(fromDate || toDate) && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Reset Date Range
            </button>
          )}
        </div>

        {/* Show Month/Year selectors when date range is not active */}
        {!isDateRangeActive && (
          <div className="border-t pt-4 mt-4">
            <h4 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-200">
              Month/Year Filter
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
