import { useState, useEffect } from 'react';
import { Layout } from '~/components/Layout';
import { dashboardApi } from '~/utils/api';
import { Button } from '~/components/Button';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const rev = await dashboardApi.getRevenue(30);
        const products = await dashboardApi.getTotalProducts();
        setTotalRevenue(rev || 0);
        setTotalInvoices(products || 0);
      } catch (e) {
        console.error(e);
        setError('Không thể tải dữ liệu báo cáo');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive financial reporting and business intelligence</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant='primary' size='md'>Schedule Reports</Button>
            <Button variant='primary' size='md'>Export Report</Button>
          </div>
        </div>

        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg'>{error}</div>}

        <div className="bg-surface p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="flex flex-wrap gap-3 items-center mb-4">
                <select className="px-3 py-2 rounded border">
                  <option>This Year</option>
                  <option>Last 30 days</option>
                </select>
                <select className="px-3 py-2 rounded border">
                  <option>All Clients</option>
                </select>
                <select className="px-3 py-2 rounded border">
                  <option>All Status</option>
                </select>
                <select className="px-3 py-2 rounded border">
                  <option>All Categories</option>
                </select>
                <input className="px-3 py-2 rounded border w-28" placeholder="Min Amount" />
                <input className="px-3 py-2 rounded border w-28" placeholder="Max Amount" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className='bg-white/5 p-4 rounded-lg'>
                  <p className='text-sm text-gray-400'>Total Revenue</p>
                  <div className='text-xl font-bold mt-1'>{loading ? '—' : formatPrice(totalRevenue)}</div>
                </div>

                <div className='bg-white/5 p-4 rounded-lg'>
                  <p className='text-sm text-gray-400'>Paid Revenue</p>
                  <div className='text-xl font-bold mt-1'>{loading ? '—' : formatPrice(0)}</div>
                </div>

                <div className='bg-white/5 p-4 rounded-lg'>
                  <p className='text-sm text-gray-400'>Outstanding</p>
                  <div className='text-xl font-bold mt-1'>{loading ? '—' : formatPrice(0)}</div>
                </div>

                <div className='bg-white/5 p-4 rounded-lg'>
                  <p className='text-sm text-gray-400'>Active Clients</p>
                  <div className='text-xl font-bold mt-1'>{loading ? '—' : totalInvoices}</div>
                </div>
              </div>

              <div className="mt-6 h-56 rounded bg-white/5 p-4">
                <svg viewBox='0 0 400 120' className='w-full h-full'>
                  <defs>
                    <linearGradient id='rg' x1='0' x2='0' y1='0' y2='1'>
                      <stop offset='0%' stopColor='rgba(7,122,125,0.15)' />
                      <stop offset='100%' stopColor='rgba(7,122,125,0.03)' />
                    </linearGradient>
                  </defs>
                  <rect x='0' y='0' width='400' height='120' fill='url(#rg)' rx='6' />
                  <polyline fill='none' stroke='var(--color-primary)' strokeWidth='2' points='0,90 40,75 80,65 120,55 160,60 200,45 240,35 280,40 320,25 360,30 400,15' />
                </svg>
              </div>
            </div>

            <div>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='text-lg font-semibold'>Filters</h3>
                <Button variant='primary' size='sm'>Reset</Button>
              </div>

              <div className='space-y-3'>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>Date Range</label>
                  <select className='w-full px-3 py-2 rounded border'>
                    <option>This Year</option>
                    <option>Last 90 days</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm text-gray-600 mb-1'>Client</label>
                  <input className='w-full px-3 py-2 rounded border' placeholder='Client name' />
                </div>

                <div>
                  <label className='block text-sm text-gray-600 mb-1'>Status</label>
                  <select className='w-full px-3 py-2 rounded border'>
                    <option>All Status</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm text-gray-600 mb-1'>Category</label>
                  <select className='w-full px-3 py-2 rounded border'>
                    <option>All</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}