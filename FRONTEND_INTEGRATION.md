# 前端集成指南

本文档说明如何在前端页面中集成反馈功能，直接连接到 Cloudflare Worker 后端。

## 📋 目录

- [快速开始](#快速开始)
- [API 端点](#api-端点)
- [前端集成示例](#前端集成示例)
- [配置说明](#配置说明)
- [常见问题](#常见问题)

## 🚀 快速开始

### 1. 获取 Worker URL

你的 Cloudflare Worker 部署成功后，会得到一个 URL，例如：
```
https://feedback-board.iocompile67692.workers.dev
```

### 2. 在前端页面中引入

将以下代码添加到你的 HTML 页面中：

```html
<script src="feedback-client.js"></script>
```

### 3. 初始化客户端

```javascript
const client = new FeedbackClient('https://feedback-board.iocompile67692.workers.dev');
```

## 🔌 API 端点

### 提交反馈

**端点**：`POST /api/feedback`

**请求头**：
```
Content-Type: application/json
```

**请求体**：
```json
{
  "name": "用户姓名",
  "email": "user@example.com",
  "subject": "反馈主题",
  "message": "反馈内容"
}
```

**注意**：`app_name` 字段由前端代码自动配置，无需用户填写。

**成功响应**：
```json
{
  "success": true,
  "id": 1
}
```

**错误响应**：
```json
{
  "error": "错误信息"
}
```

### 获取所有反馈

**端点**：`GET /api/feedback`

**响应**：
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

### 调试端点（开发测试用）

#### 检查环境变量

**端点**：`GET /debug`

**用途**：检查 Worker 的环境变量配置是否正确

**响应**：
```json
{
  "timestamp": "2026-03-03T07:56:20.173Z",
  "environment": {
    "hasResendApiKey": true,
    "resendApiKeyPrefix": "re_hST9atN...",
    "notificationEmail": "Carl@zzoutuo.com",
    "fromEmail": "softfeedback@soft.calcs.top"
  },
  "database": {
    "binding": true,
    "databaseName": "feedback_db"
  }
}
```

**使用场景**：
- 验证邮件 API 密钥是否正确配置
- 检查数据库绑定状态
- 确认环境变量是否生效

#### 测试邮件发送

**端点**：`POST /test-feedback`

**用途**：测试邮件发送功能是否正常工作

**响应**：
```json
{
  "success": true,
  "id": 17,
  "emailSent": true,
  "emailResult": {
    "id": "5c7f6396-121b-4ada-a85c-6889d1d780ca"
  },
  "emailError": null
}
```

**使用场景**：
- 测试邮件通知功能
- 验证 Resend API 连接
- 排查邮件发送问题

**注意**：此端点会自动创建一条测试反馈并发送邮件，仅供开发测试使用。

## 💻 前端集成示例

### 方案一：使用 JavaScript 客户端库

#### 1. 复制客户端代码

将 `client_example.js` 复制到你的项目中，重命名为 `feedback-client.js`

#### 2. 在 HTML 中引入

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>反馈页面</title>
</head>
<body>
    <h1>用户反馈</h1>
    
    <form id="feedbackForm">
        <div>
            <label>姓名：</label>
            <input type="text" id="name" required>
        </div>
        
        <div>
            <label>邮箱：</label>
            <input type="email" id="email" required>
        </div>
        
        <div>
            <label>主题：</label>
            <input type="text" id="subject" required>
        </div>
        
        <div>
            <label>反馈内容：</label>
            <textarea id="message" required></textarea>
        </div>
        
        <button type="submit">提交反馈</button>
    </form>
    
    <div id="result"></div>
    
    <script src="feedback-client.js"></script>
    <script>
        const WORKER_URL = 'https://feedback-board.iocompile67692.workers.dev';
        const APP_NAME = '你的软件名称';
        
        const client = new FeedbackClient(WORKER_URL);
        
        document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            const result = await client.submitFeedback(
                name,
                email,
                subject,
                message,
                APP_NAME
            );
            
            const resultDiv = document.getElementById('result');
            
            if (result.success) {
                resultDiv.innerHTML = '<p style="color: green;">反馈提交成功！</p>';
                document.getElementById('feedbackForm').reset();
            } else {
                resultDiv.innerHTML = '<p style="color: red;">提交失败：' + result.error + '</p>';
            }
        });
    </script>
</body>
</html>
```

### 方案二：使用原生 JavaScript

如果你不想使用客户端库，可以直接使用 fetch API：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>反馈页面</title>
</head>
<body>
    <h1>用户反馈</h1>
    
    <form id="feedbackForm">
        <div>
            <label>姓名：</label>
            <input type="text" id="name" required>
        </div>
        
        <div>
            <label>邮箱：</label>
            <input type="email" id="email" required>
        </div>
        
        <div>
            <label>主题：</label>
            <input type="text" id="subject" required>
        </div>
        
        <div>
            <label>反馈内容：</label>
            <textarea id="message" required></textarea>
        </div>
        
        <button type="submit">提交反馈</button>
    </form>
    
    <div id="result"></div>
    
    <script>
        const WORKER_URL = 'https://feedback-board.iocompile67692.workers.dev';
        const APP_NAME = '你的软件名称';
        
        document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            try {
                const response = await fetch(WORKER_URL + '/api/feedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        subject: subject,
                        message: message,
                        app_name: APP_NAME
                    })
                });
                
                const result = await response.json();
                const resultDiv = document.getElementById('result');
                
                if (result.success) {
                    resultDiv.innerHTML = '<p style="color: green;">反馈提交成功！</p>';
                    document.getElementById('feedbackForm').reset();
                } else {
                    resultDiv.innerHTML = '<p style="color: red;">提交失败：' + result.error + '</p>';
                }
            } catch (error) {
                document.getElementById('result').innerHTML = 
                    '<p style="color: red;">网络错误：' + error.message + '</p>';
            }
        });
    </script>
</body>
</html>
```

### 方案三：Vue.js 集成

```vue
<template>
  <div>
    <h1>用户反馈</h1>
    
    <form @submit.prevent="submitFeedback">
      <div>
        <label>姓名：</label>
        <input v-model="form.name" type="text" required>
      </div>
      
      <div>
        <label>邮箱：</label>
        <input v-model="form.email" type="email" required>
      </div>
      
      <div>
        <label>主题：</label>
        <input v-model="form.subject" type="text" required>
      </div>
      
      <div>
        <label>反馈内容：</label>
        <textarea v-model="form.message" required></textarea>
      </div>
      
      <button type="submit">提交反馈</button>
    </form>
    
    <div v-if="result.success" style="color: green;">
      反馈提交成功！
    </div>
    
    <div v-if="result.error" style="color: red;">
      提交失败：{{ result.error }}
    </div>
  </div>
</template>

<script>
import { FeedbackClient } from './feedback-client.js';

export default {
  data() {
    return {
      WORKER_URL: 'https://feedback-board.iocompile67692.workers.dev',
      APP_NAME: '你的软件名称',
      form: {
        name: '',
        email: '',
        subject: '',
        message: ''
      },
      result: {}
    };
  },
  methods: {
    async submitFeedback() {
      const client = new FeedbackClient(this.WORKER_URL);
      
      this.result = await client.submitFeedback(
        this.form.name,
        this.form.email,
        this.form.subject,
        this.form.message,
        this.APP_NAME
      );
      
      if (this.result.success) {
        this.form = {
          name: '',
          email: '',
          subject: '',
          message: ''
        };
      }
    }
  }
};
</script>
```

### 方案四：React 集成

```jsx
import React, { useState } from 'react';
import { FeedbackClient } from './feedback-client.js';

function FeedbackForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [result, setResult] = useState({});
  
  const WORKER_URL = 'https://feedback-board.iocompile67692.workers.dev';
  const APP_NAME = '你的软件名称';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const client = new FeedbackClient(WORKER_URL);
    const response = await client.submitFeedback(
      form.name,
      form.email,
      form.subject,
      form.message,
      APP_NAME
    );
    
    setResult(response);
    
    if (response.success) {
      setForm({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }
  };
  
  return (
    <div>
      <h1>用户反馈</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>姓名：</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label>邮箱：</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label>主题：</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm({...form, subject: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label>反馈内容：</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({...form, message: e.target.value})}
            required
          />
        </div>
        
        <button type="submit">提交反馈</button>
      </form>
      
      {result.success && (
        <div style={{ color: 'green' }}>
          反馈提交成功！
        </div>
      )}
      
      {result.error && (
        <div style={{ color: 'red' }}>
          提交失败：{result.error}
        </div>
      )}
    </div>
  );
}

export default FeedbackForm;
```

## ⚙️ 配置说明

### 1. 修改 Worker URL

在所有示例中，将 `https://feedback-board.iocompile67692.workers.dev` 替换为你的实际 Worker URL。

### 2. 配置软件名称（重要）

**软件名称由前端代码自动配置，用户无需填写。**

在代码顶部找到 `APP_NAME` 常量，将其修改为你的实际软件名称：

```javascript
const APP_NAME = '你的软件名称';  // 修改这里
```

**配置说明**：
- ✅ 软件名称在前端代码中配置一次即可
- ✅ 用户提交反馈时自动附加该软件名称
- ✅ 无需在表单中添加软件名称输入框
- ✅ 便于在留言板中按软件分类查看反馈

### 3. 环境变量（可选）

如果你想在不同的环境使用不同的 URL，可以使用环境变量：

```javascript
const WORKER_URL = process.env.WORKER_URL || 'https://feedback-board.iocompile67692.workers.dev';
const APP_NAME = process.env.APP_NAME || '你的软件名称';
```

## 📝 完整示例页面

这是一个完整的、可直接使用的反馈页面：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>用户反馈</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }
        input[type="text"],
        input[type="email"],
        textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input:focus,
        textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        textarea {
            min-height: 120px;
            resize: vertical;
        }
        button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.3s;
        }
        button:hover {
            transform: scale(1.02);
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .success {
            background: #d4edda;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📝 用户反馈</h1>
        
        <form id="feedbackForm">
            <div class="form-group">
                <label for="name">姓名</label>
                <input type="text" id="name" name="name" required placeholder="请输入您的姓名">
            </div>
            
            <div class="form-group">
                <label for="email">邮箱</label>
                <input type="email" id="email" name="email" required placeholder="请输入您的邮箱">
            </div>
            
            <div class="form-group">
                <label for="subject">主题</label>
                <input type="text" id="subject" name="subject" required placeholder="请输入反馈主题">
            </div>
            
            <div class="form-group">
                <label for="message">反馈内容</label>
                <textarea id="message" name="message" required placeholder="请详细描述您的反馈内容"></textarea>
            </div>
            
            <button type="submit" id="submitBtn">提交反馈</button>
        </form>
        
        <div id="result" style="display: none;"></div>
    </div>
    
    <script>
        const WORKER_URL = 'https://feedback-board.iocompile67692.workers.dev';
        const APP_NAME = '你的软件名称';
        
        document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const resultDiv = document.getElementById('result');
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            submitBtn.disabled = true;
            submitBtn.textContent = '提交中...';
            resultDiv.style.display = 'none';
            
            try {
                const response = await fetch(WORKER_URL + '/api/feedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        subject: subject,
                        message: message,
                        app_name: APP_NAME
                    })
                });
                
                const result = await response.json();
                
                resultDiv.style.display = 'block';
                
                if (result.success) {
                    resultDiv.className = 'result success';
                    resultDiv.innerHTML = '✅ 反馈提交成功！感谢您的反馈。';
                    document.getElementById('feedbackForm').reset();
                } else {
                    resultDiv.className = 'result error';
                    resultDiv.innerHTML = '❌ 提交失败：' + result.error;
                }
            } catch (error) {
                resultDiv.style.display = 'block';
                resultDiv.className = 'result error';
                resultDiv.innerHTML = '❌ 网络错误：' + error.message;
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '提交反馈';
            }
        });
    </script>
