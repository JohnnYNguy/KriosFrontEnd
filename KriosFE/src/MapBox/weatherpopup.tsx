import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTemperatureHalf, faCloud, faDroplet, faWind, faCompass, faCloudSun, faSun } from '@fortawesome/free-solid-svg-icons';
import { WeatherDetails } from '../interface/IForecastData';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

const css = require('../stylesheets/popup.css');

interface WeatherPopupProps {
  address: string,
  details: WeatherDetails;
  onReadMore: () => void;  // Function to handle "Read More" actions
}

function degreesToDirection(degrees: number): string {
  const directions = ["Nord", "Nordøst", "Øst", "Sydøst", "Sør", "Sydvest", "Vest", "Nordvest"];
  degrees += 22.5;
  if (degrees < 0) degrees += 360;
  if (degrees >= 360) degrees -= 360;
  const index = Math.floor(degrees / 45);
  return directions[index];
}

const WeatherPopup: React.FC<WeatherPopupProps> = ({ address,details, onReadMore }) => {
  const getCloudIcon = (cloudPercentage: number): IconProp => {
    if (cloudPercentage >= 60) {
      return faCloud; // Cloudy
    } else if (cloudPercentage >= 21) {
      return faCloudSun; // Partly Cloudy
    } else {
      return faSun; // Sunny
    }
  };

  

  return (
    <div className="weather-popup">
      <div className="weather-detail temp-detail">
        <FontAwesomeIcon icon={faTemperatureHalf} className="icon temp-icon" />
        <p className="text temp-text">{details.air_temperature} °C</p>
        <span className='temp-tooltip'>Temperatur</span>
      </div>
      <div className="weather-detail">
        <div className='cloud-detail'>
          <FontAwesomeIcon icon={getCloudIcon(details.cloud_area_fraction)} className="icon cloud-icon" />
          <span className='cloud-tooltip'>Skydekke</span>
        </div>
        <p className="text cloud-text">{details.cloud_area_fraction}%</p>
      </div>
      <div className="weather-detail humidity-detail">
        <FontAwesomeIcon icon={faDroplet} className="icon humidity-icon" />
        <p className="text humidity-text">{details.relative_humidity}%</p>
        <span className='humidity-tooltip'>Luftfuktighet</span>
      </div>
      <div className="weather-detail wind-dir-detail">
        <FontAwesomeIcon icon={faCompass} className="icon wind-dir-icon" />
        <p className="text wind-dir-text">{degreesToDirection(details.wind_from_direction)}</p>
        <span className='wind-dir-tooltip'>Vindretning</span>
      </div>
      <div className="weather-detail wind-speed-detail">
        <FontAwesomeIcon icon={faWind} className="icon wind-speed-icon" />
        <p className="text wind-speed-text">{details.wind_speed} m/s</p>
        <span className='wind-speed-tooltip'>Vindstyrke</span>
      </div>
      <h4 className='address-text'>{address}</h4>
      <button className="read-more-btn" onClick={onReadMore}>Les mer</button>
    </div>
  );
};

export default WeatherPopup;
