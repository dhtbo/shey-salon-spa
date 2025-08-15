import { IUser } from '@/interfaces'
import { create } from 'zustand'

const useUsersGlobalStore = create((set) => ({
    user: null,
    setUser: (user: IUser) => set({ user }),

}))

export default useUsersGlobalStore

export interface IUsersGlobalStore {
    user: IUser | null
    setUser: (user: IUser) => void
}
