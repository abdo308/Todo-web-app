#!/usr/bin/env python3
"""
STRESS LOAD TESTING SCRIPT - Designed to overload the Todo App
Creates massive concurrent load across all endpoints to test system limits
"""
import requests
import time
import random
import json
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta

# AGGRESSIVE Configuration - Designed to overload
BASE_URL = "http://localhost:3000"
NUM_WORKERS = 50  # Massive concurrency
REQUESTS_PER_WORKER = float('inf')  # Infinite requests - runs until Ctrl+C
DELAY_BETWEEN_REQUESTS = 0.001  # Almost no delay - flood the server
REQUEST_TIMEOUT = 5  # Short timeout to fail fast

# Test data generators
TEST_USERS = [
    {
        "email": f"loadtest{i}@example.com",
        "password": "LoadTest123!",
        "username": f"loaduser{i}",
        "firstname": f"Load{i}",
        "lastname": "Tester",
        "contact": f"+1234567{i:04d}",
        "position": "QA Engineer"
    }
    for i in range(NUM_WORKERS)
]

# Large payloads to stress the system
LARGE_TODO_DESCRIPTION = "A" * 5000  # 5KB description
MASSIVE_TODO_DESCRIPTION = "B" * 50000  # 50KB description

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
MAGENTA = '\033[95m'
CYAN = '\033[96m'
RESET = '\033[0m'

