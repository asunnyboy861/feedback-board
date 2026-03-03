const feedbackData = {
  name: "测试用户",
  email: "test@example.com",
  subject: "测试邮件通知功能",
  message: "这是一条测试反馈，用于验证邮件通知功能是否正常工作。如果收到此邮件，说明配置成功！",
  app_name: "测试软件"
};

async function testFeedbackSubmission() {
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ 反馈提交成功！');
      console.log('反馈 ID:', result.id);
      console.log('');
      console.log('📧 请检查邮箱 Carl@zzoutuo.com 是否收到邮件通知');
      console.log('');
      console.log('提示：如果未收到邮件，请检查：');
      console.log('1. Cloudflare Dashboard 中是否配置了 RESEND_API_KEY 环境变量');
      console.log('2. Resend API Key 是否有效');
      console.log('3. 是否超出 Resend 免费额度');
      console.log('4. 查看 Worker 日志中的错误信息');
    } else {
      console.error('❌ 反馈提交失败：', result.error);
    }
  } catch (error) {
    console.error('❌ 请求失败：', error.message);
  }
}

console.log('🧪 开始测试邮件通知功能...');
console.log('');
console.log('提交测试反馈：');
console.log('- 姓名:', feedbackData.name);
console.log('- 邮箱:', feedbackData.email);
console.log('- 主题:', feedbackData.subject);
console.log('- 软件:', feedbackData.app_name);
console.log('');
console.log('正在提交...');

testFeedbackSubmission();
