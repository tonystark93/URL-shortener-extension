// Saves options to chrome.storage

function save_options (url) {

    chrome.storage.sync.set({
        preferredURL: url,
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        if(status) {
            status.textContent = 'Options saved.';
            setTimeout(function () {
                status.textContent = '';
            }, 1000);
        }
    });
}

function initValues(){
    chrome.storage.local.get({ "automaticCopy": "" }, function (result) {
        result.automaticCopy = result.automaticCopy === "true" ? true : false;
        $("#automaticCopy").prop("checked", result.automaticCopy);
    });
    chrome.storage.local.get({ "hideInputURL": "" }, function (result) {
        result.hideInputURL = result.hideInputURL === "true" ? true : false;
        $("#hideInputURL").prop("checked", result.hideInputURL);
    });
    chrome.storage.local.get({ "automaticQRCode": "" }, function (result) {
        result.automaticQRCode = result.automaticQRCode === "true" ? true : false;
        $("#automaticQRCode").prop("checked", result.automaticQRCode);
    });
    chrome.storage.local.get({ "nightMode": "" }, function (result) {
        var inNightMode = result.nightMode === "true" ? true : false;
        $("#nightMode").prop("checked", inNightMode);
        if(inNightMode){
            document.body.classList.add("nightMode");
        }
    });

    chrome.storage.sync.get({
        preferredURL: 'isgd',
    }, function (items) {
        let preferredURL= items.preferredURL;
        $("input[value="+preferredURL+"]").attr("checked",true);
    });
}

document.addEventListener('DOMContentLoaded', initValues);
document.getElementById("removeHistory").addEventListener("click",function(){
    chrome.storage.local.set({ "url": [] });
    var status = document.getElementById('status');
    status.textContent = 'History removed.';
    setTimeout(function () {
        status.textContent = '';
    }, 1000);
});

$("input[name=urlshortener]").change(function(){
    if(this.checked) {
        save_options(this.value);
    }
});
$("#automaticCopy").on("change",function () {
    var checked = $(this).is(":checked");
    console.log(checked);
    chrome.storage.local.set({ "automaticCopy": String(checked) },function(){
        chrome.storage.local.get({"automaticCopy":""},function(value){
            console.log(value)
        })
    });
});
$("#hideInputURL").on("change",function () {
    var checked = $(this).is(":checked");
    console.log(checked);
    chrome.storage.local.set({ "hideInputURL": String(checked) },function(){
        chrome.storage.local.get({"hideInputURL":""},function(value){
            console.log(value)
        })
    });
});
$("#automaticQRCode").on("change",function () {
    var checked = $(this).is(":checked");
    chrome.storage.local.set({ "automaticQRCode": String(checked) },function(){
        chrome.storage.local.get({"automaticQRCode":""},function(value){
            console.log(value)
        })
    });
});
$("#keyboardShortcuts").on("click",function () {

    chrome.tabs.create({url: "chrome://extensions/shortcuts"});

});
$("#nightMode").on("change",function () {
    var checked = $(this).is(":checked");
    if(checked){
        document.body.classList.add("nightMode");
    }else{
        document.body.classList.remove("nightMode");
    }
    chrome.storage.local.set({ "nightMode": String(checked) },function(){
        chrome.storage.local.get({"nightMode":""},function(value){
            console.log(value)
        })
        
    });
});

$("#save").on("click",function(event){
    $("#save").text("Changes Saved Successfully");
    setTimeout(function(){
        $("#save").text("Save Changes");
    },2000);
    event.preventDefault();
    debugger;
    event.stopPropagation();
})
$("#bitlyForm").submit(function(e){
   let accessKey = ($("#bitlyApiKey").val());
   if(accessKey.length > 5){
    chrome.storage.local.set({"bitlyApiKey":accessKey}, function(){
console.log("success");
    });
    $("#bitlyForm").find("input[type=submit]").val("Saved");
    setTimeout(function(){
       $("#bitlyForm").find("input[type=submit]").val("Save API key");
    },1000);
}
    e.preventDefault();
return false;    
});
$("#cuttlyForm").submit(function(e){
    let accessKey = ($("#cuttlyApiKey").val());
    if(accessKey.length > 5){
     chrome.storage.local.set({"cuttlyApiKey":accessKey}, function(){
     });
     $("#cuttlyForm").find("input[type=submit]").val("Saved");
     setTimeout(function(){
        $("#cuttlyForm").find("input[type=submit]").val("Save API key");
     },1000);
    }
     e.preventDefault();
 return false;    
 });
chrome.storage.local.get({"bitlyApiKey":""}, function(res){
if(res.bitlyApiKey){
    $("#bitlyApiKey").val(res.bitlyApiKey)
}
});
chrome.storage.local.get({"cuttlyApiKey":""}, function(res){
    if(res.cuttlyApiKey){
        $("#cuttlyApiKey").val(res.cuttlyApiKey)
    }
    });