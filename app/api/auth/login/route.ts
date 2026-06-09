// 使用next.js的api路由处理登录请求
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === 'user' && password === 'password') {
      return NextResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-token-12345',
          user: {
            id: 1,
            username: 'user',
            email: 'user@example.com',
          },
        },
        message: '登录成功',
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '用户名或密码错误',
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '请求参数错误',
    }, { status: 400 });
  }
}
