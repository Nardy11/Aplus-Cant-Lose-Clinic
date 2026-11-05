import axios from "axios";
import { DEMO } from "../Consts";
import demoAdapter from "./mockApi";

// Imported first in index.js: in demo mode every axios request is answered by the mock instead of the network.
if (DEMO) {
  axios.defaults.adapter = demoAdapter;
  // eslint-disable-next-line no-console
  console.info("El7a2ny demo mode: data is simulated in your browser, no server is involved.");
}
