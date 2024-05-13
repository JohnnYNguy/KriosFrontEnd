  import React, { useState, useMemo } from "react";
  import "../stylesheets/sidebar.css";
  import "@fortawesome/fontawesome-free/css/all.css";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import {
    faAngleDown,
    faAngleUp,
    faCloudShowersHeavy,
    faDroplet,
    faTemperature0,
    faXmark,
    faSun,
  } from "@fortawesome/free-solid-svg-icons";
  import useFetchGetObservations from "./useFetchGetObservations";
  import { Line } from "react-chartjs-2";
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions,
  } from "chart.js";
  import { IweatherStation } from "../interface/IweatherStation";
  import IObservationData from "../interface/IObservationData";
  import { Observation } from "../interface/IObservationData";
  const css = require('../stylesheets/sidebar.css');

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  interface SidebarProps {
    isOpen: boolean;
    closeSidebar: () => void;
    stations: IweatherStation[] | null;
    colors: { id: string; color: string }[]; 
  }

  interface IObservationsData {
    [key: string]: IObservationData[] | null;
  }

  const calculateDataBounds = (data: number[]) => {
    if (data.length === 0) return { min: 0, max: 1 };
    let min = data[0], max = data[0];
    data.forEach(value => {
      if (value < min) min = value;
      if (value > max) max = value;
    });
    return { min, max };
  };

  const useExtractChartData = (observations: IObservationsData | null, elementId: string, colors:  { id: string; color: string }[]): [ChartData<"line">, {min: number, max: number}, string] => {
    return useMemo(() => {
      const labels: string[] = [];
      const data: number[] = [];
      const seenDates = new Set<string>();
      let sourceId = ''; // This will capture the first encountered source ID for simplicity

      if (observations) {
        Object.entries(observations).forEach(([stationId, stationData]) => {
          stationData?.forEach((observationData: IObservationData) => {
            // Only process data if sourceId does not start with "SN4780"
    
              observationData.observations.forEach((obs: Observation) => {
                if (obs.elementId === elementId && !sourceId) {
                  sourceId = observationData.sourceId; // Capture the sourceId from IObservationData
                }
                if (obs.elementId === elementId) {
                  const dateStr = new Date(observationData.referenceTime).toLocaleDateString();
                  if (!seenDates.has(dateStr)) {
                    seenDates.add(dateStr);
                    labels.push(dateStr); 
                    data.push(obs.value);
                  }
                }   
              });
            
          });
        });
      }

      const { min, max } = calculateDataBounds(data);
      const matchingColor = colors.find(color => {
        // Remove the suffix after ':' if present
        const normalizedSourceId = sourceId.split(':')[0];
        return color.id === normalizedSourceId;
      })?.color || "rgb(75, 192, 192)";

      return [{
        labels,
        datasets: [{
          label: `kilde ${sourceId}`,
          data,
          fill: false,
          borderColor: matchingColor,
          tension: 0.1,
        }],
      }, { min, max }, sourceId];
    }, [observations, elementId, colors]);
  };

  const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    closeSidebar,
    stations,
    colors,
  }) => {
    const [startDate, setStartDate] = useState("2000-01-01");
    const [endDate, setEndDate] = useState("2024-01-01");
    const sidebarClasses = `sidebar${isOpen ? " open" : ""}`;
    const { observations, error, loading } = useFetchGetObservations(stations ?? [], `${startDate}%2F${endDate}`);
    const [timeFrame, setTimeFrame] = useState('P1M');

    const [showSunlight, setShowSunlight] = useState(true);
    const [showHumidity, setShowHumidity] = useState(true);
    const [showTemperature, setShowTemperature] = useState(true);
    const [showPrecipitation, setShowPrecipitation] = useState(true);

    const [sunlightChartData, sunlightBounds, sunlightSourceId] = useExtractChartData(observations, `sum(duration_of_sunshine ${timeFrame})`, colors);
    const [humidityChartData, humidityBounds, humiditySourceId] = useExtractChartData(observations, `mean(relative_humidity ${timeFrame})`,colors);
    const [temperatureChartData, temperatureBounds, temperatureSourceId] = useExtractChartData(observations, `mean(air_temperature ${timeFrame})`,colors);
    const [precipitationChartData, precipitationBounds, precipitationSourceId] = useExtractChartData(observations, 'sum(precipitation_amount P1Y)',colors);

    const options = (bounds: {min: number, max: number}): ChartOptions<"line"> => ({
      scales: {
        y: {
          beginAtZero: false,
          suggestedMin: bounds.min - (bounds.max - bounds.min) * 0.1,
          suggestedMax: bounds.max + (bounds.max - bounds.min) * 0.1,
        }
      },
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true }
      },
    });

    const toggleChartVisibility = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      setter(prevState => !prevState);
    };

    return (
      <div className={sidebarClasses}>
        <button className="btn" onClick={closeSidebar}>
          <FontAwesomeIcon icon={faXmark} />
          <span className="btn-tooltip">Lukk</span>
        </button>
        <h1>Værhistorikk</h1>
        <div className="calendarWrap">
          <label htmlFor="start-date"></label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label htmlFor="end-date"></label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button className="toggler" onClick={() => setTimeFrame(timeFrame === 'P1M' ? 'P1Y' : 'P1M')}>
        {timeFrame === 'P1M' ? 'Pr År' : 'Pr Mnd'}
        </button>
        <div className="graphWrapper">
          <div className="graphEntry" onClick={() => toggleChartVisibility(setShowTemperature)}>
            <FontAwesomeIcon icon={faTemperature0} style={{ marginRight: "8px" }} />
            Temperatur
            <FontAwesomeIcon icon={showTemperature ? faAngleUp : faAngleDown} style={{ marginRight: "8px" }} />
            {showTemperature && <Line data={temperatureChartData} options={options(temperatureBounds)} />}
          </div>
          <div className="graphEntry" onClick={() => toggleChartVisibility(setShowPrecipitation)}>
            <FontAwesomeIcon icon={faCloudShowersHeavy} style={{ marginRight: "8px" }} />
            Nedbør
            <FontAwesomeIcon icon={showPrecipitation ? faAngleUp : faAngleDown} style={{ marginRight: "8px" }} />
            {showPrecipitation && <Line data={precipitationChartData} options={options(precipitationBounds)} />}
          </div>
          <div className="graphEntry" onClick={() => toggleChartVisibility(setShowHumidity)}>
            <FontAwesomeIcon icon={faDroplet} style={{ marginRight: "8px" }} />
            Fuktighet
            <FontAwesomeIcon icon={showHumidity ? faAngleUp : faAngleDown} style={{ marginRight: "8px" }} />
            {showHumidity && <Line data={humidityChartData} options={options(humidityBounds)} />}
          </div>
          <div className="graphEntry" onClick={() => toggleChartVisibility(setShowSunlight)}>
            <FontAwesomeIcon icon={faSun} style={{ marginRight: "8px" }} />
            Solskinnstimer
            <FontAwesomeIcon icon={showSunlight ? faAngleUp : faAngleDown} style={{ marginRight: "8px" }} />
            {showSunlight && <Line data={sunlightChartData} options={options(sunlightBounds)} />}
          </div>
        </div>
      </div>
    );
  };

  export default Sidebar;
