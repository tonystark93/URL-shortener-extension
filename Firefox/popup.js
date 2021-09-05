var preferredShortURL;
var currentShorternURL = '';
let sync = {}, local = {};
function copyTextToClipboard(text) {
    currentShorternURL = text;
    var copyFrom = document.createElement("textarea");
    $(copyFrom).css({
        position: "absolute",
        top: "0px",
        left: "0px"
    });
    copyFrom.textContent = text;
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    body.removeChild(copyFrom);
}
function pasteToInputBox(shorternURL) {
    console.log(shorternURL)
    $("#outputText").val(shorternURL)
}
function loadingState() {
    $("#shortenBtn").append("<img id='loader'src='./tail-spin.svg'/>");
    $("#btnText").text("Shortening...");
    $("#qrCodeGen").addClass("disabled").attr("disabled", true);
}
function removeLoader() {
    $("#shortenBtn").find("#loader").remove();
    $("#qrCodeGen").removeClass("disabled").removeAttr("disabled");
}
function copyInfo() {
    $("#btnText").text("Copied to Clipboard");
    setTimeout(function () {
        $("#btnText").text("Shorten URL and Copy to Clipboard");
    }, 3000)
}
function generateQRCode() {
    let image = $("<img/>", {
        id: "qrImage",
        class: "qrImage",
        src: 'http://chart.apis.google.com/chart?cht=qr&chs=180x180&choe=UTF-8&chld=H|0&chl=' + currentShorternURL
    });
    $("#qrImage").remove();
    $(document.body).append(image);
}
function checkForAutomaticQRCodeGen() {
    browser.storage.local.get({ "automaticQRCode": "" }, function (result) {
        console.log(result)
        if (result.automaticQRCode === 'true') {
            generateQRCode();
        }
    });
}

