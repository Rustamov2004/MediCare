import requests

def test():
    # Login as admin
    login_data = {
        "userName": "admin123",
        "password": "123"
    }
    r = requests.post("http://localhost:8080/api/auth/login", json=login_data)
    if r.status_code != 200:
        print("Login failed:", r.text)
        return
    token = r.json().get("token")
    print("Logged in!")

    headers = {"Authorization": f"Bearer {token}"}
    r2 = requests.get("http://localhost:8080/api/admin/inventory/history/1", headers=headers)
    print("History status:", r2.status_code)
    print("History response:", r2.text)

test()
