const input = document.getElementById("connection");
const feedback = document.getElementById("status");

async function load() {
  const { connection = "" } = await chrome.storage.local.get("connection");
  input.value = connection;
}

document.getElementById("save").addEventListener("click", async () => {
  await chrome.storage.local.set({ connection: input.value.trim() });
  feedback.textContent = input.value.trim()
    ? `Saved. Redirection enabled to: "${input.value.trim()}".`
    : "Saved. Will not redirect.";
});

load().catch(console.error);
