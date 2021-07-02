function applyHexes(colorHexes) {
    var colouredElements = document.querySelectorAll("#result-svg rect[fill], #result-svg g[fill]");
    for(var i = colouredElements.length - 1; i >= 0; i--) {
        var classList = colouredElements[i].classList;
        for(var j = classList.length - 1; j >= 0; j--) {
            if(colorHexes[classList.item(j)]) {
                colouredElements[i].setAttribute("fill", colorHexes[classList.item(j)]);
                console.log(colouredElements[i], colorHexes[classList.item(j)]);
            }
        }
    }
}

function exportSvg(svg) {
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;

    var ctx = canvas.getContext('2d');
    var data = (new XMLSerializer()).serializeToString(svg);
    var DOMURL = window.URL || window.webkitURL || window;
  
    var img = new Image();
    var svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    var url = DOMURL.createObjectURL(svgBlob);
  
    img.onload = function () {
      ctx.drawImage(img, 0, 0, 512, 512);
      DOMURL.revokeObjectURL(url);

      console.log("losded");
  
      var imgURI = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream');
  
      triggerDownload(imgURI);
    }
    img.src = url;
}

function triggerDownload (imgURI) {
  
    var a = document.createElement("a");
    a.setAttribute('download', 'nhs.png');
    a.setAttribute('href', imgURI);
  
    a.click();
  }