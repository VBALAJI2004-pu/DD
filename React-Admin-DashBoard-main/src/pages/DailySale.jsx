import React, { useState, useRef, useEffect, useMemo } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { FiPlus, FiEye, FiX } from "react-icons/fi";
import useSalesStore from "../Store/SalesStore";
import { AttachmentModal } from "../components";
import { useAuth } from "../contexts/AuthContext";
 

const DailySale = () => {
  const { currentColor, currentMode } = useStateContext();
  const { user } = useAuth();
  const { addSales, addOrder } = useSalesStore();
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attachmentModal, setAttachmentModal] = useState({
    isOpen: false,
    fileUrl: "",
    fileName: ""
  });
  const salesFileInputRef = useRef(null);
  const paymentReceiptInputRef = useRef(null);
  const orderFileInputRef = useRef(null);
  const orderReceiptInputRef = useRef(null);
  const RECEIPT_MAX_SIZE = 10 * 1024 * 1024;
  const RECEIPT_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  const PAYMENT_MODES = [
    "Cash",
    "UPI",
    "Bank Transfer",
    "Card",
    "Cheque",
    "Other",
  ];
  const ORDER_PAYMENT_MODES = [
    "Cash",
    "UPI",
    "Bank Transfer",
    "Card",
    "Cheque",
    "Other",
    "Online",
  ];

  // Today's date in YYYY-MM-DD for max attribute of date inputs
  const today = new Date().toISOString().split("T")[0];

  // Form states
  const [salesForm, setSalesForm] = useState({
    date: "",
    openingCash: "",
    purchaseCash: "",
    onlineCash: "",
    physicalCash: "",
    cashTransferred: "",
    closingCash: "",
    totalSales: 0, // start with 0
    remarks: "",
    file: null,
    orderDate: "",
    orderId: "",
    orderAmount: "",
    paymentReceived: "",
    amountPaid: "",
    paymentMode: "",
    paymentReceipt: null,
  });

  // Update totalSales automatically
  useEffect(() => {
    const openingCash = Number(salesForm.openingCash) || 0;
    const purchaseCash = Number(salesForm.purchaseCash) || 0;
    const onlineCash = Number(salesForm.onlineCash) || 0;
    const physicalCash = Number(salesForm.physicalCash) || 0;

    const total = physicalCash + onlineCash + purchaseCash - openingCash;

    setSalesForm((prev) => ({ ...prev, totalSales: total }));
  }, [
    salesForm.openingCash,
    salesForm.purchaseCash,
    salesForm.onlineCash,
    salesForm.physicalCash,
  ]);

  const [orderForm, setOrderForm] = useState({
    orderDate: "",
    deliveryDate: "",
    orderId: "",
    amount: "",
    paymentMode: "",
    file: null,
    remarks: "",
    paymentReceived: "",
    amountPaid: "",
    paymentReceipt: null,
  });

  const isValidAmountPaid = (value) => {
    if (value === "" || value === null || value === undefined) return false;
    const parsed = Number(value);
    return !Number.isNaN(parsed) && parsed > 0;
  };

  const clearReceiptInput = () => {
    if (paymentReceiptInputRef.current) paymentReceiptInputRef.current.value = "";
  };

  const clearOrderReceiptInput = () => {
    if (orderReceiptInputRef.current) orderReceiptInputRef.current.value = "";
  };

  const receiptPreviewUrl = useMemo(() => {
    if (
      salesForm.paymentReceipt &&
      salesForm.paymentReceipt.type &&
      salesForm.paymentReceipt.type.startsWith("image/")
    ) {
      return URL.createObjectURL(salesForm.paymentReceipt);
    }
    return "";
  }, [salesForm.paymentReceipt]);

  useEffect(() => {
    return () => {
      if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
    };
  }, [receiptPreviewUrl]);

  const orderReceiptPreviewUrl = useMemo(() => {
    if (
      orderForm.paymentReceipt &&
      orderForm.paymentReceipt.type &&
      orderForm.paymentReceipt.type.startsWith("image/")
    ) {
      return URL.createObjectURL(orderForm.paymentReceipt);
    }
    return "";
  }, [orderForm.paymentReceipt]);

  useEffect(() => {
    return () => {
      if (orderReceiptPreviewUrl) URL.revokeObjectURL(orderReceiptPreviewUrl);
    };
  }, [orderReceiptPreviewUrl]);

  const handleSalesFormChange = (e) => {
    const { name, value, type, files } = e.target;

    if (name === "paymentReceipt") {
      const selected = files && files[0] ? files[0] : null;
      if (!selected) {
        setSalesForm((prev) => ({ ...prev, paymentReceipt: null }));
        return;
      }
      const extension = selected.name.split(".").pop()?.toLowerCase();
      const allowedExtensions = ["jpg", "jpeg", "png", "webp", "pdf"];
      if (
        !RECEIPT_TYPES.includes(selected.type) &&
        !allowedExtensions.includes(extension)
      ) {
        alert("Payment receipt must be a JPG, JPEG, PNG, WEBP, or PDF file.");
        clearReceiptInput();
        return;
      }
      if (selected.size > RECEIPT_MAX_SIZE) {
        alert("Payment receipt must be 10MB or smaller.");
        clearReceiptInput();
        return;
      }
      setSalesForm((prev) => ({ ...prev, paymentReceipt: selected }));
      return;
    }

    if (name === "paymentReceived") {
      setSalesForm((prev) => ({
        ...prev,
        paymentReceived: value,
        ...(value !== "yes"
          ? { amountPaid: "", paymentMode: "", paymentReceipt: null }
          : {}),
      }));
      if (value !== "yes") clearReceiptInput();
      return;
    }

    if (name === "amountPaid") {
      setSalesForm((prev) => ({
        ...prev,
        amountPaid: value,
        ...(!isValidAmountPaid(value)
          ? { paymentMode: "", paymentReceipt: null }
          : {}),
      }));
      if (!isValidAmountPaid(value)) clearReceiptInput();
      return;
    }

    setSalesForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleOrderFormChange = (e) => {
    const { name, value, type, files } = e.target;

    if (name === "paymentReceipt") {
      const selected = files && files[0] ? files[0] : null;
      if (!selected) {
        setOrderForm((prev) => ({ ...prev, paymentReceipt: null }));
        return;
      }
      const extension = selected.name.split(".").pop()?.toLowerCase();
      const allowedExtensions = ["jpg", "jpeg", "png", "webp", "pdf"];
      if (
        !RECEIPT_TYPES.includes(selected.type) &&
        !allowedExtensions.includes(extension)
      ) {
        alert("Payment receipt must be a JPG, JPEG, PNG, WEBP, or PDF file.");
        clearOrderReceiptInput();
        return;
      }
      if (selected.size > RECEIPT_MAX_SIZE) {
        alert("Payment receipt must be 10MB or smaller.");
        clearOrderReceiptInput();
        return;
      }
      setOrderForm((prev) => ({ ...prev, paymentReceipt: selected }));
      return;
    }

    if (name === "paymentReceived") {
      setOrderForm((prev) => ({
        ...prev,
        paymentReceived: value,
        ...(value !== "yes"
          ? { amountPaid: "", paymentMode: "", paymentReceipt: null }
          : {}),
      }));
      if (value !== "yes") clearOrderReceiptInput();
      return;
    }

    if (name === "amountPaid") {
      setOrderForm((prev) => ({
        ...prev,
        amountPaid: value,
        ...(!isValidAmountPaid(value)
          ? { paymentMode: "", paymentReceipt: null }
          : {}),
      }));
      if (!isValidAmountPaid(value)) clearOrderReceiptInput();
      return;
    }

    setOrderForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSalesSubmit = async (e) => {
    e.preventDefault();

    if (salesForm.orderAmount !== "") {
      const parsedOrderAmount = Number(salesForm.orderAmount);
      if (Number.isNaN(parsedOrderAmount) || parsedOrderAmount < 0) {
        alert("Order amount must be a valid non-negative number.");
        return;
      }
    }
    if (salesForm.paymentReceived === "yes" && salesForm.amountPaid !== "") {
      const parsedAmountPaid = Number(salesForm.amountPaid);
      if (Number.isNaN(parsedAmountPaid) || parsedAmountPaid < 0) {
        alert("Amount paid must be a valid non-negative number.");
        return;
      }
    }

    const payload = { ...salesForm };
    if (payload.paymentReceived !== "yes") {
      payload.amountPaid = "";
      payload.paymentMode = "";
      payload.paymentReceipt = null;
    } else if (!isValidAmountPaid(payload.amountPaid)) {
      payload.paymentMode = "";
      payload.paymentReceipt = null;
    }

    setLoading(true);
    try {
      await addSales(payload);
      // Reset form
      setSalesForm({
        date: "",
        openingCash: "",
        purchaseCash: "",
        onlineCash: "",
        physicalCash: "",
        cashTransferred: "",
        closingCash: "",
        totalSales: 0,
        remarks: "",
        file: null,
        orderDate: "",
        orderId: "",
        orderAmount: "",
        paymentReceived: "",
        amountPaid: "",
        paymentMode: "",
        paymentReceipt: null,
      });
      setShowSalesForm(false);
      if (salesFileInputRef.current) salesFileInputRef.current.value = "";
      if (paymentReceiptInputRef.current) paymentReceiptInputRef.current.value = "";
    } catch (err) {
      // error toast handled in store
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    if (orderForm.amount !== "") {
      const parsedAmount = Number(orderForm.amount);
      if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
        alert("Amount must be a valid non-negative number.");
        return;
      }
    }
    if (orderForm.paymentReceived === "yes" && orderForm.amountPaid !== "") {
      const parsedAmountPaid = Number(orderForm.amountPaid);
      if (Number.isNaN(parsedAmountPaid) || parsedAmountPaid < 0) {
        alert("Amount paid must be a valid non-negative number.");
        return;
      }
    }

    const payload = { ...orderForm };
    if (payload.paymentReceived !== "yes") {
      payload.amountPaid = "";
      payload.paymentMode = "";
      payload.paymentReceipt = null;
    } else if (!isValidAmountPaid(payload.amountPaid)) {
      payload.paymentMode = "";
      payload.paymentReceipt = null;
    }

    setLoading(true);
    try {
      await addOrder(payload);
      // Reset form
      setOrderForm({
        orderDate: "",
        deliveryDate: "",
        orderId: "",
        amount: "",
        paymentMode: "",
        file: null,
        remarks: "",
        paymentReceived: "",
        amountPaid: "",
        paymentReceipt: null,
      });
      setShowOrderForm(false);
      if (orderFileInputRef.current) orderFileInputRef.current.value = "";
      if (orderReceiptInputRef.current) orderReceiptInputRef.current.value = "";
    } catch (err) {
      // error toast handled in store
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className={`flex justify-center items-start min-h-screen pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-8 px-2 sm:px-4 main-content-mobile overflow-x-hidden ${
        currentMode === "Dark" ? "bg-[#23272e]" : "bg-gray-100"
      }`}
    >
      <div className="w-full max-w-6xl min-w-0">
        <div
          className={`bg-white dark:text-gray-200 dark:bg-secondary-dark-bg shadow-2xl m-1 sm:m-2 md:m-3 p-2 sm:p-3 md:p-4 rounded-2xl w-full min-w-0 ${
            currentMode === "Dark" ? "bg-[#23272e]" : "bg-white"
          }`}
        >
          <div
            className={`m-1 sm:m-2 md:m-4 lg:m-6 p-2 sm:p-4 md:p-6 lg:p-10 pb-4 mt-4 sm:mt-6 md:mt-8 lg:mt-12 rounded-xl md:rounded-3xl w-full min-w-0 overflow-hidden ${
              currentMode === "Dark" ? "bg-secondary-dark-bg" : "bg-gray-200"
            }`}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Daily Sales & Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Add new sales entries and orders using the forms below
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
              <button
                onClick={() => {
                  setShowSalesForm(!showSalesForm);
                  setShowOrderForm(false);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <FiPlus /> Add Sales
              </button>
              {/* Add Order Button - Hidden for Staff */}
              {user?.role !== 'staff' && (
                <button
                  onClick={() => {
                    setShowOrderForm(!showOrderForm);
                    setShowSalesForm(false);
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <FiPlus /> Add Order
                </button>
              )}
            </div>

            {/* Sales Form */}
            {showSalesForm && (
              <div
                className={`rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-6 w-full min-w-0 overflow-hidden ${
                  currentMode === "Dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Add Sales Entry
                </h3>
                <form onSubmit={handleSalesSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={salesForm.date}
                      onChange={handleSalesFormChange}
                      required
                      max={today}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Opening Cash <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="openingCash"
                        value={salesForm.openingCash}
                        onChange={handleSalesFormChange}
                        min="0"
                        step="0.01"
                        required
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Purchase Cash <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="purchaseCash"
                        value={salesForm.purchaseCash}
                        onChange={handleSalesFormChange}
                        min="0"
                        step="0.01"
                        required
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Online Cash <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="onlineCash"
                        value={salesForm.onlineCash}
                        onChange={handleSalesFormChange}
                        min="0"
                        step="0.01"
                        required
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Physical Cash <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="physicalCash"
                        value={salesForm.physicalCash}
                        onChange={handleSalesFormChange}
                        min="0"
                        step="0.01"
                        required
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cash Transferred <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        name="cashTransferred"
                        value={salesForm.cashTransferred}
                        onChange={handleSalesFormChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Closing Cash <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        name="closingCash"
                        value={salesForm.closingCash}
                        onChange={handleSalesFormChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total Sale <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      name="totalSales"
                      readOnly
                      value={salesForm.totalSales}
                      onChange={handleSalesFormChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order Date
                      </label>
                      <input
                        type="date"
                        name="orderDate"
                        value={salesForm.orderDate}
                        onChange={handleSalesFormChange}
                        max={today}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order ID
                      </label>
                      <input
                        type="text"
                        name="orderId"
                        value={salesForm.orderId}
                        onChange={handleSalesFormChange}
                        placeholder="External order reference"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order Amount
                      </label>
                      <input
                        type="number"
                        name="orderAmount"
                        value={salesForm.orderAmount}
                        onChange={handleSalesFormChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Has any payment been received?
                    </label>
                    <select
                      name="paymentReceived"
                      value={salesForm.paymentReceived}
                      onChange={handleSalesFormChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  {salesForm.paymentReceived === "yes" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount Paid
                      </label>
                      <input
                        type="number"
                        name="amountPaid"
                        value={salesForm.amountPaid}
                        onChange={handleSalesFormChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Partial payments are allowed and do not need to match the order amount.
                      </p>
                    </div>
                  )}

                  {salesForm.paymentReceived === "yes" &&
                    isValidAmountPaid(salesForm.amountPaid) && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Payment Mode
                          </label>
                          <select
                            name="paymentMode"
                            value={salesForm.paymentMode}
                            onChange={handleSalesFormChange}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              currentMode === "Dark"
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white text-gray-900"
                            }`}
                          >
                            <option value="">Select Payment Mode</option>
                            {PAYMENT_MODES.map((mode) => (
                              <option key={mode} value={mode}>
                                {mode}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Upload Payment Receipt
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="file"
                              name="paymentReceipt"
                              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                              onChange={handleSalesFormChange}
                              className={`flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                currentMode === "Dark"
                                  ? "bg-gray-700 border-gray-600 text-white"
                                  : "bg-white text-gray-900"
                              }`}
                              ref={paymentReceiptInputRef}
                            />
                            {salesForm.paymentReceipt && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const fileUrl = URL.createObjectURL(
                                      salesForm.paymentReceipt
                                    );
                                    setAttachmentModal({
                                      isOpen: true,
                                      fileUrl,
                                      fileName: salesForm.paymentReceipt.name,
                                    });
                                  }}
                                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                                >
                                  <FiEye size={16} />
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSalesForm((prev) => ({
                                      ...prev,
                                      paymentReceipt: null,
                                    }));
                                    clearReceiptInput();
                                  }}
                                  className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-1"
                                >
                                  <FiX size={16} />
                                  Remove
                                </button>
                              </>
                            )}
                          </div>
                          {salesForm.paymentReceipt && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">
                                Selected: {salesForm.paymentReceipt.name}
                              </p>
                              {receiptPreviewUrl && (
                                <img
                                  src={receiptPreviewUrl}
                                  alt="Payment receipt preview"
                                  className="mt-2 max-h-32 rounded-md border border-gray-300"
                                />
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Optional. Allowed: JPG, JPEG, PNG, WEBP, PDF. Max size: 10MB.
                          </p>
                        </div>
                      </>
                    )}

                  {salesForm.paymentReceived === "no" && (
                    <p className="text-xs text-gray-500">
                      Payment status: No Payment
                    </p>
                  )}
                  {salesForm.paymentReceived === "yes" &&
                    !isValidAmountPaid(salesForm.amountPaid) && (
                      <p className="text-xs text-gray-500">
                        Payment status not established until an amount paid is entered.
                      </p>
                    )}
                  {salesForm.paymentReceived === "yes" &&
                    isValidAmountPaid(salesForm.amountPaid) &&
                    salesForm.orderAmount === "" && (
                      <p className="text-xs text-gray-500">
                        Payment Received – Completion Unknown
                      </p>
                    )}
                  {salesForm.paymentReceived === "yes" &&
                    isValidAmountPaid(salesForm.amountPaid) &&
                    salesForm.orderAmount !== "" &&
                    Number(salesForm.amountPaid) >=
                      Number(salesForm.orderAmount) && (
                      <p className="text-xs text-gray-500">
                        Payment status: Fully Paid
                      </p>
                    )}
                  {salesForm.paymentReceived === "yes" &&
                    isValidAmountPaid(salesForm.amountPaid) &&
                    salesForm.orderAmount !== "" &&
                    Number(salesForm.amountPaid) <
                      Number(salesForm.orderAmount) && (
                      <p className="text-xs text-gray-500">
                        Payment status: Partial Payment
                      </p>
                    )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      rows={2}
                      value={salesForm.remarks}
                      onChange={handleSalesFormChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File Attachment
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        name="file"
                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleSalesFormChange}
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                        ref={salesFileInputRef}
                      />
                      {salesForm.file && (
                        <button
                          type="button"
                          onClick={() => {
                            const fileUrl = URL.createObjectURL(salesForm.file);
                            setAttachmentModal({
                              isOpen: true,
                              fileUrl: fileUrl,
                              fileName: salesForm.file.name
                            });
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <FiEye size={16} />
                          View
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Allowed: Images, PDFs, Word files. Max size: 10MB.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowSalesForm(false)}
                      className="px-6 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-400 hover:dark:bg-gray-600"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded font-semibold text-white"
                      style={{
                        background: currentColor,
                        opacity: loading ? 0.7 : 1,
                      }}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Sales"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Order Form - Hidden for Staff */}
            {showOrderForm && user?.role !== 'staff' && (
              <div
                className={`rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-6 w-full min-w-0 overflow-hidden ${
                  currentMode === "Dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Add Order Entry
                </h3>
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Order Date
                    </label>
                    <input
                      type="date"
                      name="orderDate"
                      value={orderForm.orderDate}
                      onChange={handleOrderFormChange}
                      max={today}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={orderForm.deliveryDate}
                      onChange={handleOrderFormChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order ID
                      </label>
                      <input
                        type="text"
                        name="orderId"
                        value={orderForm.orderId}
                        onChange={handleOrderFormChange}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={orderForm.amount}
                        onChange={handleOrderFormChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Has any payment been received?
                    </label>
                    <select
                      name="paymentReceived"
                      value={orderForm.paymentReceived}
                      onChange={handleOrderFormChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  {orderForm.paymentReceived === "yes" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount Paid
                      </label>
                      <input
                        type="number"
                        name="amountPaid"
                        value={orderForm.amountPaid}
                        onChange={handleOrderFormChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Partial payments are allowed and do not need to match the order amount.
                      </p>
                    </div>
                  )}

                  {orderForm.paymentReceived === "yes" &&
                    isValidAmountPaid(orderForm.amountPaid) && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Payment Mode
                          </label>
                          <select
                            name="paymentMode"
                            value={orderForm.paymentMode}
                            onChange={handleOrderFormChange}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              currentMode === "Dark"
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white text-gray-900"
                            }`}
                          >
                            <option value="">Select Payment Mode</option>
                            {ORDER_PAYMENT_MODES.map((mode) => (
                              <option key={mode} value={mode}>
                                {mode}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Payment Receipt
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="file"
                              name="paymentReceipt"
                              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                              onChange={handleOrderFormChange}
                              className={`flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                currentMode === "Dark"
                                  ? "bg-gray-700 border-gray-600 text-white"
                                  : "bg-white text-gray-900"
                              }`}
                              ref={orderReceiptInputRef}
                            />
                            {orderForm.paymentReceipt && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const fileUrl = URL.createObjectURL(
                                      orderForm.paymentReceipt
                                    );
                                    setAttachmentModal({
                                      isOpen: true,
                                      fileUrl,
                                      fileName: orderForm.paymentReceipt.name,
                                    });
                                  }}
                                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                                >
                                  <FiEye size={16} />
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOrderForm((prev) => ({
                                      ...prev,
                                      paymentReceipt: null,
                                    }));
                                    clearOrderReceiptInput();
                                  }}
                                  className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-1"
                                >
                                  <FiX size={16} />
                                  Remove
                                </button>
                              </>
                            )}
                          </div>
                          {orderForm.paymentReceipt && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">
                                Selected: {orderForm.paymentReceipt.name}
                              </p>
                              {orderReceiptPreviewUrl && (
                                <img
                                  src={orderReceiptPreviewUrl}
                                  alt="Payment receipt preview"
                                  className="mt-2 max-h-32 rounded-md border border-gray-300"
                                />
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Optional. Allowed: JPG, JPEG, PNG, WEBP, PDF. Max size: 10MB.
                          </p>
                        </div>
                      </>
                    )}

                  {orderForm.paymentReceived === "no" && (
                    <p className="text-xs text-gray-500">
                      Payment status: No Payment
                    </p>
                  )}
                  {orderForm.paymentReceived === "yes" &&
                    !isValidAmountPaid(orderForm.amountPaid) && (
                      <p className="text-xs text-gray-500">
                        Payment status not established until an amount paid is entered.
                      </p>
                    )}
                  {orderForm.paymentReceived === "yes" &&
                    isValidAmountPaid(orderForm.amountPaid) &&
                    orderForm.amount === "" && (
                      <p className="text-xs text-gray-500">
                        Payment Received – Completion Unknown
                      </p>
                    )}
                  {orderForm.paymentReceived === "yes" &&
                    isValidAmountPaid(orderForm.amountPaid) &&
                    orderForm.amount !== "" &&
                    Number(orderForm.amountPaid) >= Number(orderForm.amount) && (
                      <p className="text-xs text-gray-500">
                        Payment status: Fully Paid
                      </p>
                    )}
                  {orderForm.paymentReceived === "yes" &&
                    isValidAmountPaid(orderForm.amountPaid) &&
                    orderForm.amount !== "" &&
                    Number(orderForm.amountPaid) < Number(orderForm.amount) && (
                      <p className="text-xs text-gray-500">
                        Payment status: Partial Payment
                      </p>
                    )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File Attachment
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        name="file"
                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleOrderFormChange}
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentMode === "Dark"
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                        ref={orderFileInputRef}
                      />
                      {orderForm.file && (
                        <button
                          type="button"
                          onClick={() => {
                            const fileUrl = URL.createObjectURL(orderForm.file);
                            setAttachmentModal({
                              isOpen: true,
                              fileUrl: fileUrl,
                              fileName: orderForm.file.name
                            });
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <FiEye size={16} />
                          View
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Allowed: Images, PDFs, Word files. Max size: 10MB.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={orderForm.remarks}
                      onChange={handleOrderFormChange}
                      rows="2"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        currentMode === "Dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowOrderForm(false)}
                      className="px-6 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-400 hover:dark:bg-gray-600"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded font-semibold text-white"
                      style={{
                        background: currentColor,
                        opacity: loading ? 0.7 : 1,
                      }}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Order"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <AttachmentModal
        isOpen={attachmentModal.isOpen}
        onClose={() => setAttachmentModal({ isOpen: false, fileUrl: "", fileName: "" })}
        fileUrl={attachmentModal.fileUrl}
        fileName={attachmentModal.fileName}
      />
    </div>
  );
};

export default DailySale;
