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

export interface ISalon_Spa {
    id: number;
    owner_id: number;
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
    max_bookings_per_slot: number;
    location_name: string;
    latitude: number;
    longitude: number;
    created_at: string;
    updated_at: string;
    offer_status: string;
}

export interface IAppointment {
    id: number;
    user_id: number;
    salon_spa_id: number;
    date: string;
    time: string;
    status: '已预约' | '已完成' | '已取消';
    created_at: string;
    updated_at: string;

    // 运行时属性
    user_data: IUser;
    salon_spa_data: ISalon_Spa;
}
