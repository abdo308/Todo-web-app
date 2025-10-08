pipeline {
    agent any // Run on any available Jenkins agent

    stages {
        // Stage 1 (Previously Checkout): This stage has been removed.
        // Jenkins automatically checks out the correct branch before starting the pipeline.

        // The first stage is now 'Build Docker Image'
        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build . -t safiya089/todo-web-app:latest'
                }
            }
        }

        // Stage 2: Push the image to Docker Hub
        stage('Push to Docker Hub') {
            steps {
                script {
                    // Uses the 'DOCKERHUB_CREDENTIALS' ID from Jenkins Credentials
                    withCredentials([string(credentialsId: 'DOCKERHUB_CREDENTIALS', variable: 'DOCKER_PASSWORD')]) {
                        sh 'docker login -u "safiya089" -p "${DOCKER_PASSWORD}"'
                        sh 'docker push safiya089/todo-web-app:latest'
                    }
                }
            }
        }

        // Stage 3: Deploy the new image to your EC2 server
        stage('Deploy to Server') {
            steps {
                script {
                    // Uses the 'SSH_SERVER_CREDENTIALS' ID from Jenkins Credentials
                    withCredentials([sshUserPrivateKey(credentialsId: 'SSH_SERVER_CREDENTIALS', keyFileVariable: 'SSH_KEY')]) {
                        // === IMPORTANT: REPLACE 'your_server_ip' WITH YOUR ACTUAL EC2 IP ADDRESS ===
                        sh '''
                            ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} root@your_server_ip "
                                docker pull safiya089/todo-web-app:latest &&
                                docker stop todo-app-container || true &&
                                docker rm todo-app-container || true &&
                                docker run -d --name todo-app-container -p 80:8000 safiya089/todo-web-app:latest
                            "
                        '''
                    }
                }
            }
        }
    }
}

