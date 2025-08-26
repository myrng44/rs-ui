import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
	route('login', 'routes/login.tsx'),
	route('dashboard', 'routes/dashboard.tsx'),
	route('products', 'routes/products.tsx'),
	route('categories', 'routes/categories.tsx'),
	route('orders', 'routes/orders.tsx'),
  route('customers', 'routes/customers.tsx'),
	route('suppliers', 'routes/suppliers.tsx'),
	route('stores', 'routes/stores.tsx'),
	route('stock', 'routes/stock.tsx'),
	route('vouchers', 'routes/vouchers.tsx'),
	route('about', 'routes/about.tsx'),
] satisfies RouteConfig;
