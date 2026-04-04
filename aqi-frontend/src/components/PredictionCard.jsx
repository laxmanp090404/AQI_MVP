export default function PredictionCard({data}){

 return(

 <div
    className="rounded-2xl p-5 text-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
  style={{background:data.color}}
 >

    <h2 className="text-xl font-bold tracking-wide">
   {data.city}
  </h2>

    <p className="mt-2 text-3xl font-bold">
   AQI {Math.round(data.aqi)}
  </p>

    <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-white/90">
   {data.category}
  </p>

    <p className="mt-4 text-sm text-white/95">
   PM2.5: {data.predicted_pm25.toFixed(2)}
  </p>

    <p className="text-sm text-white/95">
   Date: {data.predicted_for}
  </p>

 </div>

 )

}