'use server'

import supabase from "@/config/supabase-config"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'

// 更新用户个人信息
export const updateUserProfile = async (userId: number, data: {
    name?: string
    email?: string
    currentPassword?: string
    newPassword?: string
}) => {
    try {
        // 如果要更新密码，先验证当前密码
        if (data.newPassword && data.currentPassword) {
            const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('password')
                .eq('id', userId)
                .single()

            if (userError || !userData) {
                return {
                    success: false,
                    message: '用户不存在'
                }
            }

            const isPasswordValid = await bcrypt.compare(data.currentPassword, userData.password)
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: '当前密码错误'
                }
            }
        }

        // 构建更新对象
        const updateData: any = {}
        
        if (data.name) updateData.name = data.name
        if (data.email) updateData.email = data.email
        if (data.newPassword) {
            updateData.password = await bcrypt.hash(data.newPassword, 10)
        }

        // 更新用户信息
        const { data: updatedUser, error: updateError } = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single()

        if (updateError) {
            return {
                success: false,
                message: updateError.message
            }
        }

        return {
            success: true,
            message: '个人信息更新成功',
            data: updatedUser
        }

    } catch (error: any) {
        return {
            success: false,
            message: error.message
        }
    }
}

// 获取系统设置
export const getSystemSettings = async () => {
    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('*')
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 表示没有找到记录
            return {
                success: false,
                message: error.message
            }
        }

        // 如果没有设置记录，返回默认值
        const defaultSettings = {
            site_name: '美容预约系统',
            site_description: '专业的美容沙龙预约管理平台',
            timezone: 'Asia/Shanghai',
            language: 'zh-CN',
            maintenance_mode: false,
            allow_registration: true,
            email_notifications: true,
            sms_notifications: false,
            auto_backup: true,
            backup_frequency: 'daily'
        }

        return {
            success: true,
            data: data || defaultSettings
        }

    } catch (error: any) {
        return {
            success: false,
            message: error.message
        }
    }
}

// 更新系统设置
export const updateSystemSettings = async (settings: {
    siteName?: string
    siteDescription?: string
    timezone?: string
    language?: string
    maintenanceMode?: boolean
    allowRegistration?: boolean
    emailNotifications?: boolean
    smsNotifications?: boolean
    autoBackup?: boolean
    backupFrequency?: string
}) => {
    try {
        // 转换字段名为数据库格式
        const dbSettings = {
            site_name: settings.siteName,
            site_description: settings.siteDescription,
            timezone: settings.timezone,
            language: settings.language,
            maintenance_mode: settings.maintenanceMode,
            allow_registration: settings.allowRegistration,
            email_notifications: settings.emailNotifications,
            sms_notifications: settings.smsNotifications,
            auto_backup: settings.autoBackup,
            backup_frequency: settings.backupFrequency,
            updated_at: new Date().toISOString()
        }

        // 移除 undefined 值
        Object.keys(dbSettings).forEach(key => {
            if (dbSettings[key as keyof typeof dbSettings] === undefined) {
                delete dbSettings[key as keyof typeof dbSettings]
            }
        })

        // 先检查是否存在设置记录
        const { data: existingSettings } = await supabase
            .from('system_settings')
            .select('id')
            .single()

        let result
        if (existingSettings) {
            // 更新现有记录
            result = await supabase
                .from('system_settings')
                .update(dbSettings)
                .eq('id', existingSettings.id)
                .select()
                .single()
        } else {
            // 创建新记录
            result = await supabase
                .from('system_settings')
                .insert([{ ...dbSettings, created_at: new Date().toISOString() }])
                .select()
                .single()
        }

        if (result.error) {
            return {
                success: false,
                message: result.error.message
            }
        }

        return {
            success: true,
            message: '系统设置更新成功',
            data: result.data
        }

    } catch (error: any) {
        return {
            success: false,
            message: error.message
        }
    }
}

// 创建数据备份
export const createDataBackup = async () => {
    try {
        // 这里应该实现实际的备份逻辑
        // 例如：导出数据库、上传到云存储等
        
        // 模拟备份过程
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 记录备份信息
        const backupRecord = {
            backup_name: `backup_${new Date().toISOString().replace(/[:.]/g, '-')}`,
            backup_size: Math.floor(Math.random() * 1000000) + 500000, // 模拟备份大小
            backup_type: 'manual',
            status: 'completed',
            created_at: new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('backup_logs')
            .insert([backupRecord])
            .select()
            .single()

        if (error) {
            return {
                success: false,
                message: error.message
            }
        }

        return {
            success: true,
            message: '数据备份创建成功',
            data: data
        }

    } catch (error: any) {
        return {
            success: false,
            message: error.message
        }
    }
}

// 获取备份历史
export const getBackupHistory = async () => {
    try {
        const { data, error } = await supabase
            .from('backup_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            return {
                success: false,
                message: error.message
            }
        }

        return {
            success: true,
            data: data || []
        }

    } catch (error: any) {
        return {
            success: false,
            message: error.message
        }
    }
}

// 获取登录日志
export const getLoginLogs = async (userId: number, limit: number = 10) => {
    try {
        const { data, error } = await supabase
            .from('login_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            return {
                success: false,
                message: error.message
            }
        }

        return {
            success: true,
            data: data || []
        }

    } catch (error: any) {
        return {
            success: false,
            message: error.message
        }
    }
}

// 记录登录日志
export const logUserLogin = async (userId: number, ipAddress: string, userAgent: string) => {
    try {
        const loginLog = {
            user_id: userId,
            ip_address: ipAddress,
            user_agent: userAgent,
            login_time: new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('login_logs')
            .insert([loginLog])
            .select()
            .single()

        if (error) {
            return {
                success: false,
                message: error.message
            }
        }

        return {
            success: true,
            data: data
        }

    } catch (error: any) {
        return {
            success: false,
            message: error.message
        }
    }
}