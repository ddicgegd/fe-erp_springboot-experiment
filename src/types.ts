export enum ViewState {
    LOGIN = 'LOGIN',
    DASHBOARD = 'DASHBOARD',
    TRACKING = 'TRACKING',
    PRODUCTS = 'PRODUCTS',
    PROFILE = 'PROFILE',
    USER_DETAIL = 'USER_DETAIL'
}

export interface Shipment {
    id: string;
    name: string;
    status: 'In Transit' | 'Completed' | 'Pending' | 'Ready';
    deadline: string;
    timeSpent: string;
    location: string;
    progress: number;
    weight: number;
    itemsCount: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    clearance: string;
    avatar: string;
}
