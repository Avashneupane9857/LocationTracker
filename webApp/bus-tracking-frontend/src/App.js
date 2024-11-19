import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import io from "socket.io-client";
import "leaflet/dist/leaflet.css";

const socket = io("http://localhost:3001");

const App = () => {
  const [busLocations, setBusLocations] = useState([]);

  useEffect(() => {
    // Fetch initial bus locations
    const fetchLocations = async () => {
      const response = await fetch("http://localhost:3001/api/bus-locations");
      const data = await response.json();
      setBusLocations(data);
    };

    fetchLocations();

    // Listen for real-time updates
    socket.on("bus-location-update", (newLocation) => {
      setBusLocations((prev) =>
        prev.map((bus) =>
          bus.busId === newLocation.busId ? { ...bus, ...newLocation } : bus
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  return (
    <MapContainer
      center={[27.7172, 85.324]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {busLocations.map((bus) => (
        <Marker key={bus.busId} position={[bus.latitude, bus.longitude]}>
          <Popup>Bus ID: {bus.busId}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default App;
