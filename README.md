This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



## Docker 部署

### 1. 构建镜像

```bash
docker build --no-cache -t upload_next:latest .
```

### 2. 导出/导入镜像（可选）

```bash
# 导出
docker save upload_next:latest -o upload_next.tar

# 导入
docker load -i /home/jy/upload_next.tar
```

### 3. 配置

修改 [nginx.conf](nginx.conf) 中的后端容器名称为实际后端容器名：

```nginx
location /api/ {
    proxy_pass http://你的后端容器名:5000;
    ...
}
location /socket.io/ {
    proxy_pass http://你的后端容器名:5000;
    ...
}
```

### 4. 运行容器

确保前后端容器在同一 Docker 网络中：

```bash
# 方式一：使用已有网络（如 1panel-network）
docker run -d \
  --name next-frontend \
  --network 1panel-network \
  -p 7690:80 \
  upload_next:latest

# 方式二：创建新网络
docker network create mynet
docker network connect mynet 你的后端容器名
docker run -d \
  --name next-frontend \
  --network mynet \
  -p 7690:80 \
  upload_next:latest
```

### 5. 访问

部署完成后访问：`http://<服务器IP>:7690`
