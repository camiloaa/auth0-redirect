const RULE_ID = 1;

if (typeof browser == "undefined") {
  // `browser` is not defined in Chrome, but Manifest V3 extensions in Chrome
  // also support promises in the `chrome` namespace, like Firefox. To easily
  // test the example without modifications, polyfill "browser" to "chrome".
  globalThis.browser = chrome;
}

async function updateRule() {
  console.log("Waiting async");
  const { connection } = await browser.storage.local.get("connection");
  const value = typeof connection === "string" ? connection.trim() : "";
  console.log("Waiting async " + value);

  // No configured value: remove the rule so requests are left alone.
  if (!value) {
    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE_ID]
    });
    return;
  }

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: [{
      id: RULE_ID,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          transform: {
            queryTransform: {
              // Replaces existing "connection" parameters; adds one if absent.
              removeParams: ["connection"],
              addOrReplaceParams: [{
                key: "connection",
                value
              }]
            }
          }
        }
      },
      condition: {
        // The || anchors matching at the hostname boundary.
        regexFilter: "^https://[^/]+\\.auth0\\.com/",
        resourceTypes: ["main_frame"]
      }
    }]
  });
}


// Rebuild on extension install/startup and whenever the option changes.
browser.runtime.onInstalled.addListener(() => {
  console.log("Waiting installed");
  updateRule().catch(console.error);
});
browser.runtime.onStartup.addListener(() => {
  console.log("Waiting start");
  updateRule().catch(console.error);
});
browser.storage.onChanged.addListener((changes, area) => {
  console.log("Waiting changed");
  if (area === "local" && changes.connection) {
    updateRule().catch(console.error);
  }
});
