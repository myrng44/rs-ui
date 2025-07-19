import {type RouteConfig, index, route} from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('dashboard', 'routes/dashboard.tsx', [
    route('product', 'routes/product.tsx', [
      route('new', 'routes/newProduct.tsx'),
    ]),
  ]),
  route('info', 'routes/info.tsx'),
  route('settings', 'routes/settings.tsx'),
  route('auth', 'routes/loginForm.tsx'),
] satisfies RouteConfig;
