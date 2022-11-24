import axios from "axios";

export const axiosInstance = axios.create({ baseURL: "http://localhost:8080/" });

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.code === "ERR_NETWORK") {
            // alert(
            //     "Looks like server is not reachable. Please click OK and if you continue to see this error fix server problem and refresh this window for more details"
            // );
            console.log(`Server not running.`);
        }
        return error;
    }
);
