chrome.webRequest.onCompleted.addListener((resp => {
        // console.log(resp)
        if (resp.url.includes("/floatdb/search")) {
            console.log(resp);
        }
    }),
    {urls: ["https://csgofloat.com/*"]}
)