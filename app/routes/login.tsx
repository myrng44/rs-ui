import { type FormEvent, useState } from 'react';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import Dropdown from '~/components/Dropdown';
import { authApi } from '~/utils/api';
import {Toast} from "~/components/Toast";

export default function Login() {
	const [formData, setFormData] = useState({
		username: '',
		password: '',
		storeId: '1',
	});
	const storeOptions = [
		{ value: '1', label: 'Circle K - CS1 Tôn Đức Thắng, Đống Đa' },
		{ value: '2', label: 'Circle K - CS24 - Bùi Đình Túy, Bình Thạnh' },
		{ value: '3', label: 'Circle K - CS4 - Từ Hoa, Tây Hồ' },
		{ value: '4', label: 'Circle K - CS161 - Lê Hồng Phong, Đà Lạt' },
		{ value: '5', label: 'Circle K - CS44 - TEST1' },
		{ value: '6', label: 'Circle K - CS44 - TEST2' },
		{ value: '7', label: 'Circle K - CS44 - TEST3' },
		{ value: '8', label: 'Circle K - CS44 - TEST4' },
		{ value: '9', label: 'Circle K - CS44 - TEST5' },
	];
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

	const handleLogin = async (e: FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');
    setToastMessage('');
    setShowToast(false);

		try {
			const data = await authApi.login(formData);
			localStorage.setItem('accessToken', data.accessToken);
			localStorage.setItem('refreshToken', data.refreshToken);
      setToastMessage("Đăng nhập thành công!");
      setShowToast(true);
			setTimeout(() => {
        window.location.href = '/';
      }, 1000);
		} catch (err: any) {
			if (err.status === 401) {
				setError('Tên đăng nhập hoặc mật khẩu không đúng');
			} else {
				setError('Lỗi kết nối đến server');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center p-4'>
			<div className='bg-surface rounded-lg shadow-xl w-full max-w-md p-8'>
				<div className='text-center mb-8'>
					<img
						className='w-20 h-20 rounded-lg mx-auto mb-4 flex items-center justify-center'
						src={'https://www.circlek.com.vn/wp-content/themes/circlek//images/img/ckclub.png'}
						alt={'Store maN logo'}
					></img>
					<h1 className='text-2xl font-bold text-gray-900 mb-2'>Đăng nhập Store maN</h1>
					<p className='text-gray-600'>Vui lòng nhập thông tin đăng nhập</p>
				</div>

				<form onSubmit={handleLogin} className='space-y-6'>
					<Input
						label='Username'
						type='text'
						placeholder='Nhập username'
						value={formData.username}
						onChange={(e) => setFormData({ ...formData, username: e.target.value })}
						required
					/>

					<div className='relative'>
						<Input
							label='Password'
							type='password'
							placeholder='Nhập password'
							value={formData.password}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
							required
						/>
					</div>

					<Dropdown
						label='Store'
						value={formData.storeId}
						onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
						options={storeOptions}
						required
					/>

					{error && <div className='text-error text-sm text-center bg-red-50 p-3 rounded-lg'>{error}</div>}

					<Button
						type='submit'
						className='w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
						disabled={isLoading}
					>
						{isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
					</Button>

					<div className='text-center'>
						<button type='button' className='text-sm text-gray-500 hover:text-gray-700'>
							<a href={'https://forms.office.com/r/DkAixzbSjg'}>Gửi yêu cầu hỗ trợ?</a>
						</button>
						<div className='bg-emerald-100 rounded-lg w-xs justify-center items-center mx-auto p-2'>
							<p>(TEST)account: admin001</p>
							<p>(TEST)password: 123456abc</p>
						</div>
					</div>
				</form>
        {showToast && (
          <Toast
            message={toastMessage}
            type="success"
            duration={2000}
            onClose={() => setShowToast(false)}
          />
        )}
			</div>
		</div>
	);
}
