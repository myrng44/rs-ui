import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
	return [{ title: 'Store maN' }, { name: 'Manage your business!', content: 'Welcome to Store maN!' }];
}

export default function Home() {
	return <div className='items-center'>
    <p className='font-bold text-xl text-gray-800 leading-tight'>Home Page!</p>
  </div>
}