function handleActions(lurl, resp) {
    console.log(lurl,resp);
    saveToStorage(lurl, resp);
    copyTextToClipboard(resp);
    pasteToInputBox(resp);
    removeLoader();
    copyInfo();
    checkForAutomaticQRCodeGen();

}
var urlShorteners = {
    tinyurl: function (url) {
        var req = new XMLHttpRequest();
        req.open("GET", "https://tinyurl.com/api-create.php?url=" + encodeURIComponent(url), true);
        req.addEventListener("load", function (e) {
            var resp = req.responseText.replace("http://", "https://");
            handleActions(url, resp);
        }, false);
        req.send();
    },
    isgd: function (url) {
        $.ajax({
            url: "https://is.gd/create.php?format=json&url=" + encodeURIComponent(url) + "&logstats=1",
            type: 'GET',
            success: function (response) {
                response = JSON.parse(response);
                removeLoader();
                if (response.errorcode === 4) {
                    var message = document.querySelector('.error');
                    message.innerText = 'Your network address is banned from shortening URLs, usually due to abuse of our service in the past.' + "So please change to tinyurl by clicking Setting icon";
                    $(".error").show();
                    return 0;
                }
                if(response.errorcode===1){

                    var message = document.querySelector('.error');
                    message.innerText =  response.errormessage;
                    $(".error").show();
                    return 0;
                }
                console.log(response)
                handleActions(url, response.shorturl);
            }, error: function () {
            }
        });

    },
    vgd: function (url) {
        $.ajax({
            url: "https://v.gd/create.php?format=json&url=" + encodeURIComponent(url) + "&logstats=1",
            type: 'GET',
            success: function (response) {
                response = JSON.parse(response);
                removeLoader();
                if (response.errorcode === 4) {
                    var message = document.querySelector('.error');
                    message.innerText = 'Your network address is banned from shortening URLs, usually due to abuse of our service in the past.' + "So please change to tinyurl by clicking Setting icon";
                    $(".error").show();
                    return 0;
                }
                if(response.errorcode===1){
                    var message = document.querySelector('.error');
                    message.innerText =  response.errormessage;
                    $(".error").show();
                    return 0;
                }
                handleActions(url, response.shorturl);
            }, error: function () {
            }
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
                debugger;
                handleActions(url, result.url);
            },
            (error) => {
                removeLoader();
                var message = document.querySelector('#message');
                message.innerText = 'Unable to shorten. Change to tinyrul or isgd for url shrotening in settings page';
                return 0;
            }
        )
    },
    tnyim:  function(url){
        var req = new XMLHttpRequest();
        req.open("GET", "https://tny.im/yourls-api.php?format=json&action=shorturl&url=" + encodeURIComponent(url), true);
        req.addEventListener("load", function (e) {
            var resp = JSON.parse(req.responseText).shorturl.replace("http://", "https://");
            handleActions(url, resp);
        }, false);
        req.send();
    },
    bitly: function(url){
        browser.storage.local.get({
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
                    var message = document.querySelector('.error');
                    message.innerText = 'Check the access token is correct for bitly in options page';
                    $(".error").show();
                    removeLoader();
                    return 0;
                }
                var surl = (JSON.parse(req.responseText)).data.url;
                handleActions(url, surl);
            }, false);
            req.addEventListener("error", function (e) {
                //var resp = JSON.parse(req.responseText).shorturl.replace("http://", "https://");
               console.log("errro");
            }, false);
            req.send();
        }
        });


    },
    cuttly:function(url){
        browser.storage.local.get({
            cuttlyApiKey: false,
        },async function (res) {
            // await fetch("https://cutt.ly");
            let apiKey =  res.cuttlyApiKey;
            if(apiKey){
            let longurl = encodeURIComponent(url);
            var req = new XMLHttpRequest();
            req.open("GET", "https://ifsc-code.in/urlShorten?longUrl="+ longurl + "&api=" + apiKey, true);
            req.addEventListener("load", function (e) {
                //var resp = JSON.parse(req.responseText).shorturl.replace("http://", "https://");
                if(JSON.parse(req.responseText).url.status === 4)
                {
                    var message = document.querySelector('.error');
                    message.innerText = 'Check the access token is correct for cuttly in options page';
                   $(".error").show();
                   removeLoader();
                    return 0;
                }
                var surl = (JSON.parse(req.responseText)).url.shortLink;

                handleActions(url, surl);
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
function onWindowLoad() {
 
    browser.storage.local.get({
        preferredURL: "isgd",
    }, function (res) {
        preferredShortURL = res.preferredURL;
        if(preferredShortURL === "bitly"){
            browser.storage.local.get({"bitlyApiKey":""}, function(res){
             
                if(!res.bitlyApiKey || res.bitlyApiKey < 7){
                    $(".error").text("Please configure access key for bitly in settings page").removeClass("hide");
                }
                });
        } else if(preferredShortURL === "cuttly"){
            browser.storage.local.get({"cuttlyApiKey":""}, function(res){
                if(!res.cuttlyApiKey || res.cuttlyApiKey.length<7){
                    $(".error").text("Please configure access key for cuttly in settings page").removeClass("hide");
                }
                });
        }else {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                var tablink = tabs[0].url;
                if (!checkForUrl(tablink)) {
                    $(".error").text("It seems the above text is not a URL").removeClass("hide");
                    return 0;
                }
                else {
                    $(".error").addClass("hide");
                }
         
          
            browser.storage.local.get({ "automaticCopy": "" }, function (result) {
                if (result.automaticCopy === "true") {
                    loadingState()
                    urlShorteners[preferredShortURL](tablink);
                }
            });

        });
        }
 
    });
    document.getElementById("history").onclick = function () {
        chrome.tabs.create({ url: "history.html" }, function (tab) {// No i18n
            targetId = tab.id;
            window.close();
        });
    };
    document.getElementById("options").onclick = function () {
        chrome.tabs.create({ url: "options.html" }, function (tab) {// No i18n
            targetId = tab.id;
            window.close();
        });
    };

    $("#shortenBtn").on("click", function () {
        browser.storage.local.get({
            preferredURL: "isgd",
        }, function (res) {
            preferredShortURL = res.preferredURL;
            if (!checkForUrl($("#inputText").val())) {
                $(".error").text("It seems the above pasted text is not a URL").removeClass("hide");
                return 0;
            }
            else {
                $(".error").addClass("hide");
            }
            loadingState();
            urlShorteners[preferredShortURL]($("#inputText").val());
        });
    });

    $("#qrCodeGen").on("click", function () {
        generateQRCode();
    });
    $(".rating").on("click", function () {
        window.open("https://addons.mozilla.org/en-US/firefox/addon/url-shortener-/reviews/");
    });
    function checkForUrl(url) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(url);
    }
    var message = document.querySelector('#message');

    //   chrome.tabs.getSelected(null,function(tab) {

    // });

    chrome.tabs.executeScript(null, {
        code: "var a=a+1;"
    }, function () {

        if (chrome.runtime.lastError) {
            message.innerText = 'Unable to shorten links for the current tab';
        }
    });
}
function saveToStorage(lurl, surl) {
    browser.storage.local.get({ "url": [] }, function (result) {
        if (typeof result.url === "undefined") {
            result.url = [];
        }
            result.url.push({ lurl: lurl, surl: surl });
        browser.storage.local.set({ url: result.url });
    });
}

window.onload = onWindowLoad;
$(document).ready(function () {


    setTimeout(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var tablink = tabs[0].url;
            console.log(tablink, tabs[0]);
            $("#inputText").val(tablink);
        });

        document.activeElement.blur();
        $("#copy").focus();
    }, 100);
    browser.storage.local.get({ "hideInputURL": "" }, function (result) {
        result.hideInputURL = result.hideInputURL === "true" ? 'none' : 'block';
        $("#inputText").css("display", result.hideInputURL);
    });

});