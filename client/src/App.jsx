// App.js
import { useRoutes } from "react-router-dom";
import routes from "./routes";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.withCredentials = true;

const App = () => {
  const element = useRoutes(routes);
  return <>{element}</>;
};

export default App;
