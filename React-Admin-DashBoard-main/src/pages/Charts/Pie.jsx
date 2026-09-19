import React, { useEffect, useState, useRef } from "react";
import { ChartsHeader, Doughnut as PieChart, ConfirmationModal, AttachmentModal } from "../../components";
import useExpenseStore from "../../Store/ExpenseStore";
import { useStateContext } from "../../contexts/ContextProvider";
import { useRole } from "../../contexts/RoleContext";
import {
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaFileExcel,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import jsPDFAutoTable from "jspdf-autotable";
const paymentModes = ["Cash", "Online"];

const monthNames = [
  "",
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

const Table = ({ expenses, categories, selectedMonth, selectedYear }) => {
  const { currentMode, currentColor } = useStateContext();
  const { permissions } = useRole();
  const {
    deleteExpense,
    updateExpense,
    getMonthlyExpenseData,
    getYearlyExpenseSummary,
    selectedMonth: storeMonth,
    selectedYear: storeYear,
    getExpenseCategories,
    categorySubMap,
    categories: storeCategories,
    getExpensePieChartData,
    isDateRangeActive,
    fromDate,
    toDate,
    getDateRangePieChartData,
    getDateRangeExpenseData,
  } = useExpenseStore();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  // Attachment modal state
  const [attachmentModal, setAttachmentModal] = useState({
    isOpen: false,
    fileUrl: "",
    fileName: ""
  });

  // Debug function to log expense data
  const debugExpenseData = (expenses) => {
    console.log('🔍 DEBUGGING EXPENSE DATA:');
    console.log('Total expenses:', expenses.length);
    if (expenses.length > 0) {
      const firstExpense = expenses[0];
      console.log('First expense structure:', firstExpense);
      console.log('Attachment fields in first expense:', {
        billAttachment: firstExpense.billAttachment,
        attachment: firstExpense.attachment,
        fileUrl: firstExpense.fileUrl,
        paymentAttachment: firstExpense.paymentAttachment,
        billAttachmentName: firstExpense.billAttachmentName,
        attachmentName: firstExpense.attachmentName,
        fileName: firstExpense.fileName,
        paymentAttachmentName: firstExpense.paymentAttachmentName
      });
    }
  };

  // Debug expenses when they change
  useEffect(() => {
    if (expenses && expenses.length > 0) {
      debugExpenseData(expenses);
    }
  }, [expenses]);
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    title: "",
    message: "",
    onConfirm: null,
    loading: false
  });

  // Helper to format date as dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Amount filter state
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Sorting logic
  const getSortedExpenses = () => {
    let sortable = [...expenses];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        // For date, sort by timestamp
        if (sortConfig.key === "date") {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }
        // For amount, sort numerically
        if (sortConfig.key === "amount") {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }
        // For string, case-insensitive
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  };

  // Filtering logic (category/status only)
  const filteredExpenses = getSortedExpenses().filter((e) => {
    const categoryMatch = selectedCategories.length > 0 ? selectedCategories.includes(e.category) : true;
    const statusMatch = filterStatus ? e.paymentStatus === filterStatus : true;
    return categoryMatch && statusMatch;
  });

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Toggle direction
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Handle category checkbox change
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Clear all selected categories
  const clearSelectedCategories = () => {
    setSelectedCategories([]);
  };

  // Select all categories
  const selectAllCategories = () => {
    setSelectedCategories([...categories]);
  };

  // Ref for the table and category dropdown
  const tableRef = React.useRef(null);
  const categoryDropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCategoryDropdown]);

  // Export to Excel
  const handleExportExcel = () => {
    setConfirmModal({
      isOpen: true,
      type: "info",
      title: "Export Excel",
      message: "Do you want to download the expense report as Excel?",
      onConfirm: () => {
        doExportExcel();
        setConfirmModal({ isOpen: false, type: null, title: "", message: "", onConfirm: null, loading: false });
      },
      loading: false
    });
  };

  // Export to PDF
  const handleExportPDF = () => {
    setConfirmModal({
      isOpen: true,
      type: "info",
      title: "Export PDF",
      message: "Do you want to download the expense report as PDF?",
      onConfirm: () => {
        doExportPDF();
        setConfirmModal({ isOpen: false, type: null, title: "", message: "", onConfirm: null, loading: false });
      },
      loading: false
    });
  };

  // Export to PDF using jsPDF + autoTable (portrait, all columns visible)
  const downloadPDF = () => {
    setConfirmModal({
      isOpen: true,
      type: "info",
      title: "Download PDF",
      message: "Are you sure you want to download the expense data as PDF?",
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }));
          const doc = new jsPDF({ orientation: "landscape" });
          
          let title = "Expense Report for TT KOTHANUR BLR 04";
          let subtitle;
          if (isDateRangeActive && fromDate && toDate) {
            const formatDate = (dateStr) => {
              const d = new Date(dateStr);
              return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
            };
            subtitle = `Period: ${formatDate(fromDate)} to ${formatDate(toDate)}`;
          } else {
            subtitle = `Month: ${selectedMonth ? monthNames[selectedMonth] : "All"}  Year: ${selectedYear}`;
          }
          
          doc.setFontSize(13);
          doc.text(title, 150, 15, { align: "center" });
          doc.setFontSize(10);
          doc.text(subtitle, 150, 22, { align: "center" });
          
          const tableData = filteredExpenses.map(exp => [
            formatDate(exp.date),
            exp.category,
            exp.subCategory || "",
            `₹${exp.amount}`,
            exp.paymentStatus || "",
            exp.paymentMode || "",
            exp.attachment ? "Yes" : "No",
            exp.remarks || exp.remark || ""
          ]);
          
          doc.autoTable({
            head: [[
              "Date", "Category", "Sub-Category", "Amount", 
              "Status", "Payment Mode", "Attachment", "Remarks"
            ]],
            body: tableData,
            startY: 30,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 139, 202] },
            margin: { left: 10, right: 10 },
            tableWidth: "wrap"
          });
          
          // Add total amount at the bottom
          const totalAmount = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
          const finalY = doc.lastAutoTable.finalY + 10;
          
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 150, finalY, { align: "center" });
          
          doc.save(`expense-report-${new Date().toISOString().split('T')[0]}.pdf`);
          setConfirmModal({ isOpen: false, type: null, title: "", message: "", onConfirm: null, loading: false });
        } catch (error) {
          setConfirmModal(prev => ({ ...prev, loading: false }));
        }
      },
      loading: false
    });
  };

  const doExportExcel = () => {
    const exportData = filteredExpenses.map((exp) => ({
      Date: formatDate(exp.date),
      Category: exp.category,
      "Sub-Category": exp.subCategory || "",
      Amount: exp.amount,
      Status: exp.paymentStatus || "",
      "Payment Mode": exp.paymentMode || "",
      Attachment: exp.attachment || "",
      Remark: exp.remarks || exp.remark || "",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    // Set column widths for better readability
    ws["!cols"] = [
      { wch: 12 }, // Date
      { wch: 18 }, // Category
      { wch: 18 }, // Sub-Category
      { wch: 10 }, // Amount
      { wch: 10 }, // Status
      { wch: 16 }, // Payment Mode
      { wch: 18 }, // Attachment
      { wch: 24 }, // Remark
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(
      wb,
      `Expense_Report_TT_KOTHANUR_BLR_04_${selectedYear}_${selectedMonth}.xlsx`
    );
  };

  const doExportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait" });
    const title = `Expense Report for TT KOTHANUR BLR 04`;
    let subtitle;
    if (isDateRangeActive && fromDate && toDate) {
      const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      };
      subtitle = `Period: ${formatDate(fromDate)} to ${formatDate(toDate)}`;
    } else {
      subtitle = `Month: ${
        selectedMonth ? monthNames[selectedMonth] : "All"
      }  Year: ${selectedYear}`;
    }
    doc.setFontSize(13);
    doc.text(title, 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text(subtitle, 105, 22, { align: "center" });
    const tableColumn = [
      "Date",
      "Category",
      "Sub-Category",
      "Amount",
      "Status",
      "Payment Mode",
      "Attachment",
      "Remark",
    ];
    const tableRows = filteredExpenses.map((exp) => [
      formatDate(exp.date),
      exp.category,
      exp.subCategory || "",
      exp.amount,
      exp.paymentStatus || "",
      exp.paymentMode || "",
      exp.attachment || "",
      exp.remarks || exp.remark || "",
    ]);
    jsPDFAutoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      styles: {
        fontSize: 7.5,
        cellPadding: 1.5,
        halign: "center",
        valign: "middle",
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [74, 109, 167],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didParseCell: function (data) {
        // Color the Status column
        if (data.section === "body" && data.column.index === 4) {
          if (data.cell.raw === "Paid") {
            data.cell.styles.textColor = [34, 197, 94]; // green
            data.cell.styles.fontStyle = "bold";
          } else if (data.cell.raw === "Pending") {
            data.cell.styles.textColor = [239, 68, 68]; // red
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      columnStyles: {
        0: { cellWidth: "auto" }, // Date
        1: { cellWidth: "auto" }, // Category
        2: { cellWidth: "auto" }, // Sub-Category
        3: { cellWidth: "auto" }, // Amount
        4: { cellWidth: "auto" }, // Status
        5: { cellWidth: "auto" }, // Payment Mode
        6: { cellWidth: "auto" }, // Attachment
        7: { cellWidth: "auto" }, // Remark
      },
      margin: { left: 10, right: 10 },
      tableWidth: "wrap",
    });
    
    // Add total amount at the bottom
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 105, finalY, { align: "center" });
    
    doc.save(
      `Expense_Report_TT_KOTHANUR_BLR_04_${selectedYear}_${selectedMonth}.pdf`
    );
  };

  // Edit/Delete modal logic
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null,
    row: null,
  });
  const [editModal, setEditModal] = useState({ open: false, expense: null });
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const handleUpdateExpense = async (expenseId, updatedData) => {
    try {
      await updateExpense(expenseId, updatedData);
      // Refresh data
      if (storeMonth === 0) {
        await getYearlyExpenseSummary(storeYear);
      } else {
        await getMonthlyExpenseData(storeMonth, storeYear);
      }
      setEditModal({ open: false, expense: null });
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteExpense = async (expense) => {
    try {
      setConfirmModal(prev => ({ ...prev, loading: true }));
      setDeletingExpenseId(expense._id);
      await deleteExpense(expense._id);
      // Refresh data
      if (storeMonth === 0) {
        await getYearlyExpenseSummary(storeYear);
      } else {
        await getMonthlyExpenseData(storeMonth, storeYear);
      }
      setConfirmModal({ isOpen: false, type: null, title: "", message: "", onConfirm: null, loading: false });
    } catch (error) {
      setConfirmModal(prev => ({ ...prev, loading: false }));
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const handleViewAttachment = (fileUrl, fileName) => {
    setAttachmentModal({
      isOpen: true,
      fileUrl: fileUrl,
      fileName: fileName
    });
  };

  const [downloadModal, setDownloadModal] = useState({
    open: false,
    url: "",
    filename: "",
  });

  // Download handler
  const handleDownload = (url, filename) => {
    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || url.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load data based on current filter mode
  useEffect(() => {
    const fetchData = async () => {
      if (isDateRangeActive && fromDate && toDate) {
        // Use date range filter
        await Promise.all([
          getDateRangePieChartData(fromDate, toDate),
          getDateRangeExpenseData(fromDate, toDate)
        ]);
      } else {
        // Use month/year filter
        if (selectedMonth === 0) {
          await getYearlyExpenseSummary(selectedYear);
        } else {
          await Promise.all([
            getExpensePieChartData(selectedMonth, selectedYear),
            getMonthlyExpenseData(selectedMonth, selectedYear)
          ]);
        }
      }
    };
    
    fetchData();
  }, [
    selectedMonth,
    selectedYear,
    isDateRangeActive,
    fromDate,
    toDate,
    getDateRangePieChartData,
    getDateRangeExpenseData,
    getYearlyExpenseSummary,
    getExpensePieChartData,
    getMonthlyExpenseData
  ]);
  return (
    <div
      className={`rounded-xl shadow p-2 md:p-4 mt-2 md:mt-4 w-full overflow-x-auto ${
        currentMode === "Dark"
          ? "bg-[#23272e] text-gray-200"
          : "bg-white text-gray-900"
      }`}
      style={{ maxWidth: "100vw" }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="font-semibold">
            Categories:
          </label>
          <div className="relative" ref={categoryDropdownRef}>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="border-2 rounded-lg px-4 py-2 min-w-[160px] text-left flex items-center justify-between transition-all hover:shadow-md"
              style={{
                background: currentMode === "Dark" ? "#2d323b" : "#f9fafb",
                color: currentMode === "Dark" ? "#e5e7eb" : "#1f2937",
                borderColor: currentColor,
              }}
            >
              <span className="font-medium">
                {selectedCategories.length === 0
                  ? "Select Categories"
                  : `${selectedCategories.length} selected`}
              </span>
              <span className={`text-sm transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            
            {showCategoryDropdown && (
              <div
                className={`absolute top-full left-0 mt-2 border-2 rounded-lg shadow-xl z-50 min-w-[240px] overflow-hidden`}
                style={{
                  borderColor: currentColor,
                  background: currentMode === "Dark" ? "#1a1e24" : "#ffffff",
                }}
              >
                <div className="p-3 border-b" style={{
                  borderColor: currentColor,
                  background: currentMode === "Dark" ? "#2d323b" : "#f3f4f6",
                }}>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllCategories}
                      className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                        currentMode === "Dark"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearSelectedCategories}
                      className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                        currentMode === "Dark"
                          ? "bg-gray-600 hover:bg-gray-700 text-white"
                          : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                      }`}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                
                <div className="p-2 max-h-64 overflow-y-auto">
                  {categories.length === 0 ? (
                    <div className={`text-center py-4 text-sm ${
                      currentMode === "Dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      No categories available
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <label
                        key={cat}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                          currentMode === "Dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => handleCategoryChange(cat)}
                          className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                        />
                        <span className={`text-sm font-medium ${
                          currentMode === "Dark" ? "text-gray-200" : "text-gray-700"
                        }`}>
                          {cat}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                
                {selectedCategories.length > 0 && (
                  <div className="px-3 py-2 border-t text-xs" style={{ borderColor: currentColor }}>
                    <span style={{ color: currentColor }} className="font-semibold">
                      {selectedCategories.length} of {categories.length} selected
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <label htmlFor="statusFilter" className="font-semibold ml-4">
            Status:
          </label>
          <select
            id="statusFilter"
            className="border rounded px-2 py-1 min-w-[100px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              background: currentMode === "Dark" ? "#23272e" : "#fff",
              color: currentMode === "Dark" ? "#fff" : "#23272e",
              borderColor: currentColor,
            }}
          >
            <option value="">All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <button
            className="flex items-center gap-2 px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-base font-semibold"
            onClick={handleExportExcel}
          >
            <FaFileExcel className="text-xl" /> Export Excel
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-base font-semibold"
            onClick={handleExportPDF}
          >
            <FaFilePdf className="text-xl" /> Export PDF
          </button>
        </div>
      </div>
      <div className="overflow-x-auto w-full">
        <table
          ref={tableRef}
          className="min-w-[800px] md:min-w-full table-auto border text-base bg-white dark:bg-[#23272e]"
        >
          <thead
            className={
              currentMode === "Dark"
                ? "bg-[#2d323b] text-gray-100"
                : "bg-gray-100 text-gray-900"
            }
          >
            <tr>
              {/* Table headers with sort icons */}
              {[
                { key: "date", label: "Date" },
                { key: "category", label: "Category" },
                { key: "subCategory", label: "Sub-Category" },
                {
                  key: "amount",
                  label: (
                    <div className="flex flex-col items-center">
                      <span>Amount</span>
                      <span className="text-xs font-semibold text-blue-600">
                        ₹
                        {filteredExpenses
                          .reduce(
                            (sum, exp) => sum + Number(exp.amount || 0),
                            0
                          )
                          .toLocaleString("en-IN")}
                      </span>
                    </div>
                  ),
                },
                { key: "paymentStatus", label: "Status" },
                { key: "paymentMode", label: "Payment Mode" },
                { key: "attachment", label: "Attachment" },
                { key: "remarks", label: "Remark" },
                { key: "actions", label: "Actions", sortable: false },
              ].filter((col) => col.key !== "actions" || permissions.canSeeActions).map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-3 border text-base cursor-pointer select-none"
                  onClick={
                    col.sortable === false
                      ? undefined
                      : () => handleSort(col.key)
                  }
                >
                  <span className="flex items-center gap-1 justify-center">
                    {col.label}
                    {col.sortable === false ? null : (
                      <>
                        <FaSortUp
                          className={`ml-1 text-xs ${
                            sortConfig.key === col.key &&
                            sortConfig.direction === "asc"
                              ? "text-blue-500"
                              : "text-gray-400"
                          }`}
                        />
                        <FaSortDown
                          className={`ml-0.5 text-xs -mt-1 ${
                            sortConfig.key === col.key &&
                            sortConfig.direction === "desc"
                              ? "text-blue-500"
                              : "text-gray-400"
                          }`}
                        />
                      </>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-lg ">
                  No data found
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
                <tr
                  key={exp._id}
                  className={
                    currentMode === "Dark"
                      ? "hover:bg-[#23272e] border-gray-700"
                      : "hover:bg-gray-50 border-gray-200"
                  }
                >
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    {formatDate(exp.date)}
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    {exp.category}
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    {exp.subCategory || ""}
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    ₹{exp.amount}
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    {exp.paymentStatus ? (
                      <span
                        className={
                          exp.paymentStatus === "Paid"
                            ? "text-green-500 font-bold"
                            : "text-red-500 font-bold"
                        }
                      >
                        {exp.paymentStatus}
                      </span>
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    {exp.paymentMode || "-"}
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    <div className="flex flex-col gap-1">
                      {/* Bill Attachment */}
                      {(exp.billAttachment || exp.attachment || exp.fileUrl) ? (
                        <button
                          className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm"
                          onClick={() => {
                            const fileUrl = exp.billAttachment || exp.attachment || exp.fileUrl;
                            const fileName = exp.billAttachmentName || exp.attachmentName || exp.fileName || fileUrl?.split('/').pop() || 'Bill';
                            setAttachmentModal({
                              isOpen: true,
                              fileUrl: fileUrl,
                              fileName: fileName
                            });
                          }}
                        >
                          <FiEye size={14} />
                          Bill
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No Bill</span>
                      )}
                      
                      {/* Payment Attachment */}
                      {exp.paymentAttachment ? (
                        <button
                          className="text-green-500 hover:text-green-700 flex items-center gap-1 text-sm"
                          onClick={() => {
                            const fileUrl = exp.paymentAttachment;
                            const fileName = exp.paymentAttachmentName || fileUrl?.split('/').pop() || 'Payment';
                            setAttachmentModal({
                              isOpen: true,
                              fileUrl: fileUrl,
                              fileName: fileName
                            });
                          }}
                        >
                          <FiEye size={14} />
                          Payment
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No Payment</span>
                      )}
                    </div>
                  </td>
                  <td className="border px-3 py-3 whitespace-nowrap text-base">
                    {exp.remarks || exp.remark || "-"}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-2 py-2">
                    {permissions.canSeeActions && (
                      <>
                        <button
                          className={`${
                            deletingExpenseId
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          } text-white px-2 py-1 rounded mr-2 transition-colors`}
                          onClick={() => {
                            setEditingExpense(exp);
                            setEditForm({
                              amount: exp.amount,
                              description: exp.description,
                              category: exp.category,
                              subcategory: exp.subcategory,
                              paymentStatus: exp.paymentStatus,
                              paymentMode: exp.paymentMode,
                              file: null,
                            });
                            setEditModalOpen(true);
                          }}
                          disabled={deletingExpenseId}
                        >
                          <FaEdit className="text-2xl" />
                        </button>
                        <button
                          className={`${
                            deletingExpenseId === exp._id
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600"
                          } text-white px-2 py-1 rounded transition-colors`}
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              type: "delete",
                              title: "Delete Expense",
                              message: `Are you sure you want to delete this expense of ₹${exp.amount}?`,
                              onConfirm: () => handleDeleteExpense(exp),
                              loading: false,
                            });
                          }}
                          disabled={deletingExpenseId === exp._id}
                        >
                          {deletingExpenseId === exp._id ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                          ) : (
                            <FaTrash className="text-2xl" />
                          )}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Attachment Modal */}
      <AttachmentModal
        isOpen={attachmentModal.isOpen}
        onClose={() => setAttachmentModal({ isOpen: false, fileUrl: null, fileName: '' })}
        fileUrl={attachmentModal.fileUrl}
        fileName={attachmentModal.fileName}
      />
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null, title: "", message: "", onConfirm: null, loading: false })}
        onConfirm={confirmModal.onConfirm || (() => {})}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.type === 'danger' ? 'Delete' : 'Confirm'}
        cancelText="Cancel"
        type={confirmModal.type}
        loading={confirmModal.loading}
      />
      {/* Edit Modal */}
      {editModal.open && (
        <EditExpenseModal
          expense={editModal.expense}
          onClose={() => setEditModal({ open: false, expense: null })}
          onSave={async (id, data) => {
            await updateExpense(id, data);
            setEditModal({ open: false, expense: null });
            // Refresh data
            if (storeMonth === 0) {
              await getYearlyExpenseSummary(storeYear);
            } else {
              await getMonthlyExpenseData(storeMonth, storeYear);
            }
          }}
        />
      )}
      
      {/* Alternative Edit Modal */}
      {editModalOpen && editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => {
            setEditModalOpen(false);
            setEditingExpense(null);
            setEditForm({});
          }}
          onSave={async (id, data) => {
            await updateExpense(id, data);
            setEditModalOpen(false);
            setEditingExpense(null);
            setEditForm({});
            // Refresh data
            if (storeMonth === 0) {
              await getYearlyExpenseSummary(storeYear);
            } else {
              await getMonthlyExpenseData(storeMonth, storeYear);
            }
          }}
        />
      )}
      {/* Download confirmation modal */}
      <ConfirmModal
        open={downloadModal.open}
        onClose={() => setDownloadModal({ open: false, url: "", filename: "" })}
        onConfirm={() => {
          handleDownload(downloadModal.url, downloadModal.filename);
          setDownloadModal({ open: false, url: "", filename: "" });
        }}
        title={`Download file "${downloadModal.filename}"?`}
        confirmText="Download"
        confirmColor="bg-blue-600"
      />
    </div>
  );
};

const Pie = () => {
  const {
    expensePieChartData,
    getExpensePieChartData,
    selectedMonth,
    loading,
    selectedYear,
    monthlyExpense,
    getYearlyExpenseSummary,
    yearlyExpenseSummary,
    getMonthlyExpenseData,
    monthlyExpenseData,
    getMonthlyExpense,
    getTotalLoansExpense,
    getDateRangeExpense,
    getDateRangeLoansExpense,
    // Date range filter
    fromDate,
    toDate,
    isDateRangeActive,
    dataRefreshTrigger,
    getDateRangePieChartData,
    getDateRangeExpenseData,
  } = useExpenseStore();

  const [view, setView] = useState("pie"); // "pie" or "table"

  useEffect(() => {
    const fetchData = async () => {
      if (isDateRangeActive && fromDate && toDate) {
        // Use date range filter - call all APIs needed for dashboard cards
        await Promise.all([
          getDateRangePieChartData(fromDate, toDate),
          getDateRangeExpenseData(fromDate, toDate),
          getDateRangeExpense(fromDate, toDate),
          getDateRangeLoansExpense(fromDate, toDate)
        ]);
      } else {
        // Use month/year filter
        if (selectedMonth === 0) {
          // Get yearly data - don't call getExpensePieChartData for yearly view
          await getYearlyExpenseSummary(selectedYear);
        } else {
          // Call all APIs needed for dashboard cards and pie chart
          await Promise.all([
            getExpensePieChartData(selectedMonth, selectedYear),
            getMonthlyExpenseData(selectedMonth, selectedYear),
            getMonthlyExpense(selectedMonth, selectedYear),
            getTotalLoansExpense(selectedMonth, selectedYear)
          ]);
        }
      }
    };
    
    fetchData();
  }, [
    selectedMonth,
    selectedYear,
    isDateRangeActive,
    fromDate,
    toDate,
    dataRefreshTrigger,
    getDateRangePieChartData,
    getDateRangeExpenseData,
    getDateRangeExpense,
    getDateRangeLoansExpense,
    getYearlyExpenseSummary,
    getExpensePieChartData,
    getMonthlyExpenseData,
    getMonthlyExpense,
    getTotalLoansExpense
  ]);

  // Use yearly or monthly data based on selection
  const chartData =
    isDateRangeActive
      ? expensePieChartData || []
      : selectedMonth === 0
      ? yearlyExpenseSummary?.expensePieChartData || []
      : expensePieChartData;
  const total =
    isDateRangeActive
      ? monthlyExpense
      : selectedMonth === 0
      ? yearlyExpenseSummary?.totalYearlyExpense || 0
      : monthlyExpense;

  return (
    <div className="m-2 p-2 pb-4 md:p-10 md:m-10 mt-32 sm:mt-28 md:mt-24 lg:mt-20 md:rounded-3xl dark:bg-secondary-dark-bg rounded-xl bg-gray-200">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <ChartsHeader
          category="Expense"
          title={`Expense Breakdown amount: ₹ ${
            total ? Number(total).toLocaleString("en-IN") : "0"
          }`}
        />
        <div className="flex gap-2 mt-2 md:mt-0">
          <button
            className={`px-3 sm:px-4 py-2 rounded font-semibold border transition-colors duration-200 text-sm sm:text-base ${
              view === "pie"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            }`}
            onClick={() => setView("pie")}
          >
            Pie Chart
          </button>
          <button
            className={`px-3 sm:px-4 py-2 rounded font-semibold border transition-colors duration-200 text-sm sm:text-base ${
              view === "table"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            }`}
            onClick={() => setView("table")}
          >
            Table View
          </button>
        </div>
      </div>

      {view === "pie" ? (
        <div className="w-full">
          <PieChart
            id="chart-pie"
            data={chartData}
            legendVisibility
            height="400px"
          />
        </div>
      ) : (
        <div className="table-container">
          <Table
            expenses={
              isDateRangeActive
                ? (monthlyExpenseData.expenses || [])
                : (selectedMonth === 0
                    ? (yearlyExpenseSummary?.expenses || [])
                    : (monthlyExpenseData.expenses || []))
            }
            categories={
              isDateRangeActive
                ? (monthlyExpenseData.categories || [])
                : (selectedMonth === 0
                    ? (yearlyExpenseSummary?.categories || [])
                    : (monthlyExpenseData.categories || []))
            }
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>
      )}
    </div>
  );
};

// ConfirmModal component
const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  confirmText = "Download",
  confirmColor = "bg-green-600",
  children,
  loading = false,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-[#23272e] rounded-lg shadow-2xl p-6 w-[90vw] max-w-md mx-auto flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
        {children && (
          <div className="mb-4 text-center text-gray-700 dark:text-gray-200">
            {children}
          </div>
        )}
        <div className="flex gap-4 mt-2">
          <button
            className={`px-5 py-2 rounded font-semibold text-white ${confirmColor} hover:brightness-110 shadow flex items-center gap-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </button>
          <button
            className="px-5 py-2 rounded font-semibold bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 hover:dark:bg-gray-600 shadow"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// EditExpenseModal component
const EditExpenseModal = ({ expense, onClose, onSave }) => {
  const { currentColor, currentMode } = useStateContext();
  const { categories, categorySubMap, getExpenseCategories } = useExpenseStore();
  const [form, setForm] = useState({ ...expense, billAttachment: null, paymentAttachment: null });
  const [showPaymentMode, setShowPaymentMode] = useState(expense.paymentStatus === "Paid");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [attachmentModal, setAttachmentModal] = useState({
    isOpen: false,
    fileUrl: "",
    fileName: ""
  });
  const billAttachmentRef = useRef(null);
  const paymentAttachmentRef = useRef(null);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  React.useEffect(() => {
    getExpenseCategories();
  }, [getExpenseCategories]);

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
    if (name === "paymentStatus") {
      setShowPaymentMode(value === "Paid");
      if (value !== "Paid") {
        setForm((prev) => ({ ...prev, paymentMode: "", paymentAttachment: null }));
        if (paymentAttachmentRef.current) paymentAttachmentRef.current.value = "";
      }
    }
    if (name === "category") {
      setForm((prev) => ({ ...prev, subCategory: "" }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      form.category &&
      categorySubMap[form.category] &&
      categorySubMap[form.category].length > 0 &&
      !form.subCategory
    ) {
      setError("Sub-Category is required for this category.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const submitData = { ...form };
      if (submitData.paymentStatus !== "Paid") {
        delete submitData.paymentMode;
        delete submitData.paymentAttachment;
      }
      await onSave(expense._id, submitData);
      if (billAttachmentRef.current) billAttachmentRef.current.value = "";
      if (paymentAttachmentRef.current) paymentAttachmentRef.current.value = "";
      onClose(); // Ensure modal closes after successful update
    } catch (err) {
      console.error("Update expense error:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update expense. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${
          currentMode === "Dark"
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        } rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 md:mb-6 text-center">
            Edit Expense
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Basic Information */}
            <div>
              <h6 className="font-semibold mb-4">Basic Information</h6>
              <div className="mb-4">
                <label
                  htmlFor="editExpenseDate"
                  className="block mb-1 font-medium"
                >
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="editExpenseDate"
                  name="date"
                  value={form.date ? form.date.split("T")[0] : ""}
                  onChange={handleChange}
                  required
                  max={today}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="editExpenseCategory"
                  className="block mb-1 font-medium"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="editExpenseCategory"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    currentMode === "Dark"
                      ? "bg-[#23272e] text-gray-100"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories &&
                    categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>
              {/* Only show subcategory field if category has subcategories */}
              {form.category &&
                categorySubMap[form.category] &&
                categorySubMap[form.category].length > 0 && (
                <div className="mb-4">
                  <label
                    htmlFor="editExpenseSubCategory"
                    className="block mb-1 font-medium"
                  >
                    Sub-Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="editExpenseSubCategory"
                    name="subCategory"
                    value={form.subCategory}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      currentMode === "Dark"
                        ? "bg-[#23272e] text-gray-100"
                        : "bg-white text-gray-900"
                    }`}
                    required
                  >
                    <option value="">Select Sub-Category</option>
                    {categorySubMap[form.category].map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Show message when category has no subcategories */}
              {form.category &&
                categorySubMap[form.category] &&
                categorySubMap[form.category].length === 0 && (
                <div className="mb-4">
                  <div className={`px-3 py-2 rounded border text-sm ${
                    currentMode === "Dark"
                      ? "bg-gray-700 text-gray-300 border-gray-600"
                      : "bg-gray-100 text-gray-600 border-gray-300"
                  }`}>
                    No subcategories available for "{form.category}"
                  </div>
                </div>
              )}
              <div className="mb-4">
                <label
                  htmlFor="editExpenseAmount"
                  className="block mb-1 font-medium"
                >
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="editExpenseAmount"
                  name="amount"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-inherit"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="editExpenseRemark"
                  className="block mb-1 font-medium"
                >
                  Remarks
                </label>
                <textarea
                  id="editExpenseRemark"
                  name="remarks"
                  rows={2}
                  value={form.remarks}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-inherit"
                ></textarea>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="editBillAttachment"
                  className="block mb-1 font-medium"
                >
                  Bill Attachment
                </label>
                <input
                  type="file"
                  id="editBillAttachment"
                  name="billAttachment"
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-inherit"
                  ref={billAttachmentRef}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload bill/invoice. Allowed: Images, PDFs, Word files. Max size: 10MB.
                </p>
                {(expense.billAttachment || expense.attachment || expense.fileUrl) && !form.billAttachment && (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const fileUrl = expense.billAttachment || expense.attachment || expense.fileUrl;
                        const fileName = expense.billAttachmentName || expense.attachmentName || expense.fileName || fileUrl?.split('/').pop() || 'Current Bill';
                        setAttachmentModal({
                          isOpen: true,
                          fileUrl: fileUrl,
                          fileName: fileName
                        });
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <FiEye size={16} />
                      View Current Bill
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Payment Details */}
            <div>
              <h6 className="font-semibold mb-4">Payment Details</h6>
              <div className="mb-4">
                <label
                  htmlFor="editPaymentStatus"
                  className="block mb-1 font-medium"
                >
                  Payment Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="editPaymentStatus"
                  name="paymentStatus"
                  value={form.paymentStatus}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    currentMode === "Dark"
                      ? "bg-[#23272e] text-gray-100"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <option value="">Select Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              {showPaymentMode && (
                <div className="mb-4">
                  <label
                    htmlFor="editPaymentMode"
                    className="block mb-1 font-medium"
                  >
                    Payment Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="editPaymentMode"
                    name="paymentMode"
                    value={form.paymentMode}
                    onChange={handleChange}
                    required={showPaymentMode}
                    className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      currentMode === "Dark"
                        ? "bg-[#23272e] text-gray-100"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    <option value="">Select Mode</option>
                    {paymentModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {showPaymentMode && (
                <div className="mb-4">
                  <label
                    htmlFor="editPaymentAttachment"
                    className="block mb-1 font-medium"
                  >
                    Payment Attachment
                  </label>
                  <input
                    type="file"
                    id="editPaymentAttachment"
                    name="paymentAttachment"
                    accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-inherit"
                    ref={paymentAttachmentRef}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload payment proof/receipt. Allowed: Images, PDFs, Word files. Max size: 10MB.
                  </p>
                  {expense.paymentAttachment && !form.paymentAttachment && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const fileUrl = expense.paymentAttachment;
                          const fileName = expense.paymentAttachmentName || fileUrl?.split('/').pop() || 'Current Payment';
                          setAttachmentModal({
                            isOpen: true,
                            fileUrl: fileUrl,
                            fileName: fileName
                          });
                        }}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <FiEye size={16} />
                        View Current Payment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 md:gap-4 mt-4 md:mt-6">
            <button
              type="button"
              className="px-4 md:px-6 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-400 hover:dark:bg-gray-600"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 md:px-6 py-2 rounded font-semibold text-white"
              style={{
                background: currentColor,
                opacity: submitting ? 0.7 : 1,
              }}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
          </form>
        </div>
      </div>
      
      {/* Attachment Modal */}
      <AttachmentModal
        isOpen={attachmentModal.isOpen}
        onClose={() => setAttachmentModal({ isOpen: false, fileUrl: "", fileName: "" })}
        fileUrl={attachmentModal.fileUrl}
        fileName={attachmentModal.fileName}
      />
    </div>
  );
};

export default Pie;
