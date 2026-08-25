# 魔塔 · Tower of Doom — Run & Deploy

Real-time co-op multiplayer Tower of Doom (魔塔), built as a `client/` +
`server/` + `shared/` npm workspace at the repo root. Design doc:
[`design/gdd/tower-of-doom.md`](design/gdd/tower-of-doom.md).

- **client/** — Phaser 3 + Vite front end
- **server/** — Colyseus (Node.js) authoritative multiplayer room
- **shared/** — types, the combat formula (+ unit tests), and floor data used by both

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run build:shared      # server & client both import the built shared package

# two terminals:
npm run dev:server        # Colyseus room on ws://localhost:2567
npm run dev:client        # Vite dev server on http://localhost:5173
```

Open `http://localhost:5173` in two browser tabs/windows, enter a name in
each, and click "加入游戏" (Join Game) — both tabs join the same room and
share the same tower.

## Test

```bash
npm test          # combat formula unit tests (shared/src/combat.test.ts)
```

## Run with Docker (single container, production-style)

Builds the client, bundles it into the server's `public/` folder, and serves
both the static site and the WebSocket room from one port:

```bash
docker compose up --build
# open http://localhost:8080
```

## Deploy to Azure

Target: **Azure Container Apps** (native WebSocket support). Infra is defined
in [`infra/main.bicep`](infra/main.bicep).

> **Scaling note**: a Colyseus room keeps authoritative game state in the
> memory of a single process. The Bicep template pins the Container App to
> **1 replica**. Do not raise `maxReplicas` without first adding a shared
> presence/state store (e.g. Redis) — otherwise players joining the "same"
> room can land on different instances with divergent tower state.

### First-time infra setup

```bash
az login
az group create --name rg-tower-of-doom --location eastus

az deployment group create \
  --resource-group rg-tower-of-doom \
  --template-file infra/main.bicep \
  --parameters appName=tower-of-doom
```

This creates an Azure Container Registry, a Log Analytics workspace, a
Container Apps environment, and the Container App itself (initially running
a public placeholder image — see the comment in `main.bicep` for why). Note
the `acrName` and `containerAppName` outputs.

### Build and push the real image once, manually

```bash
az acr build --registry <acrName> --image tower-of-doom:v1 .
az containerapp update \
  --name <containerAppName> \
  --resource-group rg-tower-of-doom \
  --image <acrName>.azurecr.io/tower-of-doom:v1
```

### Continuous deploys via GitHub Actions

[`.github/workflows/deploy-azure.yml`](.github/workflows/deploy-azure.yml)
runs the shared package's tests, then builds the image in ACR and updates
the Container App on every push to `main`. It authenticates via OIDC
(no client secret in GitHub). One-time setup:

1. Create an Azure AD app registration and a federated credential trusting
   `repo:<org>/<repo>:ref:refs/heads/main` (Azure Portal → App registrations
   → your app → Certificates & secrets → Federated credentials).
2. Grant that app's service principal `AcrPush` on the ACR and `Contributor`
   (or a narrower custom role) on the resource group.
3. In the GitHub repo, set:
   - Secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
   - Variables: `AZURE_RESOURCE_GROUP`, `ACR_NAME`, `CONTAINERAPP_NAME`
     (the values from the Bicep outputs above)

## Known MVP limitations

See the GDD's "Edge Cases" and "Acceptance Criteria" sections. Notably: no
player death/respawn (unwinnable fights are simply blocked), no persistence
across room restarts, and single-replica-only multiplayer.

## Known dependency pin

`server/package.json` pins `@colyseus/core` to the exact version `0.16.24`
instead of a `^0.16.0` range. `0.16.25` was published with a broken
`@colyseus/greeting-banner: "workspace:^"` dependency (an unreplaced pnpm
workspace protocol string), which `npm install` cannot resolve. This also
means `npm audit` will flag an old `nanoid` transitively pulled in by
`@colyseus/core@0.16.x` (fix requires `@colyseus/core@0.17.x`, which in turn
requires `@colyseus/schema@^4.0.7` — incompatible with the `colyseus.js`
client, which is still published against `@colyseus/schema@^3.0.0` as of
this writing). Re-evaluate this pin once `colyseus.js` catches up to schema
v4, or once a fixed `0.16.x` patch of `@colyseus/core` ships.