class StressLoadTester:
    def __init__(self):
        self.tokens = {}
        self.todo_ids = {}
        self.lock = threading.Lock()
        self.results = {
            'success': 0,
            'errors': 0,
            'timeouts': 0,
            'status_codes': {},
            'endpoints': {},
            'total_requests': 0,
            'total_time': 0,
            'start_time': None,
            'error_types': {}
        }
        self.active_threads = 0
    
    def update_stats(self, success, status_code, endpoint, elapsed_time, error_type=None):
        """Thread-safe stats update"""
        with self.lock:
            self.results['total_requests'] += 1
            self.results['total_time'] += elapsed_time
            
            if success:
                self.results['success'] += 1
            else:
                self.results['errors'] += 1
                if error_type:
                    self.results['error_types'][error_type] = self.results['error_types'].get(error_type, 0) + 1
            
            self.results['status_codes'][status_code] = self.results['status_codes'].get(status_code, 0) + 1
            self.results['endpoints'][endpoint] = self.results['endpoints'].get(endpoint, 0) + 1
    
    def register_and_login(self, user_index):
        """Register and login a user - returns token"""
        user = TEST_USERS[user_index]
        
        # Try to register (might fail if already exists - that's ok)
        try:
            start = time.time()
            response = requests.post(
                f"{BASE_URL}/auth/register",
                json=user,
                timeout=REQUEST_TIMEOUT
            )
            elapsed = time.time() - start
            self.update_stats(response.status_code in [200, 201], response.status_code, "/auth/register", elapsed)
        except Exception as e:
            self.update_stats(False, 0, "/auth/register", 0, str(type(e).__name__))
        
        # Login to get token
        try:
            start = time.time()
            response = requests.post(
                f"{BASE_URL}/auth/login",
                data={
                    "username": user['email'],
                    "password": user['password'],
                    "grant_type": "password"
                },
                timeout=REQUEST_TIMEOUT
            )
            elapsed = time.time() - start
            
            if response.status_code == 200:
                self.tokens[user_index] = response.json()['access_token']
                self.update_stats(True, 200, "/auth/login", elapsed)
                return self.tokens[user_index]
            else:
                self.update_stats(False, response.status_code, "/auth/login", elapsed)
                return None
        except Exception as e:
            self.update_stats(False, 0, "/auth/login", 0, str(type(e).__name__))
            return None
    
    def create_todo(self, user_index, large_payload=False):
        """Create a todo item"""
        token = self.tokens.get(user_index)
        if not token:
            return
        
        description = MASSIVE_TODO_DESCRIPTION if large_payload else LARGE_TODO_DESCRIPTION if random.random() > 0.7 else "Regular todo"
        
        todo_data = {
            "title": f"Stress Test Todo {random.randint(1, 10000)}",
            "description": description,
            "status": random.choice(["pending", "in_progress", "completed"]),
            "priority": random.choice(["low", "medium", "high"]),
            "due_date": (datetime.now() + timedelta(days=random.randint(1, 30))).isoformat()
        }
        
        try:
            start = time.time()
            response = requests.post(
                f"{BASE_URL}/todos",
                json=todo_data,
                headers={"Authorization": f"Bearer {token}"},
                timeout=REQUEST_TIMEOUT
            )
            elapsed = time.time() - start
            
            if response.status_code in [200, 201]:
                todo_id = response.json().get('id')
                if user_index not in self.todo_ids:
                    self.todo_ids[user_index] = []
                self.todo_ids[user_index].append(todo_id)
                self.update_stats(True, response.status_code, "/todos [POST]", elapsed)
            else:
                self.update_stats(False, response.status_code, "/todos [POST]", elapsed)
        except requests.Timeout:
            with self.lock:
                self.results['timeouts'] += 1
            self.update_stats(False, 0, "/todos [POST]", 0, "Timeout")
        except Exception as e:
            self.update_stats(False, 0, "/todos [POST]", 0, str(type(e).__name__))
    
    def get_todos(self, user_index):
        """Get all todos for a user"""
        token = self.tokens.get(user_index)
        if not token:
            return
        
        try:
            start = time.time()
            response = requests.get(
                f"{BASE_URL}/todos",
                headers={"Authorization": f"Bearer {token}"},
                timeout=REQUEST_TIMEOUT
            )
            elapsed = time.time() - start
            self.update_stats(response.status_code == 200, response.status_code, "/todos [GET]", elapsed)
        except requests.Timeout:
            with self.lock:
                self.results['timeouts'] += 1
            self.update_stats(False, 0, "/todos [GET]", 0, "Timeout")
        except Exception as e:
            self.update_stats(False, 0, "/todos [GET]", 0, str(type(e).__name__))
    
    def update_todo(self, user_index):
        """Update a random todo"""
        token = self.tokens.get(user_index)
        if not token or user_index not in self.todo_ids or not self.todo_ids[user_index]:
            return
        
        todo_id = random.choice(self.todo_ids[user_index])
        update_data = {
            "title": f"Updated Todo {random.randint(1, 10000)}",
            "description": LARGE_TODO_DESCRIPTION if random.random() > 0.8 else "Updated description",
            "status": random.choice(["pending", "in_progress", "completed"]),
            "priority": random.choice(["low", "medium", "high"])
        }
        
        try:
            start = time.time()
            response = requests.put(
                f"{BASE_URL}/todos/{todo_id}",
                json=update_data,
                headers={"Authorization": f"Bearer {token}"},
                timeout=REQUEST_TIMEOUT
            )
            elapsed = time.time() - start
            self.update_stats(response.status_code == 200, response.status_code, "/todos/{id} [PUT]", elapsed)
        except requests.Timeout:
            with self.lock:
                self.results['timeouts'] += 1
            self.update_stats(False, 0, "/todos/{id} [PUT]", 0, "Timeout")
        except Exception as e:
            self.update_stats(False, 0, "/todos/{id} [PUT]", 0, str(type(e).__name__))
    
    def delete_todo(self, user_index):
        """Delete a random todo"""
        token = self.tokens.get(user_index)
        if not token or user_index not in self.todo_ids or not self.todo_ids[user_index]:
            return
        
        todo_id = self.todo_ids[user_index].pop()
        
        try:
            start = time.time()
            response = requests.delete(
                f"{BASE_URL}/todos/{todo_id}",
                headers={"Authorization": f"Bearer {token}"},
                timeout=REQUEST_TIMEOUT
            )
            elapsed = time.time() - start
            self.update_stats(response.status_code in [200, 204], response.status_code, "/todos/{id} [DELETE]", elapsed)
        except requests.Timeout:
            with self.lock:
                self.results['timeouts'] += 1
            self.update_stats(False, 0, "/todos/{id} [DELETE]", 0, "Timeout")
        except Exception as e:
            self.update_stats(False, 0, "/todos/{id} [DELETE]", 0, str(type(e).__name__))
    
    def get_me(self, user_index):
        """Get current user info"""
        token = self.tokens.get(user_index)
        if not token:
            return
        
        try:
            start = time.time()
            response = requests.get(
                f"{BASE_URL}/auth/me",
                headers={"Authorization": f"Bearer {token}"},
                timeout=REQUEST_TIMEOUT
            )
            elapsed = time.time() - start
            self.update_stats(response.status_code == 200, response.status_code, "/auth/me", elapsed)
        except requests.Timeout:
            with self.lock:
                self.results['timeouts'] += 1
            self.update_stats(False, 0, "/auth/me", 0, "Timeout")
        except Exception as e:
            self.update_stats(False, 0, "/auth/me", 0, str(type(e).__name__))
    
    def worker_task(self, worker_id):
        """Main worker task - executes random operations"""
        with self.lock:
            self.active_threads += 1
        
        print(f"{CYAN}[Worker {worker_id}]{RESET} Starting stress test...")
        
        # Login first
        token = self.register_and_login(worker_id)
        if not token:
            print(f"{RED}[Worker {worker_id}]{RESET} Failed to login!")
            with self.lock:
                self.active_threads -= 1
            return
        
        # Stress test loop - runs forever until interrupted
        request_count = 0
        while True:
            # Random operation with weighted distribution
            action = random.choices(
                ['create', 'get', 'update', 'delete', 'get_me', 'create_large'],
                weights=[40, 30, 15, 10, 5, 5],  # Create and GET are most common
                k=1
            )[0]
            
            if action == 'create':
                self.create_todo(worker_id, large_payload=False)
            elif action == 'create_large':
                self.create_todo(worker_id, large_payload=True)
            elif action == 'get':
                self.get_todos(worker_id)
            elif action == 'update':
                self.update_todo(worker_id)
            elif action == 'delete':
                self.delete_todo(worker_id)
            elif action == 'get_me':
                self.get_me(worker_id)
            
            # Minimal delay
            time.sleep(DELAY_BETWEEN_REQUESTS)
            
            # Progress update every 100 requests
            request_count += 1
            if request_count % 100 == 0:
                print(f"{BLUE}[Worker {worker_id}]{RESET} Progress: {request_count} requests sent")
    
    def print_stats(self):
        """Print current statistics"""
        elapsed = time.time() - self.results['start_time'] if self.results['start_time'] else 0
        total = self.results['total_requests']
        
        if total == 0:
            return
        
        print(f"\n{MAGENTA}{'='*80}{RESET}")
        print(f"{CYAN}STRESS TEST STATISTICS{RESET}")
        print(f"{MAGENTA}{'='*80}{RESET}")
        print(f"{YELLOW}Duration:{RESET} {elapsed:.2f}s")
        print(f"{YELLOW}Active Workers:{RESET} {self.active_threads}/{NUM_WORKERS}")
        print(f"{YELLOW}Total Requests:{RESET} {total}")
        print(f"{YELLOW}Requests/sec:{RESET} {total/elapsed:.2f}" if elapsed > 0 else "N/A")
        print(f"{GREEN}Success:{RESET} {self.results['success']} ({self.results['success']/total*100:.1f}%)")
        print(f"{RED}Errors:{RESET} {self.results['errors']} ({self.results['errors']/total*100:.1f}%)")
        print(f"{RED}Timeouts:{RESET} {self.results['timeouts']}")
        print(f"{YELLOW}Avg Response Time:{RESET} {self.results['total_time']/total*1000:.2f}ms" if total > 0 else "N/A")
        
        print(f"\n{CYAN}Status Codes:{RESET}")
        for code, count in sorted(self.results['status_codes'].items()):
            color = GREEN if code in [200, 201, 204] else YELLOW if code in [400, 401, 404] else RED
            print(f"  {color}{code}:{RESET} {count}")
        
        print(f"\n{CYAN}Top Endpoints:{RESET}")
        sorted_endpoints = sorted(self.results['endpoints'].items(), key=lambda x: x[1], reverse=True)[:10]
        for endpoint, count in sorted_endpoints:
            print(f"  {endpoint}: {count}")
        
        if self.results['error_types']:
            print(f"\n{RED}Error Types:{RESET}")
            for error, count in sorted(self.results['error_types'].items(), key=lambda x: x[1], reverse=True):
                print(f"  {error}: {count}")
        
        print(f"{MAGENTA}{'='*80}{RESET}\n")
    
    def run_stress_test(self):
        """Execute the stress test with multiple workers"""
        print(f"{MAGENTA}{'='*80}{RESET}")
        print(f"{CYAN}STARTING INFINITE STRESS TEST{RESET}")
        print(f"{MAGENTA}{'='*80}{RESET}")
        print(f"{YELLOW}Workers:{RESET} {NUM_WORKERS}")
        print(f"{YELLOW}Requests per worker:{RESET} INFINITE (until Ctrl+C)")
        print(f"{YELLOW}Delay between requests:{RESET} {DELAY_BETWEEN_REQUESTS}s")
        print(f"{RED}WARNING: This will generate continuous massive load!{RESET}")
        print(f"{RED}Press Ctrl+C to stop the test{RESET}")
        print(f"{MAGENTA}{'='*80}{RESET}\n")
        
        self.results['start_time'] = time.time()
        
        # Stats printer thread
        def stats_printer():
            while True:
                time.sleep(10)  # Print stats every 10 seconds
                self.print_stats()
        
        stats_thread = threading.Thread(target=stats_printer, daemon=True)
        stats_thread.start()
        
        # Launch all workers
        with ThreadPoolExecutor(max_workers=NUM_WORKERS) as executor:
            futures = [executor.submit(self.worker_task, i) for i in range(NUM_WORKERS)]
            
            try:
                # Keep running until interrupted
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print(f"\n{YELLOW}Stopping stress test...{RESET}")
                # Workers will stop naturally when executor shuts down
        
        # Final stats
        self.print_stats()
        
        total_time = time.time() - self.results['start_time']
        print(f"{GREEN}Stress test completed!{RESET}")
        print(f"{YELLOW}Total time:{RESET} {total_time:.2f}s")
        print(f"{YELLOW}Overall throughput:{RESET} {self.results['total_requests']/total_time:.2f} req/s")

if __name__ == "__main__":
    print(f"{RED}⚠️  WARNING: INFINITE STRESS TEST MODE ⚠️{RESET}")
    print(f"{YELLOW}This will create continuous massive load on your system!{RESET}")
    print(f"{YELLOW}Press Ctrl+C at any time to stop.{RESET}\n")
    
    try:
        tester = StressLoadTester()
        tester.run_stress_test()
    except KeyboardInterrupt:
        print(f"\n{RED}Test interrupted by user!{RESET}")
        if hasattr(tester, 'results') and tester.results['total_requests'] > 0:
            tester.print_stats()
    except Exception as e:
        print(f"{RED}Fatal error: {e}{RESET}")
