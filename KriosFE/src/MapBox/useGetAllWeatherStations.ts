import mapboxgl from "mapbox-gl";
import { useEffect, useState } from "react";
import { Feature, FeatureCollection, Point, Geometry, GeoJsonProperties } from 'geojson'
import { getFromRedis, getLocationAll } from "../apiController";

const useGetAllWeatherStations= (  ) => {
    const [stationData, setStationData] = useState<Feature<Geometry, GeoJsonProperties>[]>([]);

    useEffect(() => {
        const getAllWeatherStations = async () => {
            try {
                // Get data from API
                const getWeatherStations = await getFromRedis();

                // Turn data to GeoJSON
                if (getWeatherStations) {
                    const filteredData = getWeatherStations.map(( station: any ) => {
                        const { id, name, countryCode, geometry } = station;

                        return {
                            type: 'Feature',
                            geometry: { type: 'Point', coordinates: geometry.coordinates },
                            properties: { id, name, countryCode }
                        } as Feature<Geometry, GeoJsonProperties>;
                    }).filter( ( data: any ) => data !== null ) as Feature<Point, GeoJsonProperties>[];
                    setStationData(filteredData);
                }
            } catch(error) {
                console.error("Error fetching Weather Stations.", error)
            }
        }

        getAllWeatherStations();
        console.log("All Weather stations:", stationData)

        
    }, []);

    // Return data
    return stationData;
}

export default useGetAllWeatherStations;