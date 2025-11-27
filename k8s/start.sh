#!/bin/bash

echo "🚀 Starting Todo App on Kubernetes..."

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
kubectl port-forward service/todo-nginx 3000:80 > /dev/null 2>&1 &
PORT_FORWARD_PID=$!

echo ""
echo "✨ Todo App is running!"
echo "📱 Access the app at: http://localhost:3000"
echo ""
echo "📊 Useful commands:"
echo "  - View pods:        kubectl get pods"
echo "  - View services:    kubectl get services"
echo "  - Backend logs:     kubectl logs -f deployment/todo-backend"
echo "  - Frontend logs:    kubectl logs -f deployment/todo-frontend"
echo "  - Stop port-forward: kill $PORT_FORWARD_PID"
echo ""
echo "🛑 To stop the app: kubectl delete -f k8s/"
echo ""
