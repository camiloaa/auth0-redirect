const input = document.getElementById("connection");
const status = document.getElementById("status");

async function load() {
  const { connection = "" } = await chrome.storage.local.get("connection");
  input.value = connection;
}

document.getElementById("save").addEventListener("click", async () => {
  await chrome.storage.local.set({ connection: input.value.trim() });
  status.textContent = input.value.trim()
    ? "Saved. The rule is active."
    : "Saved. The rule is disabled.";
});

load().catch(console.error);
