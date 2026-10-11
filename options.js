const RULE_ID = 1;
const input = document.getElementById("connection");
const status = document.getElementById("status");

async function load() {
  const { connection = "" } = await chrome.storage.local.get("connection");
  input.value = connection;
}

document.getElementById("save").addEventListener("click", async () => {
  const value = input.value.trim();

  try {
    await chrome.storage.local.set({ connection: value });

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE_ID],
      addRules: value ? [{
        id: RULE_ID,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            transform: {
              queryTransform: {
                removeParams: ["connection"],
                addOrReplaceParams: [{ key: "connection", value }]
              }
            }
          }
        },
        condition: {
          regexFilter: "^https://[^/]+\\.auth0\\.com/",
          resourceTypes: ["main_frame"]
        }
      }] : []
    });

    status.textContent = value
      ? "Saved. The rule is active."
      : "Saved. The rule is disabled.";
  } catch (error) {
    console.error(error);
    status.textContent = `Could not update the rule: ${error.message}`;
  }
});

load().catch(console.error);
