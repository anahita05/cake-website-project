import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/HomePage";
import ProductDetail from "../pages/ProductDetail";
import CartPage from "../pages/CartPage";
import ComingSoon from "../pages/ComingSoon";
import SignupPage from "../pages/SignupPage";
import LoginPage from "../pages/LoginPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "product/:id", element: <ProductDetail /> },
      { path: "cart", element: <CartPage /> },
      { path: "cakes", element: <ComingSoon /> },
      { path: "theme-cakes", element: <ComingSoon /> },
      { path: "desserts", element: <ComingSoon /> },

      { path: "*", element: <ComingSoon /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/login", element: <LoginPage /> },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
