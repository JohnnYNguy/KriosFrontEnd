import mapboxgl from "mapbox-gl";

interface PlaceWeatherStationMarkerParams {
  map: mapboxgl.Map;
  markerRef: React.MutableRefObject<mapboxgl.Marker[]>;
  coordinates: mapboxgl.LngLat;
  id: string
  name: string;
  imageUrl: string;
  distance: number;
}

const placeWeatherStationMarker = ({
  map,
  markerRef,
  coordinates,
  id,
  name,
  imageUrl,
  distance,
}: PlaceWeatherStationMarkerParams) => {
  const markerElement = document.createElement('div');
  markerElement.className = 'custom-marker';
  markerElement.style.backgroundImage = `url(${imageUrl})`;
  markerElement.style.backgroundSize = 'cover';
  markerElement.style.width = '50px';
  markerElement.style.height = '50px';
  markerElement.style.display = 'flex';
  markerElement.style.flexDirection = 'column';
  markerElement.style.alignItems = 'center';

  // Tooltip element for name and distance
  const tooltip = document.createElement('div');
  tooltip.textContent = distance.toFixed(1) + " km \n" + name; 
  tooltip.style.visibility = 'hidden'; 
  tooltip.style.position = 'absolute';
  tooltip.style.bottom = '70px'; 
  tooltip.style.backgroundColor = 'black';
  tooltip.style.color = 'white';
  tooltip.style.padding = '4px 8px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.fontSize = '12px';
  tooltip.style.textAlign = 'center';
  tooltip.style.zIndex = '1'; 

  
  markerElement.appendChild(tooltip);

  // Determine the background color based on the order of the marker
  const markerCount = markerRef.current.length + 1;
  const maxMarkers = 5; // Fewer steps for a more dramatic change
  const red = 255 - (255 * (markerCount - 1) / (maxMarkers - 1));
  const blue = (255 * (markerCount - 1) / (maxMarkers - 1));
  const color = `rgb(${Math.round(red)}, 0, ${Math.round(blue)})`;

  // Name label with color
  const nameLabel = document.createElement('div');
  nameLabel.textContent = id;
  nameLabel.style.marginTop = '45px';
  nameLabel.style.color = 'white';
  nameLabel.style.fontSize = '11px';
  nameLabel.style.textAlign = 'center';
  nameLabel.style.backgroundColor = color;
  nameLabel.style.borderRadius = '5px';
  nameLabel.style.padding = '1px 4px';

  // Append the label to the marker element
  markerElement.appendChild(nameLabel);

  // Mouse events to show/hide the tooltip
  markerElement.onmouseover = () => {
    tooltip.style.visibility = 'visible'; // Show tooltip on hover
  };
  markerElement.onmouseout = () => {
    tooltip.style.visibility = 'hidden'; // Hide tooltip on mouse out
  };

  // Create a new marker and specify the anchor to be 'bottom'
  const newMarker = new mapboxgl.Marker({ element: markerElement, anchor: 'bottom' })
    .setLngLat(coordinates)
    .addTo(map);

  // Add the new marker to the reference array
  markerRef.current.push(newMarker);

  return color;
};

export default placeWeatherStationMarker;
