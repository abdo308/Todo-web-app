#!/usr/bin/env python3
"""
Load testing script for Todo App
Sends various requests to test endpoints and generate metrics for Grafana dashboard
"""
import requests
import time
import random
import json
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configuration
BASE_URL = "http://localhost:3000"
API_URL = f"{BASE_URL}/api"
NUM_REQUESTS = None  # Infinite - run until stopped
NUM_WORKERS = 10
DELAY_BETWEEN_REQUESTS = 0.05  # seconds - faster requests

# Test credentials
TEST_USERS = [
    {"email": f"testuser{i}@example.com", "password": "TestPass123!", "username": f"testuser{i}"}
    for i in range(1, 6)
]

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

class LoadTester:
    def __init__(self):
        self.tokens = {}
        self.results = {
            'success': 0,
            'errors': 0,
            'status_codes': {},
            'endpoints': {},
            'total_time': 0
        }
    
    def register_user(self, user):
        """Register a test user"""
        try:
            response = requests.post(
                f"{API_URL}/auth/register",
                json=user,
                timeout=5
            )
            return response.status_code in [200, 201, 409]  # 409 = already exists
        except Exception as e:
            print(f"{RED}Registration error: {e}{RESET}")
            return False
    
    def login_user(self, email, password):
        """Login and get access token"""
        try:
            response = requests.post(
                f"{API_URL}/auth/login",
                data={"username": email, "password": password},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                return data.get('access_token')
            return None
        except Exception as e:
            print(f"{RED}Login error: {e}{RESET}")
            return None
    
    def make_request(self, method, endpoint, token=None, json_data=None):
        """Make an HTTP request and track results"""
        headers = {}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        start_time = time.time()
        try:
            if method == 'GET':
                response = requests.get(f"{API_URL}{endpoint}", headers=headers, timeout=5)
            elif method == 'POST':
                response = requests.post(f"{API_URL}{endpoint}", headers=headers, json=json_data, timeout=5)
            elif method == 'PUT':
                response = requests.put(f"{API_URL}{endpoint}", headers=headers, json=json_data, timeout=5)
            elif method == 'DELETE':
                response = requests.delete(f"{API_URL}{endpoint}", headers=headers, timeout=5)
            else:
                return False
            
            duration = time.time() - start_time
            self.results['total_time'] += duration
            
            # Track status codes
            status_group = f"{response.status_code // 100}xx"
            self.results['status_codes'][status_group] = self.results['status_codes'].get(status_group, 0) + 1
            
            # Track endpoints
            self.results['endpoints'][endpoint] = self.results['endpoints'].get(endpoint, 0) + 1
            
            if 200 <= response.status_code < 300:
                self.results['success'] += 1
                return True
            else:
                self.results['errors'] += 1
                return False
                
        except Exception as e:
            self.results['errors'] += 1
            print(f"{RED}Request error ({method} {endpoint}): {e}{RESET}")
            return False
    
    def test_endpoints(self, token):
        """Test various endpoints with authenticated token"""
        endpoints_to_test = [
            ('GET', '/todos'),
            ('GET', '/todos/stats'),
            ('POST', '/todos', {
                'title': f'Test Task {random.randint(1000, 9999)}',
                'description': 'Load test task',
                'priority': random.choice(['low', 'medium', 'high']),
                'due_date': '2025-12-31T23:59:59'
            }),
        ]
        
        method, endpoint, *data = random.choice(endpoints_to_test)
        json_data = data[0] if data else None
        return self.make_request(method, endpoint, token, json_data)
    
    def worker(self, user_id):
        """Worker thread that makes requests"""
        user = TEST_USERS[user_id % len(TEST_USERS)]
        
        # Login
        token = self.login_user(user['email'], user['password'])
        if not token:
            print(f"{YELLOW}Using unauthenticated requests for worker {user_id}{RESET}")
        
        # Make continuous requests
        request_count = 0
        while True:  # Infinite loop
            self.test_endpoints(token)
            request_count += 1
            
            # Print progress every 50 requests
            if request_count % 50 == 0:
                print(f"{GREEN}Worker {user_id}: {request_count} requests sent{RESET}")
            
            time.sleep(DELAY_BETWEEN_REQUESTS)
    
    def setup(self):
        """Setup test users"""
        print(f"{BLUE}Setting up test users...{RESET}")
        for user in TEST_USERS:
            self.register_user(user)
        print(f"{GREEN}Test users ready{RESET}")
    
    def run(self):
        """Run the load test"""
        print(f"\n{BLUE}{'='*60}{RESET}")
        print(f"{BLUE}Starting Continuous Load Test{RESET}")
        print(f"{BLUE}Target: {API_URL}{RESET}")
        print(f"{BLUE}Workers: {NUM_WORKERS} (sending requests continuously){RESET}")
        print(f"{BLUE}Press Ctrl+C to stop{RESET}")
        print(f"{BLUE}{'='*60}{RESET}\n")
        
        self.setup()
        
        start_time = time.time()
        
        # Run workers in parallel - they'll run forever until interrupted
        with ThreadPoolExecutor(max_workers=NUM_WORKERS) as executor:
            futures = [executor.submit(self.worker, i) for i in range(NUM_WORKERS)]
            
            try:
                # Keep the main thread alive
                while True:
                    time.sleep(5)
                    duration = time.time() - start_time
                    total = self.results['success'] + self.results['errors']
                    rps = total / duration if duration > 0 else 0
                    print(f"{BLUE}Status: {total} total requests | {rps:.1f} req/s | Success: {self.results['success']} | Errors: {self.results['errors']}{RESET}")
            except KeyboardInterrupt:
                print(f"\n{YELLOW}Stopping load test...{RESET}")
                # Cancel all futures
                for future in futures:
                    future.cancel()
        
        total_duration = time.time() - start_time
        
        # Print results
        self.print_results(total_duration)
    
    def print_results(self, duration):
        """Print test results"""
        total = self.results['success'] + self.results['errors']
        success_rate = (self.results['success'] / total * 100) if total > 0 else 0
        
        print(f"\n{BLUE}{'='*60}{RESET}")
        print(f"{BLUE}Load Test Results{RESET}")
        print(f"{BLUE}{'='*60}{RESET}")
        print(f"Total Requests:    {total}")
        print(f"{GREEN}Successful:        {self.results['success']} ({success_rate:.1f}%){RESET}")
        print(f"{RED}Failed:            {self.results['errors']}{RESET}")
        print(f"Total Duration:    {duration:.2f}s")
        print(f"Requests/sec:      {total/duration:.2f}")
        print(f"Avg Response Time: {(self.results['total_time']/total*1000):.2f}ms")
        
        print(f"\n{YELLOW}Status Code Distribution:{RESET}")
        for status, count in sorted(self.results['status_codes'].items()):
            print(f"  {status}: {count}")
        
        print(f"\n{YELLOW}Endpoint Distribution:{RESET}")
        for endpoint, count in sorted(self.results['endpoints'].items(), key=lambda x: x[1], reverse=True):
            print(f"  {endpoint}: {count}")
        
        print(f"{BLUE}{'='*60}{RESET}\n")
        print(f"{GREEN}✓ Check Grafana dashboard at http://localhost:3001{RESET}")
        print(f"{GREEN}✓ Check Prometheus metrics at http://localhost:9092{RESET}\n")


if __name__ == "__main__":
    tester = LoadTester()
    try:
        tester.run()
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Test interrupted by user{RESET}")
    except Exception as e:
        print(f"\n{RED}Test failed: {e}{RESET}")
