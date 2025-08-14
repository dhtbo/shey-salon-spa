'use client'

import { usePathname } from 'next/navigation'
import React, { use } from 'react'
import PrivateLayout from './private-layout'
import PublicLayout from './public-layout'

function LayoutProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()  // 获取当前路径
    const isPrivate = pathname.startsWith('/user') || pathname.startsWith('/admin')  // 判断是否为私有路径
    // 如果是私有路径，使用 PrivateLayout，否则使用 PublicLayout
    const Layout = isPrivate ? PrivateLayout : PublicLayout
    return (
        <Layout>
            {children}
        </Layout>
    )
}

export default LayoutProvider
