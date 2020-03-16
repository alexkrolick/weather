import React from "react";
import GMap from "google-map-react";
import format from "date-fns/format";
// import Tooltip from "@reach/tooltip";
import "@reach/tooltip/styles.css";

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
      <i className="fa fa-crosshairs"></i> {props.lat.toFixed(3)},{" "}
      {props.lng.toFixed(3)}
    </div>
  );
};

const MAP_EXPANDED_HEIGHT = 400;
const MAP_COLLAPSED_HEIGHT = 150;

const Unit = (props: any) => <span className={`text-condensed`} {...props} />;

function Forecast({ periods = [] }: { periods: any }) {
  return (
    <>
      <div className="d-flex flex-wrap">
        {/* TODO: group with a wrapper element so that day/night combos wrap as a block*/}
        {periods.map((p: any, idx: number) => {
          const precipMatch = /Chance of precipitation is (\d.?)%/.exec(
            p.detailedForecast,
          );
          const precipProbability =
            precipMatch && precipMatch[1] ? precipMatch[1] : 0;
          return (
            // <Tooltip label={p.detailedForecast}>
            <div
              className={`forecast-card px-3 pt-2 pb-0 mb-5 mt-5 ${
                p.isDaytime
                  ? "mx-2 shadow rounded-lg"
                  : "mx-2 shadow rounded-lg"
              }`}
              style={{
                width: 200,
                backgroundImage: `linear-gradient(${
                  idx > 0 ? (p.isDaytime ? "#fe4" : "#55e") : "#5a5"
                } 76px, #fff 78px)`,
                transform: `${
                  // idx > 0 ?
                  !p.isDaytime ? "translateY(0) scale(0.9)" : ""
                  // : "translateY(0)"
                }`,
              }}
            >
              <div
                className={`d-flex ${
                  idx > 0 && p.isDaytime ? "text-body" : "text-light"
                }`}
              >
                <div className={``}>
                  <span className={`font-weight-bold`}>
                    {format(new Date(p.startTime), "MM/dd")}
                  </span>
                </div>
                {/* <span className="font-weight-bold text-condensed ml-auto">
                    {p.name}
                  </span> */}
                <span className="ml-auto">
                  {p.isDaytime ? (
                    <i className="fas fa-sun"></i>
                  ) : (
                    <i className="fas fa-moon"></i>
                  )}
                </span>
              </div>
              <h4
                className={`mt-2 ${
                  idx > 0 && p.isDaytime ? "text-body" : "text-light"
                }`}
              >
                {p.name.replace(" Night", "")}
              </h4>
              <p className="d-flex mb-0 mt-4">
                <i
                  className={`fas ${
                    p.isDaytime ? "fa-temperature-high" : "fa-temperature-low"
                  }`}
                />
                <div
                  className={`ml-auto font-weight-bold ${
                    p.isDaytime ? "text-danger" : "text-info"
                  }`}
                >
                  {p.isDaytime ? (
                    <small className="font-weight-bold">
                      <i className="fas fa-sort-up" /> Hi
                    </small>
                  ) : (
                    <small className="font-weight-bold">
                      <i className="fas fa-sort-down" /> Lo
                    </small>
                  )}{" "}
                  <span className="">{p.temperature}</span>
                  <Unit>&deg;{p.temperatureUnit}</Unit>
                </div>
              </p>
              <p className="d-flex mb-0">
                <i className="fas fa-wind" />
                <div className="ml-auto font-weight-bold">
                  <span>{p.windSpeed}</span> <Unit>{p.windDirection}</Unit>
                </div>
              </p>
              <p className="d-flex mb-0">
                <i className="fas fa-cloud-sun-rain" />
                <div
                  className={`ml-auto font-weight-bold ${
                    precipProbability >= 80
                      ? "text-danger"
                      : precipProbability >= 50
                      ? "text-warning"
                      : precipProbability >= 10
                      ? "text-info"
                      : "text-muted"
                  }`}
                >
                  <i className="fas fa-tint" /> <span>{precipProbability}</span>
                  <Unit>{"%"}</Unit>
                </div>
              </p>
              {/* <p style={{ minHeight: 48 }} className="mt-3"> */}
              {/* <Tooltip label={p.detailedForecast}> */}
              {/* <span>{p.shortForecast}</span> */}
              {/* </Tooltip> */}
              {/* </p> */}
              <p>
                <img
                  src={
                    p.icon.replace("size=medium", "size=200") + `&fontsize=14`
                  }
                  alt=""
                  width="200px"
                  className="rounded-lg border shadow-sm mx-n3 mb-n3 mt-3 forecast-image flush-bottom"
                />
              </p>
              <div className="forecast-detailedForecast flush-bottom">
                <p className="font-weight-bold border-bottom pb-3">
                  {p.shortForecast}
                </p>
                <p>{p.detailedForecast}</p>
              </div>
            </div>
            // </Tooltip>
          );
        })}
      </div>
    </>
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

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        dispatch({ type: "lon/set", payload: { lon: coords.longitude } });
        dispatch({ type: "lat/set", payload: { lat: coords.latitude } });
      },
      err => {
        /* ignore error */
        console.error(err);
      },
    );
  }, []);

  return (
    <>
      <div
        style={{ height: mapHeight, width: "100%", transition: "height 0.5s" }}
      >
        <GMap
          bootstrapURLKeys={{ key: "" /* YOUR KEY HERE */ }}
          defaultCenter={{ lat: state.lat, lng: state.lon }}
          defaultZoom={7}
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
          <i
            className={`${
              mapHeight === MAP_COLLAPSED_HEIGHT
                ? "fas fa-caret-down"
                : "fas fa-caret-up"
            }`}
          ></i>{" "}
          <i
            className={`${
              mapHeight === MAP_COLLAPSED_HEIGHT
                ? "fas fa-map-marked-alt"
                : "fas fa-map-marked-alt"
            }`}
          ></i>
        </button>
        <form className="form-inline">
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
            className="form-control m-1"
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
            className="form-control m-1"
          />
        </form>
      </div>
      {/* 
      <div className="p-3">
        <h2>Forecast</h2>
      </div> */}

      <Forecast {...(forecast.result?.properties || {})} />

      <details className="p-4">
        <summary>Raw Data</summary>
        <h2>Gridpoints</h2>

        <pre style={{ maxHeight: "200px", overflow: "scroll" }}>
          {JSON.stringify(gridpoints.result, null, 2)}
        </pre>

        <h2>Forecast</h2>
        <pre style={{ maxHeight: "500px", overflow: "scroll" }}>
          {JSON.stringify(forecast.result, null, 2)}
        </pre>

        <h2>Alerts (state-wide)</h2>
        <pre style={{ maxHeight: "200px", overflow: "scroll" }}>
          {JSON.stringify(alerts.result, null, 2)}
        </pre>
      </details>
    </>
  );
}

export default App;
