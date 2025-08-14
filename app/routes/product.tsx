import useGetProduct from '@/apis/product.api'
import { Layout } from '@/components/layout'
import { Button } from '@/components/button'
import api from '@/utils/api'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { ProductForm } from '@/components/productForm'
import type { Product, ProductShow } from '@/types/Products.type'
import { Modal } from '@/components/modal'
import { Pagination } from '@/components/pagination'

const initialForm: ProductShow = {
  id: '',
  sku: '',
  name: '',
  description: '',
  unitPrice: '',
  categoryId: '',
  supplierId: ''
}
const ProductList = () => {
  /**
   * page sẽ chứa trong querry nên ta cần 1 state querry nếu querry đủ các yếu tố như search ...
   * còn ở đây thì ta sẽ lấy page phụ thuộc vào PramFetch.offset và ParamFetch.limit
   */

  const [page, setPage] = useState<number>(1)
  const limit = 10
  const offset = (page - 1) * limit

  const [data, refetch, total] = useGetProduct({
    path: 'product',
    offset: offset,
    limit: limit
  })
  const [formData, setFormData] = useState<ProductShow>(initialForm)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting] = useState<boolean>(false)
  const [editing, setEditing] = useState<boolean>(false)

  const handleChange = (field: keyof Product, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const resetForm = () => setFormData(initialForm)

  const openCreateForm = () => {
    setEditing(false)
    resetForm()
    setShowForm(true)
  }

  const openEditForm = async (productId: string) => {
    try {
      const res = await api.get(`product/${productId}`)

      const { id, sku, name, description, unitPrice, categoryId, supplierId } = res.data

      setFormData({
        id,
        sku,
        name,
        description,
        unitPrice: String(unitPrice),
        categoryId: String(categoryId),
        supplierId: String(supplierId)
      })

      console.log(res.data)
      setEditing(true)
      setShowForm(true)
    } catch (err) {
      toast.error('some thiing went wrong')
    }
  }

  const handleAdd = async () => {
    setEditing(false)
    try {
      await api.post('/product', formData)
    } catch (error) {
      console.log('some thing went wrong')
    }
    setShowForm(!showForm)
  }

  const handleUpdate = async (product: Product) => {
    console.log(formData.id)
    try {
      const data = await api.put(`/product/${formData.id}`, product)
      console.log(data)
    } catch {
      console.log('some thing went wrong')
    } finally {
      setShowForm(!showForm)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete?')
    if (!confirmed) return

    try {
      await api.delete(`/product/${id}`)
      await refetch()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      toast.error(message)
    }
  }

  const handlePage = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <Layout>
      <div className='mb-4'>
        <label className='mr-2'>Sắp xếp:</label>
        {/* <select value={sort} onChange={(e) => setSort(e.target.value)} className='border px-2 py-1 rounded'> */}
        <select>
          <option value='price_asc'>Giá tăng dần</option>
          <option value='price_desc'>Giá giảm dần</option>
        </select>
      </div>

      <div className='overflow-x-auto rounded-2xl shadow-lg border border-gray-200'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>SKU</th>
              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>Tên sản phẩm</th>
              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>Mô tả</th>
              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>Giá</th>
              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>Danh mục</th>
              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>Nhà cung cấp</th>
              <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>Chức năng</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-100'>
            {data.map((product) => (
              <tr key={product.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>{product.sku}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{product.name}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>{product.description}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-green-600'>
                  {product.unitPrice.toLocaleString()}₫
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>{product.categoryId}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>{product.supplierId}</td>
                <Button variant='danger' size='sm' onClick={() => handleDelete(product.id)} className='my-2'>
                  Delete
                </Button>
                <Button variant='primary' size='sm' className='m-2' onClick={() => openEditForm(product.id)}>
                  Update
                </Button>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditing(!editing)
          resetForm()
        }}
        title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        footer={
          <>
            <Button
              variant='outline'
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (editing) {
                  handleUpdate(formData)
                } else {
                  handleAdd()
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang thêm...' : 'Thêm'}
            </Button>
          </>
        }
      >
        <ProductForm formData={formData} onChange={handleChange} isEditMode={editing} />
      </Modal>

      <Button variant='secondary' size='sm' className='m-2' onClick={openCreateForm}>
        Create
      </Button>
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        totalItems={total}
        onPageChange={handlePage}
        itemsPerPage={limit}
      />
    </Layout>
  )
}
export default ProductList
