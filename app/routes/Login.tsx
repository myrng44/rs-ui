import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router'
import { SERVER_URL } from '@/contants/constant'
import { Link } from 'react-router'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault()
    axios.defaults.withCredentials = true
    setIsLoading(true)
    try {
      const response = await axios.post(`${SERVER_URL}/login`, {
        username,
        password
      })
      if (response.status === 200) {
        toast.success('Login successful')
        navigate('/')
      } else {
        toast.error('Email or Password Incorrect')
      }
    } catch (error: any) {
      setIsLoading(false)
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
    setIsLoading(false)
  }

  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg shadow-md p-8 w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-bold text-gray-900'>Đăng nhập</h1>
          <p className='text-gray-600 mt-2'>Nhập thông tin để tiếp tục</p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmitHandler} className='space-y-6'>
          {/* Username */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Username</label>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='username'
            />
          </div>

          {/* Password */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='password'
              />
              <button
                type='button'
                onClick={() => setShowPassword((prev) => !prev)}
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none'
                tabIndex={-1}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Footer */}
        <div className='mt-6 text-center'>
          <p className='text-red-600'>
            <Link to='/'>Về trang chủ</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
