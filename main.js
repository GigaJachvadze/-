// const cells = document.querySelectorAll('tr');

// chrome.webRequest.onBeforeRequest.addListener(
//     onIntercept,
//     {urls: ["https://csgofloat.com/*"]}
//   );

chrome.webRequest.onBeforeRequest.addListener(
    onIntercept,
    {urls: ["<all_urls>"]},
    ["blocking"]
  );

function intercept() {

}

function onIntercept(req) {
    console.log(req);
}

// intercept();

console.log(cells);