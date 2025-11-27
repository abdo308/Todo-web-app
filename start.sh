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
echo "🔗 Setting up port forwarding to localhost:3000..."
echo ""
echo "✨ Todo App is running!"
echo "📱 Access the app at: http://localhost:3000"
echo ""
echo "🛑 To stop: Press Ctrl+C, then run: kubectl delete -f k8s/"
echo ""
echo "Port forwarding active (do not close this terminal)..."
kubectl port-forward service/todo-nginx 3000:80
