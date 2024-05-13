import { useEffect, useState } from "react";
import { getObservations } from "../apiController";
import { IweatherStation } from "../interface/IweatherStation";
import IObservationData from "../interface/IObservationData";

interface IObservationsData {
  [key: string]: IObservationData[] | null;
}

// Assuming the structure of IObservation based on your logs and typical use cases


const useFetchGetObservations = (stations: IweatherStation[], referenceTime: string) => {
  const [observations, setObservations] = useState<IObservationsData>({});
  const [error, setError] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchedElements = new Set<string>();
    const fetchObservations = async () => {
      setLoading(true);
      const tempObservations: IObservationsData = {};

      try {
        const sortedStations = [...stations].sort((a, b) => a.distance - b.distance);

        for (const station of sortedStations) {
          const elements = station.elementId.split(',').map((element: string) => element.trim());
          const elementsToFetch = elements.filter((element: string) => {
            const identifier = `${element}:${referenceTime}`;
            return !fetchedElements.has(identifier);
          });

          if (elementsToFetch.length > 0) {
            const apiResult = await getObservations(station.geometry.coordinates, referenceTime, elementsToFetch.join(','));

            // Assuming apiResult is an array of observations for the current station only
            tempObservations[station.id] = apiResult.filter((obs: IObservationData) => obs.sourceId.startsWith(station.id + ':'));

            elementsToFetch.forEach((element: string) => {
              const identifier = `${element}:${referenceTime}`;
              fetchedElements.add(identifier);
            });
            
           
          } else {
          }
        }

        setObservations(tempObservations);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (stations.length > 0) {
      fetchObservations();
    }
  }, [stations, referenceTime]); // dependencies on stations and referenceTime to re-run effect when they change

  return { observations, error, loading };
};

export default useFetchGetObservations;
