export default function AQILegend(){

 const levels=[
  {label:"Good",color:"#00B050"},
  {label:"Satisfactory",color:"#92D050"},
  {label:"Moderate",color:"#FFFF00"},
  {label:"Poor",color:"#FFC000"},
  {label:"Very Poor",color:"#FF0000"},
  {label:"Severe",color:"#C00000"}
 ]

 return(

 <div
  className="
  fixed
  bottom-10
  left-10
  z-[1000]
  bg-white
  p-4
  rounded
  shadow-lg
  "
 >

  <h3 className="font-bold mb-2">
   AQI Legend
  </h3>

  {levels.map(l=>(
   <div key={l.label} className="flex items-center gap-2 mb-1">

    <div
     className="w-4 h-4 rounded"
     style={{background:l.color}}
    />

    <span>{l.label}</span>

   </div>
  ))}

 </div>

 )

}