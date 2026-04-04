import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet.heat"

export default function AQIHeatmap({ data, cities }) {

  const map = useMap()

  useEffect(() => {

    if (!data || data.length === 0) return

    // Keep latest prediction per city
    const latest = {}

    data.forEach(d => {
      latest[d.city] = d
    })

    const heatPoints = Object.values(latest).map(d => {

      const coords = cities[d.city]

      if (!coords) return null

      return [
        coords[0],
        coords[1],
        d.aqi / 200
      ]

    }).filter(Boolean)

    const heatLayer = L.heatLayer(heatPoints, {
      radius: 40,
      blur: 25,
      maxZoom: 7
    })

    heatLayer.addTo(map)

    return () => map.removeLayer(heatLayer)

  }, [data, map, cities])

  return null
}