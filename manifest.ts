import packageJson from "./package.json";

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "Help Me Out",
  version: packageJson.version,
  description:
    "This extension helps you record and share help videos with ease.",
  permissions: ["storage", "activeTab", "scripting", "tabs"],
  host_permissions: ["<all_urls>"],
  options_page: "src/pages/options/index.html",
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  action: {
    default_icon: "logo.png",
    default_popup: "src/pages/popup/index.html",
  },

  icons: {
    "128": "logo.png",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      // js: ["src/pages/content/index.js"],
      // KEY for cache invalidation
      css: ["assets/css/contentStyle<KEY>.chunk.css"],
    },
  ],

  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "icon-128.png",
        "icon-34.png",
        "images/*",
      ],
      matches: ["<all_urls>"],
    },
  ],
  externally_connectable: {
    matches: ["http://localhost:3000/*"], // Allow external communication from this domain
  },
};

export default manifest;
