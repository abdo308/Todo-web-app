#!/bin/bash

echo "📊 Opening Grafana Dashboard..."
echo ""
echo "Grafana Credentials:"
echo "  Username: admin"
echo "  Password: Yp8Q9fSydbnXLGGRcMdkag9MBgPnV4stpBy14ie8"
echo ""
echo "🌐 Grafana will be available at: http://localhost:3001"
echo ""
echo "💡 Press Ctrl+C to stop port forwarding"
echo ""

kubectl --namespace monitoring port-forward svc/monitoring-grafana 3001:80
