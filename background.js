const RULE_ID = 1;

async function updateRule() {
  const { connection } = await chrome.storage.local.get("connection");
  const value = typeof connection === "string" ? connection.trim() : "";

  // No configured value: remove the rule so requests are left alone.
  if (!value) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE_ID]
    });
    return;
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
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
        urlFilter: "||auth0.com",
        regexFilter: "^https://[^/]+\\.auth0\\.com/",
        resourceTypes: ["main_frame"]
      }
    }]
  });
}

// Rebuild on extension install/startup and whenever the option changes.
chrome.runtime.onInstalled.addListener(() => {
  updateRule().catch(console.error);
});
chrome.runtime.onStartup.addListener(() => {
  updateRule().catch(console.error);
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.connection) {
    updateRule().catch(console.error);
  }
});
