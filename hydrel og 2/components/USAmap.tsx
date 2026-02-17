import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';          // Leaflet's default styles
import usStatesData from './gz_2010_us_040_00_5m.json'; // adjust path

const stateToRegion = {
  // Northeast
  CT: 'northeast', MA: 'northeast', ME: 'northeast', NH: 'northeast',
  NJ: 'northeast', NY: 'northeast', PA: 'northeast', RI: 'northeast',
  VT: 'northeast', DE: 'northeast', MD: 'northeast', DC: 'northeast',
  // Southeast
  VA: 'southeast', WV: 'southeast', NC: 'southeast', SC: 'southeast',
  GA: 'southeast', FL: 'southeast', AL: 'southeast', MS: 'southeast',
  TN: 'southeast', KY: 'southeast',
  // Midwest
  OH: 'midwest', IN: 'midwest', MI: 'midwest', IA: 'midwest',
  MN: 'midwest', MT: 'midwest', ND: 'midwest', SD: 'midwest',
  WI: 'midwest', IL: 'midwest', KS: 'midwest', MO: 'midwest',
  NE: 'midwest',
  // West
  AR: 'west', LA: 'west', OK: 'west', TX: 'west',
  AZ: 'west', CO: 'west', ID: 'west', NM: 'west',
  NV: 'west', UT: 'west', WY: 'west', AK: 'west',
  CA: 'west', HI: 'west', OR: 'west', WA: 'west'
};

const regionColors = {
  northeast: '#FFB6C1', // light pink
  southeast: '#90EE90', // light green
  midwest: '#FFD700',   // gold
  west: '#87CEEB'       // sky blue
};

const USAmap = ({ selectedRegions, maxRegions, onRegionClick }) => {
  // Function that styles each state
  const styleState = (feature) => {
    const stateCode = feature.properties.STATE; // depends on your GeoJSON property name
    const region = stateToRegion[stateCode];
    return {
      fillColor: regionColors[region],
      weight: 1,
      opacity: 1,
      color: 'red',            // state border color
      fillOpacity: 0.5,
    };
  };
};

  // Called when a state is clicked
  const onEachState = (feature, layer) => {
    layer.on({
      click: () => {
        const stateCode = feature.properties.STATE;
        const region = stateToRegion[stateCode];
        onRegionClick(region); // will handle selection logic
      }
    });
  };

  return (
    <MapContainer
      center={[39.8, -98.6]}   // center of US
      zoom={4}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <GeoJSON
        data={usStatesData}
        style={styleState}
        onEachFeature={onEachState}
      />
    </MapContainer>
  );

const styleState = (feature) => {
  const stateCode = feature.properties.STATE;
  const region = stateToRegion[stateCode];
  const isSelected = selectedRegions.includes(region);
  return {
    fillColor: regionColors[region],
    weight: 1,
    color: 'red',
    fillOpacity: isSelected ? 0.9 : 0.4,  // darker when selected
    // optionally overlay blue:
    ...(isSelected && { fillColor: '#ADD8E6' }) // light blue
  };
};

export default USAmap;
