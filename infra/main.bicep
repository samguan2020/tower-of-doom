@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Base name used to derive resource names')
param appName string = 'tower-of-doom'

@description('Container image to deploy. Defaults to a public placeholder so the first `az deployment group create` succeeds before the ACR role assignment exists (chicken-and-egg with a private registry). CI/CD updates this to the real image after the first deploy.')
param containerImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

@description('Colyseus rooms keep authoritative state in memory on a single process. Do NOT raise this above 1 without adding a shared state store (e.g. Redis presence/driver) — otherwise players get split across instances with divergent tower state.')
param maxReplicas int = 1

@description('Whether to wire up the ACR registry credential (system identity) on the container app. Must stay false on the very first deploy: the AcrPull role assignment below depends on the container app identity, so it does not exist yet, and pointing the revision at an unauthorized private registry causes provisioning to hang and fail with "Operation expired". Flip to true (redeploy or `az containerapp update`) once the role assignment has had time to propagate after a first successful deploy.')
param useAcrRegistry bool = false

@description('Port the container listens on. The placeholder image (mcr.microsoft.com/azuredocs/containerapps-helloworld) listens on 80; the real Tower of Doom image listens on 8080 (see Dockerfile/server PORT env var). Must match whichever image `containerImage` points to, or the ingress startup probe gets "connection refused" and the revision never becomes healthy.')
param containerTargetPort int = 80

var acrName = toLower(replace('${appName}acr${uniqueString(resourceGroup().id)}', '-', ''))
var logAnalyticsName = '${appName}-logs'
var envName = '${appName}-env'
var containerAppName = appName
var acrPullRoleId = '7f951dda-4ed3-4680-a7ca-43fe172d538d'

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
  }
}

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-11-02-preview' = {
  name: envName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

resource containerApp 'Microsoft.App/containerApps@2023-11-02-preview' = {
  name: containerAppName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: containerTargetPort
        // 'auto' can negotiate HTTP/2 with some clients (notably mobile browsers), and
        // WebSocket-over-HTTP/2 (RFC 8441) upgrades aren't reliably supported end to end —
        // Colyseus clients on those connections hang forever waiting to join a room. Force
        // HTTP/1.1 so the WebSocket upgrade always works.
        transport: 'http'
        allowInsecure: false
      }
      registries: useAcrRegistry ? [
        {
          server: acr.properties.loginServer
          identity: 'system'
        }
      ] : []
    }
    template: {
      containers: [
        {
          name: containerAppName
          image: containerImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'PORT'
              value: '8080'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: maxReplicas
      }
    }
  }
}

resource acrPullAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, containerApp.id, acrPullRoleId)
  scope: acr
  properties: {
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleId)
  }
}

output containerAppUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output acrLoginServer string = acr.properties.loginServer
output acrName string = acr.name
output containerAppName string = containerApp.name
