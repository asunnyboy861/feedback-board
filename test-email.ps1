$feedbackData = @{
    name = "测试用户"
    email = "test@example.com"
    subject = "测试邮件通知功能"
    message = "这是一条测试反馈，用于验证邮件通知功能是否正常工作。如果收到此邮件，说明配置成功！"
    app_name = "测试软件"
} | ConvertTo-Json

$workerUrl = "https://feedback-board.iocompile67692.workers.dev/api/feedback"

Write-Host "🧪 开始测试邮件通知功能..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Worker URL: $workerUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "提交测试反馈：" -ForegroundColor Green
Write-Host "- 姓名: $($feedbackData | ConvertFrom-Json | Select-Object -ExpandProperty name)" -ForegroundColor White
Write-Host "- 邮箱: $($feedbackData | ConvertFrom-Json | Select-Object -ExpandProperty email)" -ForegroundColor White
Write-Host "- 主题: $($feedbackData | ConvertFrom-Json | Select-Object -ExpandProperty subject)" -ForegroundColor White
Write-Host "- 软件: $($feedbackData | ConvertFrom-Json | Select-Object -ExpandProperty app_name)" -ForegroundColor White
Write-Host ""
Write-Host "正在提交..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $workerUrl -Method POST -Body $feedbackData -ContentType "application/json" -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json

    if ($response.StatusCode -eq 200 -and $result.success) {
        Write-Host ""
        Write-Host "✅ 反馈提交成功！" -ForegroundColor Green
        Write-Host "反馈 ID: $($result.id)" -ForegroundColor White
        Write-Host ""
        Write-Host "📧 请检查邮箱 Carl@zzoutuo.com 是否收到邮件通知" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "提示：如果未收到邮件，请检查：" -ForegroundColor Yellow
        Write-Host "1. Cloudflare Dashboard 中是否配置了 RESEND_API_KEY 环境变量" -ForegroundColor White
        Write-Host "2. Resend API Key 是否有效" -ForegroundColor White
        Write-Host "3. 是否超出 Resend 免费额度" -ForegroundColor White
        Write-Host "4. 查看 Worker 日志中的错误信息" -ForegroundColor White
        Write-Host "5. 发件人域名 zzoutuo.com 是否已在 Resend 中验证" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ 反馈提交失败：$($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ 请求失败：$($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因：" -ForegroundColor Yellow
    Write-Host "- Worker URL 不正确" -ForegroundColor White
    Write-Host "- 网络连接问题" -ForegroundColor White
    Write-Host "- Worker 未正确部署" -ForegroundColor White
}
