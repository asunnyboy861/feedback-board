import requests

class FeedbackClient:
    def __init__(self, worker_url):
        self.worker_url = worker_url.rstrip('/')
        self.api_url = f"{self.worker_url}/api/feedback"

    def submit_feedback(self, name, email, subject, message, app_name):
        data = {
            'name': name,
            'email': email,
            'subject': subject,
            'message': message,
            'app_name': app_name
        }

        try:
            response = requests.post(self.api_url, json=data, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {'success': False, 'error': str(e)}

    def get_feedbacks(self):
        try:
            response = requests.get(self.api_url, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {'error': str(e)}


if __name__ == "__main__":
    WORKER_URL = "https://your-worker-name.your-subdomain.workers.dev"

    client = FeedbackClient(WORKER_URL)

    result = client.submit_feedback(
        name="张三",
        email="zhangsan@example.com",
        subject="功能建议",
        message="希望能增加导出功能",
        app_name="我的软件"
    )

    print(result)
