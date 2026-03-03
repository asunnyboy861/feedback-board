const RESEND_API_KEY = 're_hST9atNY_Fa9enaVrLrA6g3eWb6C8vX2m';
const FROM_EMAIL = 'softfeedback@soft.calcs.top';
const TO_EMAIL = 'Carl@zzoutuo.com';

async function testResendAPI() {
  console.log('🧪 开始测试 Resend API...');
  console.log('');
  console.log('配置信息：');
  console.log('- API Key:', RESEND_API_KEY.substring(0, 10) + '...');
  console.log('- 发件人:', FROM_EMAIL);
  console.log('- 收件人:', TO_EMAIL);
  console.log('');

  const emailContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resend API 测试</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f7;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🧪 Resend API 测试</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">这是一封测试邮件</p>
        </div>
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                如果您收到这封邮件，说明 Resend API 配置正确！
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">测试信息</h3>
                <ul style="color: #666666; font-size: 14px; line-height: 1.6;">
                    <li>测试时间: ${new Date().toLocaleString('zh-CN')}</li>
                    <li>发件人: ${FROM_EMAIL}</li>
                    <li>收件人: ${TO_EMAIL}</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`;

  try {
    console.log('📤 正在发送测试邮件...');
    console.log('');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        subject: '🧪 Resend API 测试邮件',
        html: emailContent,
      }),
    });

    console.log('📡 响应状态码:', response.status);
    console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));
    console.log('');

    const responseText = await response.text();
    console.log('📄 响应内容:');
    console.log(responseText);
    console.log('');

    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('✅ 邮件发送成功！');
      console.log('- 邮件 ID:', result.id);
      console.log('- 请检查邮箱:', TO_EMAIL);
    } else {
      console.error('❌ 邮件发送失败！');
      console.error('- 状态码:', response.status);
      console.error('- 错误信息:', responseText);
      console.log('');
      console.log('🔍 可能的原因：');
      console.log('1. API Key 无效或已过期');
      console.log('2. 发件人域名未在 Resend 中验证');
      console.log('3. 超出免费额度');
      console.log('4. 收件人邮箱地址错误');
    }
  } catch (error) {
    console.error('❌ 请求失败：', error.message);
    console.error('');
    console.error('🔍 可能的原因：');
    console.error('1. 网络连接问题');
    console.error('2. Resend API 服务异常');
    console.error('3. 代码错误');
  }
}

testResendAPI();
