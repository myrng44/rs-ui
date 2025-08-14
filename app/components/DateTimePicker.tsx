import React, {useState, useMemo, useEffect} from 'react';

interface CustomDateTimePickerProps {
	label?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function CustomDateTimePicker({ label = 'Chọn ngày giờ:',
                                             value = '',
                                             onChange }: CustomDateTimePickerProps) {
	const [date, setDate] = useState('');
	const [hour, setHour] = useState('00');
	const [minute, setMinute] = useState('00');
	const [second, setSecond] = useState('00');

  useEffect(() => {
    if (value) {
      //parse format
      const [datePart, timePart] = value.split('T');
      if (datePart) setDate(datePart);
      if (timePart) {
        const [h, m, s] = timePart.split(':');
        setHour(h || '00');
        setMinute(m || '00');
        setSecond(s || '00');
      }
    } else {
      setDate('');
      setHour('00');
      setMinute('00');
      setSecond('00');
    }
  }, [value]);

	const combined = useMemo(() => {
		return date ? `${date}T${hour}:${minute}:${second}` : '';
	}, [date, hour, minute, second]);

  useEffect(() => {
    if (onChange && combined !== value) {
      onChange(combined);
    }
  }, [combined, onChange, value]);

	const generateOptions = (max: number) =>
		Array.from({ length: max }, (_, i) => String(i).padStart(2, '0')).map((val) => (
			<option key={val} value={val}>
				{val}
			</option>
		));

	return (
		<div className='flex flex-col gap-2 w-fit'>
			<label className='text-sm font-medium text-gray-700'>{label}</label>

			{/* Ngày */}
			<input
				type='date'
				value={date}
				onChange={(e) => setDate(e.target.value)}
				className='border px-3 py-2 rounded-md shadow-sm text-sm focus:outline-none focus:ring focus:border-blue-500'
			/>

			{/* Giờ / Phút / Giây */}
			<div className='flex gap-2'>
				<select value={hour} onChange={(e) => setHour(e.target.value)} className='border px-2 py-1 rounded-md text-sm'>
					{generateOptions(24)}
				</select>

				<select
					value={minute}
					onChange={(e) => setMinute(e.target.value)}
					className='border px-2 py-1 rounded-md text-sm'
				>
					{generateOptions(60)}
				</select>

				<select
					value={second}
					onChange={(e) => setSecond(e.target.value)}
					className='border px-2 py-1 rounded-md text-sm'
				>
					{generateOptions(60)}
				</select>
			</div>

			{/* Hiển thị kết quả */}
			<span className='text-xs text-gray-600'>Giá trị: {combined || '(chưa chọn đầy đủ)'}</span>
		</div>
	);
}
