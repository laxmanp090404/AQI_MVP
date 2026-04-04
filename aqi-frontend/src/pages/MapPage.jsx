import { MapContainer, TileLayer } from "react-leaflet"
import { useEffect, useState } from "react"

import { cities } from "../utils/cities"
import { getPredictions } from "../services/api"

import AQIHeatmap from "../components/AQIHeatMap"
import AQIMarkers from "../components/AQIMarkers"
import AQILegend from "../components/AqiLegend"

import "leaflet/dist/leaflet.css"

export default function MapPage(){

 const [data,setData]=useState([])

 useEffect(()=>{

  const load=async()=>{

   const res=await getPredictions()

   setData(res)

  }

  load()

 },[])

 return(

 <div className="relative">

 <MapContainer
  center={[22.5,78.9]}
  zoom={5}
  className="h-screen w-full"
 >

 <TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
 />

 <AQIHeatmap data={data} cities={cities}/>

 <AQIMarkers data={data} cities={cities}/>

 </MapContainer>

 <AQILegend/>

 </div>

 )

}