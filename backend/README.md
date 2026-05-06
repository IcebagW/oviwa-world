# 🌍 Oviwa World - 完整认证系统实现指南

## 📋 系统架构

```
客户端 (Vue 3)
    ↓
API 请求 (Axios)
    ↓
后端服务器 (Node.js + Express)
    ↓
数据库 (MongoDB)
```

## 🚀 快速开始

### 1️⃣ 安装 MongoDB

#### 方案 A：直接安装（推荐）

**Linux（Ubuntu/Debian）:**
```bash
# 1. 导入 MongoDB 公钥
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# 2. 添加 MongoDB 仓库
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 3. 安装
sudo apt-get update
sudo apt-get install -y mongodb-org

# 4. 启动服务
sudo systemctl start mongod

# 5. 验证
mongosh
```

**Mac（Homebrew）:**
```bash
# 1. 安装
brew tap mongodb/brew
brew install mongodb-community

# 2. 启动
brew services start mongodb-community

# 3. 验证
mongosh
```

**Windows：**
```
1. 访问 https://www.mongodb.com/try/download/community
2. 下载 MSI 安装程序
3. 运行安装程序，勾选 "Install MongoDB as a Service"
4. 在 CMD 中运行: mongosh
```

#### 方案 B：Docker（如果不想本地安装）
```bash
docker run -d --name mongodb -p 27017:27017 mongodb/mongodb-community-server:latest
```

### 2️⃣ 设置后端服务器

```bash
cd /root/oviwa-world-backend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

服务器将运行在 `http://localhost:5000`

### 3️⃣ 设置前端项目

```bash
cd /root/oviwa-world

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 `http://localhost:5173`

## 🔐 认证流程

### 用户注册
```
用户输入: 用户名 + 邮箱 + 密码
    ↓
前端验证 (密码长度、格式等)
    ↓
发送 POST /api/auth/register
    ↓
后端验证 (邮箱唯一性、用户名唯一性)
    ↓
密码使用 bcryptjs 加密
    ↓
保存到 MongoDB
    ↓
生成 JWT 令牌 (7天有效期)
    ↓
前端保存令牌到 localStorage
    ↓
自动跳转到首页
```

### 用户登录
```
用户输入: 用户名 + 密码
    ↓
发送 POST /api/auth/login
    ↓
后端查询用户
    ↓
使用 bcryptjs 验证密码
    ↓
生成 JWT 令牌
    ↓
前端保存令牌
    ↓
发送受保护的请求时自动添加令牌
```

### 受保护的请求
```
请求 /api/auth/me
    ↓
自动在 Authorization header 中添加令牌
    ↓
后端验证令牌有效性
    ↓
返回用户信息或 401 错误
```

## 🔧 关键文件说明

### 后端

| 文件 | 用途 |
|------|------|
| `server.js` | 主应用文件，配置 Express 和 MongoDB |
| `models/User.js` | 用户数据模型，定义密码加密逻辑 |
| `routes/auth.js` | 认证相关的 API 端点 |
| `middleware/auth.js` | JWT 令牌生成和验证逻辑 |

### 前端

| 文件 | 用途 |
|------|------|
| `src/api/client.js` | Axios 实例，配置请求拦截器 |
| `src/store/user.js` | Pinia store，管理用户状态 |
| `src/router/index.js` | 路由配置和守卫 |
| `src/views/Login.vue` | 登录页面组件 |
| `src/views/Register.vue` | 注册页面组件 |

## 🔒 安全特性

### ✅ 已实现
- ✔️ 密码使用 bcryptjs 加密存储
- ✔️ JWT 令牌认证（7天过期）
- ✔️ CORS 跨域配置
- ✔️ 请求拦截器自动添加认证令牌
- ✔️ 路由守卫保护未认证访问
- ✔️ 邮箱和用户名唯一性验证
- ✔️ 密码长度最小限制

### 📌 生产环境建议

```javascript
// 修改 .env 文件

// 1. 更改 JWT_SECRET 为强密钥
JWT_SECRET=your-very-long-and-random-secret-key-at-least-32-characters

// 2. 更新 CORS 源
// 在 server.js 中：
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}))

// 3. 启用 HTTPS
// 使用 SSL 证书部署

// 4. 添加 helmet.js 保护 HTTP 头
// npm install helmet
import helmet from 'helmet'
app.use(helmet())

// 5. 添加速率限制防止暴力破解
// npm install express-rate-limit
import rateLimit from 'express-rate-limit'
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
}))
```

## 🐛 常见问题

### Q: 前端连接不到后端
**A:** 检查以下几点
- 后端服务器是否运行在 `localhost:5000`
- 前端 `src/api/client.js` 中的 `API_BASE_URL` 是否正确
- 防火墙是否允许 5000 端口

### Q: MongoDB 连接失败
**A:**
- 检查 MongoDB 是否启动：`mongosh`
- 确认 `.env` 中的 MONGODB_URI 正确
- 如果使用 Docker，检查容器是否运行：`docker ps`

### Q: JWT 令牌过期怎么办？
**A:** 当令牌过期时，API 响应拦截器会捕获 401 错误，自动清除令牌并重定向到登录页

### Q: 如何修改令牌过期时间？
**A:** 在 `middleware/auth.js` 中修改：
```javascript
expiresIn: '7d'  // 改为 '30d', '1h' 等
```

## 📊 API 文档

### 注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response:
{
  "message": "注册成功",
  "token": "eyJhbGc...",
  "user": {
    "id": "64f...",
    "username": "user123",
    "email": "user@example.com"
  }
}
```

### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "user123",
  "password": "password123"
}

Response:
{
  "message": "登录成功",
  "token": "eyJhbGc...",
  "user": {
    "id": "64f...",
    "username": "user123",
    "email": "user@example.com"
  }
}
```

### 获取当前用户
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "_id": "64f...",
  "username": "user123",
  "email": "user@example.com",
  "createdAt": "2024-...",
  "updatedAt": "2024-..."
}
```

## 🎯 下一步改进建议

1. **邮箱验证** - 发送验证邮件确认用户身份
2. **忘记密码** - 实现密码重置功能
3. **社交登录** - 集成 Google/GitHub OAuth
4. **用户资料** - 添加头像、昵称、简介等字段
5. **刷新令牌** - 实现令牌刷新机制延长会话
6. **两步验证** - 提高账户安全性
7. **审计日志** - 记录登录历史

## 📚 相关资源

- MongoDB 文档: https://docs.mongodb.com/
- Express.js: https://expressjs.com/
- Vue 3: https://vuejs.org/
- JWT: https://jwt.io/
- bcryptjs: https://github.com/dcodeIO/bcrypt.js

---

✨ 现在你有了一个安全的、生产就绪的认证系统！
