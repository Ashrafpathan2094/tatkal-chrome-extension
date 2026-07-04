import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'

const { version } = packageJson

export default defineManifest({
  manifest_version: 3,
  name: 'IRCTC Auto Fill',
  version,
  action: {
    default_popup: 'index.html',
  },
  host_permissions: ['http://*/*', 'https://*/*'],
  permissions: ['scripting', 'storage', 'tabs'],
  background: {
    service_worker: 'src/background.js',
    type: 'module',
  },
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'self'",
  },
})
