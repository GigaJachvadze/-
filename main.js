const button = document.getElementById("button");

button.addEventListener("click", function() {
  runScript();
});

document.getElementById("inputJSONButton").addEventListener("click", function() {
  let input = document.getElementById("inputJSON").value;
  try {
    let json = JSON.parse(input);
    sendData(json, "JSON");
  } catch (error) {
    console.log(error);
    document.getElementById("outputText").innerText = error;
  }
});

document.getElementById("exportButton").addEventListener("click", function() {
  sendData("", "GET");

});

chrome.runtime.onMessage.addListener(
  function(request) {
    try {
      let string = JSON.stringify(request);
      document.getElementById("exportJSON").value = string;
    } catch (error) {
      document.getElementById("outputText").innerText = error;
    }
  }
);

async function runScript() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"initialize"});
});
}

async function sendData(data, type) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: type, data: data});
});
}