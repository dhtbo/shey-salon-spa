import React from 'react'
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { IUser } from '@/interfaces'
import { Calendar, Layout, LayoutDashboard, List, User2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import Cookie from 'js-cookie'
import { toast } from 'react-hot-toast'
import useUsersGlobalStore, { IUsersGlobalStore } from '@/store/users-global-store'

interface MenuItemsProps {
    openMenuItems: boolean
    setOpenMenuItems: (open: boolean) => void // 函数 
}

function MenuItems({ openMenuItems, setOpenMenuItems}: MenuItemsProps) {
    const {user} = useUsersGlobalStore() as IUsersGlobalStore

    const pathname = usePathname();
    const router = useRouter();
    const onLogout = () => {
        try {
            Cookie.remove('token')
            Cookie.remove('role')
            router.push('/login')
            toast.success('Logout successfully')
        } catch (error: any) {
            toast.error(error.message)
        }
    }


    let userMenuItems = [
        { title: "Dashboard", path: "/user/dashboard", icon: <LayoutDashboard size={13} /> },
        { title: "Schedule Appointment", path: "/user/schedule-appointment", icon: <Calendar size={13} /> },
        { title: "My Appointments", path: "/user/appointments", icon: <List size={13} /> },
        { title: "Profile", path: `/user/profile`, icon: <User2 size={13} /> },
    ]
    let adminMenuItems = [
        { title: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={13} /> },
        { title: "Salon Spas", path: "/admin/salon-spas", icon: <List size={13} /> },
        { title: "Appointments", path: "/admin/appointments", icon: <Calendar size={13} /> },
        { title: "Settings", path: "/admin/settings", icon: <Layout size={13} /> },
    ]

    const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems

    return (
        <Sheet
            open={openMenuItems}
            onOpenChange={setOpenMenuItems}
        >
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className='flex flex-col gap-7 mt-20 px-7'>
                    {menuItems.map((item) => (
                        <Button key={item.title}
                            className={`w-full justify-start rounded-md cursor-pointer ${pathname === item.path ? 'bg-orange-200 border border-gray-200' : ''}`}
                            variant='link'
                            onClick={() => {
                                router.push(item.path)
                                setOpenMenuItems(false)
                            }}>

                            <div className='flex items-center gap-5'>
                                {item.icon}
                                <span>{item.title}</span>
                            </div>

                        </Button>
                    ))}
                    <Button className='w-full justify-start rounded-md cursor-pointer'
                        onClick={onLogout}>
                        Logout
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
export default MenuItems

