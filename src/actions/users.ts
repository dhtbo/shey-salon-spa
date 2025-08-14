'use server'
import supabase from "@/config/supabase-config"
import bcrypt from "bcryptjs";
import { success } from "zod";
import { is } from "zod/locales";
import jwt from 'jsonwebtoken';


// 用户注册函数
export const registerUser = async ({ name, email, password, role }: {
    name: string;
    email: string;
    password: string;
    role: string;
}) => {
    try {
        // 检查用户是否存在
        const { data, error } = await supabase.from('user_profiles').select('email').eq('email', email)

        if (data && data.length > 0) {
            return {
                success: false,
                message: '用户已存在',
            }

        }

        // hash密码
        const hashedPassword = await bcrypt.hashSync(password, 10);
        
        // 构建新用户对象
        const newUserObj = {
            name: name,
            email: email,
            password: hashedPassword,
            role: role,
            is_active: true,
        }

        // 插入新用户
        const { data: userData, error: insertError } = await supabase.from('user_profiles').insert([newUserObj]);
        if (insertError) {
            return {
                success: false,
                message: insertError.message,
            }
        }

        // 返回成功信息
        return {
            success: true,
            message: '用户注册成功',
            // data: userData,
        }




    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        }
    }
}

// 用户登录函数
export const loginUser = async ({ email, password, role }: {
    email: string;
    password: string;
    role: string;
}) => {
    try {
        // 检查用户是否存在
        const { data, error } = await supabase.from('user_profiles').select('*').eq('email', email).single();

        if (error || !data) {
            return {
                success: false,
                message: '用户不存在',
            }
        }
        // 检查用户角色
        if (data.role !== role) {
            return {
                success: false,
                message: '角色错误',
            }
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, data.password);
        if (!isPasswordValid) {
            return {
                success: false,
                message: '密码错误',
            }
        }

        // 生成 JWT token
        const token = jwt.sign({ userId: data.id, role: data.role }, process.env.JWT_SECRET || '', {
            expiresIn: '1d',
        });

        // 返回成功信息
        return {
            success: true,
            message: '登录成功',
            data: token,
        }

    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        }
    }
}

// 获取用户信息函数
export const getUserInfo = async (token: string) => {
    try {
        // 从 token 中提取 userId
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
        const userId = (decoded as { userId: string }).userId;

        // 查询用户信息
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            return {
                success: false,
                message: error.message,
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        };
    }
}