</body>
</html>
```

## ❓ 常见问题

### Q1: 如何获取我的 Worker URL？

部署成功后，Wrangler 会显示你的 Worker URL，格式为：
```
https://feedback-board.iocompile67692.workers.dev
```

### Q2: 可以自定义 Worker URL 吗？

可以。在 Cloudflare Dashboard 中，你可以：
1. 进入 Workers & Pages
2. 选择你的 Worker
3. 点击 Settings
4. 在 Custom Domains 中添加自定义域名

### Q3: 如何测试 API 是否正常工作？

使用浏览器开发者工具或 curl：

```bash
curl -X POST https://your-worker-url.workers.dev/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","email":"test@example.com","subject":"测试","message":"测试内容"}'
```

**注意**：`app_name` 由前端代码自动添加，无需在测试中包含。

### Q3.1: 如何测试邮件通知功能？

访问调试端点测试邮件发送：

```bash
curl -X POST https://your-worker-url.workers.dev/test-feedback
```

或在浏览器中：
1. 访问 `https://your-worker-url.workers.dev/debug` 检查环境变量
2. 使用开发者工具发送 POST 请求到 `/test-feedback`
3. 检查邮箱是否收到测试邮件

### Q4: 提交失败怎么办？

1. 检查 Worker URL 是否正确
2. 检查网络连接
3. 查看浏览器控制台的错误信息
4. 确认所有必填字段都已填写

