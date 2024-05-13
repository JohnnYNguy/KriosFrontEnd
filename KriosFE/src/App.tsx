import React from 'react';
import Map from "./MapBox/mapbox";

function App() {
  const accessToken = "pk.eyJ1IjoicHJvamVjdGtyaW9zIiwiYSI6ImNscjk2ZHI1bTAzNWUycW1sYmxwZzZmdGcifQ.fY69dsFyjhn23JecHNOSJQ"
  
  return (
    <div>
      <Map accessToken={accessToken}/>
    </div>
  );
}

export default App;
