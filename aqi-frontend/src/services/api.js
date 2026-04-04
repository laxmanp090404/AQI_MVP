import axios from "axios"

const API= import.meta.env.VITE_API_URL || "http://localhost:5000"

export const predictAQI = async(city)=>{
 const res = await axios.post(`${API}/predict`,{
  city_name:city
 })
 return res.data
}

export const getPredictions = async()=>{
 const res = await axios.get(`${API}/predictions`)
 return res.data
}
export const getHistory = async(city)=>{
 const res=await axios.get(`${API}/history/${city}`)
 return res.data
}
export const getLatestPredictions = async () => {
  const res = await axios.get(`${API}/latest-predictions`)
  return res.data
}
export const getExtensiveReport = async () => {

 const res = await axios.get(
  `${API}/extensive-report`
 )

 return res.data
}
