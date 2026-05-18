import axios, {Axios, AxiosResponse} from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    timeout: 10000
});

axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data;
    }, (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = window.location.origin + '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;