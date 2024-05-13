import axios from "axios";
import { Coords } from "./interface/Icoords";

const baseURL = "http://localhost:8080/api";
const url = "https://api.met.no/weatherapi/locationforecast/2.0/mini";

const api = axios.create({
    baseURL,
    
});

const api2 = axios.create({
   baseURL: url, 
})

export const getLocationAll = async () => {
    try { 
        const response = await api.get("/source/all");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getNearGeoPoint = async (coords: string) => {
    try {
        const response = await api.get(`/redis/nearest/${coords}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getLocationName = async (locationName: string) => {
    try {
        const response = await api.get("/source/name", {
            params: {
                locationName
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getSunshineDuration = async (stationId: string) => {
    try {
        const response = await api.get(`/observe/${stationId}:0/1900-01-01%2F2100-01-01/sum(duration_of_sunshine P1Y)`)
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getHumidity = async (stationId: string) => {
    try{ 
        const response = await api.get(`/observe/${stationId}:0/1900-01-01%2F2100-01-01/mean(relative_humidity P1Y)`);
        return response.data;
    } catch (error) {
        throw error; 
    }
}

export const getTemperature = async (stationId: string) => {
    try{
        const response = await api.get(`/observe/${stationId}:0/1900-01-01%2F2100-01-01/mean(air_temperature P1M)`);
        return response.data;
    } catch (error) {
        throw (error);
    }
}

export const getPrecipitationAmount = async (stationId: string) => {
    try{
        const response = await api.get(`/observe/${stationId}:0/1900-01-01%2F2100-01-01/sum(precipitation_amount P1Y)`);
        return response.data;
    } catch (error) {
        throw (error);
    }
}

export const getMinTemperature = async (stationId: string) => {
    try {
        const response = await api.get(`/data/${stationId}/mean/min(air_temperature P1D) P1Y`);
        return response.data;
    } catch (error) {
        throw (error);
    }
}

export const getMaxTemperature = async (stationId: string) => {
    try {
        const response = await api.get(`/data/${stationId}/mean/max(air_temperature P1D) P1Y`)
        return response.data;
    } catch (error) {
        throw (error);
    }
}

export const getFromRedis = async () => {
    try {
        const response = await api.get(`/redis/from-redis`);
        return response.data
    } catch (error) {
        throw (error)
    }
}

export const getObservations = async (coords: number[], referenceTime: string, elementId: string) => {
    try{ 
        const response = await api.get(`/redis/observations/${coords}/${referenceTime}/${elementId}`)
        return response.data
    } catch(error){ 
        throw (error)
    }
}

export const getForecast = async (coords: Coords) => {
    try {
        const params = { lat: coords.lat, lon: coords.lng };
        const response = await api2.get("", { params });
        return response.data;
    } catch (error) {
        throw (error);
    }
}