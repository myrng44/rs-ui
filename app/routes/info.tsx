
export function meta({}: Route.MetaArgs) {
  return [{ title: 'Store maN' }, { name: 'Manage your business!', content: 'Welcome to Store maN!' }];
}

export default function Info() {
  return <div className='text-center'> Info page!</div>
}