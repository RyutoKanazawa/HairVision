import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

export const MapComponent = ({ latitude, longitude }) => {
  const mapStyles = { height: '400px', width: '100%' };
  const defaultCenter = { lat: latitude, lng: longitude };

  return (
    <div className="map-container">
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap mapContainerStyle={mapStyles} zoom={13} center={defaultCenter}>
          <Marker position={defaultCenter} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
};