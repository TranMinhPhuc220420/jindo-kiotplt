import React from "react";

import { Routes, Route, createBrowserRouter } from "react-router";

// Layouts
import LayoutAdmin from "./layout/admin";
import LayoutClient from "./layout/client";

import DashboardPage from "./pages/DashboardPage";
import RevenueManagerPage from "./pages/revenue/manager";
import ProductManagerPage from "./pages/product/manager";
import InventoryManagerPage from "./pages/inventory/manager";
import ReportPage from "./pages/ReportPage";

import ManagerEmployeePage from "./pages/employee/manager";

import LoginPage from "./pages/login";

const router = createBrowserRouter([
  {
    path: "/dang-nhap",
    element: <LoginPage />,
  },

  // Admin routes
  {
    path: '/admin',
    element: <LayoutAdmin />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      // {
      //   path: 'bao-cao',
      //   element: <ReportPage />,
      // },
      // {
      //   path: 'doanh-thu',
      //   element: <RevenueManagerPage />,
      // },
      {
        path: 'quan-ly-san-pham',
        element: <ProductManagerPage />,
      },
      {
        path: 'quan-ly-kho',
        element: <InventoryManagerPage />,
      },
      {
        path: 'nhan-vien',
        children: [
          {
            path: 'quan-ly',
            element: <ManagerEmployeePage />,
          },
        ],
      },
    ],
  },

  // Client routes
  {
    path: '/',
    element: <LayoutClient />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
    ],
  },

]);

export default router;