

export interface WeatherDetails {
    air_pressure_at_sea_level: number;
    air_temperature: number;
    cloud_area_fraction: number;
    relative_humidity: number;
    wind_from_direction: number;
    wind_speed: number;
  }
  
  export interface InstantDetails {
    details: WeatherDetails;
  }
  
  export interface TimeseriesData {
    time:string;
    data: {
      instant: InstantDetails;
      
    };
  }
  
  export interface Properties {
    timeseries: TimeseriesData[];
  }
  
  export interface ForecastData {
    properties: Properties;
  }
  

  