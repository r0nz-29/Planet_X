import React from "react";
import { renderScene } from "./scene";
import "./App.css";

const App = () => {

  React.useEffect(() => {
    renderScene();
  }, []);
  return null;
};

export default App;
