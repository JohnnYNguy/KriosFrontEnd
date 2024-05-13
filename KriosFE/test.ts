map.on("click", (event) => {
  // Explicitly declare coordinates as a tuple [number, number]
  const coordinates: [number, number] = [event.lngLat.lng, event.lngLat.lat];
  map.flyTo({
    center: coordinates,
    zoom: 15
});
map.once('moveend', () => {
  mapClickHandler(coordinates,map, setCoords, accessToken, handleModal); 
});
});