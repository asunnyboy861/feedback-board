export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/api/feedback' && request.method === 'POST') {
      try {
        const data = await request.json();
        const { name, email, subject, message, app_name } = data;

        if (!name || !email || !subject || !message || !app_name) {
          return new Response(
            JSON.stringify({ error: '所有字段都是必需的' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        const ip_address = request.headers.get('CF-Connecting-IP') || '未知';
        const country = request.headers.get('CF-IPCountry') || '未知';

        const result = await env.DB.prepare(
          'INSERT INTO feedback (name, email, subject, message, app_name, country, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(name, email, subject, message, app_name, country, ip_address).run();

        return new Response(
          JSON.stringify({ success: true, id: result.meta.last_row_id }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    if (url.pathname === '/api/feedback' && request.method === 'GET') {
      try {
        const result = await env.DB.prepare(
          'SELECT * FROM feedback ORDER BY created_at DESC LIMIT 100'
        ).all();

        return new Response(
          JSON.stringify(result.results),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(getHTML(), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};

function getHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>用户反馈留言板</title>
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
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            color: white;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .app-list {
            display: grid;
            gap: 25px;
            margin-bottom: 40px;
        }
        .app-card {
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }
        .app-card:hover {
            transform: translateY(-5px);
        }
        .app-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
        }
        .app-title {
            font-size: 1.5em;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .app-icon {
            font-size: 1.2em;
        }
        .new-badge {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        .feedback-list {
            display: grid;
            gap: 15px;
        }
        .feedback-item {
            background: #f9f9f9;
            border-radius: 10px;
            padding: 15px;
            border-left: 4px solid #667eea;
            transition: all 0.3s ease;
        }
        .feedback-item:hover {
            background: #f0f0f0;
            transform: translateX(5px);
        }
        .feedback-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
            flex-wrap: wrap;
            gap: 10px;
        }
        .feedback-time {
            color: #666;
            font-size: 0.9em;
            background: #e0e0e0;
            padding: 4px 10px;
            border-radius: 15px;
        }
        .feedback-info {
            display: flex;
            gap: 15px;
            margin-bottom: 10px;
            flex-wrap: wrap;
        }
        .info-tag {
            display: flex;
            align-items: center;
            gap: 5px;
            color: #666;
            font-size: 0.85em;
        }
        .info-tag span {
            background: white;
            padding: 3px 10px;
            border-radius: 12px;
        }
        .feedback-subject {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .feedback-message {
            color: #555;
            line-height: 1.4;
        }
        .expand-btn {
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .expand-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        .loading {
            text-align: center;
            color: white;
            font-size: 1.2em;
            padding: 40px;
        }
        .no-feedback {
            text-align: center;
            color: white;
            font-size: 1.2em;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
        }
        .refresh-btn {
            display: block;
            margin: 0 auto 30px;
            padding: 12px 30px;
            background: white;
            color: #667eea;
            border: none;
            border-radius: 25px;
            font-size: 1em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .refresh-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }
        @media (max-width: 768px) {
            h1 {
                font-size: 1.8em;
            }
            .app-title {
                font-size: 1.3em;
            }
            .feedback-item {
                padding: 12px;
            }
            .feedback-info {
                flex-direction: column;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📝 用户反馈留言板</h1>
        <button class="refresh-btn" onclick="loadFeedbacks()">🔄 刷新留言</button>
        <div id="feedbackList" class="app-list">
            <div class="loading">加载中...</div>
        </div>
    </div>

    <script>
        // 软件颜色配置
        const APP_COLORS = {
            '测试软件': {
                primary: '#667eea',
                secondary: '#764ba2',
                bg: '#667eea'
            },
            '你的软件名称': {
                primary: '#10b981',
                secondary: '#059669',
                bg: '#10b981'
            },
            '默认': {
                primary: '#8b5cf6',
                secondary: '#6366f1',
                bg: '#8b5cf6'
            }
        };

        // 新消息判断（24小时内）
        function isNewFeedback(feedback) {
            const feedbackTime = new Date(feedback.created_at);
            const now = new Date();
            const hoursDiff = (now - feedbackTime) / (1000 * 60 * 60);
            return hoursDiff < 24;
        }

        // 获取软件颜色
        function getAppColors(appName) {
            return APP_COLORS[appName] || APP_COLORS['默认'];
        }

        // 按软件分组
        function groupByApp(feedbacks) {
            return feedbacks.reduce((groups, feedback) => {
                const appName = feedback.app_name;
                if (!groups[appName]) {
                    groups[appName] = [];
                }
                groups[appName].push(feedback);
                return groups;
            }, {});
        }

        // 排序软件
        function sortApps(apps) {
            return apps.sort((a, b) => {
                const aHasNew = a.feedbacks.some(isNewFeedback);
                const bHasNew = b.feedbacks.some(isNewFeedback);
                
                if (aHasNew && !bHasNew) return -1;
                if (!aHasNew && bHasNew) return 1;
                
                const aLatest = a.latestFeedback?.created_at || '';
                const bLatest = b.latestFeedback?.created_at || '';
                return new Date(bLatest) - new Date(aLatest);
            });
        }

        // 渲染软件卡片
        function renderAppCard(appName, feedbacks) {
            const colors = getAppColors(appName);
            const hasNew = feedbacks.some(isNewFeedback);
            
            // 排序反馈
            const sortedFeedbacks = feedbacks.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
            
            // 显示最新5条
            const latestFeedbacks = sortedFeedbacks.slice(0, 5);
            const collapsedFeedbacks = sortedFeedbacks.slice(5);
            
            // 渲染反馈列表
            const feedbackHtml = latestFeedbacks.map(feedback => 
                '<div class="feedback-item" style="border-left-color: ' + colors.primary + ';">' +
                    '<div class="feedback-header">' +
                        '<span class="feedback-time">🕐 ' + formatDate(feedback.created_at) + '</span>' +
                    '</div>' +
                    '<div class="feedback-info">' +
                        '<div class="info-tag">👤 <span>' + escapeHtml(feedback.name) + '</span></div>' +
                        '<div class="info-tag">📧 <span>' + escapeHtml(feedback.email) + '</span></div>' +
                        '<div class="info-tag">🌍 <span>' + escapeHtml(feedback.country) + '</span></div>' +
                        '<div class="info-tag">📍 <span>' + escapeHtml(feedback.ip_address) + '</span></div>' +
                    '</div>' +
                    '<div class="feedback-subject">' + escapeHtml(feedback.subject) + '</div>' +
                    '<div class="feedback-message">' + escapeHtml(feedback.message) + '</div>' +
                '</div>'
            ).join('');
            
            // 渲染折叠部分
            const collapsedHtml = collapsedFeedbacks.length > 0 ? 
                '<button class="expand-btn" style="background: ' + colors.bg + ';" data-app-name="' + escapeHtml(appName) + '">' +
                '📂 展开 ' + collapsedFeedbacks.length + ' 条消息' +
                '</button>' : '';
            
            return '<div class="app-card">' +
                '<div class="app-header">' +
                    '<div class="app-title">' +
                        '<span class="app-icon">📱</span>' +
                        '<span>' + escapeHtml(appName) + '</span>' +
                    '</div>' +
                    (hasNew ? '<span class="new-badge">新消息</span>' : '') +
                '</div>' +
                '<div class="feedback-list" id="app-' + escapeHtml(appName) + '">' +
                    feedbackHtml +
                '</div>' +
                '<div id="collapsed-' + escapeHtml(appName) + '" style="display: none;">' +
                    collapsedFeedbacks.map(feedback => 
                        '<div class="feedback-item" style="border-left-color: ' + colors.primary + '; opacity: 0.8;">' +
                            '<div class="feedback-header">' +
                                '<span class="feedback-time">🕐 ' + formatDate(feedback.created_at) + '</span>' +
                            '</div>' +
                            '<div class="feedback-info">' +
                                '<div class="info-tag">👤 <span>' + escapeHtml(feedback.name) + '</span></div>' +
                                '<div class="info-tag">📧 <span>' + escapeHtml(feedback.email) + '</span></div>' +
                                '<div class="info-tag">🌍 <span>' + escapeHtml(feedback.country) + '</span></div>' +
                                '<div class="info-tag">📍 <span>' + escapeHtml(feedback.ip_address) + '</span></div>' +
                            '</div>' +
                            '<div class="feedback-subject">' + escapeHtml(feedback.subject) + '</div>' +
                            '<div class="feedback-message">' + escapeHtml(feedback.message) + '</div>' +
                        '</div>'
                    ).join('') +
                '</div>' +
                collapsedHtml +
            '</div>';
        }

        // 切换折叠状态
        function toggleCollapse(button) {
            const appName = button.getAttribute('data-app-name');
            const collapsedDiv = document.getElementById('collapsed-' + escapeHtml(appName));
            const feedbackList = document.getElementById('app-' + escapeHtml(appName));
            
            if (collapsedDiv.style.display === 'none') {
                // 展开
                collapsedDiv.style.display = 'block';
                button.textContent = '📂 收起 ' + collapsedDiv.children.length + ' 条消息';
            } else {
                // 收起
                collapsedDiv.style.display = 'none';
                const hiddenCount = document.querySelectorAll('#collapsed-' + escapeHtml(appName) + ' .feedback-item').length;
                button.textContent = '📂 展开 ' + hiddenCount + ' 条消息';
            }
        }

        // 为展开按钮添加事件监听器
        document.addEventListener('click', function(event) {
            if (event.target.classList.contains('expand-btn')) {
                toggleCollapse(event.target);
            }
        });

        async function loadFeedbacks() {
            const feedbackList = document.getElementById('feedbackList');
            feedbackList.innerHTML = '<div class="loading">加载中...</div>';

            try {
                const response = await fetch('/api/feedback');
                const feedbacks = await response.json();

                if (feedbacks.length === 0) {
                    feedbackList.innerHTML = '<div class="no-feedback">暂无反馈信息</div>';
                    return;
                }

                // 按软件分组
                const grouped = groupByApp(feedbacks);
                
                // 转换为数组
                const appArray = Object.entries(grouped).map(([appName, feedbacks]) => ({
                    appName,
                    feedbacks,
                    latestFeedback: feedbacks.reduce((latest, feedback) => {
                        if (!latest || new Date(feedback.created_at) > new Date(latest.created_at)) {
                            return feedback;
                        }
                        return latest;
                    }, null)
                }));
                
                // 排序
                const sortedApps = sortApps(appArray);
                
                // 渲染
                feedbackList.innerHTML = sortedApps.map(app => 
                    renderAppCard(app.appName, app.feedbacks)
                ).join('');

            } catch (error) {
                feedbackList.innerHTML = '<div class="no-feedback">加载失败，请稍后重试</div>';
                console.error('Error:', error);
            }
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        loadFeedbacks();
        setInterval(loadFeedbacks, 30000);
    </script>
</body>
</html>`;
}
