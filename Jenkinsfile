pipeline {
    agent any // Run on any available Jenkins agent

    stages {
        // Stage 1: Checkout the source code from GitHub
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/abdo308/To-do-web-app-.git'
            }
        }

        // Stage 2: Build the Docker image using the Dockerfile
        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build . -t safiya089/todo-web-app:latest'
                }
            }
        }

        // Stage 3: Push the image to Docker Hub
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

        // Stage 4: Deploy the new image to your EC2 server via SSH
        stage('Deploy to Server') {
            steps {
                script {
                    
                    withCredentials([sshUserPrivateKey(credentialsId: 'SSH_SERVER_CREDENTIALS', keyFileVariable: 'SSH_KEY')]) {
                       
                      sh '''
                            ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ubuntu@16.171.23.59 "
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


