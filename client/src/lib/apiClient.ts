import axios from 'axios'
//http://shanimi2.mtacloud.co.il/api - for Cpanel integration

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
})

export default apiClient