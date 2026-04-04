import { useEffect, useState } from "react"
import { getExtensiveReport } from "../services/api"

export default function ExtensiveReport(){

 const [data,setData]=useState([])

 // rounding helper
 const round2 = (value) => {
  if(value === null || value === undefined) return "-"
  return Number(value).toFixed(2)
 }

 useEffect(()=>{

  const load = async () => {

   const res = await getExtensiveReport()

   setData(res)

  }

  load()

 },[])

 return(

 <div className="p-8">

 <h1 className="text-3xl font-bold mb-6">
  AQI Extensive Feature Report
 </h1>

 <div className="overflow-x-auto">

 <table className="table-auto border-collapse text-sm">

 <thead>

<tr className="bg-gray-200 text-xs">

<th className="border p-2">City</th>

<th className="border p-2">PM2.5 L1 (µg/m³)</th>
<th className="border p-2">PM2.5 L2 (µg/m³)</th>
<th className="border p-2">PM2.5 L3 (µg/m³)</th>
<th className="border p-2">PM2.5 L4 (µg/m³)</th>
<th className="border p-2">PM2.5 L5 (µg/m³)</th>
<th className="border p-2">PM2.5 L6 (µg/m³)</th>
<th className="border p-2">PM2.5 L7 (µg/m³)</th>

<th className="border p-2">Temp L1 (°C)</th>
<th className="border p-2">Temp L2 (°C)</th>
<th className="border p-2">Temp L3 (°C)</th>

<th className="border p-2">Humidity L1 (%)</th>
<th className="border p-2">Humidity L2 (%)</th>
<th className="border p-2">Humidity L3 (%)</th>

<th className="border p-2">Wind L1 (m/s)</th>
<th className="border p-2">Wind L2 (m/s)</th>
<th className="border p-2">Wind L3 (m/s)</th>

<th className="border p-2">Pressure L1 (hPa)</th>
<th className="border p-2">Pressure L2 (hPa)</th>
<th className="border p-2">Pressure L3 (hPa)</th>

<th className="border p-2">Rain L1 (mm)</th>
<th className="border p-2">Rain L2 (mm)</th>
<th className="border p-2">Rain L3 (mm)</th>

<th className="border p-2">PM2.5 Mean (µg/m³)</th>
<th className="border p-2">PM2.5 Std (µg/m³)</th>
<th className="border p-2">PM2.5 Min (µg/m³)</th>
<th className="border p-2">PM2.5 Max (µg/m³)</th>

<th className="border p-2">Month</th>
<th className="border p-2">Day of Week</th>
<th className="border p-2">Day of Year</th>
<th className="border p-2">Weekend</th>

<th className="border p-2">Predicted PM2.5 (µg/m³)</th>
<th className="border p-2">AQI</th>
<th className="border p-2">Category</th>

</tr>

</thead>

<tbody>

{data.map(row => (

<tr key={row.city}>

<td className="border p-2 font-semibold">
{row.city}
</td>

<td className="border p-2">{round2(row.pm25_lag_1)}</td>
<td className="border p-2">{round2(row.pm25_lag_2)}</td>
<td className="border p-2">{round2(row.pm25_lag_3)}</td>
<td className="border p-2">{round2(row.pm25_lag_4)}</td>
<td className="border p-2">{round2(row.pm25_lag_5)}</td>
<td className="border p-2">{round2(row.pm25_lag_6)}</td>
<td className="border p-2">{round2(row.pm25_lag_7)}</td>

<td className="border p-2">{round2(row.temp_lag_1)}</td>
<td className="border p-2">{round2(row.temp_lag_2)}</td>
<td className="border p-2">{round2(row.temp_lag_3)}</td>

<td className="border p-2">{round2(row.humidity_lag_1)}</td>
<td className="border p-2">{round2(row.humidity_lag_2)}</td>
<td className="border p-2">{round2(row.humidity_lag_3)}</td>

<td className="border p-2">{round2(row.wind_lag_1)}</td>
<td className="border p-2">{round2(row.wind_lag_2)}</td>
<td className="border p-2">{round2(row.wind_lag_3)}</td>

<td className="border p-2">{round2(row.pressure_lag_1)}</td>
<td className="border p-2">{round2(row.pressure_lag_2)}</td>
<td className="border p-2">{round2(row.pressure_lag_3)}</td>

<td className="border p-2">{round2(row.rain_lag_1)}</td>
<td className="border p-2">{round2(row.rain_lag_2)}</td>
<td className="border p-2">{round2(row.rain_lag_3)}</td>

<td className="border p-2">{round2(row.pm25_roll_mean)}</td>
<td className="border p-2">{round2(row.pm25_roll_std)}</td>
<td className="border p-2">{round2(row.pm25_roll_min)}</td>
<td className="border p-2">{round2(row.pm25_roll_max)}</td>

<td className="border p-2">{row.month}</td>
<td className="border p-2">{row.day_of_week}</td>
<td className="border p-2">{row.day_of_year}</td>
<td className="border p-2">{row.weekend}</td>

<td className="border p-2">{round2(row.pm25_prediction)}</td>
<td className="border p-2">{round2(row.aqi)}</td>
<td className="border p-2">{row.category}</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)
}
