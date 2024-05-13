import mapboxgl from "mapbox-gl";

interface MapboxFeature {
  place_type: string[];
  text: string;
  place_name: string;
}

const mapClickHandler = async (
  coordinates: [number, number], // longitude, latitude
  map: mapboxgl.Map | null,
  setCoords: React.Dispatch<React.SetStateAction<mapboxgl.LngLat | null>>,
  accessToken: string,
  handleModal: (message: string, isOpen: boolean) => void = () => {},
  setAddress: React.Dispatch<React.SetStateAction<string>> = () => {}
) => {
  
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const countryFeature = await data.features.find((feature: MapboxFeature) => feature.place_type.includes('country'));
    const addressFeature = await data.features.find((feature: MapboxFeature) => feature.place_type.includes('address') || feature.place_type.includes('poi'));
    const address = await addressFeature ? addressFeature.place_name : 'Address not found';
    setAddress(address);
    console.log("ADRESSE: " + address);
    // Check if the country is Norway
    if (countryFeature && countryFeature.text === "Norway") {
      console.log("Setting Coords in SearchHandler");
      
      setCoords(new mapboxgl.LngLat(coordinates[0], coordinates[1]));
    } else {
      handleModal("Du kan bare trykke på Norges landegrense.", true);
    }
  } catch (error) {
    console.error('Error fetching country information:', error);
  } 
};
export default mapClickHandler;
