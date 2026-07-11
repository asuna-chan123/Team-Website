import React from "react";

// Admin Imports
import MainDashboard from "views/admin/default";
import NFTMarketplace from "views/admin/marketplace";
import Profile from "views/admin/profile";
import DataTables from "views/admin/tables";
import RTLDefault from "views/rtl/default";

// New Dynamic Views
import Products from "views/admin/products";
import Orders from "views/admin/orders";
import Customers from "views/admin/customers";

// Auth Imports
import SignIn from "views/auth/SignIn";

// Icon Imports
import {
  MdHome,
  MdOutlineShoppingCart,
  MdBarChart,
  MdPerson,
  MdLock,
  MdShoppingBag,
  MdReceipt,
  MdPeople,
} from "react-icons/md";

const routes = [
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
    name: "Sản phẩm",
    layout: "/admin",
    path: "products",
    icon: <MdShoppingBag className="h-6 w-6" />,
    component: <Products />,
  },
  {
    name: "Đơn hàng",
    layout: "/admin",
    path: "orders",
    icon: <MdReceipt className="h-6 w-6" />,
    component: <Orders />,
  },
  {
    name: "Khách hàng",
    layout: "/admin",
    path: "customers",
    icon: <MdPeople className="h-6 w-6" />,
    component: <Customers />,
  },

  {
    name: "Sign In",
    layout: "/auth",
    path: "sign-in",
    icon: <MdLock className="h-6 w-6" />,
    component: <SignIn />,
  }
];
export default routes;
