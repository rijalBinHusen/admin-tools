import fs from "fs";
import { loadEnv } from "vite"

const env = loadEnv("build", process.cwd(), "");

const manifest = {
  "manifest_version": 3,
  "name": "Admin tools",
  "version": "1.0",
  "description": "Sidepanel with Vue",
  "permissions": [
    "sidePanel",
    "scripting",
    "tabs",
    "identity"
  ],
  "oauth2": {
    "client_id": env.VITE_CLIENT_GOOGLE_ID || "",
    "scopes": [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/drive"
    ]
  },
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "side_panel": {
    "default_path": "index.html"
  },
  "content_scripts": [
    {
      "matches": [
        "<all_urls>"
      ],
      "js": [
        "content.js"
      ]
    }
  ]
}

fs.writeFileSync("dist/manifest.json", JSON.stringify(manifest, null, 2));
