import { Layout } from '~/components/Layout';
import { useCallback } from 'react';
import { useTheme } from '~/contexts/themeContext';
import { Button } from '~/components/Button';
import { useSettings } from '~/contexts/settingsContext';

export default function Settings() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const { fadeTransition, setFadeTransition } = useSettings();

  const handleToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  return (
    <Layout>
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Cài đặt</h1>
          <p className='text-gray-600'>Tùy chỉnh giao diện và hành vi ứng dụng</p>
        </div>

        <div className='card p-4'>
          <h2 className='font-semibold text-gray-900 mb-2'>Giao diện</h2>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-sm font-medium text-gray-700'>Chế độ tối / sáng</div>
              <div className='text-xs text-gray-500'>Chuyển đổi giữa giao diện tối và sáng</div>
            </div>
            <div className='flex items-center gap-3'>
              <Button variant={theme === 'dark' ? 'outline' : 'primary'} size='sm' onClick={() => setTheme('light')}>Light</Button>
              <Button variant={theme === 'dark' ? 'primary' : 'outline'} size='sm' onClick={() => setTheme('dark')}>Dark</Button>
            </div>
          </div>
        </div>

        <div className='card p-4'>
          <h2 className='font-semibold text-gray-900 mb-2'>Hiệu ứng</h2>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-sm font-medium text-gray-700'>Transition (Fade)</div>
              <div className='text-xs text-gray-500'>Bật / tắt hiệu ứng chuyển trang mượt (fade)</div>
            </div>
            <div>
              <label className='inline-flex items-center cursor-pointer'>
                <input type='checkbox' checked={fadeTransition} onChange={(e) => setFadeTransition(e.target.checked)} className='sr-only' />
                <span className={`w-12 h-6 inline-block rounded-full transition-colors ${fadeTransition ? 'bg-primary' : 'bg-gray-300'}`}></span>
              </label>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
