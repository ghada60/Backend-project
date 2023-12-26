import axios from 'axios'
const baseURL = process.env.BACKEND_ORIGIN
const api = axios.create({
    baseURL
})

export default api