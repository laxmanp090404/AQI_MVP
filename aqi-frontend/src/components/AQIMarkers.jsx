import { CircleMarker, Popup } from "react-leaflet"

export default function AQIMarkers({ data, cities }) {

  const latest = {}

  data.forEach(d => {
    latest[d.city] = d
  })

  return Object.values(latest).map(city => {

    const coords = cities[city.city]

    if (!coords) return null

    return (

      <CircleMarker
        key={city.city}
        center={coords}
        radius={10}
        pathOptions={{
          color: city.color,
          fillColor: city.color,
          fillOpacity: 0.9
        }}
       
      >

        <Popup>

          <div className="space-y-1">

            <h3 className="font-bold">{city.city}</h3>

            <p>AQI: {Math.round(city.aqi)}</p>

            <p>Category: {city.category}</p>

            <p>PM2.5: {city.predicted_pm25.toFixed(2)}</p>

            <p>Date: {city.predicted_for}</p>

          </div>

        </Popup>

      </CircleMarker>

    )

  })

}