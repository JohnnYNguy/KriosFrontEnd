export default interface IObservationData {
    sourceId: string;
    referenceTime: string;
    observations: Observation[];
  }
  
  export interface Observation {
    elementId: string;
    value: number;
    unit: string;
    qualityCode: number;
  }