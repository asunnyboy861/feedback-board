# Cloudflare 反馈系统部署指南

## 前置准备

1. 注册并登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 安装 Node.js (建议 16.x 或更高版本)
3. 安装 Wrangler CLI

## 步骤一：安装 Wrangler CLI

```bash
npm install -g wrangler
```

## 步骤二：登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器，让你授权 Wrangler 访问你的 Cloudflare 账户。

## 步骤三：创建 D1 数据库

```bash
wrangler d1 create feedback-db
```

执行后会显示类似以下信息：

```
✅ Successfully created DB 'feedback-db'

[[d1_databases]]
binding = "DB"
database_name = "feedback-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**重要：** 记下 `database_id`，需要在下一步使用。

## 步骤四：配置 wrangler.toml

打开 `wrangler.toml` 文件，将 `YOUR_DATABASE_ID` 替换为上一步获取的 database_id：

```toml
[[d1_databases]]
binding = "DB"
database_name = "feedback-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 替换为实际的 database_id
```

## 步骤五：初始化数据库表

创建数据库表：

```bash
wrangler d1 execute feedback-db --remote --command="CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  app_name TEXT NOT NULL,
  country TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);"
```

## 步骤六：部署 Worker

在项目目录下执行：

```bash
npm install
wrangler deploy
```

部署成功后会显示：

```
✨ Successfully published your Worker to
  https://feedback-board.your-subdomain.workers.dev
```

**重要：** 记下这个 URL，这是你的 Worker 地址。

## 步骤七：访问留言板

在浏览器中打开：
```
https://feedback-board.your-subdomain.workers.dev
```

你会看到留言板页面，显示所有用户反馈。

## API 使用说明

### 提交反馈

**请求：**
```bash
POST /api/feedback
Content-Type: application/json

{
  "name": "用户姓名",
  "email": "user@example.com",
  "subject": "反馈主题",
  "message": "反馈内容",
  "app_name": "软件名称"
}
```

**响应：**
```json
{
  "success": true,
  "id": 1
}
```

### 获取所有反馈

**请求：**
```bash
GET /api/feedback
```

**响应：**
```json
[
  {
    "id": 1,
    "name": "用户姓名",
    "email": "user@example.com",
    "subject": "反馈主题",
    "message": "反馈内容",
    "app_name": "软件名称",
    "country": "CN",
    "ip_address": "1.2.3.4",
    "created_at": "2024-01-01 12:00:00"
  }
]
```

## 客户端集成示例

### Python 示例

```python
from client_example import FeedbackClient

client = FeedbackClient("https://feedback-board.your-subdomain.workers.dev")

result = client.submit_feedback(
    name="张三",
    email="zhangsan@example.com",
    subject="功能建议",
    message="希望能增加导出功能",
    app_name="我的软件"
)

print(result)
```

### JavaScript 示例

```javascript
import { FeedbackClient } from './client_example.js';

const client = new FeedbackClient('https://feedback-board.your-subdomain.workers.dev');

const result = await client.submitFeedback(
    '张三',
    'zhangsan@example.com',
    '功能建议',
    '希望能增加导出功能',
    '我的软件'
);

console.log(result);
```

## 常见问题

### 1. 部署失败

确保：
- 已正确安装 Node.js 和 Wrangler
- 已执行 `wrangler login` 登录
- wrangler.toml 中的 database_id 正确

### 2. 数据库连接失败

检查：
- D1 数据库是否已创建
- wrangler.toml 中的 database_id 是否正确
- 数据库表是否已创建

### 3. CORS 错误

Worker 已配置 CORS 支持，如果仍有问题，检查：
- 请求的 Content-Type 是否为 application/json
- Worker URL 是否正确

### 4. 无法获取 IP 和国家信息

确保：
- 请求通过 Cloudflare 代理
- Worker 部署在 Cloudflare Workers 上

## 本地开发

如果需要本地测试：

```bash
wrangler dev
```

然后在浏览器访问：
```
http://localhost:8787
```

## 更新部署

修改代码后，重新部署：

```bash
wrangler deploy
```

## 查看数据库内容

```bash
wrangler d1 execute feedback-db --remote --command="SELECT * FROM feedback ORDER BY created_at DESC LIMIT 10;"
```

## 清空数据库

```bash
wrangler d1 execute feedback-db --remote --command="DELETE FROM feedback;"
```

## 注意事项

1. **免费额度：** Cloudflare Workers 和 D1 都有免费额度，适合小规模使用
2. **数据安全：** 建议定期备份数据库
3. **访问控制：** 当前版本无需登录即可查看，如需添加访问控制，请修改 worker.js
4. **IP 和国家信息：** 自动从请求头获取，无需额外配置

## 项目文件说明

- `worker.js` - Worker 主文件，包含 API 和前端页面
- `wrangler.toml` - Wrangler 配置文件
- `package.json` - Node.js 依赖配置
- `index.html` - 前端留言板页面（独立版本）
- `client_example.py` - Python 客户端示例
- `client_example.js` - JavaScript 客户端示例
- `DEPLOYMENT.md` - 本部署指南

## 技术支持

如有问题，请检查：
1. Cloudflare Dashboard 中的 Workers 和 D1 状态
2. Wrangler 日志输出
3. 浏览器控制台错误信息
