document.getElementById("fileLoad").addEventListener("change", e => {
  let fileReader = new FileReader();
  fileReader.onload = function() {
    const content = fileReader.result;
    var matches = [];
    var urls = [];
    var hrefs = content.match(/href='([^']*)/gi); //TODO href can have ' and spaces in it?
    //TODO remove href part -> leave clear URL
    //TODO delete the ones which doesn't start with http?

    //console.log(hrefs);
    for (let i = 0; i < hrefs.length; i++) {
      let url = hrefs[i].replace("href='", "");
      urls.push(url);
    }
    /*hrefs[i].replace(/[^<]*(<a href='([^"]+)'>([^<]+)<\/a>)/g, function() {
        let match = Array.prototype.slice.call(arguments, 1, 4);
        console.log(match);
        matches.push(Array.prototype.slice.call(arguments, 1, 4));
      });*/
    //var hrefs = matches;
    console.log(urls);
    //console.log(hrefs);
    //console.log(matches);
    /*console.log(fileReader.result); */
    for (let j = 0; j < urls.length; j++) {
      if (urls[j].indexOf("http") !== 0) continue;
      var creating = chrome.tabs.create({
        url: urls[j]
      });
      if (creating) creating.then(onCreated, onError);
    }
  };
  fileReader.readAsText(e.target.files[0]);
});

var errorContent = document.getElementById("error-content");

function listenForClicks() {
  document.getElementById("btnSave").addEventListener("click", e => {
    if (!errorContent.classList.contains("hidden")) errorContent.classList.add("hidden");

    handleSaveBtn();
  });

  document.getElementById("btnLoad").addEventListener("click", e => {
    if (!errorContent.classList.contains("hidden")) errorContent.classList.add("hidden");
    document.getElementById("fileLoad").click();
  });
}

function onError(error) {
  showError(error);
}

function handleSaveBtn() {
  chrome.tabs.query({ currentWindow: true }, saveTabs);
  //browser.tabs.query({ currentWindow: true }).then(saveTabs, onQueryTabError);
}

function onQueryTabError(error) {
  showError(error);
}

function showError(error) {
  errorContent.innerHTML = error;
  errorContent.classList.remove("hidden");
  console.error(error);
}

function today() {
  const d = new Date();
  const year = d.getFullYear();
  let month = d.getMonth() + 1;
  let day = d.getDate();

  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;

  return [year, month, day].join("-");
}

function saveTabs(tabs) {
  let content = ["<html><body>"];

  for (let tab of tabs) {
    content.push("<p>" + tab.title + "</p>\n");
    content.push("<p><a href='" + tab.url + "'<a>" + tab.url + "</a></p><hr>\n\n");
  }
  content.push("</body></html>");

  var blob = new Blob(content, { type: "text/plain" });
  var objectURL = URL.createObjectURL(blob);
  var downloading = chrome.downloads.download({
    filename: "backup-links_" + today() + ".html",
    saveAs: true,
    url: objectURL
  });

  if (downloading) downloading.then(onStartedDownload, onFailed);
}

function onCreated(tab) {
  console.log(`Created new tab: ${tab.id}`);
}

function onStartedDownload(id) {
  console.log(`Started downloading: ${id}`);
}

function onFailed(error) {
  showError(error);
  console.log(`Download failed: ${error}`);
}

function reportError(error) {
  errorContent.innerHTML = "<p>" + error + "</p>";
  errorContent.classList.remove("hidden");
  console.error(`Error: ${error}`);
}

function reportExecuteScriptError(error) {
  reportError(`Failed to execute content script: ${error.message}`);
}

listenForClicks();
