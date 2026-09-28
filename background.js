const sarcasticMessages = [
  "Yakin mau buka tab baru? Yang lama aja belum dibaca.",
  "Napas dulu. CPU kamu udah nangis tuh.",
  "Fokus ke satu hal dulu, nggak usah sok multitasking.",
  "Tab baru lagi? Kapan selesainya kerjaanmu?"
];

// Re-usable function to check tabs and update notifications/badges
function checkTabsAndNotify() {
  chrome.storage.local.get({ maxLimit: 15, isPaused: false }, (settings) => {
    if (settings.isPaused) {
      chrome.action.setBadgeText({ text: "" });
      return;
    }

    chrome.tabs.query({}, (tabs) => {
      const tabCount = tabs.length;

      if (tabCount > settings.maxLimit) {
        // Show a red badge on the extension icon as a fallback!
        chrome.action.setBadgeText({ text: tabCount.toString() });
        chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
        
        showPassiveAggressiveNotification(tabCount);
      } else {
        // Clear the badge if under limit
        chrome.action.setBadgeText({ text: "" });
      }
    });
  });
}

// Listen to both tab creation and removal
chrome.tabs.onCreated.addListener(() => checkTabsAndNotify());
chrome.tabs.onRemoved.addListener(() => checkTabsAndNotify());

// Also check when a setting is updated in storage
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    checkTabsAndNotify();
  }
});

function showPassiveAggressiveNotification(tabCount) {
  const randomMessage = sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)];
  
  chrome.notifications.create(Date.now().toString(), {
    type: "basic",
    iconUrl: "/icon.png",
    title: `Overload: ${tabCount} Tabs Open!`,
    message: randomMessage,
    priority: 2
  }, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error("Gagal memunculkan notifikasi:", chrome.runtime.lastError.message);
    } else {
      console.log("Notifikasi berhasil dipanggil dengan ID:", notificationId);
    }
  });
}
