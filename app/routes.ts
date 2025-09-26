import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
  route('home-sysadmin', 'routes/home.sysadmin.tsx'),
  route('home-manager', 'routes/home.manager.tsx'),
  route('home-staff', 'routes/home.staff.tsx'),
	route('login', 'routes/login.tsx'),
	route('dashboard', 'routes/dashboard.tsx'),
  route('reports', 'routes/reports.tsx'),
  route('products', 'routes/products.tsx'),
	route('categories', 'routes/categories.tsx'),
	route('orders', 'routes/orders.tsx'),
  route('orders/new', 'routes/orders.new.tsx'),
  route('customers', 'routes/customers.tsx'),
	route('suppliers', 'routes/suppliers.tsx'),
	route('stores', 'routes/stores.tsx'),
	route('stock', 'routes/stock.tsx'),
	route('vouchers', 'routes/vouchers.tsx'),
  route('settings', 'routes/settings.tsx'),
  route('about', 'routes/about.tsx'),
] satisfies RouteConfig;
