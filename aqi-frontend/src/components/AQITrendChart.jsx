import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 Tooltip,
 CartesianGrid,
 ResponsiveContainer
} from "recharts"

export default function AQITrendChart({data}){

 if(!data || data.length === 0) return null

 return(

 <div className="h-72 w-full">
  <ResponsiveContainer width="100%" height="100%">
   <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3"/>
    <XAxis dataKey="predicted_for"/>
    <YAxis/>
    <Tooltip/>
    <Line
     type="monotone"
     dataKey="aqi"
     stroke="#f97316"
     strokeWidth={3}
     dot={{ r: 3 }}
     activeDot={{ r: 6 }}
    />
   </LineChart>
  </ResponsiveContainer>
 </div>

 )

}