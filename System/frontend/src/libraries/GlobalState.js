import React, { createContext, useState } from "react";
import url from '../../env'

const initialState = {
  // mapsKey: "AIzaSyCCZcb_AEAcCRk0uxe-GjAtUU_ewjpDXIM",
  endPoint: `${url}`,
};

export const GlobalContext = createContext();

const GlobalState = ({ children }) => {
  const [globalSate, setGlobalState] = useState(initialState);
  return (
    <GlobalContext.Provider value={[globalSate, setGlobalState]}>
      {children}
    </GlobalContext.Provider>
  );
};
export default GlobalState;
