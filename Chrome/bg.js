chrome.runtime.setUninstallURL("https://thebyteseffect.com/posts/uninstall-url-shortner/", null);// No i18n
chrome.runtime.onInstalled.addListener(function (details) {
    chrome.contextMenus.create({
        title: 'Shorten the current hovered link and copy',//No i18n
        contexts: ["link"],//No i18n
        id: "shorternhoverlink"//No i18n
    });
    chrome.contextMenus.create({
        title: 'Shorten the current page link and copy',//No i18n
        contexts: ["all"],//No i18n
        id: "page"//No i18n
    });
    chrome.contextMenus.create({
        title: "Shorten the image url and copy",
        contexts: ["image"],
        id: "shorternlink"
    });
    
    if (details.reason == "install") {
        chrome.storage.sync.set({
            preferredURL: "tinyurl",
        });
        chrome.storage.local.set({ "automaticQRCode": "true" });
        chrome.storage.local.set({ "automaticCopy": "true" });

        chrome.tabs.create({ url: "https://www.thebyteseffect.com/2018/04/features-of-url-shortener-extension.html" });
    }
});


function saveToStorage(lurl, surl) {
    chrome.storage.local.get({ "url": [] }, function (result) {
        if (typeof result.url === "undefined") {
            result.url = [];
        }
            result.url.push({ lurl: lurl, surl: surl });
        chrome.storage.local.set({ url: result.url });
    });
}
var urlShorten = {
    isgd:function(url){
        return new Promise(function (resolve, reject) {
            url = encodeURIComponent(url);
            fetch("https://is.gd/create.php?format=json&url=" + url + "&logstats=1").then((resp)=> {
                if(resp.status===200) {
                    return resp.json();
                }else{
                    throw "Unable to find url";
                }
            }).then((response)=>{
                if(response && response.shorturl){
                    saveToStorage(url, response.shorturl);
                    copyTextToClipboard(response.shorturl);
                }
            });
        });
    },
    vgd:function(url){
        return new Promise(function (resolve, reject) {
            url = encodeURIComponent(url);
            fetch("https://v.gd/create.php?format=json&url=" + url + "&logstats=1").then((resp)=> {
               if(resp.status===200) {
                   return resp.json();
               }else{
                   throw "Unable to find url";
               }
            }).then((response)=>{
              if(response && response.shorturl){
                  saveToStorage(url, response.shorturl);
                  copyTextToClipboard(response.shorturl);
              }
            });
        });
    },
    tinyurl: function(url){
     fetch("https://tinyurl.com/api-create.php?url=" + encodeURIComponent(url)).then((resp)=>resp.text()).then((data)=>{
         if(data.length<50){
             const response = data.replace("http://","https://");
             saveToStorage(url,response);
             copyTextToClipboard(response);
         }
     })
        // req.addEventListener("load", function (e) {
        //     var resp = req.responseText.replace("http://", "https://");
        //     saveToStorage(url, resp);
        //     copyTextToClipboard(resp);
        //
        //
        // }, false);
        // req.send();
    },
    tnyim:  function(url){
        fetch("https://tny.im/yourls-api.php?format=json&action=shorturl&url=" + encodeURIComponent(url)).then((resp)=>resp.text()).then((data)=>{
            const resp = JSON.parse(data).shorturl.replace("http://", "https://");
            saveToStorage(url, resp);
            copyTextToClipboard(resp);
        });
    },
    priv: function (url) {
        fetch("https://a.priv.sh", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        }).then(r => r.json()).then(r => {
            if (r.message !== "success") {
                throw "That URL doesn't quite look right..."
            } else {
                return r
            }
        }).then(
            (result) => {
                saveToStorage(url, result.url);
                copyTextToClipboard(result.url);
            },
            (error) => {

               return 0;
            }
        )
    },
    cuttly:function(url){
        chrome.storage.local.get({
            cuttlyApiKey: false,
        },async function (res) {
            let apiKey =  res.cuttlyApiKey;
            if(apiKey){
            let longurl = encodeURIComponent(url);
            fetch("https://ifsc-code.in/urlShorten?longUrl="+ longurl + "&api=" + apiKey).then((resp)=>resp.text()).then((data)=>{
                    if(JSON.parse(data).url.status === 4)
                    {
                        return 0;
                    }
                    var surl = (JSON.parse(data)).url.shortLink;
                    saveToStorage(url, surl);
                    copyTextToClipboard(surl);
            })
        }
        });

    },
        bitly: function(url){
            chrome.storage.local.get({
                bitlyApiKey: false,
            }, function (res) {
                let apiKey =  res.bitlyApiKey;
                if(apiKey){
                let longurl = encodeURIComponent(url);

                fetch("https://api-ssl.bitly.com/v3/shorten?access_token="+ apiKey + "&longUrl="+longurl+"&domain=bit.ly&").then((resp)=>resp.text()).then((data)=>{
                    if(JSON.parse(data).status_txt === "INVALID_ARG_ACCESS_TOKEN")
                    {
                        return 0;
                    }
                    var surl = JSON.parse(data).data.url;
                    saveToStorage(url, surl);
                    copyTextToClipboard(surl);
                });
            }
            });


        }

}

chrome.contextMenus.onClicked.addListener(onClickHandler);

function clientScriptCopyToClipboard(text){
    navigator.clipboard.writeText(text)
    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = text;
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(copyFrom);
    copyFrom.setAttribute('readonly', '');
    copyFrom.style.position = 'absolute';
    copyFrom.select();
    copyFrom.style.left = '-9999px';
    document.execCommand('copy');
    body.removeChild(copyFrom);
}

async function copyTextToClipboard(data) {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(data);
        } else {
          chrome.tabs.query({active:true}).then((tabs)=>{
            const activeTabId = tabs[0].id;
            chrome.scripting.executeScript({
                target: { tabId:activeTabId },
                func: clientScriptCopyToClipboard,
                args:[data]
            });
          })
        }
}

function onClickHandler(info, tabs) {
    info.linkUrl = info.linkUrl || info.pageUrl;

    chrome.storage.sync.get({
        preferredURL: "isgd",
    }, function (res) {
        isTinyURLPreferred = res.preferredURL === "tinyurl";
        if (info.menuItemId !== "shorternhoverlink"){
            if (tabs.url) {
                info.linkUrl = tabs.url;
            }
        if (info.srcUrl) {
            info.linkUrl = info.srcUrl;
        }
    }
    urlShorten[res.preferredURL](info.linkUrl);
});
}
