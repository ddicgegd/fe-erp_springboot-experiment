import axios from "axios";
import { setDataStartEndIndexes } from "recharts/types/state/chartDataSlice";

interface LoginRequest {
    username: string;
    password: string;
}

export const login = (loginRequest: LoginRequest) => {
    return axios.post('/auth/login', loginRequest);
}
