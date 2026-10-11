const RULE_ID = 1;

if (typeof browser == "undefined") {
  // `browser` is not defined in Chrome, but Manifest V3 extensions in Chrome
  // also support promises in the `chrome` namespace, like Firefox. To easily
  // test the example without modifications, polyfill "browser" to "chrome".
  globalThis.browser = chrome;
}

async function updateRule() {
  const { connection } = await browser.storage.local.get("connection");
  const organization = typeof connection === "string" ? connection.trim() : "";

  // No configured value: remove the rule so requests are left alone.
  if (!organization) {
    console.debug("Auth0 will not redirect");
    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE_ID]
    });
    return;
  }

  console.debug("Auth0 will redirect to  " + organization);

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
                value: organization
              }]
            }
          }
        }
      },
      condition: {
        regexFilter: "^https://[^/]+\\.auth0\\.com/",
        resourceTypes: ["main_frame"]
      }
    }]
  });
}

// Create redirection rule at extension start.
browser.runtime.onStartup.addListener(() => {
  console.debug("Auth0 redirect started");
  updateRule().catch(console.error);
});

// Rebuild redirection rule when there are changes.
browser.storage.onChanged.addListener((changes, area) => {
  console.debug("Auth0 redirect changed");
  if (area === "local" && changes.connection) {
    updateRule().catch(console.error);
  }
});
