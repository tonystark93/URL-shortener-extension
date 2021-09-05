chrome.runtime.setUninstallURL("https://thebyteseffect.com/posts/uninstall-url-shortner/", null);// No i18n
browser.runtime.onInstalled.addListener(function (details) {

    if (details.reason == "install") {
        browser.storage.local.set({
            preferredURL: "tinyurl",
            "automaticQRCode": "true"
        });

        chrome.tabs.create({ url: "https://www.thebyteseffect.com/2018/04/features-of-url-shortener-extension.html" });
    }

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
            var xmlhttp;
            if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp = new XMLHttpRequest();
            }
            xmlhttp.open("GET", "https://is.gd/create.php?format=json&url=" + url + "&logstats=1", true);

            xmlhttp.onload = function () {
                if (xmlhttp.status == 200) {
                    saveToStorage(url, JSON.parse(xmlhttp.responseText).shorturl);
                    copyTextToClipboard(JSON.parse(xmlhttp.responseText).shorturl);
                } else {
                   reject(Error(xmlhttp.statusText));
                }
            };
            // Handle network errors
            xmlhttp.onerror = function () {
                reject(Error("Network Error"));
            };
            xmlhttp.send();
        });
    },
    vgd:function(url){
        return new Promise(function (resolve, reject) {
            url = encodeURIComponent(url);
            var xmlhttp;
            if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp = new XMLHttpRequest();
            }
            xmlhttp.open("GET", "https://v.gd/create.php?format=json&url=" + url + "&logstats=1", true);

            xmlhttp.onload = function () {
                if (xmlhttp.status == 200) {
                    saveToStorage(url, JSON.parse(xmlhttp.responseText).shorturl);
                    copyTextToClipboard(JSON.parse(xmlhttp.responseText).shorturl);
                } else {
                   reject(Error(xmlhttp.statusText));
                }
            };
            // Handle network errors
            xmlhttp.onerror = function () {
                reject(Error("Network Error"));
            };
            xmlhttp.send();
        });
    },
    tinyurl: function(url){
        var req = new XMLHttpRequest();
        req.open("GET", "https://tinyurl.com/api-create.php?url=" + encodeURIComponent(url), true);
        req.addEventListener("load", function (e) {
            var resp = req.responseText.replace("http://", "https://");
            saveToStorage(url, resp);
            copyTextToClipboard(resp);


        }, false);
        req.send();
    },
    tnyim:  function(url){
        var req = new XMLHttpRequest();
        req.open("GET", "https://tny.im/yourls-api.php?format=json&action=shorturl&url=" + encodeURIComponent(url), true);
        req.addEventListener("load", function (e) {
            var resp = JSON.parse(req.responseText).shorturl.replace("http://", "https://");
            saveToStorage(url, resp);
            copyTextToClipboard(resp);
        }, false);
        req.send();
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
            var req = new XMLHttpRequest();
            req.open("GET", "https://ifsc-code.in/urlShorten?longUrl="+ longurl + "&api=" + apiKey, true);
            req.addEventListener("load", function (e) {
                //var resp = JSON.parse(req.responseText).shorturl.replace("http://", "https://");
                if(JSON.parse(req.responseText).url.status === 4)
                {

                    return 0;
                }
                var surl = (JSON.parse(req.responseText)).url.shortLink;

                saveToStorage(url, surl);
                copyTextToClipboard(surl);
            }, false);
            req.addEventListener("error", function (e) {
                //var resp = JSON.parse(req.responseText).shorturl.replace("http://", "https://");
               console.log("errro");
            }, false);
            req.send();
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
                var req = new XMLHttpRequest();
                req.open("GET", "https://api-ssl.bitly.com/v3/shorten?access_token="+ apiKey + "&longUrl="+longurl+"&domain=bit.ly&", true);
                req.addEventListener("load", function (e) {
                    //var resp = JSON.parse(req.responseText).shorturl.replace("http://", "https://");
                    if(JSON.parse(req.responseText).status_txt === "INVALID_ARG_ACCESS_TOKEN")
                    {
                        return 0;
                    }
                    var surl = (JSON.parse(req.responseText)).data.url;
                    saveToStorage(url, surl);
                    copyTextToClipboard(surl);
                }, false);
                req.addEventListener("error", function (e) {
                    //var resp = JSON.parse(req.responseText).shorturl.replace("http://", "https://");
                   console.log("errro");
                }, false);
                req.send();
            }
            });


        }

}


chrome.contextMenus.onClicked.addListener(onClickHandler);
function copyTextToClipboard(data) {
    console.trace(data);
    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = data;
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    body.removeChild(copyFrom);
}

function onClickHandler(info, tabs) {
    info.linkUrl = info.linkUrl || info.pageUrl;

    browser.storage.local.get({
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
