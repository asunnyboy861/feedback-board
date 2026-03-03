# 留言板系统 - 邮件通知功能

一个基于 Cloudflare Workers 和 D1 数据库的用户反馈留言板系统，支持邮件通知功能。

## 功能特性

- ✅ 用户反馈提交和展示
- ✅ 实时留言板界面
- ✅ 新消息邮件通知
- ✅ 多软件支持
- ✅ 地理位置记录
- ✅ 响应式设计

## 技术栈

- **后端**: Cloudflare Workers
- **数据库**: Cloudflare D1
- **邮件服务**: Resend API
- **前端**: 原生 HTML/CSS/JavaScript

## 项目结构

```
留言板/
├── worker.js              # Cloudflare Worker 主文件
├── wrangler.toml          # Cloudflare 配置文件
├── index.html             # 留言板前端界面
├── EMAIL_SETUP.md         # 邮件配置文档
├── DEPLOYMENT.md          # 部署文档
├── EMAIL_FEATURE.md       # 邮件功能文档
└── FRONTEND_INTEGRATION.md # 前端集成文档
```

## 快速开始

### 1. 环境配置

在 `wrangler.toml` 中配置环境变量：

```toml
[vars]
RESEND_API_KEY = "your_resend_api_key"
NOTIFICATION_EMAIL = "your_email@example.com"
FROM_EMAIL = "noreply@yourdomain.com"
```

### 2. 部署到 Cloudflare

```bash
wrangler deploy
```

### 3. 访问留言板

部署成功后，访问 Cloudflare 提供的 Worker URL 即可查看留言板。

## API 端点

### 主要端点

- `POST /api/feedback` - 提交反馈
- `GET /api/feedback` - 获取所有反馈
- `GET /` - 留言板界面

### 调试端点

- `GET /debug` - 检查环境变量配置
- `POST /test-feedback` - 测试邮件发送功能

## 前端集成

### 提交反馈

```javascript
const response = await fetch('https://your-worker.workers.dev/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: '用户姓名',
    email: 'user@example.com',
    subject: '反馈主题',
    message: '反馈内容',
    app_name: '软件名称'
  })
});

const result = await response.json();
console.log(result);
```

## 邮件通知功能

### 功能说明

当用户提交反馈时，系统会自动发送邮件通知到配置的邮箱地址。

### 邮件模板

邮件包含以下信息：
- 反馈主题和内容
- 用户信息（姓名、邮箱）
- 软件名称
- 地理位置（国家、IP地址）
- 提交时间
- 反馈 ID

### 配置要求

1. **Resend API Key**
   - 在 [Resend](https://resend.com) 注册账号
   - 创建 API Key
   - 验证发送域名

2. **环境变量**
   - `RESEND_API_KEY`: Resend API 密钥
   - `NOTIFICATION_EMAIL`: 接收通知的邮箱地址
   - `FROM_EMAIL`: 发件人邮箱地址（必须是已验证的域名）

## 故障排除

### 邮件未发送

**问题**: 反馈提交成功但未收到邮件

**解决方案**:
1. 检查环境变量是否正确配置
2. 访问 `/debug` 端点验证配置
3. 检查 Resend API Key 是否有效
4. 确认发件人域名已在 Resend 中验证

### 部署失败

**问题**: `wrangler deploy` 失败

**解决方案**:
1. 检查网络连接
2. 确认 Cloudflare 账户状态
3. 验证 wrangler.toml 配置格式

### 数据库错误

**问题**: 反馈提交失败

**解决方案**:
1. 检查 D1 数据库绑定
2. 确认数据库 ID 正确
3. 验证数据库表结构

## 常见问题

### Q: 如何修改邮件模板？

A: 编辑 `worker.js` 中的 `generateEmailTemplate` 函数。

### Q: 如何添加更多软件？

A: 在前端提交反馈时，在 `app_name` 字段指定软件名称即可。

### Q: 如何查看实时日志？

A: 使用 `wrangler tail` 命令查看 Worker 实时日志。

### Q: 邮件发送失败怎么办？

A: 
1. 访问 `/debug` 端点检查环境变量
2. 使用 `/test-feedback` 端点测试邮件发送
3. 查看 Resend 后台的发送记录

### Q: 如何限制邮件发送频率？

A: 可以在 Worker 中添加速率限制逻辑，或使用 Cloudflare 的速率限制功能。

## 开发说明

### 本地开发

```bash
# 安装依赖
npm install

# 本地测试
wrangler dev

# 部署到生产环境
wrangler deploy
```

### 数据库管理

```bash
# 创建数据库
wrangler d1 create feedback_db

# 执行 SQL
wrangler d1 execute feedback_db --file=./schema.sql

# 查询数据库
wrangler d1 execute feedback_db --command="SELECT * FROM feedback"
```

## 安全建议

1. **不要在代码中硬编码敏感信息**
   - 使用环境变量存储 API 密钥
   - 不要将 wrangler.toml 提交到公共仓库

2. **使用 Secrets 存储敏感信息**
   ```bash
   wrangler secret put RESEND_API_KEY
   ```

3. **启用 CORS 保护**
   - 根据需要限制允许的域名

4. **实施速率限制**
   - 防止垃圾邮件和滥用

## 更新日志

### v1.0.0 (2026-03-03)
- ✅ 初始版本发布
- ✅ 用户反馈提交功能
- ✅ 实时留言板界面
- ✅ 邮件通知功能
- ✅ 多软件支持
- ✅ 地理位置记录

## 技术支持

如遇到问题，请检查：
1. Cloudflare Workers 日志
2. Resend API 发送记录
3. 浏览器控制台错误
4. 网络连接状态

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
