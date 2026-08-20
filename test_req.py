import requests
url = 'http://localhost:8000/api/analyze/'
with open('payload.json', 'r') as f:
    data = f.read()
try:
    resp = requests.post(url, data=data, headers={'Content-Type': 'application/json'})
    print(resp.status_code)
    print(resp.text[:500])
except Exception as e:
    print(e)
