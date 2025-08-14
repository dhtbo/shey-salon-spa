import React from 'react'
import Header from './header'
import Cookies from 'js-cookie'
import { getUserInfo } from '@/actions/users'

function PrivateLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(null)
    const fetchUser = async () => {
        try {
            const token: any = Cookies.get('token')
            const res = await getUserInfo(token)
            if (res.success) {
                setUser(res.data)
            } else {
                setError(res.message)
            }
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }
    React.useEffect(() => {
        fetchUser()
    }, [])

    if (loading) {
        return <div className='flex justify-center items-center h-screen'>
            Loading...
        </div>

    }
    if (error) {
        return <div className='flex justify-center items-center h-screen text-red-500'>
            {error}
        </div>
    }

    return (
        <div>
            <Header user={user} />
            <div className='p-5'>{children}</div>
        </div>
    )
}

export default PrivateLayout
