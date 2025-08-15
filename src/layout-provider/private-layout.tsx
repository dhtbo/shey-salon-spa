import React from 'react'
import Header from './header'
import Cookies from 'js-cookie'
import { getUserInfo } from '@/actions/users'
import Loader from '@/components/ui/loader'
import ErrorMessage from '@/components/ui/error-message'
import useUsersGlobalStore, { IUsersGlobalStore } from '@/store/users-global-store'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

function PrivateLayout({ children }: { children: React.ReactNode }) {
    const {setUser} = useUsersGlobalStore() as IUsersGlobalStore
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(null)
    const router = useRouter()

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
            Cookies.remove('token')
            Cookies.remove('role')
            toast.error(error.message)
            router.push('/login')
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
            <Loader />
        </div>
    }

    if (error) {
        return <ErrorMessage error={error} />
    }

    return (
        <div>
            <Header />
            <div className='p-5'>{children}</div>
        </div>
    )
}

export default PrivateLayout
