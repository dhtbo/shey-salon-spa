'use client'
import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from 'next/link'
import { loginUser } from '@/actions/users'
import toast from 'react-hot-toast'
import Cookie from 'js-cookie'
import { useRouter } from 'next/navigation'

function LoginPage() {
    const [loading, setLoading] = React.useState(false)
    const router = useRouter()

    // 定义注册表单验证规则
    const formSchema = z.object({
        email: z.string().min(2).max(50),
        password: z.string().min(2).max(50),
        role: z.enum(["user", "admin"]),
    })

    // 初始化表单
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            role: "user",

        },
    })

    // 表单提交处理
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const res = await loginUser(values)
            if (res.success) {
                toast.success(res.message)
                Cookie.set('token', res.data || '')
                Cookie.set('role', values.role)  // 设置角色到Cookie
                router.push(`/${values.role}/dashboard`);  // 根据角色跳转页面
            } else {
                toast.error(res.message)
            }
        } catch (error: any) {
            toast.error(error.message)
        }
        setLoading(false)

    }

    return (
        <div className='auth-bg'>
            <div className='bg-white p-5 rounded-sm w-[400px] '>
                <h1 className='text-xl font-bold! text-gray-600'>登录您的账户</h1>
                <hr className='my-7 border-t border-gray-300' />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* 邮箱字段 */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>邮箱</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* 密码字段 */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>密码</FormLabel>
                                    <FormControl>
                                        <Input placeholder=""
                                            type='password'
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 角色选择字段 */}
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>角色</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex space-x-20"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="user" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    用户
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="admin" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    管理员
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='flex justify-between items-center'>
                            <div className='flex gap-5 text-sm'>
                                还没有账户？
                                <Link href="/register" className='underline'>注册</Link>
                            </div>
                            <Button disabled={loading} type="submit">登录</Button>
                        </div>
                    </form>
                </Form>
            </div>

        </div>
    )
}

export default LoginPage
