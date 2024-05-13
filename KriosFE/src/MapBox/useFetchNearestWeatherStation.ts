import { useState, useEffect } from "react";
import { getNearGeoPoint } from "../apiController";
import { Coords } from "../interface/Icoords";
import { IweatherStation } from "../interface/IweatherStation";

const useFetchNearestWeatherStation = (coords: Coords | null) => {
    const [data, setData] = useState<IweatherStation[] | null>(null);
    const [error, setError] = useState<unknown | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!coords) {
            setLoading(false);
            return;
        }
        const fetchWeatherStations = async () => {
            setLoading(true);
            try {
                const coordString = `${coords.lng},${coords.lat}`;
                const apiResults = await getNearGeoPoint(coordString);
                setData(apiResults.sensorSystem);
                setError(null);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(message);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchWeatherStations(); 
    }, [coords]);

    return { data, error, loading };
};

export default useFetchNearestWeatherStation;