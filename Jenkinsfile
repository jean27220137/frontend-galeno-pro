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
                        bat scannerHome + '\\bin\\sonar-scanner.bat -Dsonar.projectKey=galenos-frontend -Dsonar.projectName=GalenosPro-Frontend -Dsonar.sources=src -Dsonar.exclusions=**/node_modules/**,**/*.spec.ts'
                    }
                }
            }
        }
    }
}