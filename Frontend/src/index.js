

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";
import 'bootstrap/dist/css/bootstrap.min.css';
import App from "./App";
import './styles.scss';

import ChatProvider from "./Context/ChatProvider";
import "./index.css";
import "./design/tokens.css";
import "./design/ui.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
          <ChatProvider>

    <Provider store={store}>
      <App/>
    </Provider>
    </ChatProvider>

  </React.StrictMode>
);
