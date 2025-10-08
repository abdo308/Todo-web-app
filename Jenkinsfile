pipeline {
    agent any // Run on any available Jenkins agent

    options {
        skipDefaultCheckout true
    }

    stages {
        // Stage 1: Checkout
        stage('Checkout') {
            steps {
                cleanWs()
                git branch: 'main', url: 'https://github.com/abdo308/To-do-web-app-.git'
            }
        }

        // Stage 2: Build Docker Image
        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build . -t safiya089/todo-web-app:latest'
                }
            }
        }

        // Stage 3: Push to Docker Hub
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

        // Stage 4: Deploy to Server with all Dependencies
        stage('Deploy to Server') {
            steps {
                script {
                    // Pull all secrets: SSH key, Database URL, Redis URL, and Secret Key
                    withCredentials([
                        sshUserPrivateKey(credentialsId: 'SSH_SERVER_CREDENTIALS', keyFileVariable: 'SSH_KEY'),
                        string(credentialsId: 'DATABASE_URL', variable: 'DB_URL'),
                        string(credentialsId: 'REDIS_URL', variable: 'RD_URL'),
                        string(credentialsId: 'SECRET_KEY', variable: 'S_KEY')
                    ]) {
                       
                        sh 'ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ubuntu@16.171.23.59 "docker pull safiya089/todo-web-app:latest && docker stop todo-app-container || true && docker rm todo-app-container || true && docker run -d --name todo-app-container --network todo-net -p 80:8000 -e DATABASE_URL=\'${DB_URL}\' -e REDIS_URL=\'${RD_URL}\' -e SECRET_KEY=\'${S_KEY}\' -e ALGORITHM=HS256 -e ACCESS_TOKEN_EXPIRE_MINUTES=30 safiya089/todo-web-app:latest"'
                    }
                }
            }
        }
    }
}

