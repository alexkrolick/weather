import React from "react";
import GMap from "google-map-react";

import * as weather from "./apiWeatherDotGov";
import "./App.css";

type State = {
  lat?: number;
  lon?: number;
  station?: string;
};

type ActionLatSet = { type: "lat/set"; payload: { lat: State["lat"] } };
type ActionLonSet = { type: "lon/set"; payload: { lon: State["lon"] } };
type ActionStationSet = {
  type: "station/set";
  payload: { station: State["station"] };
};
type ActionInit = { type: "init"; payload: {} };

type Actions = ActionLatSet | ActionLonSet | ActionStationSet | ActionInit;

const actionHandlers = {
  init: () => ({ lat: 40, lon: -100, station: null }),
  "lat/set": (state: State, action: ActionLatSet) => ({
    ...state,
    lat: action.payload.lat,
    station: null,
  }),
  "lon/set": (state: State, action: ActionLonSet) => ({
    ...state,
    lon: action.payload.lon,
    station: null,
  }),
  "station/set": (state: State, action: ActionStationSet) => ({
    ...state,
    station: action.payload.station,
  }),
};

const GMapMarker = (props: { lat: number; lng: number }) => {
  return (
    <div
      style={{
        minWidth: 150,
        color: "white",
        textShadow: "1px 0px 2px darkgray",
        fontSize: 15,
        fontWeight: "bold",
      }}
    >
      <i className="fas fa-map-marker"></i> {props.lat.toFixed(3)},{" "}
      {props.lng.toFixed(3)}
    </div>
  );
};

const MAP_EXPANDED_HEIGHT = 400;
const MAP_COLLAPSED_HEIGHT = 150;

function Forecast({ periods = [] }: { periods: any }) {
  return (
    <div>
      {periods.map((p: any) => {
        return (
          <pre>
            <code>{JSON.stringify(p, null, 4)}</code>
          </pre>
        );
      })}
    </div>
  );
}

function App() {
  const [mapHeight, setMapHeight] = React.useState(MAP_COLLAPSED_HEIGHT);
  const [state, dispatch] = React.useReducer(
    (state: State, action: Actions) =>
      // @ts-ignore screw it
      actionHandlers[action.type](state, action),
    actionHandlers.init(),
  );

  const gridpoints = weather.useGridpoints({ lat: state.lat, lon: state.lon });
  const alerts = weather.useAlerts();
  const gridStation = state.station;
  const { gridX, gridY } = gridpoints.result?.properties || {};
  const forecast = weather.useForecast({ station: gridStation, gridX, gridY });

  React.useEffect(() => {
    const nearestStation = gridpoints.result?.properties?.cwa || null;
    if (!state.station && nearestStation) {
      dispatch({ type: "station/set", payload: { station: nearestStation } });
    }
  }, [state.station, gridpoints.result]);

  return (
    <>
      <div
        style={{ height: mapHeight, width: "100%", transition: "height 0.5s" }}
      >
        <GMap
          bootstrapURLKeys={{ key: "" /* YOUR KEY HERE */ }}
          defaultCenter={{ lat: state.lat, lng: state.lon }}
          defaultZoom={9}
          onClick={({ lat, lng }) => {
            // TODO: don't do 2 dispatches
            dispatch({ type: "lon/set", payload: { lon: lng } });
            dispatch({ type: "lat/set", payload: { lat: lat } });
          }}
        >
          <GMapMarker lat={state.lat} lng={state.lon} />
        </GMap>
      </div>

      <div>
        <button
          className="float-right btn"
          onClick={() =>
            setMapHeight(
              mapHeight === MAP_COLLAPSED_HEIGHT
                ? MAP_EXPANDED_HEIGHT
                : MAP_COLLAPSED_HEIGHT,
            )
          }
        >
          <i className="fas fa-location-arrow"></i>
        </button>
        <input
          value={state.lat}
          onChange={e =>
            dispatch({
              type: "lat/set",
              payload: { lat: parseInt(e.target.value) },
            })
          }
          placeholder="Latitude"
          type="number"
          aria-label="Latitude"
        />
        <input
          value={state.lon}
          onChange={e =>
            dispatch({
              type: "lon/set",
              payload: { lon: parseInt(e.target.value) },
            })
          }
          placeholder="Longitude"
          type="number"
          aria-label="Longitude"
        />
      </div>

      <h2>Gridpoints</h2>

      <pre style={{ maxHeight: "200px", overflow: "scroll" }}>
        {JSON.stringify(gridpoints.result, null, 2)}
      </pre>

      <h2>Alerts</h2>
      <pre style={{ maxHeight: "200px", overflow: "scroll" }}>
        {JSON.stringify(alerts.result, null, 2)}
      </pre>

      <h2>Forecast</h2>
      <pre style={{ maxHeight: "200px", overflow: "scroll" }}>
        {JSON.stringify(forecast.result, null, 2)}
      </pre>

      <div>
        <Forecast {...(forecast.result?.properties || {})} />
      </div>
    </>
  );
}

export default App;
