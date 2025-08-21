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
            toast.success('退出登录成功')
        } catch (error: any) {
            toast.error(error.message)
        }
    }


    let userMenuItems = [
        { title: "仪表板", path: "/user/dashboard", icon: <LayoutDashboard size={13} /> },
        { title: "预约服务", path: "/user/schedule-appointment", icon: <Calendar size={13} /> },
        { title: "我的预约", path: "/user/appointments", icon: <List size={13} /> },
        { title: "个人资料", path: `/user/profile`, icon: <User2 size={13} /> },
    ]
    let adminMenuItems = [
        { title: "仪表板", path: "/admin/dashboard", icon: <LayoutDashboard size={13} /> },
        { title: "沙龙管理", path: "/admin/salon-spas", icon: <List size={13} /> },
        { title: "预约管理", path: "/admin/appointments", icon: <Calendar size={13} /> },
        { title: "系统设置", path: "/admin/settings", icon: <Layout size={13} /> },
    ]

    const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems

    return (
        <Sheet
            open={openMenuItems}
            onOpenChange={setOpenMenuItems}
        >
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>菜单</SheetTitle>
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
                        退出登录
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
export default MenuItems

