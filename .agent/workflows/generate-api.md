---
description: Generate API client code from OpenAPI spec using Orval
---

## Prerequisites
- Backend Spring Boot should be running at `http://localhost:8080` if you need fresh API docs

## Steps

1. (Optional) Fetch fresh OpenAPI spec from running backend and patch problematic endpoints:
```powershell
node -e "const http = require('http'); const fs = require('fs'); http.get('http://localhost:8080/v3/api-docs', (res) => { let data = ''; res.on('data', c => data += c); res.on('end', () => { const spec = JSON.parse(data); delete spec.paths['/api/merchandise/checkProduct/{name}']; delete spec.paths['/api/merchandise/checkCategory/{name}']; fs.writeFileSync('api-docs.json', JSON.stringify(spec, null, 2), 'utf8'); console.log('Saved api-docs.json'); }); })"
```

// turbo
2. Run Orval to generate TypeScript types and React Query hooks:
```powershell
npm run generate:api
```

// turbo
3. Verify the generated code compiles:
```powershell
npx tsc --noEmit
```
