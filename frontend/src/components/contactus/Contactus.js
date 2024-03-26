import React from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBBtn,
} from "mdb-react-ui-kit";

const Contactus = () => {
  return (
    <MDBContainer className=".d-flex justify-content-center w-50% mx-20%">
      <MDBRow>
        <h5 className="text-primary text-center mb-8">
          Incase Of Any Complaint/ Issue Reach Out!
        </h5>
        <MDBCol md="6">
          <div className="text-bold  pt-8">
            <p>Name : Gilbert Nyamberi</p>
            <p>Email: in160001620@kisiiuniversity.ac.ke</p>
            <p>Address: Kisii University, Kisii</p>
          </div>
        </MDBCol>
        <MDBCol md="6">
          <div className="text-bold  pt-8">
            <p>Name : Brian Mugo</p>
            <p>Email: in160000520@kisiiuniversity.ac.ke</p>
            <p>Address: Kisii University, Kisii</p>
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default Contactus;
