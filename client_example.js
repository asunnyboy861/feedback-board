class FeedbackClient {
    constructor(workerUrl) {
        this.workerUrl = workerUrl.replace(/\/$/, '');
        this.apiUrl = `${this.workerUrl}/api/feedback`;
    }

    async submitFeedback(name, email, subject, message, appName) {
        const data = {
            name: name,
            email: email,
            subject: subject,
            message: message,
            app_name: appName
        };

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('提交反馈失败:', error);
            return { success: false, error: error.message };
        }
    }

    async getFeedbacks() {
        try {
            const response = await fetch(this.apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('获取反馈失败:', error);
            return { error: error.message };
        }
    }
}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedbackClient;
}
