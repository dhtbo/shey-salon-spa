import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token');
    const role = req.cookies.get('role');
    const url = req.nextUrl.clone();
    const isPrivateRoute = req.nextUrl.pathname.startsWith('/user') || req.nextUrl.pathname.startsWith('/admin');

    // 如果是私有路由，且没有token，重定向到登录页
    if (isPrivateRoute && !token) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
    } 

    // 如果不是私有路由，且有token和role，重定向到用户首页
    if ( !isPrivateRoute && token && role) {

        url.pathname = `/${role}/dashboard`;
        return NextResponse.redirect(url);
    }

    // 其他情况，继续请求
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next|static|favicon.ico).*)'], // 匹配所有路径，排除api、_next、static和favicon.ico
};