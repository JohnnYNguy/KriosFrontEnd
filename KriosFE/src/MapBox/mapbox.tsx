import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from 'react-dom';
import mapboxgl, { LngLat } from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { getNearGeoPoint, getLocationAll } from "../apiController";
import markerImage from "../assets/icons/weatherStation.png";
import useFetchNearestWeatherStation from "./useFetchNearestWeatherStation";
import { updateMarker } from "./updateMarker";
import placeWeatherStationMarker from "./placeWeatherStationMarker";
import mapClickHandler from "./mapClickHandler";
import Sidebar from "./Sidebar";
import stationImage from "../assets/icons/station.png";
import BoundsAlert from "../alerts/BoundsAlert";
import useGetAllWeatherStations from "./useGetAllWeatherStations";
import { clusterAllWeatherStations } from "./clusterAllWeatherStations";
import layersIcon from "../assets/icons/layers.png";
import useFetchGetForecast from "./useFetchGetForecast";
import "@fortawesome/fontawesome-free/css/all.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faMap, faHouse, } from "@fortawesome/free-solid-svg-icons";
import WeatherPopup from "./weatherpopup";
import mapStyleHandler from "./mapStyleHandler";
const css = require('../stylesheets/map.css');

  interface MapProps {
    accessToken: string;
  }

  interface MarkerColor {
    id: string;
    color: string;
  }

  const Map: React.FC<MapProps> = ({ accessToken }) => {
    let markerRef = useRef<mapboxgl.Marker | null>(null);
    let stationMarkerRef = useRef<mapboxgl.Marker[]>([]);
    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
    const [coords, setCoords] = useState<LngLat | null>(null);
    const [address, setAddress] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showStationMarker, setShowStationMarker] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [mapStyle, setMapStyle] = useState<string>("mapbox://styles/projectkrios/cltmwyv6x009i01pc82g040np");
    const [satelliteView, setSatelliteView] = useState<boolean>(false);
    const [markerColors, setMarkerColors] = useState<MarkerColor[]>([]);
    const [showWMSMenu, setShowWMSMenu] = useState(false);
    const [showRadonLayer, setShowRadonLayer] = useState(false);
    const [radonLegendUrl, setRadonLegendUrl] = useState("");
    const [showBedrock, setShowBedrockLayer] = useState(false);
    const [bedrockLegendUrl, setBedrockLegendUrl] = useState("");
    const [showLosMasser, setShowLosMasser] = useState(false);
    const [losmasserLegendUrl, setLosmasserLegendUrl] = useState("");

    const memoizedCoords = useMemo(() => {
      return coords ? { lat: coords.lat, lng: coords.lng } : null;
    }, [coords ? coords.lat : null, coords ? coords.lng : null]);

    const { data, error, loading } = useFetchNearestWeatherStation(memoizedCoords);
    const { data: forecastData, error: forecastError, loading: forecastLoading } = useFetchGetForecast(memoizedCoords);

    const handleReadMore = () => {
      console.log("Read More clicked");
      setIsSidebarOpen(true);
    };

    const handleModal = (message: string, isOpen: boolean) => {
      setModalMessage(message);
      setIsModalOpen(isOpen);
    };

    // Call and save data from API
    const weatherStations = useGetAllWeatherStations();

    const toggleRadonLayer = () => {
      setShowRadonLayer(prev => !prev);
      if (showBedrock){
        toggleBedrockLayer();
      } if (showLosMasser){
        toggleLosLayer();
      }
    };

    const toggleBedrockLayer = () => {
      setShowBedrockLayer(prev => !prev); 
      if (showRadonLayer){
        toggleRadonLayer();
      } if (showLosMasser){
        toggleLosLayer();
      }
    }
    const toggleLosLayer = () => {
      setShowLosMasser(prev => !prev);
      if (showRadonLayer){
        toggleRadonLayer();
      } if (showBedrock){
        toggleBedrockLayer();
      }
    }
    useEffect(() => {
      if (showRadonLayer) {
        const radonLegendUrl = "https://geo.ngu.no/mapserver/RadonWMS2?language=nor&version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=RadonWMS2&format=image/png&STYLE=default";
        setRadonLegendUrl(radonLegendUrl);
      } else {
        setRadonLegendUrl(""); 
      }
      if (showBedrock){ 
        const bedrockLegendUrl = "https://geo.ngu.no/mapserver/BerggrunnWMS3?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetLegendGraphic&LAYER=Berggrunn_nasjonal&FORMAT=image/png&SLD_VERSION=1.1.0";
        setBedrockLegendUrl(bedrockLegendUrl);
      }else {
        setBedrockLegendUrl("");
      } if (showLosMasser){ 
        const losmasserLegendUrl = "https://geo.ngu.no/mapserver/LosmasserWMS2?language=nor&version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=Losmasse_Norge&format=image/png&STYLE=default"
        setLosmasserLegendUrl(losmasserLegendUrl);
      }else{ 
        setLosmasserLegendUrl("");
      }
    }, [showRadonLayer, showBedrock, showLosMasser]);

    useEffect(() => {
      mapboxgl.accessToken = accessToken;

      const bounds = [
        [4.63, 57.9776],
        [31.078, 71.1851],
      ];

      const map = new mapboxgl.Map({
        container: "map",
        style: mapStyle,
        center: [2.407455447512632, 60.07541954856802],
        zoom: 4.5,
        pitch: 40,
        bearing: 60,
      });

      const onMapLoad = () => 
        setMapInstance(map);
        if (showRadonLayer) {
          map.addLayer({
            'id': 'wms-radon-map-layer',
            'type': 'raster',
            'source': {
              'type': 'raster',
              'tiles': [
                'https://geo.ngu.no/mapserver/RadonWMS2?language=nor&version=1.3.0&service=WMS&request=GetMap&layers=Radon_aktsomhet_oversikt&styles=&format=image/png&transparent=true&CRS=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}'
              ],
              'tileSize': 256
            },
            'paint': {}
          });
        }
        if (showBedrock){ 
          map.addLayer({
            'id': 'ngu-berggrunnwms',
            'type': 'raster',
            'source': {
                'type': 'raster',
                'tiles': [
                    'https://geo.ngu.no/mapserver/BerggrunnWMS3?language=nor&version=1.3.0&service=WMS&request=GetMap&layers=Berggrunn&styles=&format=image/png&transparent=true&CRS=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}'
                ],
                'tileSize': 256
            },
            'paint': {}
        });
        }else{
          setRadonLegendUrl("");
        }
        if (showLosMasser){ 
          map.addLayer({
            'id': 'ngu-losmasser',
            'type': 'raster',
            'source': {
                'type': 'raster',
                'tiles': [
                    'https://geo.ngu.no/mapserver/losmasserWMS2?language=nor&version=1.3.0&service=WMS&request=GetMap&layers=losmasse_Norge&styles=&format=image/png&transparent=true&CRS=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}'
                ],
                'tileSize': 256
            },
            'paint': {}
        });
        
        }
      ;
      map.on('load', onMapLoad);

    

    // if (showStationMarker) {
    //   clusterAllWeatherStations(map, weatherStations);
    // }

      map.setMaxBounds(bounds as mapboxgl.LngLatBoundsLike);

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: "Søk",
      countries: 'no',
      marker: false,
    });

      map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      map.addControl(geocoder, "top-right");
      map.addControl(new mapboxgl.ScaleControl());

      const geocoderContainer = document.querySelector(".mapboxgl-ctrl-geocoder") as HTMLElement;
      geocoderContainer.style.position = "absolute";
      geocoderContainer.style.top = "10px";
      geocoderContainer.style.right = "10px";
      geocoderContainer.style.zIndex = "1";

      geocoder.on("result", (event) => {
        const eventResult = event.result.geometry?.coordinates;
        if (eventResult && eventResult.length === 2) {
          const coordinates: [number, number] = [eventResult[0], eventResult[1]];
          map.once('idle', () => {
            mapClickHandler(coordinates, map, setCoords, accessToken, handleModal, setAddress);
          });
        } else {
          console.error("Unable to extract valid coordinates from the result:", event.result);
        }
      });

      map.on("click", (event) => {
        const coordinates: [number, number] = [event.lngLat.lng, event.lngLat.lat];
        mapClickHandler(coordinates, map, setCoords, accessToken, handleModal, setAddress);
      });

    return () => {
      map.remove();
      map.off('load', onMapLoad);
    };
  }, [accessToken, showStationMarker]);

  function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return function(...args: any[]) {
      clearTimeout(timeout);
    };
  }

  useEffect(() => {
    if (mapInstance) {
      mapInstance.addSource('weatherStations', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: weatherStations
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      mapInstance.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'weatherStations',
        filter: ['has', 'point_count'],
        layout:{ 'visibility': 'none' },
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#89CFF0', // Blue if count under 10
                10,
                '#f1f075', // Yellow if count under 20
                20,
                '#8cf29a', // Green if count under 50
                50,
                '#f28cb1', // red if count under 100
                100,
                '#8cf2cd' // soft green if count over 50
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
            ]
        }
      });

      mapInstance.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'weatherStations',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'visibility': 'none'
        }
      });
    
      mapInstance.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'weatherStations',
        filter: ['!', ['has', 'point_count']],
        layout: { 'visibility': 'none' },
        paint: {
            'circle-color': '#89CFF0',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
      });
    }

    if (mapInstance && showStationMarker) {
      mapInstance.setLayoutProperty('clusters', 'visibility', 'visible');
      mapInstance.setLayoutProperty('cluster-count', 'visibility', 'visible');
      mapInstance.setLayoutProperty('unclustered-point', 'visibility', 'visible');
    }
  }, [mapInstance]);

    useEffect(() => {
      if (data && coords && mapInstance) {
        stationMarkerRef.current.forEach(marker => marker.remove());
        stationMarkerRef.current = [];

        const updateLocationInfo = () => {

          data.forEach((stationData) => {
            const { geometry, distance, id, shortName } = stationData;
            const stationCoords: [number, number] = geometry.coordinates as [number, number];
            const popupContainer = document.createElement('div');

            const color = placeWeatherStationMarker({
              map: mapInstance,
              markerRef: stationMarkerRef,
              coordinates: new mapboxgl.LngLat(stationCoords[0], stationCoords[1]),
              id: id,
              name: shortName,
              imageUrl: markerImage,
              distance
            });
            setMarkerColors((prevColors: MarkerColor[]) => [...prevColors, { id, color }]);
          });

          // Type guard to check if forecastData has the necessary structure and content
          if (forecastData && forecastData.properties && forecastData.properties.timeseries && forecastData.properties.timeseries.length > 0) {
            const now = new Date();
          
            const closestTimeseries = forecastData.properties.timeseries.reduce((prev, curr) => {
              const prevDate = new Date(prev.time);
              const currDate = new Date(curr.time);
              const prevDiff = Math.abs(prevDate.getTime() - now.getTime());
              const currDiff = Math.abs(currDate.getTime() - now.getTime());
              return (prevDiff < currDiff) ? prev : curr;
            });
          
            if (closestTimeseries && closestTimeseries.data && closestTimeseries.data.instant && closestTimeseries.data.instant.details) {
              const latestWeatherDetails = closestTimeseries.data.instant.details;
          
              const popupContentElement = document.createElement('div');
          
              ReactDOM.render(
                <WeatherPopup
                  address={address}
                  details={latestWeatherDetails}
                  onReadMore={handleReadMore}
                />,
                popupContentElement
              );
          
              if (coords) {
                updateMarker(
                  mapInstance,
                  markerRef,
                  coords,
                  popupContentElement,
                );
              } else {
                console.error('Coordinates are missing for the popup');
              }
            }
          } else {
            console.error("Forecast data is missing or incomplete.");
          }
        };

        if (mapInstance.isStyleLoaded()) {
          updateLocationInfo();
        }
        return () => {
          ReactDOM.unmountComponentAtNode(document.createElement('div'));
        };
      }
    }, [data, coords, loading, error, mapInstance, markerImage, stationMarkerRef, markerRef, forecastData]);

    const switchStationState = () => {
      setShowStationMarker(prevState => !prevState)

      console.log(showStationMarker)
    }

    useEffect(() => {
      const mapStyle = satelliteView ? "mapbox://styles/mapbox/satellite-streets-v12" : "mapbox://styles/projectkrios/cltmwyv6x009i01pc82g040np";

      if (mapInstance) {
        mapInstance.setStyle(mapStyle);
      }
    }, [accessToken, satelliteView]);

    const toggleMapView = () => {
      if (showStationMarker) {
        mapStyleHandler(handleModal);
      } else {
        const toggleSatelliteView = () => {
          setSatelliteView(prev => !prev);
        };
  
        const switchMapStyle = () => {
          const newStyle =
            mapStyle === "mapbox://styles/projectkrios/cltmwyv6x009i01pc82g040np"
              ? "mapbox://styles/mapbox/satellite-streets-v12"
              : "mapbox://styles/projectkrios/cltmwyv6x009i01pc82g040np";
          setMapStyle(newStyle);
  
          console.log("Map style", newStyle);
        };
  
        toggleSatelliteView();
        switchMapStyle();
      }
    }

    useEffect(() => {
      if (mapInstance && mapInstance.getStyle()) { // Ensure the map and style are loaded
        if (mapInstance.getLayer('wms-radon-map-layer')) {
          // Set the visibility based on showWMSLayer state
          mapInstance.setLayoutProperty(
            'wms-radon-map-layer',
            'visibility',
            showRadonLayer ? 'visible' : 'none'
          );
        } else if (showRadonLayer) {
          // Add the layer if it doesn't exist and should be visible
          mapInstance.addLayer({
            'id': 'wms-radon-map-layer',
            'type': 'raster',
            'source': {
              'type': 'raster',
              'tiles': [
                'https://geo.ngu.no/mapserver/RadonWMS2?language=nor&version=1.3.0&service=WMS&request=GetMap&layers=Radon_aktsomhet_oversikt&styles=&format=image/png&transparent=true&CRS=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}'
              ],
              'tileSize': 256
            },
            'paint': {}
          });
        }
        if (mapInstance.getLayer('ngu-berggrunnwms')){
          mapInstance.setLayoutProperty(
            'ngu-berggrunnwms', 
            'visibility',
          showBedrock ? 'visible' : 'none'
          )
        } else if (showBedrock){
          mapInstance.addLayer({
            'id': 'ngu-berggrunnwms',
            'type': 'raster',
            'source': {
                'type': 'raster',
                'tiles': [
                    'https://geo.ngu.no/mapserver/BerggrunnWMS3?service=WMS&request=GetMap&layers=Berggrunn_nasjonal&styles=&format=image/png&transparent=true&version=1.3.0&CRS=EPSG:3857&width=800&height=600&bbox={bbox-epsg-3857}'
                ],
                'tileSize': 256
            },
            'paint': {}
        });
        }
        if (mapInstance.getLayer('ngu-losmasser')){
          mapInstance.setLayoutProperty(
            'ngu-losmasser', 
            'visibility', 
          showLosMasser ? 'visible' : 'none'
          )
        } else if (showLosMasser){
          mapInstance.addLayer({
            'id': 'ngu-losmasser',
            'type': 'raster',
            'source': {
                'type': 'raster',
                'tiles': [
                    'https://geo.ngu.no/mapserver/LosmasserWMS2?service=WMS&request=GetMap&version=1.3.0&layers=Losmasseflate_N1000_web&styles=&format=image/png&transparent=true&crs=EPSG:3857&width=800&height=600&bbox={bbox-epsg-3857}'
                ],
                'tileSize': 256
            },
            'paint': {}
        });
        }
      }
    }, [showLosMasser, showBedrock, showRadonLayer, mapInstance]);
    

  return (
    <>
      <div
        className="home-btn"
      
        style={{
          position: 'absolute',
          width: 32,
          height: 32,
          background: 'white',
          zIndex: 3,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 9,
          marginTop: 9
        }}>
        <FontAwesomeIcon icon={faHouse} />
        <span className="home-btn-tooltip">Gå hjem</span>
      </div>

      <div
        className="switch-mapstyle-btn"
        style={{
          position: "absolute",
          width: 32,
          height: 32,
          background: "white",
          zIndex: 3,
          borderRadius: 10,
          top: "66%",
          right: "0%",
          marginRight: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={() => {
          toggleMapView();
        }}
      >
        <img src={layersIcon} style={{ width: 15, height: 15 }} alt="Map style btn" />
        <span className="switch-mapstyle-btn-tooltip">Bytt kartstil</span>
      </div>

        

      {isModalOpen && (
        <BoundsAlert message={modalMessage} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
      {!showStationMarker ?
        <div
          className="show-station-marker-btn"
          style={{
            position: "absolute",
            width: 32,
            height: 32,
            background: "lightGray",
            zIndex: 3,
            borderRadius: 10,
            top: "73%",
            right: "0%",
            marginRight: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}

          onClick={switchStationState}
        >
          <img src={stationImage} style={{ width: 20, height: 20 }} alt="weather station logo" />
          <span className="show-station-marker-btn-tooltip">Vis værstasjoner</span>
        </div>
        :
        <div
        className="close-station-marker-btn"
          style={{
            position: "absolute",
            width: 32,
            height: 32,
            background: "white",
            zIndex: 3,
            borderRadius: 10,
            top: "73%",
            right: "0%",
            marginRight: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}

            onClick={switchStationState}
          >
            <img src={stationImage} style={{ width: 20, height: 20 }} alt="weather station logo" />
          <span className="close-station-marker-btn-tooltip">Skjul værstasjoner</span>
          </div>
        }
  <div
        style={{
          position: "absolute",
          width: 32,
          height: 32,
          background: showRadonLayer ? "white" : "lightGray",
          zIndex: 3,
          borderRadius: 10,
          top: "79%",
          right: "0%",
          marginRight: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onMouseEnter={() => setShowWMSMenu(true)}
        onMouseLeave={() => setShowWMSMenu(false)}
      >
        <FontAwesomeIcon icon={faMap} size="lg" style={{ color: showRadonLayer || showBedrock || showLosMasser ? 'blue' : 'grey' }} />
        {showWMSMenu && (
          <div className="wmsMenu">
          <label className="switch">
            <input type="checkbox" checked={showRadonLayer} onChange={toggleRadonLayer}/>
            <span className="slider round"></span>
            <div className="labelText">Radon</div>
          </label>
          <label className="switch">
            <input type="checkbox" checked={showBedrock} onChange={toggleBedrockLayer}/>
            <span className="slider round"></span>
            <div className="labelText">Bergrunn</div>
          </label>
          <label className="switch">
            <input type="checkbox" checked={showLosMasser} onChange={toggleLosLayer}/>
            <span className="slider round"></span>
            <div className="labelText">Løsmasse</div>
          </label>
        </div>
        )}
      </div>
      <div className="LegendContainer">
      {radonLegendUrl && (
      <div className="legend"
        style={{
          position: "absolute",
          top: "10%",
          right: "10px",
          zIndex: 1000,
          padding: "10px",
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Radonnivå</div>
        <img src={radonLegendUrl} alt="Radon Legend" style={{ width: "auto", height: "100px" }} />
      </div>
    )}
    {bedrockLegendUrl && (
      <div className="bedrockLegend legend"
        style={{
          position: "absolute",
          top: "10%",
          right: "10px",
          zIndex: 1000,
          padding: "10px",
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Berggrunn</div>
        <img className="bedrockImg" src={bedrockLegendUrl} alt="Berggrunn Legend" style={{ width: "auto", height: "100px" }} />
      </div>
    )}
    {losmasserLegendUrl && (
      <div className="losmasseLegend legend"
        style={{
          position: "absolute",
          top: "10%",
          right: "10px",
          zIndex: 1000,
          padding: "10px",
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      > 
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Løsmasse</div>
        <img className="losmasseImg" src={losmasserLegendUrl} alt="Løsmasse Legend" style={{ width: "auto", height: "100px" }} />
      </div>
    )}
</div>
        <div
          id="map"
          style={{ position: "relative", height: "100vh", zIndex: 2 }}
        />
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} stations={data} colors={markerColors} />
        <div id="map" style={{ position: "relative", height: "100vh", zIndex: 2 }} />
      </>
    );
  };

  export default Map;
