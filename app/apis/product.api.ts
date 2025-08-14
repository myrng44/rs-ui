import type { ParamFetch, Product } from '@/types/Products.type'
import { useEffect, useState } from 'react'
import api from '@/utils/api'
import { type ProductResponseTpye } from '@/types/Products.type'

export const useGetProduct = (ParamFetch: ParamFetch): [Product[], () => Promise<void>, number] => {
  const [data, setData] = useState<Product[]>([])
  const [total, setTotal] = useState<number>(0)
  const fetchAPI = async () => {
    // const queryString = new URLSearchParams(ParamFetch.query).toString()
    const res = await api.get<ProductResponseTpye>(
      `${ParamFetch.path}?offset=${ParamFetch.offset}&limit=${ParamFetch.limit}`
    )
    setData(res.data.elements)
    setTotal(res.data.totalElements)
  }
  useEffect(() => {
    fetchAPI()
  }, [ParamFetch.path, ParamFetch.offset, ParamFetch.limit])
  return [data, fetchAPI, total]
}
export default useGetProduct
