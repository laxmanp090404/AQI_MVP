export default function PredictionCard({data}){

 return(

 <div
  className="p-5 rounded shadow-lg text-white"
  style={{background:data.color}}
 >

  <h2 className="text-xl font-bold">
   {data.city}
  </h2>

  <p className="text-3xl font-bold">
   AQI {Math.round(data.aqi)}
  </p>

  <p>
   {data.category}
  </p>

  <p>
   PM2.5: {data.predicted_pm25.toFixed(2)}
  </p>

  <p>
   Date: {data.predicted_for}
  </p>

 </div>

 )

}