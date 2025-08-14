import { Menu } from 'lucide-react'
import React from 'react'

function Header({user}:{user:any}) {

    return (
        <div className="bg-black p-5 text-white flex justify-between items-center">
            <h1 className="text-white text-2xl font-bold!">S . H . E . Y</h1>

            <div className="flex gap-5">
                <h1 className="text-sm!">{user?.name}</h1>

                <Menu className="text-orange-500 cursor-pointer" size={15} /> 
            </div>
        </div>
    )
}

export default Header
