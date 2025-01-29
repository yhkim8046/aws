import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css"; // 최소한의 스타일 시트를 작성한다고 가정

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
