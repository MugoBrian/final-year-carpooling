import React, { useState, useEffect, useRef } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  DirectionsRenderer,
  DirectionsService,
  GoogleMap,
} from "@react-google-maps/api";
import "react-datepicker/dist/react-datepicker.css";
import Cookies from "js-cookie";
import Geocode from "react-geocode";
import { Link } from "react-router-dom";
import * as AiIcons from "react-icons/ai";
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
const baseKmRate = 1;
const baseMinRate = 0.1;
const ksh = 133;
const addKlocationmRate = 2;
const addMinRate = 0.2;

export default function DriveRequest({ setToken, setActiveTrip }) {
  const [showModal, setShowModal] = useState(false);
  const [mapType, setMapType] = useState();
  const [modalTitle, setModalTitle] = useState("Title Error");
  const [routeResp, setRouteResp] = useState();
  const [dateTime, setDateTime] = useState(
    new Date(new Date().getTime() + 60 * 60 * 1000)
  );
  const [mapCoords, setMapCoords] = useState({
    src: null,
    dst: null,
  });
  const [rider, setRider] = useState([]);
  const [ride, setRide] = useState([]);
  const [finding, setFinding] = useState(true);

  const [srcName, setsrcName] = useState("");
  const [destName, setdestName] = useState("");

  const navigate = useNavigate();
  const [rideRouteResp, setRideRouteResp] = useState({ reload: false });
  const [rideTrip, setRideTrip] = useState();

  const [rideRequests, setRideRequests] = useState({ loading: true });
  const [calculationData, setCalculationData] = useState({});

  const mapRef = useRef();
  const onMapLoad = (map) => {
    mapRef.current = map;
  };
  const [responseMessage, setResponseMessage] = useState();

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
      console.log(`directionsCallback`, response);
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

  const updateCalculation = (s1, d1, s2, d2, trip) => {
    const service = new window.google.maps.DistanceMatrixService();
    service
      .getDistanceMatrix({
        origins: [s1, s2, d2],
        destinations: [s2, d2, d1],
        travelMode: "DRIVING",
      })
      .then((result) => {
        console.log(result);
        if (
          result &&
          result.rows &&
          result.rows.length > 0 &&
          result.rows[0].elements &&
          result.rows[0].elements.length > 0
        ) {
          let pickUpLocation = result.originAddresses[1];
          let dropOffLocation = result.destinationAddresses[2];

          let oldDuration = result.rows[0].elements[2].duration.value;
          let newDuration =
            result.rows[0].elements[0].duration.value +
            result.rows[1].elements[1].duration.value +
            result.rows[2].elements[2].duration.value;
          let originalDistance = result.rows[0].elements[2].duration.value;
          let newDistance =
            result.rows[0].elements[0].distance.value +
            result.rows[1].elements[1].distance.value +
            result.rows[2].elements[2].distance.value;

          let fare =
            (originalDistance * baseKmRate) / 1000 +
            (oldDuration * baseMinRate) / 60;
          let addFare =
            ((newDistance - originalDistance) * baseKmRate) / 1000 +
            ((newDuration - oldDuration) * baseMinRate) / 60;
          if (addFare <= 0) {
            addFare = 1;
          }
          let newDurationMin = parseInt(newDuration / 60);
          let newDurationSec = (newDuration % 60).toFixed(0);
          setCalculationData({
            pickUpLocation,
            dropOffLocation,
            newDistance,
            newDuration,
            fare,
            addFare,
            newDurationMin,
            newDurationSec,
          });
        }
      })
      .catch((error) => {
        console.log("Error calculating distance:", error);
      });
  };

  const handleRideClick = (trip) => (e) => {
    // console.log(`ride`, trip)
    setRideTrip(trip);
    setRideRouteResp({ ...rideRouteResp, reload: true });
    updateCalculation(
      trip.source,
      trip.destination,
      trip.pickUpPoints[0],
      trip.pickUpPoints[1],
      trip
    );
    fetch(`${url}/user/details?userId=${trip.driver}`, {
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
        console.log(`USER DETAILs`, responseJson.user);
        setRider([responseJson.user]);
      })
      .catch((error) => {
        console.log(error);
        alert(error);
        // window.location.reload();
      });
  };

  const handleRideAction = (action) => (e) => {
    fetch(`${url}/update/request/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Authorization': 'Bearer ' + Cookies.get('tokken'),  //another working solution
        Coookie: Cookies.get("tokken"),
      },
      body: JSON.stringify({ action, tripRequest: rideTrip._id }),
    })
      .then((response) => {
        console.log(response);
        if (response.ok) return response.json();
        else if (response.status === 401) setToken(null);
        else setResponseMessage('An Error Occurred!')
        throw new Error(response.statusText);
      })
      .then((responseJson) => {
        setResponseMessage(responseJson.msg);
        navigate("/active-trip");
      })
      .catch((error) => {
        console.log(error);
        setResponseMessage('Error: An Error Occurred!')
        // window.location.reload();
      });
  };
  const getWaypoints = (trip) => {
    //console.log(`trip`, trip)
    let waypoints = [];
    trip.pickUpPoints.forEach((p) =>
      waypoints.push({ location: p, stopover: true })
    );
    return waypoints;
  };

  useEffect(() => {
    fetch(`${url}/drive/requests/`, {
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
        // console.log(`response`, response)
        if (response.ok) {
          return response.json();
        }
      })
      .then((responseJson) => {
        console.log("Drive Requests", responseJson);
        setRideRequests({
          rides: [...responseJson.rideRequests],
          loading: false,
        });
      })
      .catch((error) => {
        console.log(`error`, error);
      });
  }, []);

  return (
    <>
      {rideRequests == null || rideRequests.loading ? (
        <div>Loading...</div>
      ) : rideRequests != null && rideRequests.rides.length > 0 ? (
        <>
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
            <Row style={{ marginTop: "3rem" }}>
              <Col>
                <div>Pending Drive Requests</div>
                {rideRequests.rides.map((ride) => (
                  <Row className="p-2" key={ride._id}>
                    <Button letiant="info" onClick={handleRideClick(ride)}>
                      Driver Name {ride.driverName}
                    </Button>
                  </Row>
                ))}
                <Row>
                  {ride &&
                    rider.map((r) => {
                      return (
                        <Container fluid="lg">
                          <Row>
                            <>
                              <h5>Driver Details</h5>

                              <div>
                                <b>Name:</b> {r.name || ""}
                              </div>
                              <div>
                                <b>Last Name</b> {r.lastname || ""}
                              </div>
                              <div>
                                <b>Phone Number</b> {r.phone_number || ""}
                              </div>

                              <div>
                                <b>Vehicle Name:</b> {r.VehicleName || ""}
                              </div>
                              <div>
                                <b>Vehicle License Plate:</b>{" "}
                                {r.VehicleLicensePlate || ""}
                              </div>
                            </>
                          </Row>
                        </Container>
                      );
                    })}
                </Row>
              </Col>
              <Col>
                <Row>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={15}
                    center={center}
                    options={options}
                    onLoad={onMapLoad}
                  >
                    {(rideRouteResp == null || rideRouteResp.reload) && (
                      <DirectionsService
                        // required
                        options={{
                          destination: rideTrip.destination,
                          origin: rideTrip.source,
                          travelMode: "DRIVING",
                          waypoints: getWaypoints(rideTrip),
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
                </Row>
                <Row>
                  {rider.map((r) => {
                    return (
                      <Container fluid="lg">
                        <Row>
                          {typeof calculationData != "undefined" &&
                            calculationData != null &&
                            calculationData != {} && (
                              <>
                                <div>
                                  <b>Pickup Location:</b>{" "}
                                  {calculationData.pickUpLocation || ""}
                                </div>
                                <div>
                                  <b>Drop off Location:</b>{" "}
                                  {calculationData.dropOffLocation || ""}
                                </div>
                                <div>
                                  <b>Total Ride Distance:</b>{" "}
                                  {calculationData
                                    ? (
                                        calculationData.newDistance / 1000
                                      ).toFixed(3) + " km" || ""
                                    : ""}
                                </div>
                                <div>
                                  <b>Total Ride Duration:</b>{" "}
                                  {calculationData.newDuration
                                    ? calculationData.newDurationMin +
                                        " minutes " +
                                        calculationData.newDurationSec +
                                        " seconds" || ""
                                    : ""}
                                </div>
                                <div>
                                  <b>Base Fare:</b>{" "}
                                  {"Ksh." +
                                    calculationData.fare?.toFixed(1) * ksh ||
                                    ""}
                                </div>
                                <div>
                                  <b>Additional Fare:</b>{" "}
                                  {"Ksh." +
                                    calculationData.addFare?.toFixed(1) * ksh ||
                                    ""}
                                </div>
                              </>
                            )}
                          <div>
                            <Button
                              style={{ margin: "1rem" }}
                              letiant="outline-info"
                              onClick={handleRideAction("accepted")}
                            >
                              Accept Ride
                            </Button>
                            <Button
                              style={{ margin: "1rem" }}
                              letiant="outline-info"
                              onClick={handleRideAction("rejected")}
                            >
                              Reject Ride
                            </Button>
                          </div>
                        </Row>
                      </Container>
                    );
                  })}
                </Row>
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
            <Link to="/drive">
              <Button
                letiant="light-info"
                className={"main-button"}
                data-test="drive-button"
              >
                <AiIcons.AiTwotoneCar
                  style={{ color: "black", marginTop: "0 0.3rem" }}
                  data-test="drive-icon"
                />{" "}
                Schedule a Ride
              </Button>
            </Link>
          </div>
        </>
      )}
    </>
  );
}
