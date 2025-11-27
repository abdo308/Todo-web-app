#!/bin/bash

echo "🔍 Opening Prometheus UI..."
echo ""
echo "🌐 Prometheus will be available at: http://localhost:9090"
echo ""
echo "💡 Check Targets at: http://localhost:9090/targets"
echo "💡 Check Service Discovery at: http://localhost:9090/service-discovery"
echo ""
echo "💡 Press Ctrl+C to stop port forwarding"
echo ""

kubectl --namespace monitoring port-forward svc/monitoring-kube-prometheus-prometheus 9092:9090
