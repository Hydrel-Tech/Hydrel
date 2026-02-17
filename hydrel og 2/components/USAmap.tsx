
import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import usStatesData from '../gz_2010_us_040_00_5m';

const stateToRegion: Record<string, string> = {
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

const regionColors: Record<string, string> = {
  northeast: '#FFB6C1', // light pink
  southeast: '#90EE90', // light green
  midwest: '#FFD700',   // gold
  west: '#87CEEB'       // sky blue
};

interface USAmapProps {
  selectedRegions: string[];
  maxRegions: number;
  onRegionClick: (region: string) => void;
}

const USAmap: React.FC<USAmapProps> = ({ selectedRegions, maxRegions, onRegionClick }) => {
  
  // Function that styles each state
  const styleState = (feature: any) => {
    // Attempt to resolve state code from properties. Adjust 'NAME' or 'STATE' based on actual JSON keys.
    // The provided file likely uses 'NAME' (e.g. "Texas") or 'STATE' (FIPS/Abbr).
    // Using a lookup if necessary, but assuming feature.properties.NAME maps to abbreviations or we use the helper logic.
    // For safety, we'll try to map common identifiers.
    
    const props = feature.properties;
    let region = '';
    
    // Direct mapping attempt (if JSON has abbreviations like 'TX')
    if (stateToRegion[props.STATE]) {
       region = stateToRegion[props.STATE];
    } 
    // If JSON has full names (e.g. "California"), we might need to rely on the passed in logic or mapped snippet
    // Since the snippet provided assumed stateToRegion[stateCode], we stick to that logic.
    // We will assume `feature.properties.NAME` might need mapping, or `feature.properties.STATE` is the key.
    // In many GeoJSONs, STATE is a numeric FIPS code. NAME is the string.
    // Let's assume the user has a map where the keys match the JSON properties or use a name-to-abbr helper.
    else if (props.NAME) {
       region = getRegionByStateName(props.NAME) || '';
    }

    const isSelected = selectedRegions.includes(region);

    return {
      fillColor: regionColors[region] || '#eee',
      weight: 1,
      opacity: 1,
      color: 'red', // state border color
      fillOpacity: isSelected ? 0.9 : 0.4, // darker when selected
      // Overlay blue tint if selected (simulated by mixing or just using high opacity fill)
      // The snippet requested: ...(isSelected && { fillColor: '#ADD8E6' }) 
      // We will override fill color if selected to make it distinct as requested in snippet logic
      ...(isSelected && { fillColor: '#3b82f6', fillOpacity: 0.6 }) 
    };
  };

  // Called when a state is clicked
  const onEachState = (feature: any, layer: any) => {
    layer.on({
      click: () => {
        const props = feature.properties;
        let region = '';
        if (stateToRegion[props.STATE]) region = stateToRegion[props.STATE];
        else if (props.NAME) region = getRegionByStateName(props.NAME) || '';
        
        if (region) {
          onRegionClick(region);
        }
      }
    });
  };

  return (
    <div className="h-[600px] w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-300">
      <MapContainer
        center={[37.8, -96]}   // center of US
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <GeoJSON
          data={usStatesData as any}
          style={styleState}
          onEachFeature={onEachState}
        />
      </MapContainer>
    </div>
  );
};

// Helper for Name -> Code if JSON uses Full Names
const getRegionByStateName = (name: string): string | undefined => {
    const nameToCode: Record<string, string> = {
        "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
        "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
        "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
        "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
        "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
        "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
        "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
        "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
        "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
        "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
        "District of Columbia": "DC"
    };
    const code = nameToCode[name];
    return code ? stateToRegion[code] : undefined;
}

export default USAmap;