### Q5: 如何查看提交的反馈？

访问你的 Worker URL（不带 `/api/feedback`）即可看到留言板页面，显示所有反馈。

### Q6: IP 和国家信息是如何获取的？

系统自动从 Cloudflare 的请求头中获取：
- IP：`CF-Connecting-IP`
- 国家：`CF-IPCountry`

无需在前端手动提供。

### Q7: 需要后端服务器吗？

不需要。Cloudflare Worker 是无服务器架构，所有代码都在 Cloudflare 的边缘网络中运行。

### Q8: 数据安全吗？

数据存储在 Cloudflare D1 数据库中，Cloudflare 提供企业级的安全保障。建议：
- 定期备份数据
- 不要在反馈中提交敏感信息（如密码、信用卡号等）

### Q9: 软件名称如何配置？

软件名称在前端代码中通过 `APP_NAME` 常量配置：

```javascript
const APP_NAME = '你的软件名称';
```

配置后，所有用户提交的反馈都会自动标记为该软件名称，用户无需手动填写。这样：
- 简化用户界面（减少输入字段）
- 确保数据一致性（所有反馈都有正确的软件名称）
- 便于后续统计和分析（按软件分类查看反馈）

### Q10: 邮件通知功能是如何工作的？

当用户提交反馈时，系统会自动：
1. 将反馈保存到 Cloudflare D1 数据库
2. 使用 Resend API 发送邮件通知到配置的邮箱
3. 邮件包含完整的反馈信息（用户信息、反馈内容、地理位置等）

