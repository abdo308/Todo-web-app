#!/bin/bash

echo "🚀 Starting Todo App on Kubernetes..."

# Kill any existing port-forward processes
echo "🔍 Checking for existing port-forward processes..."
pkill -f "kubectl port-forward" 2>/dev/null && echo "   Stopped existing port-forward" || echo "   No existing port-forward found"

# Apply all Kubernetes manifests
echo "📦 Applying Kubernetes manifests..."
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/nginx/

echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/todo-backend
kubectl wait --for=condition=available --timeout=300s deployment/todo-frontend
kubectl wait --for=condition=available --timeout=300s deployment/todo-nginx
kubectl wait --for=condition=available --timeout=300s deployment/postgres

echo "✅ All deployments are ready!"

# Set up port forwarding
echo "🔗 Setting up port forwarding..."
echo ""

# Check if monitoring namespace exists
if kubectl get namespace monitoring &> /dev/null; then
    echo "📊 Monitoring stack detected - setting up additional port forwards..."
    
    # Start Grafana port-forward in background
    kubectl port-forward -n monitoring svc/monitoring-grafana 3001:80 > /dev/null 2>&1 &
    GRAFANA_PID=$!
    
    # Start Prometheus port-forward in background
    kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-prometheus 9092:9090 > /dev/null 2>&1 &
    PROMETHEUS_PID=$!
    
    # Wait a moment for port-forwards to establish
    sleep 2
    
    # Get Grafana password
    echo "   ✅ Grafana: http://localhost:3001"
    echo "      Username: admin"
    echo -n "      Password: "
    kubectl get secret -n monitoring monitoring-grafana -o jsonpath="{.data.admin-password}" 2>/dev/null | base64 --decode
    echo ""
    echo ""
    echo "   ✅ Prometheus: http://localhost:9092"
    echo ""
else
    echo "ℹ️  Monitoring not installed. To add monitoring, see README.md"
    echo ""
fi

echo "✨ Todo App is running!"
echo "📱 Access the app at: http://localhost:3000"
echo ""
echo "🛑 To stop: Press Ctrl+C, then run:  ./delete.sh "
echo ""
echo "Port forwarding active (do not close this terminal)..."
kubectl port-forward service/todo-nginx 3000:80
