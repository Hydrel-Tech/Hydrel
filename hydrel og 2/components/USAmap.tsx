import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
// NOTE: leaflet CSS is now loaded globally in index.html — do NOT import it here
// import 'leaflet/dist/leaflet.css';  <-- removed to fix deployment CSS loading failure
import usStatesData from '../gz_2010_us_040_00_5m.json';

const stateToRegion: Record<string, string> = {
  CT:'northeast',MA:'northeast',ME:'northeast',NH:'northeast',NJ:'northeast',
  NY:'northeast',PA:'northeast',RI:'northeast',VT:'northeast',DE:'northeast',
  MD:'northeast',DC:'northeast',VA:'southeast',WV:'southeast',NC:'southeast',
  SC:'southeast',GA:'southeast',FL:'southeast',AL:'southeast',MS:'southeast',
  TN:'southeast',KY:'southeast',OH:'midwest',IN:'midwest',MI:'midwest',
  IA:'midwest',MN:'midwest',MT:'midwest',ND:'midwest',SD:'midwest',WI:'midwest',
  IL:'midwest',KS:'midwest',MO:'midwest',NE:'midwest',AR:'west',LA:'west',
  OK:'west',TX:'west',AZ:'west',CO:'west',ID:'west',NM:'west',NV:'west',
  UT:'west',WY:'west',AK:'west',CA:'west',HI:'west',OR:'west',WA:'west'
};

const regionColors: Record<string, string> = {
  northeast: '#FFB6C1',
  southeast: '#90EE90',
  midwest:   '#FFD700',
  west:      '#87CEEB'
};

interface USAmapProps {
  selectedRegions: string[];
  savedRegions:    string[];
  maxRegions:      number;
  onRegionClick:   (region: string) => void;
}

const USAmap: React.FC<USAmapProps> = ({
  selectedRegions, savedRegions, maxRegions, onRegionClick
}) => {
  const [mapReady, setMapReady] = React.useState(false);

  const styleState = (feature: any) => {
    const props = feature.properties;
    let region = stateToRegion[props.STATE] || getRegionByStateName(props.NAME) || '';
    const isSelected = selectedRegions.includes(region);
    const isSaved    = savedRegions.includes(region);
    return {
      fillColor:   isSelected ? '#3b82f6' : (regionColors[region] || '#eee'),
      weight:      isSaved ? 2 : 1,
      opacity:     1,
      color:       isSaved ? '#059669' : 'red',
      fillOpacity: isSelected ? 0.7 : (isSaved ? 0.5 : 0.3),
      ...(isSelected && { weight: 2, color: '#2563eb' })
    };
  };

  const onEachState = (feature: any, layer: any) => {
    layer.on({
      click: () => {
        const props   = feature.properties;
        const region  = stateToRegion[props.STATE] || getRegionByStateName(props.NAME) || '';
        if (region) onRegionClick(region);
      }
    });
  };

  return (
    <div className="h-[600px] w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-300 relative">
      {!mapReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold tracking-widest uppercase text-cyan-500">
            Initializing Map Intelligence...
          </p>
        </div>
      )}
      <MapContainer
        center={[37.8, -96]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <GeoJSON
          key={selectedRegions.join(',') + savedRegions.join(',')}
          data={usStatesData as any}
          style={styleState}
          onEachFeature={onEachState}
        />
      </MapContainer>
    </div>
  );
};

const getRegionByStateName = (name: string): string | undefined => {
  const nameToCode: Record<string, string> = {
    'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA',
    'Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA',
    'Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA',
    'Kansas':'KS','Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD',
    'Massachusetts':'MA','Michigan':'MI','Minnesota':'MN','Mississippi':'MS','Missouri':'MO',
    'Montana':'MT','Nebraska':'NE','Nevada':'NV','New Hampshire':'NH','New Jersey':'NJ',
    'New Mexico':'NM','New York':'NY','North Carolina':'NC','North Dakota':'ND','Ohio':'OH',
    'Oklahoma':'OK','Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC',
    'South Dakota':'SD','Tennessee':'TN','Texas':'TX','Utah':'UT','Vermont':'VT',
    'Virginia':'VA','Washington':'WA','West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY',
    'District of Columbia':'DC'
  };
  const code = nameToCode[name];
  return code ? stateToRegion[code] : undefined;
};

export default USAmap;
