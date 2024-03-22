import React, { useState, useEffect, useRef } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import {
  DirectionsRenderer,
  DirectionsService,
  GoogleMap,
} from "@react-google-maps/api";
import "react-datepicker/dist/react-datepicker.css";
import Cookies from "js-cookie";
import Geocode from "react-geocode";
import * as MdIcons from "react-icons/md";
import { Link } from "react-router-dom";
import url from "../../../env";

Geocode.setApiKey("AIzaSyD8MSGXG-7y2nXRtE90sv2IeLCElO2e3i0");

const mapContainerStyle = {
  height: "45vh",
  width: "100%",
};
const options = {
  disableDefaultUI: true,
  zoomControl: true,
};
const center = {
  lat: -0.6773283,
  lng: 34.7796,
};

export default function RideRequest({ setToken, setActiveTrip }) {
  const [showModal, setShowModal] = useState(false);
  const [mapType, setMapType] = useState();
  const [modalTitle, setModalTitle] = useState("Title Error");
  const [routeResp, setRouteResp] = useState();
  const [finding, setFinding] = useState(true);
  const [srcName, setsrcName] = useState("");
  const [destName, setdestName] = useState("");
  const [rideTrip, setRideTrip] = useState();
  const [dateTime, setDateTime] = useState(
    new Date(new Date().getTime() + 60 * 60 * 1000)
  );

  const [mapCoords, setMapCoords] = useState({
    src: null,
    dst: null,
  });
  const [rideRouteResp, setRideRouteResp] = useState({ reload: false });
  const [driver, setDriver] = useState([]);
  const [ride, setRide] = useState([]);

  const [rideRequests, setRideRequests] = useState({ loading: true });
  const [responseMessage, setResponseMessage] = useState();

  const mapRef = useRef();
  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const openMapModal = (mapType) => {
    setMapType(mapType);
    setModalTitle(mapType === "src" ? "Start" : "Destination");
    setShowModal(true);
  };

  const getLocFromCoords = (coords, type) => {
    let lat = coords["lat"];
    let long = coords["lng"];

    Geocode.fromLatLng(lat, long).then(
      (res) => {
        const location = res.results[0].formatted_address;
        if (type === "src") {
          setsrcName(location);
        } else {
          setdestName(location);
        }
      },
      (err) => {
        console.error(err);
        if (type === "src") {
          setsrcName(lat + "," + long);
        } else {
          setdestName(lat + "," + long);
        }
      }
    );
  };

  const handleCallback = (closeButtonClicked, mapType, mapData) => {
    setShowModal(false);
    if (closeButtonClicked) return;

    setMapCoords({
      ...mapCoords,
      [mapType]: mapData,
    });
    getLocFromCoords(mapData, mapType);
  };

  const directionsCallback = (response) => {
    if (response !== null) {
      if (response.status === "OK") setRouteResp(response);
      else
        setResponseMessage(
          `Error: Your Network connection is slow, Problem fetching Directions!`
        );
    } else
      setResponseMessage(
        `Error: Your Network connection is slow, Problem fetching Directions!`
      );
  };

  const rideDirectionsCallback = (response) => {
    if (response !== null) {
      if (response.status === "OK")
        setRideRouteResp({ rideData: response, reload: false });
      else
        setResponseMessage(
          `Error: Your Network connection is slow, Problem fetching Directions!`
        );
    } else
      setResponseMessage(
        `Error: Your Network connection is slow, Problem fetching Directions!`
      );
  };

  const handleRideClick = (ride) => (e) => {
    setRide(ride);
    fetch(`${url}/user/details?userId=${ride.rider}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 'Authorization': 'Bearer ' + Cookies.get('tokken'),  //another working solution
        Coookie: Cookies.get("tokken"),
      },
    })
      .then((response) => {
        if (response.ok) return response.json();
        else if (response.status === 401) setToken(null);
        throw new Error(response.statusText);
      })
      .then((responseJson) => {
        console.log("response user", responseJson.user);
        setDriver([responseJson.user]);
      })
      .catch((error) => {
        alert(error);
        // window.location.reload();
      });
  };

  const getWaypoints = (trip) => {
    let waypoints = [];
    if (
      (mapCoords.src.lat != trip.source.lat ||
        mapCoords.src.lon != trip.source.lon) &&
      (mapCoords.src.lat != trip.destination.lat ||
        mapCoords.src.lon != trip.destination.lon)
    ) {
      waypoints.push({ location: mapCoords.src, stopover: true });
    }
    if (
      (mapCoords.dst.lat != trip.source.lat ||
        mapCoords.dst.lon != trip.source.lon) &&
      (mapCoords.dst.lat != trip.destination.lat ||
        mapCoords.dst.lon != trip.destination.lon)
    ) {
      waypoints.push({ location: mapCoords.dst, stopover: true });
    }
    return waypoints;
  };

  useEffect(() => {
    fetch(`${url}/ride/requests/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Coookie: Cookies.get("tokken"),
      },
      body: JSON.stringify({
        state: "pending",
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((responseJson) => {
        console.log(`Response from fetching requests`, responseJson);
        setRideRequests({
          rides: [...responseJson.rideRequests],
          loading: false,
        });
      })
      .catch((error) => {});
  }, []);

  return (
    <>
      {rideRequests == null || rideRequests.loading ? (
        <div>Loading...</div>
      ) : rideRequests != null && rideRequests.rides.length > 0 ? (
        <>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={15}
            center={center}
            options={options}
            onLoad={onMapLoad}
          >
            {(ride != null || ride._id != null) && (
              <DirectionsService
                // required
                options={{
                  destination: ride.destination,
                  origin: ride.source,
                  travelMode: "DRIVING",
                  waypoints: ride.waypoints,
                  optimizeWaypoints: true,
                }}
                callback={rideDirectionsCallback}
              />
            )}
            {rideRouteResp !== null && !rideRouteResp.reload && (
              <DirectionsRenderer
                // required
                options={{
                  directions: rideRouteResp.rideData,
                }}
              />
            )}
          </GoogleMap>
          {responseMessage && (
            <Container
              className={`rounded mb-4 mt-4 ${
                responseMessage.startsWith("Error") ? "bg-danger" : "bg-success"
              }`}
            >
              <p className="text-white py-2 text-center">{responseMessage}</p>
            </Container>
          )}
          <Container fluid="lg">
            <Row style={{ marginTop: "1.8rem" }}>
              <Col>
                <h4 className="text-success">Pending Ride Requests</h4>
                {rideRequests.rides.map((ride) => (
                  <Row className="p-2" key={ride._id}>
                    <Button
                      variant="outline-info"
                      onClick={handleRideClick(ride)}
                    >
                      Passenger Name:{" "}
                      <span className="text-black text-right pl-5">
                        {ride.riderName}
                      </span>
                    </Button>
                  </Row>
                ))}
              </Col>
              <Col md>
                {driver.map((r) => {
                  return (
                    <Container fluid="lg">
                      <Row style={{ marginTop: "2rem" }}>
                        <div className="p-0">
                          <h4>Passenger Details</h4>
                          <p>First Name: {r.name}</p>
                          <p>Last Name: {r.lastname}</p>
                          <p>Email: {r.email}</p>
                          <p>Phone Number{r.phone_number}</p>
                        </div>
                      </Row>
                    </Container>
                  );
                })}
              </Col>
            </Row>
          </Container>
        </>
      ) : (
        <>
          <div class="text-center" style={{ fontSize: "24px" }}>
            No pending requests.
          </div>
          <div class="text-center" style={{ margin: "1rem 0" }}>
            <Link to="/ride">
              <Button
                variant="light-info"
                className={"main-button"}
                data-test="drive-button"
              >
                <MdIcons.MdPeopleOutline
                  style={{ color: "black", marginRight: "0.3rem" }}
                  data-test="ride-icon"
                />{" "}
                Find a Ride
              </Button>
            </Link>
          </div>
        </>
      )}
    </>
  );
}
