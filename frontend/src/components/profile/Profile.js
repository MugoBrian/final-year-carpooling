import React, { useEffect, useState } from "react";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBInput,
  MDBBtn,
} from "mdb-react-ui-kit";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import axios from "axios";
import url from "../../env";

export default function Profile() {
  const [user, setUser] = useState({});
  const [isVehicle, setIsVehicle] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [vmake, setvMake] = useState();
  const [vname, setvName] = useState();
  const [vseat, setvSeat] = useState();
  const [vmodel, setvModel] = useState();
  const [vyear, setvYear] = useState();
  const [vLicensePlate, setvLicensePlate] = useState();

  const [address, setAddress] = useState();
  const id = localStorage.getItem("id");
  const API_KEY = "AIzaSyD8MSGXG-7y2nXRtE90sv2IeLCElO2e3i0";

  useEffect(() => {
    axios.get(`${url}/user/details?userId=${id}`).then((res) => {
      setUser(res.data.user);
      if (res.data.user.VehicleName != null) {
        setIsVehicle(true);
      }
      console.log(res.data.user);
    });
  }, [id, isVehicle]);

  // Get and update location
  useEffect(() => {
    const getUserLocationAndUpdateAddress = async () => {
      if ("geolocation" in navigator) {
        const options = {
          enableHighAccuracy: true, // Request high accuracy for the position
          timeout: 5000, // Maximum time allowed to try obtaining the location
          maximumAge: 0, // Indicates not to use a cached position and to try to get a fresh one
        };

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const addr = await fetchAddress(latitude, longitude);
              setAddress(addr); // Update local state with the fetched address
            } catch (error) {
              console.error("Failed to fetch address:", error);
            }
          },
          (error) => {
            console.error(
              "Geolocation permission denied or error occurred:",
              error
            );
            setResponseMessage(
              "Error: Geolocation permission denied or error occurred!"
            );
          },
          options // Pass the options object here
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        setResponseMessage(
          "Error: Geolocation is not supported by this browser."
        );
      }
    };

    getUserLocationAndUpdateAddress();
  }, []);

  const fetchAddress = async (lat, lng) => {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
    );
    if (
      response.data &&
      response.data.results &&
      response.data.results.length > 0
    ) {
      return response.data.results[0].formatted_address; // This is your address
    }
    setResponseMessage("Error: Address not found");
  };

  function setVehicleDetails() {
    const updateUser = {
      userId: id,
      VehicleName: vname,
      VehicleMake: vmake,
      VehicleModel: vmodel,
      VehicleSeats: vseat,
      VehicleYear: vyear,
      VehicleLicensePlate: vLicensePlate,
    };

    axios
      .post(`${url}/user/updatedetails`, updateUser)
      .then((res) => {
        setResponseMessage(res.data.message);
        window.location.reload();
      })
      .catch((err) => {
        setResponseMessage(err.response.data.message);
      });
  }

  let vehicleName = isVehicle ? (
    user.VehicleName
  ) : (
    <MDBInput
      required={true}
      id="vehiclename"
      type="text"
      value={vname}
      onChange={(e) => {
        setvName(e.target.value);
      }}
    />
  );
  let VehicleMake = isVehicle ? (
    user.VehicleMake
  ) : (
    <MDBInput
      required={true}
      id="vehiclemake"
      type="text"
      value={vmake}
      onChange={(e) => {
        setvMake(e.target.value);
      }}
    />
  );
  let VehicleModel = isVehicle ? (
    user.VehicleModel
  ) : (
    <MDBInput
      required={true}
      id="vehiclemodal"
      type="text"
      value={vmodel}
      onChange={(e) => {
        setvModel(e.target.value);
      }}
    />
  );
  let VehicleSeats = isVehicle ? (
    user.VehicleSeats
  ) : (
    <MDBInput
      type="number"
      required={true}
      id="vehicleseat"
      value={vseat}
      onChange={(e) => {
        setvSeat(e.target.value);
      }}
    />
  );
  let VehicleYear = isVehicle ? (
    user.VehicleYear
  ) : (
    <MDBInput
      required={true}
      id="vehicleyear"
      type="text"
      value={vyear}
      onChange={(e) => {
        setvYear(e.target.value);
      }}
    />
  );
  let VehicleLicensePlate = isVehicle ? (
    user.VehicleLicensePlate
  ) : (
    <MDBInput
      required={true}
      id="vehiclelicenseplate"
      type="text"
      value={vLicensePlate}
      onChange={(e) => {
        setvLicensePlate(e.target.value);
      }}
    />
  );

  return (
    <section style={{ backgroundColor: "#eee" }}>
      <MDBContainer className="py-5">
        <MDBRow>
          <MDBCol lg="4">
            <MDBCard className="mb-4">
              <MDBCardBody className="text-center">
                <MDBCardImage
                  src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: "150px" }}
                  fluid
                />
                <p className="text-muted mb-1">User</p>
                <p className="text-muted mb-4">
                  {address ? address : "Kisii, Kenya"}
                </p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol lg="8">
            <MDBCard className="mb-4">
              <MDBCardBody>
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>First Name</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">
                      {user.name}
                    </MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Last name</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">
                      {user.lastname}
                    </MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Email</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">
                      {user.email}
                    </MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Mobile</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">
                      {user.phone_number}
                    </MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Address</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">
                      {address ? address : "Kisii, Kenya"}
                    </MDBCardText>
                  </MDBCol>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>

            <MDBRow>
              <MDBCol md="15">
                <MDBCard className="mb-4 mb-md-0">
                  <MDBCardBody>
                    <MDBCardText className="mb-4">
                      <span className="text-primary font-italic me-1">*</span>{" "}
                      Vehicle Details
                    </MDBCardText>
                    <Container>
                      <Row>
                        <Col>
                          <MDBCardText
                            className="mb-1"
                            style={{ fontSize: ".77rem" }}
                          >
                            Vehicle Name
                          </MDBCardText>
                          {vehicleName}
                        </Col>
                        <Col>
                          <MDBCardText
                            className="mb-1"
                            style={{ fontSize: ".77rem" }}
                          >
                            Vehicle Make
                          </MDBCardText>
                          {VehicleMake}
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <MDBCardText
                            className="mt-4 mb-1"
                            style={{ fontSize: ".77rem" }}
                          >
                            Vehicle Model
                          </MDBCardText>
                          {VehicleModel}
                        </Col>
                        <Col>
                          <MDBCardText
                            className="mt-4 mb-1"
                            style={{ fontSize: ".77rem" }}
                          >
                            Seats
                          </MDBCardText>
                          {VehicleSeats}
                        </Col>
                        <Col>
                          <MDBCardText
                            className="mt-4 mb-1"
                            style={{ fontSize: ".77rem" }}
                          >
                            Vehicle Year
                          </MDBCardText>
                          {VehicleYear}
                        </Col>
                        <Col>
                          <MDBCardText
                            className="mt-4 mb-1"
                            style={{ fontSize: ".77rem" }}
                          >
                            Vehicle LicensePlate
                          </MDBCardText>
                          {VehicleLicensePlate}
                        </Col>
                      </Row>
                    </Container>
                    {responseMessage && (
                      <Container
                        className={`rounded mb-4 mt-4 ${
                          responseMessage.startsWith("Error")
                            ? "bg-danger"
                            : "bg-success"
                        }`}
                      >
                        <p className="text-white py-2 text-center">
                          {responseMessage}
                        </p>
                      </Container>
                    )}
                    <Container className="text-center p-3">
                      {!isVehicle && (
                        <MDBBtn onClick={setVehicleDetails}>
                          Submit Details
                        </MDBBtn>
                      )}
                    </Container>
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
            </MDBRow>
            <Container className="mb-5"></Container>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </section>
  );
}
