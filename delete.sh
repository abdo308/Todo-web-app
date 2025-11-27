#!/bin/bash

echo "🛑 Stopping Todo App on Kubernetes..."

# Kill port-forward processes
echo "🔌 Stopping port forwarding..."
pkill -f "kubectl port-forward" 2>/dev/null && echo "   ✓ Port-forward stopped" || echo "   ℹ No port-forward running"

# Delete all Kubernetes resources
echo "🗑️  Deleting Kubernetes resources..."
kubectl delete -f k8s/nginx/
kubectl delete -f k8s/frontend/
kubectl delete -f k8s/backend/
kubectl delete -f k8s/postgres/

echo ""
echo "✅ Todo App stopped successfully!"
echo ""
echo "💡 To start again, run: ./start.sh"
echo ""
