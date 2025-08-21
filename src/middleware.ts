import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function base64UrlDecode(input: string): string {
	// 将 base64url 转为标准 base64，并补齐 padding
	let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
	const pad = base64.length % 4;
	if (pad) base64 += '='.repeat(4 - pad);
	const decoded = atob(base64);
	try {
		// 尝试处理可能的 UTF-8 文本
		return decodeURIComponent(
			Array.from(decoded)
				.map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
				.join('')
		);
	} catch {
		return decoded;
	}
}

function isJwtExpired(token: string | undefined | null): boolean {
	if (!token) return true;
	try {
		const parts = token.split('.');
		if (parts.length < 2) return true;
		const payloadRaw = base64UrlDecode(parts[1]);
		const payload = JSON.parse(payloadRaw) as { exp?: number };
		if (!payload.exp) return true;
		const nowInSeconds = Math.floor(Date.now() / 1000);
		return nowInSeconds >= payload.exp;
	} catch {
		return true;
	}
}

export function middleware(req: NextRequest) {
	const tokenCookie = req.cookies.get('token');
	const roleCookie = req.cookies.get('role');
	const token = tokenCookie?.value;
	const role = roleCookie?.value;
	const url = req.nextUrl.clone();
	const isPrivateRoute = req.nextUrl.pathname.startsWith('/user') || req.nextUrl.pathname.startsWith('/admin');

	const tokenExpired = isJwtExpired(token);

	// 私有路由：无 token 或 token 过期 => 清除 cookie 并跳转登录
	if (isPrivateRoute && (!token || tokenExpired)) {
		url.pathname = '/login';
		const res = NextResponse.redirect(url);
		res.cookies.set('token', '', { path: '/', maxAge: 0 });
		res.cookies.set('role', '', { path: '/', maxAge: 0 });
		return res;
	}

	// 公共路由：仅在 token 存在且未过期时，根据角色跳转到各自首页
	if (!isPrivateRoute && token && role && !tokenExpired) {
		url.pathname = `/${role}/dashboard`;
		return NextResponse.redirect(url);
	}

	// 其他情况，继续请求
	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next|static|favicon.ico).*)'], // 匹配所有路径，排除api、_next、static和favicon.ico
};