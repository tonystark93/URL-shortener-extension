chrome.runtime.setUninstallURL("https://thebyteseffect.com/posts/uninstall-url-shortner/", null);
browser.runtime.onInstalled.addListener(function (details) {

    if (details.reason == "install") {
        browser.storage.local.set({
            preferredURL: "tinyurl",
            "automaticQRCode": "true"
        });

        chrome.tabs.create({ url: "https://www.thebyteseffect.com/2018/04/features-of-url-shortener-extension.html" });
    }
});


browser.contextMenus.create({
    title: 'Shorten the current hovered link and copy',
    contexts: ["link"],
    id: "shorternhoverlink"
});
browser.contextMenus.create({
    title: 'Shorten the current page link and copy',
    contexts: ["all"],
    id: "page"
});
browser.contextMenus.create({
    title: "Shorten the image url and copy",
    contexts: ["image"],
    id: "shorternlink"
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
    isgd: function (url) {
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
    vgd: function (url) {
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
    tinyurl: function (url) {
        var req = new XMLHttpRequest();
        req.open("GET", "https://tinyurl.com/api-create.php?url=" + encodeURIComponent(url), true);
        req.addEventListener("load", function (e) {
            var resp = req.responseText.replace("http://", "https://");
            saveToStorage(url, resp);
            copyTextToClipboard(resp);


        }, false);
        req.send();
    },
    tnyim: function (url) {
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
    cuttly: function (url) {
        chrome.storage.local.get({
            cuttlyApiKey: false,
        }, async function (res) {
            let apiKey = res.cuttlyApiKey;
            if (apiKey) {
                let longurl = encodeURIComponent(url);
                var req = new XMLHttpRequest();
                req.open("GET", "https://ifsc-code.in/urlShorten?longUrl=" + longurl + "&api=" + apiKey, true);
                req.addEventListener("load", function (e) {
                    //var resp = JSON.parse(req.responseText).shorturl.replace("http://", "https://");
                    if (JSON.parse(req.responseText).url.status === 4) {

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
    bitly: function (url) {
        chrome.storage.local.get({
            bitlyApiKey: false,
        }, function (res) {
            let apiKey = res.bitlyApiKey;
            if (apiKey) {
                fetch('https://api-ssl.bitly.com/v4/shorten', {
                    method: 'POST',
                    headers: {
                        'Authorization': apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ "long_url": url, "domain": "bit.ly" })
                }).then(function (res) {
                    return res.json();
                }).then(function (res) {
                    if (!res.link) {
                        var message = document.querySelector('.error');
                        message.innerText = res.message + '. Check the access token is correct for bitly in options page or generate a new token in bit.ly and apply';
                        $(".error").show();
                        removeLoader();
                        return 0;
                    }
                    var surl = res.link;
                    saveToStorage(url, surl);
                    copyTextToClipboard(surl);
                });
            }
        });


    }

}


chrome.contextMenus.onClicked.addListener(onClickHandler);
function copyTextToClipboard(data) {
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
        if (info.menuItemId !== "shorternhoverlink") {
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
