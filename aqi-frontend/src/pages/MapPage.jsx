import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { cities } from "../utils/cities";
import "leaflet/dist/leaflet.css";

export default function MapPage() {

  return (
    <MapContainer center={[22.5, 78.9]} zoom={5} className="h-screen">

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {Object.entries(cities).map(([city, coord]) => (

        <Marker key={city} position={coord}>

          <Popup>

            {city}

          </Popup>

        </Marker>

      ))}

    </MapContainer>
  );
}