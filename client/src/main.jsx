import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { StyleSheetManager } from "styled-components";
ReactDOM.createRoot(document.getElementById("root")).render(
  <Suspense fallback={<div>Loading...</div>}>
    <RecoilRoot>
      <BrowserRouter>
        <StyleSheetManager shouldForwardProp={(prop) => prop !== "shake"}>
          <App />
          <ToastContainer />
        </StyleSheetManager>
      </BrowserRouter>
    </RecoilRoot>
  </Suspense>
);
