pipeline {
    agent any // Run on any available Jenkins agent

    options {
        // Prevent the automatic, sometimes problematic, default checkout
        skipDefaultCheckout true
    }

    stages {
        // Stage 1: A controlled and clean checkout process
        stage('Checkout') {
            steps {
                // First, completely clean the workspace to avoid any previous state issues
                cleanWs()
                
                // Now, explicitly check out the correct branch from the repository
                git branch: 'main', url: 'https://github.com/abdo308/To-do-web-app-.git'
            }
        }

        // Stage 2: Build the Docker image
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
                  
                    withCredentials([usernamePassword(credentialsId: 'DOCKERHUB_CREDENTIALS', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                       
                        sh 'docker login -u "${DOCKER_USERNAME}" -p "${DOCKER_PASSWORD}"'
                        sh 'docker push safiya089/todo-web-app:latest'
                    }
                }
            }
        }

        // Stage 4: Deploy the new image to your EC2 server
        stage('Deploy to Server') {
            steps {
                script {
                    // Uses the 'SSH_SERVER_CREDENTIALS' ID from Jenkins Credentials
                    withCredentials([sshUserPrivateKey(credentialsId: 'SSH_SERVER_CREDENTIALS', keyFileVariable: 'SSH_KEY')]) {
                        // === IMPORTANT: REPLACE 'your_server_ip' WITH YOUR ACTUAL EC2 IP ADDRESS ===
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
