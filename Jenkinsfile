pipeline {
    agent any

    stages {
        stage('SCM') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        def scannerHome = tool 'SonarScanner'
                        bat """\\bin\\sonar-scanner.bat"" -Dsonar.projectKey=galenos-frontend -Dsonar.sources=src -Dsonar.projectName=GalenosPro-Frontend"
                    }
                }
            }
        }
    }
}