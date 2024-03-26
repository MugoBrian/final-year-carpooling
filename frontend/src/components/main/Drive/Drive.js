import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Col,
  Container,
  FloatingLabel,
  Form,
  Row,
} from "react-bootstrap";
import axios from "axios";
import MapSelector from "../MapSelector";
import {
  DirectionsRenderer,
  DirectionsService,
  GoogleMap,
} from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";

import DatePicker from "react-datepicker";
import "./Drive.css";
import "react-datepicker/dist/react-datepicker.css";
import Cookies from "js-cookie";
import Geocode from "react-geocode";
import { Navigate } from "react-router-dom";
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

export default function Drive({ setToken, setActiveTrip }) {
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("Title Error");
  const [mapType, setMapType] = useState();
  const [userVehicleSeat, setUserVehicleSeat] = useState(null);
  const [mapCoords, setMapCoords] = useState({
    src: null,
    dst: null,
  });
  const [data, setData] = useState({
    src: {
      lat: null,
      lng: null,
    },
    dst: {
      lat: null,
      lng: null,
    },
    route: null,
    dateTime: null,
    max_riders: null,
  });
  const [routeResp, setRouteResp] = useState();
  const [dateTime, setDateTime] = useState(
    new Date(new Date().getTime() + 60 * 60 * 1000)
  );
  const [riders, setRiders] = useState();

  const [srcName, setsrcName] = useState("");
  const [destName, setdestName] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [driveMessage, setDriveMessage] = useState("");

  const id = localStorage.getItem("id");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${url}/user/details?userId=${id}`).then((res) => {
      console.log(res.data);
      if (res.data.user === null) {
        setDriveMessage("Access Denied!");
        navigate("/login");
      } else {
        console.log(res.data.user.VehicleLicensePlate);
        if (
          res.data.user.VehicleLicensePlate === null ||
          res.data.user.VehicleLicensePlate === undefined ||
          res.data.user.VehicleLicensePlate === ""
        ) {
          setDriveMessage(
            "Error: Update Your Vehicle Details To Schedule A Drive. Redirecting..."
          );
          setTimeout(() => {
            return navigate("/profile");
          }, 2000);
        } else {
          setUserVehicleSeat(res.data.user.VehicleSeats);
        }
      }
    });
  }, [id, navigate]);

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

  const directionsCallback = (drive) => {
    if (drive !== null) {
      if (drive.status === "OK") setRouteResp(drive);
      else setDriveMessage("Problem fetching directions");
    } else setDriveMessage("Problem fetching directions");
  };

  const handleDriveSubmit = async (event) => {
    event.preventDefault();
    setData({
      src: {
        lat: mapCoords.src.lat,
        lng: mapCoords.src.lng,
      },
      dst: {
        lat: mapCoords.dst.lat,
        lng: mapCoords.dst.lng,
      },
      route: routeResp.routes[0].overview_path,
      dateTime: dateTime,
      max_riders: riders,
    });

    return fetch(`${url}/trip/drive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        Coookie: Cookies.get("tokken"),
      },
      body: JSON.stringify(data),
    }).then((drive) => {
      if (drive.ok) {
        setDriveMessage("Your drive is scheduled!");
        setTimeout(() => {
          setRedirect(true);
        }, 1000);
        return drive.json();
      } else if (drive.status === 401) {
        setToken(null);
      } else {
        setDriveMessage(drive.data.message);
      }
    });
  };

  useEffect(() => {
    setRouteResp(null);
  }, [mapCoords]);
  const items = [];
  if (userVehicleSeat) {
    for (let i = 0; i < userVehicleSeat; i++) {
      // Pushing JSX elements to the items array
      items.push(<option value={i + 1}>{i + 1}</option>);
    }
  }
  console.log(userVehicleSeat);
  return (
    <>
      {redirect ? <Navigate to="/ride-request" /> : <></>}
      {driveMessage && (
        <Container
          className={`rounded mb-4 mt-4 ${
            driveMessage.startsWith("Error") ? "bg-danger" : "bg-success"
          }`}
        >
          <p className="text-white py-2 text-center">{driveMessage}</p>
        </Container>
      )}
      <Container fluid="lg">
        <Row style={{ marginTop: "3rem" }}>
          <Col md>
            <Row
              style={{ marginTop: "1rem", fontSize: "36px" }}
              class="col-xs-1"
              align="center"
            >
              Schedule Your Ride
            </Row>
            <Form>
              <Form.Group as={Row} className="mb-3" controlId="src">
                <Col xs="9">
                  <Form.Control
                    readOnly
                    defaultValue="Starting position not selected"
                    value={mapCoords["src"] ? srcName : null}
                    required
                  />
                </Col>
                <Col xs="3">
                  <Button
                    variant="info"
                    onClick={() => openMapModal("src")}
                    style={{ width: "100%" }}
                    data-test="source-button"
                  >
                    Start
                  </Button>
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3" controlId="dst">
                <Col xs="9">
                  <Form.Control
                    required
                    readOnly
                    defaultValue="Destination not selected"
                    value={mapCoords["dst"] ? destName : null}
                  />
                </Col>
                <Col xs="3">
                  <Button
                    variant="info"
                    onClick={() => openMapModal("dst")}
                    style={{ width: "100%" }}
                    data-test="destination-button"
                  >
                    Destination
                  </Button>
                </Col>
              </Form.Group>
              <Row style={{ marginTop: "1rem" }}>
                <Col xs="6" sm="3" md="4">
                  <label>Date-Time of trip: </label>
                </Col>
                <Col xs="6">
                  <DatePicker
                    required
                    showTimeSelect
                    selected={dateTime}
                    minDate={new Date()}
                    closeOnScroll={true}
                    onChange={(date) => setDateTime(date)}
                    dateFormat="MMMM d @ h:mm aa"
                  />
                </Col>
              </Row>
              <Row style={{ marginTop: "1rem" }}>
                <Col sm="7" md="12" xl="8">
                  <FloatingLabel
                    controlId="ridingWith"
                    label="Select the number of people you can ride with"
                  >
                    <Form.Select
                      required
                      onChange={(e) => {
                        setRiders(e.target.value);
                      }}
                    >
                      <option>----- Select -----</option>
                      {userVehicleSeat && items}
                    </Form.Select>
                  </FloatingLabel>
                </Col>
              </Row>
              <Row className="justify-content-center">
                <Col className="col-auto">
                  <Button
                    variant="info"
                    type="submit"
                    data-test="drive-submit-button"
                    style={{ marginTop: "3rem" }}
                    onClick={handleDriveSubmit}
                  >
                    Schedule drive!
                  </Button>
                </Col>
              </Row>
            </Form>
          </Col>
          <Col md style={{ marginTop: "2rem" }}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={15}
              center={center}
              options={options}
              onLoad={onMapLoad}
            >
              {routeResp == null &&
                mapCoords["src"] != null &&
                mapCoords["dst"] != null && (
                  <DirectionsService
                    // required
                    options={{
                      destination: mapCoords["dst"],
                      origin: mapCoords["src"],
                      travelMode: "DRIVING",
                      drivingOptions: {
                        departureTime: dateTime,
                      },
                    }}
                    // required
                    callback={directionsCallback}
                  />
                )}

              {routeResp !== null && (
                <DirectionsRenderer
                  // required
                  options={{
                    directions: routeResp,
                  }}
                />
              )}
            </GoogleMap>
          </Col>
        </Row>
      </Container>
      <MapSelector
        showModal={showModal}
        mapType={mapType}
        modalTitle={modalTitle}
        mapCoords={mapCoords}
        handleCallback={handleCallback}
      />
    </>
  );
}
