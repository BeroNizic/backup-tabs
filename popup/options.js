function onCreated(tab) {
  console.log(`Created new tab: ${tab.id}`);
  window.close();
}

function onError(error) {
  console.log(`Error: ${error}`);
}

var creating = chrome.tabs.create(
  {
    url: "/backup-tabs/backup-tabs.html"
  },
  onCreated
);
//creating.then(onCreated, onError);
