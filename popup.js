document.addEventListener('DOMContentLoaded', () => {
  const currentTabsEl = document.getElementById('current-tabs');
  const maxLimitEl = document.getElementById('max-limit');
  const pauseToggleEl = document.getElementById('pause-toggle');

  // Load current settings
  chrome.storage.local.get({ maxLimit: 15, isPaused: false }, (settings) => {
    maxLimitEl.value = settings.maxLimit;
    pauseToggleEl.checked = settings.isPaused;
    // We call updateTabCount right after loading the correct limit
    updateTabCount();
  });

  // Calculate and display current tab count
  const updateTabCount = () => {
    chrome.tabs.query({}, (tabs) => {
      const count = tabs.length;
      
      // Animate counting up
      let currentVal = parseInt(currentTabsEl.textContent) || 0;
      if (currentVal !== count && currentVal !== 0) {
          currentTabsEl.style.transform = 'scale(1.1)';
          setTimeout(() => currentTabsEl.style.transform = 'scale(1)', 150);
      }
      
      currentTabsEl.textContent = count;
      
      // Update styling based on threshold
      const limit = parseInt(maxLimitEl.value, 10) || 15;
      if (count > limit && !pauseToggleEl.checked) {
        currentTabsEl.classList.add('warning');
      } else {
        currentTabsEl.classList.remove('warning');
      }
    });
  };

  // Re-check whenever tabs change
  chrome.tabs.onCreated.addListener(updateTabCount);
  chrome.tabs.onRemoved.addListener(updateTabCount);

  // Listeners for setting changes (using 'input' instead of 'change' so it saves instantly as you type!)
  maxLimitEl.addEventListener('input', (e) => {
    let newLimit = parseInt(e.target.value, 10);
    
    // Only save if it's a valid number
    if (!isNaN(newLimit) && newLimit >= 1) {
      chrome.storage.local.set({ maxLimit: newLimit });
      updateTabCount();
    }
  });

  // If user leaves it blank or invalid, reset to 15 on blur
  maxLimitEl.addEventListener('blur', (e) => {
    let newLimit = parseInt(e.target.value, 10);
    if (isNaN(newLimit) || newLimit < 1) {
      e.target.value = 15;
      chrome.storage.local.set({ maxLimit: 15 });
      updateTabCount();
    }
  });

  pauseToggleEl.addEventListener('change', (e) => {
    chrome.storage.local.set({ isPaused: e.target.checked });
    updateTabCount();
  });
});
