/**
 * Routes are configured here
 * each route has two requred parts:
 * a URL pattern to match URL
 *  and
 * a file path to the route modules that defines its behaviour
 */

import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  // route('about', 'routes/about.tsx'),
  //    route module

  //nested Routes
  // route('dashboard', 'routes/dashboard.tsx'),
  route('login', 'routes/Login.tsx'),
  route('products', 'routes/product.tsx')
] satisfies RouteConfig
