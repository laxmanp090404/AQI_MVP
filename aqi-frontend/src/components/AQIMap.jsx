import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const cityCoords = {
    "Ahmedabad": [23.0225, 72.5714], "Aizawl": [23.7307, 92.7176],
    "Amaravati": [16.5062, 80.6480], "Amritsar": [31.6340, 74.8723],
    "Bengaluru": [12.9716, 77.5946], "Bhopal": [23.2599, 77.4126],
    "Brajrajnagar": [21.82, 83.92], "Chandigarh": [30.7333, 76.7794],
    "Chennai": [13.0827, 80.2707], "Coimbatore": [11.0168, 76.9558],
    "Delhi": [28.7041, 77.1025], "Ernakulam": [9.9816, 76.2999],
    "Gurugram": [28.4595, 77.0266], "Guwahati": [26.1445, 91.7362],
    "Hyderabad": [17.3850, 78.4867], "Jaipur": [26.9124, 75.7873],
    "Jorapokhar": [23.70, 86.41], "Kochi": [9.9312, 76.2673],
    "Kolkata": [22.5726, 88.3639], "Lucknow": [26.8467, 80.9462],
    "Mumbai": [19.0760, 72.8777], "Patna": [25.5941, 85.1376],
    "Shillong": [25.5788, 91.8933], "Talcher": [20.95, 85.23],
    "Thiruvananthapuram": [8.5241, 76.9366], "Visakhapatnam": [17.6868, 83.2185]
};

function RecenterMap({ coords }) {
    const map = useMap();
    if (coords) map.setView(coords, 6);
    return null;
}

const AQIMap = ({ activeCity, aqiData }) => {
    const center = activeCity ? cityCoords[activeCity] : [20.5937, 78.9629];

    return (
        <MapContainer center={center} zoom={5} style={{ height: "450px", borderRadius: "12px" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <RecenterMap coords={activeCity ? cityCoords[activeCity] : null} />
            
            {activeCity && aqiData && (
                <CircleMarker 
                    center={cityCoords[activeCity]} 
                    pathOptions={{ 
                        color: aqiData.last_color, 
                        fillColor: aqiData.last_color, 
                        fillOpacity: 0.7 
                    }}
                    radius={20}
                >
                    <Popup>
                        <strong>{activeCity}</strong><br/>
                        Predicted AQI: {aqiData.last_prediction}<br/>
                        Status: {aqiData.last_category}
                    </Popup>
                </CircleMarker>
            )}
        </MapContainer>
    );
};

export default AQIMap;