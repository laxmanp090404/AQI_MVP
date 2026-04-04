import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 Tooltip,
 CartesianGrid
} from "recharts"

export default function AQITrendChart({data}){

 if(!data) return null

 return(

 <LineChart
  width={500}
  height={300}
  data={data}
 >

 <CartesianGrid strokeDasharray="3 3"/>

 <XAxis dataKey="predicted_for"/>

 <YAxis/>

 <Tooltip/>

 <Line
  type="monotone"
  dataKey="aqi"
  stroke="#ff7300"
  strokeWidth={3}
 />

 </LineChart>

 )

}