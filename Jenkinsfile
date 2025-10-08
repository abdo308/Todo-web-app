pipeline {
    agent any // Run on any available Jenkins agent

    stages {
        // Stage 1: Checkout the source code from GitHub
        stage('Checkout') {
            steps {
                // Pulls the latest code from your specific repository
                git 'https://github.com/abdo308/To-do-web-app-.git'
            }
        }

        // Stage 2: Build the Docker image using the Dockerfile
        stage('Build Docker Image') {
            steps {
                script {
                    // Builds the image and tags it with your Docker Hub username and app name
                    sh 'docker build . -t safiya089/todo-web-app:latest'
                }
            }
        }

        // Stage 3: Log in and push the image to Docker Hub
        stage('Push to Docker Hub') {
            steps {
                script {
                    // Securely uses the credentials stored in Jenkins (ID: DOCKERHUB_CREDENTIALS)
                    withCredentials([string(credentialsId: 'DOCKERHUB_CREDENTIALS', variable: 'DOCKER_PASSWORD')]) {
                        // Logs into Docker Hub using the stored credentials
                        sh 'docker login -u "safiya089" -p "${DOCKER_PASSWORD}"'
                        
                        // Pushes the tagged image to your Docker Hub repository
                        sh 'docker push safiya089/todo-web-app:latest'
                    }
                }
            }
        }

        // Stage 4: Deploy the new image to your production server
        stage('Deploy to Server') {
            steps {
                script {
                    // Securely uses the SSH credentials for your server (ID: SSH_SERVER_CREDENTIALS)
                    withCredentials([sshUserPrivateKey(credentialsId: 'SSH_SERVER_CREDENTIALS', keyFileVariable: 'SSH_KEY')]) {
                        // Connects to your server via SSH and runs deployment commands
                        // IMPORTANT: Replace 'user' and 'your_server_ip' with your actual server details
                        sh '''
                            ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} user@your_server_ip "
                                docker pull safiya089/todo-web-app:latest &&
                                docker stop todo-app-container || true &&
                                docker rm todo-app-container || true &&
                                docker run -d --name todo-app-container -p 80:3000 safiya089/todo-web-app:latest
                            "
                        '''
                    }
                }
            }
        }
    }
}
