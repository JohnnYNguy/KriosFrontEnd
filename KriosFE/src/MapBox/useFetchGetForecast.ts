import { useState, useEffect } from "react";
import { getForecast } from "../apiController";
import { Coords } from "../interface/Icoords";
import { ForecastData } from "../interface/IForecastData";


const useFetchGetForecast = (coords: Coords | null) => {
    const [data, setData] = useState<ForecastData | null>(null);
    const [error, setError] = useState<unknown | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!coords) {
            setLoading(false);
            return;
        }
        const fetchForecast = async () => {
            setLoading(true);
            try {
                console.log("Fetching forecast");
                const apiResults = await getForecast(coords);
                setData(apiResults);
                setError(null);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(message);
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchForecast(); 
    }, [coords]);

    return { data, error, loading };
};

export default useFetchGetForecast;