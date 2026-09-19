import {
  FiShoppingBag,
  FiPieChart,
  FiBarChart,
  FiCreditCard,
  FiStar,
  FiShoppingCart,
} from "react-icons/fi";
import {
  BsBoxSeam,
  BsCurrencyDollar,
  BsShield,
  BsChatLeft,
} from "react-icons/bs";
import { MdOutlineSupervisorAccount } from "react-icons/md";
import { FcSalesPerformance } from "react-icons/fc";

export const colorMappingData = [
  [
    { x: "1", y: 10000 },
    { x: "2", y: 5000 },
    { x: "3", y: 25000 },
    { x: "4", y: 15000 },
    { x: "5", y: 30000 },
    { x: "6", y: 20000 },
    { x: "7", y: 35000 },
    { x: "8", y: 40000 },
    { x: "9", y: 45000 },
    { x: "10", y: 60000 },
    { x: "11", y: 70000 },
    { x: "12", y: 80000 },
    { x: "13", y: 90000 },
    { x: "14", y: 100000 },
    { x: "15", y: 110000 },
    { x: "16", y: 120000 },
    { x: "17", y: 130000 },
    { x: "18", y: 140000 },
    { x: "19", y: 150000 },
    { x: "20", y: 160000 },
    { x: "21", y: 170000 },
    { x: "22", y: 180000 },
    { x: "23", y: 190000 },
    { x: "24", y: 200000 },
    { x: "25", y: 210000 },
    { x: "26", y: 220000 },
    { x: "27", y: 230000 },
    { x: "28", y: 240000 },
    { x: "29", y: 250000 },
    { x: "30", y: 260000 },
    { x: "31", y: 270000 },
  ],
  ["#fa0000"],
  ["#fac400"],
  ["#00fa00"],
];

export const rangeColorMapping = [
  {
    label: "₹ 0 to ₹ 10000",
    start: "0",
    end: "10000",
    colors: colorMappingData[1],
  },

  {
    label: "₹ 10000 to ₹ 15000",
    start: "10000",
    end: "15000",
    colors: colorMappingData[2],
  },

  {
    label: "₹ 0 to ₹ 10000",
    start: "15000",
    end: "1000000",
    colors: colorMappingData[3],
  },
];

export const ColorMappingPrimaryXAxis = {
  valueType: "Category",
  majorGridLines: { width: 0 },
  title: "Date",
  titleStyle: {
    color: "#FFFFFF",
    size: "16px",
    fontWeight: "500",
  },
  labelStyle: {
    color: "#FFFFFF",
    size: "12px",
    fontWeight: "500",
  },
  labelIntersectAction: "Rotate45",
};

export const ColorMappingPrimaryYAxis = {
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 },
  labelFormat: "₹ {value}",
  title: "Sale",
  titleStyle: {
    color: "#FFFFFF", // white color
    size: "16px", // increased size
    fontWeight: "500", // medium boldness
  },
};

export const links = [
  {
    title: "TT Kothanur",
    links: [
      {
        name: "Dashboard",
        linkTo: "dashboard",
        icon: <FiShoppingBag />,
      },
      {
        name: "Expenses",
        linkTo: "expenses",
        icon: <FiPieChart />,
      },
      {
        name: "Sales",
        linkTo: "sales-data",
        icon: <FiPieChart />,
      },
    ],
  },
];

export const earningData = (otherExpenses, totalLoansExpense, totalSales) => [
  {
    icon: <FcSalesPerformance />,
    amount: totalSales
      ? `₹ ${Number(totalSales).toLocaleString("en-IN")}`
      : "₹ 0",
    title: "Total Sales",
    description: "Revenue from sales & orders",
    iconColor: "#03C9D7",
    iconBg: "#E5FAFB",
    pcColor: "green-600",
    tooltip: `Total Sales: ₹${Number(totalSales || 0).toLocaleString("en-IN")}`,
  },
  {
    icon: <BsBoxSeam />,
    amount: `₹ ${
      otherExpenses ? Number(otherExpenses).toLocaleString("en-IN") : "0"
    }`,
    title: "Operating Expenses",
    description: "Total expenses excl. Loans & EMI",
    iconColor: "rgb(255, 244, 229)",
    iconBg: "rgb(254, 201, 15)",
    pcColor: "green-600",
    tooltip: `Operating Expenses: ₹${Number(otherExpenses || 0).toLocaleString("en-IN")}`,
  },
];

export const themeColors = [
  {
    name: "blue-theme",
    color: "#1A97F5",
  },
  {
    name: "green-theme",
    color: "#03C9D7",
  },
  {
    name: "purple-theme",
    color: "#7352FF",
  },
  {
    name: "red-theme",
    color: "#FF5C8E",
  },
  {
    name: "indigo-theme",
    color: "#1E4DB7",
  },
  {
    color: "#FB9678",
    name: "orange-theme",
  },
];

export const userProfileData = [
  {
    icon: <BsCurrencyDollar />,
    title: "My Profile",
    desc: "Account Settings",
    iconColor: "#03C9D7",
    iconBg: "#E5FAFB",
  },
  {
    icon: <BsShield />,
    title: "My Inbox",
    desc: "Messages & Emails",
    iconColor: "rgb(0, 194, 146)",
    iconBg: "rgb(235, 250, 242)",
  },
  {
    icon: <FiCreditCard />,
    title: "My Tasks",
    desc: "To-do and Daily Tasks",
    iconColor: "rgb(255, 244, 229)",
    iconBg: "rgb(254, 201, 15)",
  },
];

export const pieChartData = [
  { x: "Labour", y: 18, text: "18%" },
  { x: "Legal", y: 8, text: "8%" },
  { x: "Production", y: 15, text: "15%" },
  { x: "License", y: 11, text: "11%" },
  { x: "Facilities", y: 18, text: "18%" },
  { x: "Taxes", y: 14, text: "14%" },
  { x: "Insurance", y: 16, text: "16%" },
  { x: "Interest", y: 16, text: "16%" },
  { x: "Other", y: 16, text: "16%" },
];
export const dropdownData = [
  {
    Id: "1",
    Time: "March 2021",
  },
  {
    Id: "2",
    Time: "April 2021",
  },
  {
    Id: "3",
    Time: "May 2021",
  },
];
