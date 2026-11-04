# Quantum Powered POWER sizer

Quick sizer for IBM POWER servers.

Reference of CPW and rPerf rating for current and older IBM POWER servers.

Available at [https://qpps.github.io](https://qpps.github.io).

Based on [IBM Power Performance Report](https://www.ibm.com/downloads/cas/K90RQOW8) and [IBM Power Performance Capabilities Reference](https://www.ibm.com/downloads/cas/LGMXGGPJ).

NOT an official IBM tool.

This tool is provided as is without warranty of any kind. Refer to IBM, your business partner and/or official IBM documentation.

Currently beta software.

## Development

Requires Node.js 20.19 or later (22 recommended).

```sh
npm ci
npm run dev      # local dev server
npm run check    # svelte-check
npm run build    # static site written to ./build
```

## Deployment

Pushes to `main` are built and deployed to GitHub Pages by `.github/workflows/deploy.yml`.
In the repository settings, set Pages > Source to "GitHub Actions". The base path is derived from the repository name: a
`<owner>.github.io` repository is served from the domain root, any other repository from `/<repo>`.
For a local build under a sub-path, set `BASE_PATH`, e.g. `BASE_PATH=/qpps.github.io npm run build`.
