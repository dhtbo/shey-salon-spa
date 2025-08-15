export interface IUser {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ISaon_Spa {
    id: number;
    name: string;
    description: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    working_days: string[];
    start_time: string;
    end_time: string;
    break_start_time: string;
    break_end_time: string;
    min_service_price: number;
    max_service_price: number;
    slot_duration: number; // in minute
    max_booking_per_slot: number;
    location_name: string;
    latitude: number;
    longitude: number;
}