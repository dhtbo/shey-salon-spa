import { Menu } from 'lucide-react'
import React from 'react'
import MenuItems from './menu-items'
import useUsersGlobalStore, { IUsersGlobalStore } from '@/store/users-global-store'

function Header() {
    const [openMenuItems, setOpenMenuItems] = React.useState(false)
    const {user} = useUsersGlobalStore() as IUsersGlobalStore

    return (
        <div className="bg-black p-5 text-white flex justify-between items-center">
            <h1 className="text-white text-2xl font-bold!">S . H . E . Y</h1>

            <div className="flex gap-5">
                <h1 className="text-sm!">{user?.name}</h1>

                <Menu className="text-orange-500 cursor-pointer" size={15}
                    onClick={() => setOpenMenuItems(true)}
                />
            </div>

            {openMenuItems && (
                <MenuItems
                    openMenuItems={openMenuItems}
                    setOpenMenuItems={setOpenMenuItems}
                />
            )}
        </div>
    )
}

export default Header