**配置要求**：
- 在 `wrangler.toml` 中配置 `RESEND_API_KEY`、`NOTIFICATION_EMAIL` 和 `FROM_EMAIL`
- 在 Resend 后台验证发件人域名

**无需前端额外配置**，邮件发送功能完全由 Worker 后端处理。

### Q11: 如何排查邮件发送问题，若遇到相应的邮箱发送失败的？

1. **检查环境变量**：
   - 访问 `https://your-worker-url.workers.dev/debug`
   - 确认 `RESEND_API_KEY`、`NOTIFICATION_EMAIL` 和 `FROM_EMAIL` 都已正确配置

2. **测试邮件发送**：
   - 发送 POST 请求到 `https://your-worker-url.workers.dev/test-feedback`
   - 检查响应中的 `emailSent` 字段
   - 查看邮箱是否收到测试邮件

3. **查看 Resend 后台**：
   - 登录 [Resend Dashboard](https://resend.com/dashboard)
   - 查看 API 请求日志
   - 检查是否有发送失败的记录

4. **检查 Worker 日志**：
   - 使用 `wrangler tail` 命令查看实时日志
   - 查找邮件发送相关的错误信息

## 📚 相关文档

- [部署指南](DEPLOYMENT.md)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)

## 🆘 技术支持

如遇到问题，请检查：
1. Cloudflare Dashboard 中的 Workers 和 D1 状态
2. 浏览器控制台的错误信息
3. 网络连接是否正常

祝你集成顺利！🎉
