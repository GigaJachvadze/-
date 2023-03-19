const button = document.getElementById("button");

button.addEventListener("click", function() {
  runScript();
})

async function runScript() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"initialize"});
});
}