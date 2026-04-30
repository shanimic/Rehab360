import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://shanimi2.mtacloud.co.il/api',
})

export default apiClient