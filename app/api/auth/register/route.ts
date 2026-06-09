import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const { username, password, email } = await request.json();

    if (!username || !password || !email) {
      return NextResponse.json({
        success: false,
        error: '请填写完整信息',
      }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({
        success: false,
        error: '用户名至少需要3个字符',
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: '密码至少需要6个字符',
      }, { status: 400 });
    }

    if (!email.includes('@')) {
      return NextResponse.json({
        success: false,
        error: '请输入有效的邮箱地址',
      }, { status: 400 });
    }

    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: '用户名或邮箱已存在',
      }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { user },
      message: '注册成功！',
    });
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
    }, { status: 500 });
  }
}