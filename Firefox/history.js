function getAnalyticsURL(surl) {
    let href;
    var content = surl.substr(15, surl.length - 15);
    if (surl.indexOf("goo.gl") !== -1) {
        href = "https://goo.gl/#analytics/goo.gl/" + content + "/all_time";
    } else if (surl.indexOf("tinyurl.com") !== -1) {
        href = "Analytics not available for TinyURL";
    } else if (surl.indexOf("priv.sh") !== -1) {
        href = "Analytics not available for priv.sh";
    } else if (surl.indexOf("is.gd") !== -1) {
        href = "https://is.gd/stats.php?url=" + surl.substr(14, surl.length);
    } else if (surl.indexOf("tny.im") !== -1) {
        href = surl + "+";
    } else if (surl.indexOf("v.gd") !== -1) {
        href = "https://v.gd/stats.php?url=" + surl.substr(13, surl.length);
    } else if (surl.indexOf("cutt.ly") !== -1) {
        href = surl + "-stats";
    } else {
        href = surl + "+";
    }
    return href;
}
function convertToCsv(fName, rows) {
    var csv = '';
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        for (var j = 0; j < row.length; j++) {
            var val = row[j] === null ? '' : row[j].toString();
            val = val.replace(/\t/gi, " ");
            if (j > 0)
                csv += '\t';
            csv += val;
        }
        csv += '\n';
    }

    // for UTF-16
    var cCode, bArr = [];
    bArr.push(255, 254);
    for (var i = 0; i < csv.length; ++i) {
        cCode = csv.charCodeAt(i);
        bArr.push(cCode & 0xff);
        bArr.push(cCode / 256 >>> 0);
    }

    var blob = new Blob([new Uint8Array(bArr)], { type: 'text/csv;charset=UTF-16LE;' });
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, fName);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) {
            var url = window.URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", fName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    }
}


window.onload = function () {
    document.getElementById("deleteHistory").onclick = function () {
       browser.storage.local.set({ "url": [] });
        window.location.reload();
    };
    document.getElementById("importCSV").onclick = function () {

       browser.storage.local.get({ "url": [] }, function (result) {
            var loop = 0;

            let finalArray = [["Original URL", "Shortened URL", "Analytics"]];

            finalArray.concat(result);
            for (loop = result.url.length - 1; loop >= 0; loop--) {

                finalArray.push([result.url[loop].lurl, result.url[loop].surl, getAnalyticsURL(result.url[loop].surl)]);

            }
           browser.storage.sync.get({ "url": [] }).then(()=>{
                // var loop = 0;
                for (loop = result2.url.length - 1; loop >= 0; loop--) {

                    finalArray.push([result2.url[loop].lurl, result2.url[loop].surl, getAnalyticsURL(result2.url[loop].surl)]);
                }
               
                convertToCsv('Shortened-URL.csv', finalArray);
            },()=>{
                convertToCsv('Shortened-URL.csv', finalArray);
            });
        });


    };

   browser.storage.local.get({ "url": [] }, function (result) {
        var loop = 0;
        for (loop = result.url.length - 1; loop >= 0; loop--) {

            appendValue(result.url[loop].lurl, result.url[loop].surl);
        }
        if (result.url.length > 0) {
            document.getElementById("noc").style.display = "none";
        }
    });
   browser.storage.sync.get({ "url": [] }, function (result) {
        var loop = 0;
        for (loop = result.url.length - 1; loop >= 0; loop--) {

            appendValue(result.url[loop].lurl, result.url[loop].surl);
        }
        if (result.url.length > 0) {
            document.getElementById("noc").style.display = "none";
        }
    });

};
function appendValue(lurl, surl) {
    var tableRef = document.getElementById('table');
    if (!surl) {
        return;
    }

    var rowElem = document.createElement("div");
    rowElem.className = 'row';


    var originalURL = document.createElement("div");
    originalURL.className = "cell";
    var textElem = document.createTextNode(lurl);
    originalURL.appendChild(textElem);


    var shortURL = document.createElement("div");
    shortURL.className = "cell";
    textElem = document.createTextNode(surl);
   
    shortURL.appendChild(textElem);


    



    var content = surl.substr(15, surl.length - 15);
    var a = document.createElement('a');
    var linkText = document.createTextNode("Analytics");
    var href;

    if (surl.indexOf("goo.gl") !== -1) {
        href = "https://goo.gl/#analytics/goo.gl/" + content + "/all_time";
    } else if (surl.indexOf("tinyurl.com") !== -1) {

        linkText.nodeValue = "Analytics not available for TinyURL";
        href = 'https://tinyurl.com/'
    } else if (surl.indexOf("priv.sh") !== -1) {
        linkText.nodeValue = "Analytics not available for priv.sh";
        href = 'https://priv.sh/#why-explainer'
    } else if (surl.indexOf("is.gd") !== -1) {
        href = "https://is.gd/stats.php?url=" + surl.substr(14, surl.length);
    } else if (surl.indexOf("tny.im") !== -1) {
        href = surl + "+";
    } else if (surl.indexOf("v.gd") !== -1) {
        href = "https://v.gd/stats.php?url=" + surl.substr(13, surl.length);
    } else if (surl.indexOf("cutt.ly") !== -1) {
        href = surl + "-stats";
    } else {
        href = surl + "+";
    }
    
    a.appendChild(linkText);

    var analyticsURL = document.createElement("div");
    analyticsURL.className = "cell";
    a.target = "_blank";
    a.rel = "noreferrer";
    a.href = href;


    analyticsURL.appendChild(a);

    rowElem.appendChild(originalURL);
    rowElem.appendChild(shortURL);
    rowElem.appendChild(analyticsURL)

    tableRef.appendChild(rowElem);
}