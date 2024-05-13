import React from "react";
import mapboxgl from "mapbox-gl";
const css = require('../stylesheets/popup.css');


export const updateMarker = (
  map: mapboxgl.Map, 
  markerRef: React.MutableRefObject<mapboxgl.Marker | null>, 
  coordinates: mapboxgl.LngLatLike, 
  popupContentElement: HTMLElement
) => {
  let customPopup = "customPopup"
  // Create the marker if it doesn't exist
  if (!markerRef.current) {
    const markerEl = document.createElement('div');
markerEl.className = 'markerClass'; // Assign your custom class

// You can insert an img element or any other content inside markerEl as needed
const innerEl = document.createElement('div');
innerEl.className = 'innerMarker';
markerEl.appendChild(innerEl);
    const popup = new mapboxgl.Popup({closeButton:true, offset: 35, className: customPopup}).setDOMContent(popupContentElement);
    markerRef.current = new mapboxgl.Marker(markerEl)
      .setLngLat(coordinates)
      .setPopup(popup)
      .addTo(map);
      markerRef.current.getPopup().setDOMContent(popupContentElement).addTo(map);
      console.log("placingMarker");
      markerRef.current.getElement().addEventListener('click', (e) => {
        e.stopPropagation(); // Stop click event from propagating to the map
        markerRef.current?.togglePopup(); // Alternatively, use .getPopup().addTo(map) if you always want to open the popup
      });
  } else {
    // Update the marker position
    markerRef.current.setLngLat(coordinates);
    

    // Update the popup content directly without closing and reopening it
    if (markerRef.current.getPopup()) {
      markerRef.current.getPopup().setDOMContent(popupContentElement);
    }

    // Ensure the popup remains open with the new content
    if (!markerRef.current.getPopup().isOpen()) {
      markerRef.current.getPopup().addTo(map);
    }
  }
}; 
