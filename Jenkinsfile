pipeline {

    agent any

    options {
        timestamps()
        skipDefaultCheckout(true)
        skipStagesAfterUnstable()
    }

    stages {

        stage('Checkout') {
            agent { docker { image 'alpine:3.21'; reuseNode true } }
            steps { checkout scm }
        }

        stage('Install Dependencies') {
            agent { docker { image 'node:22-alpine'; reuseNode true; args '-e HOME=/tmp -e npm_config_cache=/tmp/.npm' } }
            steps {
                sh '''
                    set -e
                    echo "=== Node Runtime ==="
                    node --version
                    npm --version
                    rm -rf node_modules
                    npm install --no-audit --no-fund --no-package-lock
                    echo "=== Dependencies Installed ==="
                '''
            }
        }

        stage('Test') {
            agent { docker { image 'node:22-alpine'; reuseNode true; args '-e HOME=/tmp -e npm_config_cache=/tmp/.npm' } }
            steps {
                sh '''
                    set -e
                    echo "=== Running Vitest ==="
                    npx vitest run --passWithNoTests
                '''
            }
        }

        stage('Build Application') {
            agent { docker { image 'node:22-alpine'; reuseNode true; args '-e HOME=/tmp -e npm_config_cache=/tmp/.npm' } }
            steps {
                sh '''
                    set -e
                    echo "=== Building Vite App ==="
                    npm run build
                    test -f dist/index.html
                    ls -lh dist
                '''
            }
        }

        stage('Trivy Security Scan') {
            agent {
                docker {
                    image 'aquasec/trivy:0.74.0'
                    reuseNode true
                    args '''
                        --entrypoint=""
                        -e HOME=/tmp
                        -e XDG_CACHE_HOME=/tmp/.cache
                    '''
                }
            }
            steps {
                sh '''
                    set -e
                    mkdir -p .trivy-cache || true
                    trivy --version
                    trivy fs \
                        --cache-dir .trivy-cache \
                        --scanners vuln \
                        --severity HIGH,CRITICAL \
                        --skip-dirs node_modules \
                        --skip-dirs dist \
                        --format sarif \
                        --output trivy-results.sarif \
                        --exit-code 0 \
                        .
                    ls -lh trivy-results.sarif
                '''
            }
            post {
                always {
                    recordIssues(
                        enabledForFailure: true,
                        failOnError: false,
                        tools: [sarif(id: 'trivy', name: 'Trivy Security', pattern: 'trivy-results.sarif')]
                    )
                }
            }
        }

        stage('Package Application') {
            agent { docker { image 'alpine:3.21'; reuseNode true; args '-u root' } }
            steps {
                sh '''
                    set -e
                    apk add --no-cache git zip unzip
                    rm -f latest-app.zip
                    git config --global --add safe.directory '*' || true
                    git archive --format=zip HEAD -o latest-app.zip
                    ls -lh latest-app.zip
                    if unzip -Z1 latest-app.zip | grep -E '^\\.env$' >/dev/null; then
                        echo "ERROR: zip masih berisi .env rahasia"
                        exit 1
                    fi
                    echo "OK: file .env tidak ada di zip"
                    unzip -l latest-app.zip | head -n 60
                '''
            }
        }

        stage('Publish Application') {
            steps {
                archiveArtifacts(artifacts: 'latest-app.zip', fingerprint: true, allowEmptyArchive: false)
                script {
                    def appName = env.JOB_NAME
                        .replaceAll('[^a-zA-Z0-9._-]', '-')
                        .replaceAll('-+', '-')
                        .replaceAll('^-|-$', '')
                    def buildId = env.BUILD_NUMBER
                    echo "Application Name: ${appName}"
                    echo "Build ID: ${buildId}"

                    sh """
                        set -e
                        docker exec cicd-jenkins \\
                            mkdir -p \\
                            "/var/jenkins_home/userContent/applications/${appName}/${buildId}"
                        docker cp \\
                            latest-app.zip \\
                            "cicd-jenkins:/var/jenkins_home/userContent/applications/${appName}/${buildId}/latest-app.zip"
                        docker exec cicd-jenkins \\
                            ls -lh \\
                            "/var/jenkins_home/userContent/applications/${appName}/${buildId}/latest-app.zip"
                    """

                    def jenkinsBaseUrl = env.BUILD_URL
                        .substring(0, env.BUILD_URL.indexOf('/job/'))
                        .replace('localhost', 'host.docker.internal')
                    env.ARTIFACT_URL =
                        "${jenkinsBaseUrl}/userContent/applications/${appName}/${buildId}/latest-app.zip"
                    echo "Artifact URL: ${env.ARTIFACT_URL}"
                }
            }
        }

        stage('Deploy Application') {
            agent { docker { image 'curlimages/curl:8.15.0'; reuseNode true; args '--network cicd-network' } }
            steps {
                script {
                    def redeployResponse = sh(
                        script: '''
                            set -e
                            curl -sS --fail-with-body \
                                -X POST "$URL_REDEPLOY" \
                                -H "Content-Type: application/json" \
                                -d "{
                                    \\"token_access\\": \\"$DEPLOY_TOKEN\\",
                                    \\"website_id\\": \\"$WEBSITE_ID\\",
                                    \\"source_url\\": \\"$ARTIFACT_URL\\",
                                    \\"source_type\\": \\"jenkins\\"
                                }"
                        ''',
                        returnStdout: true
                    ).trim()
                    echo "Redeploy Response:"
                    echo redeployResponse

                    def maxAttempts = 120
                    def attempt = 0
                    def deploymentStatus = 'IN_PROGRESS'

                    while (deploymentStatus == 'IN_PROGRESS') {
                        attempt++
                        if (attempt > maxAttempts) {
                            error("Deployment timeout. Status masih IN_PROGRESS setelah ${maxAttempts} attempts.")
                        }
                        sleep time: 5, unit: 'SECONDS'
                        echo "=== Checking Deployment Progress (${attempt}/${maxAttempts}) ==="

                        def progressResponse = sh(
                            script: '''
                                set -e
                                curl -sS --fail-with-body \
                                    -X POST "$URL_PROGRESS" \
                                    -H "Content-Type: application/json" \
                                    -d "{
                                        \\"token_access\\": \\"$DEPLOY_TOKEN\\",
                                        \\"website_id\\": \\"$WEBSITE_ID\\"
                                    }"
                            ''',
                            returnStdout: true
                        ).trim()
                        echo "Progress Response:"
                        echo progressResponse

                        def json = readJSON text: progressResponse
                        deploymentStatus = json?.data?.status?.toString()?.toUpperCase()
                        if (!deploymentStatus) {
                            error("Response progress tidak memiliki data.status")
                        }
                        echo "Deployment Status: ${deploymentStatus}"

                        if (deploymentStatus == 'SUCCESS') {
                            echo "✅ DEPLOYMENT SUCCESS"
                            break
                        }
                        if (deploymentStatus == 'FAIL') {
                            echo "❌ DEPLOYMENT FAILED"
                            echo(json?.data?.log ?: 'Deployment failed tanpa log.')
                            error("Deployment gagal untuk website ${WEBSITE_ID}")
                        }
                        echo "Deployment masih berjalan..."
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts(artifacts: 'trivy-results.sarif', allowEmptyArchive: true)
        }
        success {
            echo "✅ PIPELINE SUCCESS"
            echo "📦 Artifact: ${env.ARTIFACT_URL ?: '(not published)'}"
        }
        failure {
            echo "❌ PIPELINE FAILED — periksa log stage yang merah."
        }
    }
}