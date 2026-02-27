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
        .feedback-list {
            display: grid;
            gap: 20px;
            margin-bottom: 40px;
        }
        .feedback-item {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }
        .feedback-item:hover {
            transform: translateY(-5px);
        }
        .feedback-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
        }
        .feedback-time {
            color: #666;
            font-size: 0.9em;
            background: #f0f0f0;
            padding: 5px 12px;
            border-radius: 20px;
        }
        .feedback-app {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }
        .feedback-info {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
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
            background: #e8f4f8;
            padding: 3px 10px;
            border-radius: 12px;
        }
        .feedback-subject {
            font-size: 1.3em;
            color: #333;
            margin-bottom: 10px;
            font-weight: 600;
        }
        .feedback-message {
            color: #555;
            line-height: 1.6;
            background: #f9f9f9;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
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
            .feedback-item {
                padding: 20px;
            }
            .feedback-header {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📝 用户反馈留言板</h1>
        <button class="refresh-btn" onclick="loadFeedbacks()">🔄 刷新留言</button>
        <div id="feedbackList" class="feedback-list">
            <div class="loading">加载中...</div>
        </div>
    </div>

    <script>
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

                feedbackList.innerHTML = feedbacks.map(feedback => 
                    '<div class="feedback-item">' +
                        '<div class="feedback-header">' +
                            '<span class="feedback-time">🕐 ' + formatDate(feedback.created_at) + '</span>' +
                            '<span class="feedback-app">📱 ' + escapeHtml(feedback.app_name) + '</span>' +
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
