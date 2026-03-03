# 邮件通知配置指南

本文档详细说明如何配置反馈系统的邮件通知功能。

## 概述

反馈系统支持在新用户提交反馈时，自动发送邮件通知到指定邮箱。使用 Resend API 实现邮件发送，具有以下特点：

- ✅ 免费额度充足（3000 封/月）
- ✅ API 简单易用
- ✅ 支持精美 HTML 邮件模板
- ✅ 高可靠性，送达率高
- ✅ 与 Cloudflare Workers 完美集成

## 快速开始

### 步骤一：注册 Resend 账户

1. 访问 [Resend 官网](https://resend.com/)
2. 点击 "Sign Up" 注册账户
3. 验证邮箱地址
4. 登录 Dashboard

### 步骤二：获取 API Key

1. 在 Resend Dashboard 中，点击左侧菜单 "API Keys"
2. 点击 "Create API Key"
3. 给 API Key 命名（例如：Feedback System）
4. 选择权限（建议选择 "Full Access"）
5. 复制生成的 API Key（格式：`re_xxxxxxxxxxxxxx`）

**重要：** API Key 只会显示一次，请妥善保存！

### 步骤三：配置环境变量

在 Cloudflare Dashboard 中配置环境变量：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择你的 Worker 项目
3. 点击 "Settings" 标签
4. 点击 "Variables and Secrets"
5. 点击 "Add variable" 添加以下变量：

#### 必需变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxx` | Resend API 密钥 |
| `NOTIFICATION_EMAIL` | `Carl@zzoutuo.com` | 接收通知的邮箱地址 |

#### 可选变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `FROM_EMAIL` | `noreply@yourdomain.com` | 发件人邮箱（默认：`noreply@yourdomain.com`） |

### 步骤四：验证发件人域名（推荐）

如果使用自定义域名作为发件人邮箱，需要在 Resend 中验证域名：

1. 在 Resend Dashboard 中，点击 "Domains"
2. 点击 "Add Domain"
3. 输入你的域名（例如：`yourdomain.com`）
4. 点击 "Add"

Resend 会提供 DNS 记录配置信息：

```
Type: TXT
Name: _dmarc.yourdomain.com
Value: v=DMARC1; p=none

Type: TXT
Name: resend._domainkey.yourdomain.com
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...

Type: TXT
Name: yourdomain.com
Value: v=spf1 include:resend.com ~all
```

5. 登录你的域名 DNS 管理面板
6. 添加上述 DNS 记录
7. 等待 DNS 传播（通常 5-10 分钟）
8. 在 Resend Dashboard 中点击 "Verify"

### 步骤五：重新部署 Worker

配置完成后，重新部署 Worker：

```bash
wrangler deploy
```

## 邮件模板样式

系统使用精美的 HTML 邮件模板，包含以下元素：

- 🎨 渐变色头部设计
- 📧 清晰的反馈内容展示
- 📋 详细的反馈信息表格
- 🌍 地理位置（国家、IP）
- ⏰ 提交时间
- 🔗 可点击的邮箱链接

### 邮件主题格式

```
📧 新反馈：[软件名称] - [反馈主题]
```

### 邮件内容包含

- 反馈主题
- 反馈内容
- 软件名称
- 用户姓名
- 用户邮箱（可点击）
- 国家/地区
- IP 地址
- 提交时间
- 反馈 ID

## 测试邮件功能

### 方法一：提交测试反馈

1. 访问你的反馈系统前端页面
2. 填写测试反馈信息
3. 提交反馈
4. 检查 `Carl@zzoutuo.com` 邮箱是否收到邮件

### 方法二：使用 API 测试

```bash
curl -X POST https://your-worker.workers.dev/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "email": "test@example.com",
    "subject": "测试邮件通知",
    "message": "这是一条测试反馈，用于验证邮件通知功能。",
    "app_name": "测试软件"
  }'
```

### 方法三：查看 Worker 日志

在 Cloudflare Dashboard 中查看 Worker 日志：

1. 进入 Worker 详情页
2. 点击 "Logs" 标签
3. 查看是否有邮件发送相关的日志

## 故障排查

### 问题 1：未收到邮件

**可能原因：**
- 环境变量未配置
- API Key 无效
- 收件人邮箱错误

**解决方案：**
1. 检查 Cloudflare Dashboard 中的环境变量配置
2. 验证 Resend API Key 是否有效
3. 确认收件人邮箱地址正确
4. 查看 Worker 日志中的错误信息

### 问题 2：邮件发送失败

**可能原因：**
- Resend API 调用失败
- 超出免费额度
- 网络问题

**解决方案：**
1. 检查 Resend Dashboard 中的使用情况
2. 查看 Worker 日志中的详细错误
3. 确认网络连接正常
4. 尝试重新部署 Worker

### 问题 3：邮件被标记为垃圾邮件

**可能原因：**
- 发件人域名未验证
- DNS 记录配置不正确
- 邮件内容被误判

**解决方案：**
1. 在 Resend 中验证发件人域名
2. 配置完整的 SPF、DKIM、DMARC 记录
3. 使用专业的发件人邮箱地址
4. 将发件人邮箱添加到白名单

### 问题 4：API Key 权限不足

**可能原因：**
- API Key 权限设置错误
- API Key 已过期

**解决方案：**
1. 在 Resend Dashboard 中重新生成 API Key
2. 确保选择 "Full Access" 权限
3. 更新 Cloudflare 环境变量
4. 重新部署 Worker

## 高级配置

### 配置多个收件人

如果需要发送到多个邮箱，可以修改 `worker.js` 中的代码：

```javascript
to: env.NOTIFICATION_EMAIL.split(',').map(email => email.trim()),
```

然后在环境变量中配置：

```
NOTIFICATION_EMAIL = "email1@example.com,email2@example.com,email3@example.com"
```

### 自定义邮件模板

如需自定义邮件模板，修改 `worker.js` 中的 `generateEmailTemplate` 函数。

### 添加邮件发送状态记录

可以在数据库中添加字段记录邮件发送状态：

```sql
ALTER TABLE feedback ADD COLUMN email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE feedback ADD COLUMN email_sent_at DATETIME;
```

## 成本说明

### Resend 免费额度

- **免费计划：** 3000 封邮件/月
- **超出后：** $1.00 / 1000 封邮件

### Cloudflare Workers 免费额度

- **免费计划：** 100,000 请求/天
- **超出后：** $5.00 / 1000 万请求

### 预估成本

假设每天收到 100 条反馈：

- **邮件发送：** 3000 封/月（免费额度内）
- **Worker 请求：** 3000 请求/月（免费额度内）

**总成本：** $0/月

## 安全建议

1. **保护 API Key**
   - 不要将 API Key 提交到版本控制
   - 使用环境变量存储敏感信息
   - 定期轮换 API Key

2. **限制发件人域名**
   - 只在 Resend 中验证可信域名
   - 不要使用免费邮箱作为发件人

3. **监控使用情况**
   - 定期检查 Resend Dashboard
   - 设置使用量告警
   - 监控 Worker 日志

## 相关链接

- [Resend 官网](https://resend.com/)
- [Resend API 文档](https://resend.com/docs/api-reference/emails/send-email)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)

## 技术支持

如有问题，请：

1. 查看本文档的故障排查部分
2. 检查 Worker 日志
3. 访问 Resend 和 Cloudflare 官方文档
4. 联系技术支持团队
