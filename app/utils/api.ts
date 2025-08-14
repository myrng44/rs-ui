import axios, { type AxiosInstance } from 'axios'
import { SERVER_URL } from '@/contants/constant'

class Api {
  instance: AxiosInstance
  constructor() {
    this.instance = axios.create({
      baseURL: SERVER_URL,
      timeout: 1000,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })
  }
}

const api = new Api().instance

export default api
