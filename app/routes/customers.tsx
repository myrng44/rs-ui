import { Layout } from '~/components/Layout';

interface Customers {
	id: string;
	name: string;
	phone: string;
	gender: string;
	point: number;
}

export default function Customers() {
	return (
		<Layout>
			<div className='flex justify-between items-center'></div>
		</Layout>
	);
}
