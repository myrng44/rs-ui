import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("products", "routes/products.tsx"),
  route("orders", "routes/orders.tsx"),
  route("login", "routes/login.tsx"),
] satisfies RouteConfig;
