import { Container } from "react-bootstrap";
const ResponseDisplay = ({ responseMessage }) => {
  return (
    <div>
      {responseMessage && (
        <Container
          className={`rounded mb-4 mt-4 ${
            responseMessage.startsWith("Error") ? "bg-danger" : "bg-success"
          }`}
        >
          <p className="text-white py-2 text-center">{responseMessage}</p>
        </Container>
      )}
    </div>
  );
};
export default ResponseDisplay;
