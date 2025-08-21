'use client'
import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from 'next/link'
import toast from 'react-hot-toast'
import { registerUser } from "@/actions/users"
import { useRouter } from 'next/navigation'

function RegisterPage() {
    const [loading, setLoading] = React.useState(false)
    const router = useRouter()
    // 定义注册表单验证规则
    const formSchema = z.object({
        name: z.string().min(2, '用户名至少2个字符').max(50, '用户名最多50个字符'),
        email: z.string().email('请输入有效的邮箱地址'),
        password: z.string().min(6, '密码至少6个字符').max(50, '密码最多50个字符'),
        confirmPassword: z.string(),
        role: z.enum(["user", "admin"]),
    }).refine(data => data.password === data.confirmPassword, {
        message: "两次输入的密码不一致",
        path: ["confirmPassword"],
    })

    // 初始化表单
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "user",
        },
    })

    // 表单提交处理
    async function onSubmit(values: z.infer<typeof formSchema>) {

        try {
            setLoading(true)
            const response = await registerUser(values)
            if (response.success) {
                toast.success('注册成功')
                router.push('/login')
            } else {
                toast.error(response.message || '注册失败，请稍后再试')
            }
        } catch (error:any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='auth-bg'>
            <div className='bg-white p-5 rounded-sm w-[400px] '>
                <h1 className='text-xl font-bold! text-gray-600'>创建新账户</h1>
                <hr className='my-7 border-t border-gray-300' />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* 用户名字段 */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>用户名</FormLabel>
                                    <FormControl>
                                        <Input placeholder="请输入用户名" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 邮箱字段 */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>邮箱</FormLabel>
                                    <FormControl>
                                        <Input placeholder="请输入邮箱" type="email" {...field} />
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
                                        <Input placeholder="请输入密码" type='password' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 确认密码字段 */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>确认密码</FormLabel>
                                    <FormControl>
                                        <Input placeholder="请确认密码" type='password' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 角色选择 */}
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
                                                <FormLabel className="font-normal">用户</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="admin" />
                                                </FormControl>
                                                <FormLabel className="font-normal">管理员</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 提交按钮和登录链接 */}
                        <div className='flex justify-between items-center'>
                            <div className='flex gap-5 text-sm'>
                                已有账户？
                                <Link href="/login" className='underline'>登录</Link>
                            </div>
                            <Button type="submit" disabled={loading}>注册</Button>

                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default RegisterPage