window.addEventListener("load", function() {
    var nonce = genNonce();

    var colorList = document.getElementById("color-list");

    var colouredElements = document.querySelectorAll("#result-svg rect[fill], #result-svg g[fill]");
    var colours = {};
    var colourCount = 0;

    for(var i = colouredElements.length - 1; i >= 0; i--) {
        var elem = colouredElements[i];
        var colour = elem.getAttribute("fill");
        if(colour.length < 6) colour = threeHexToSixHex(colour);
        if(colours[colour] === undefined) colours[colour] = colourCount++;

        elem.classList.add(nonce + "-colour-" + colours[colour]);
    }

    var cssSheet = document.styleSheets[0];

    var urlColors = location.hash.split("/").filter(x=>x.length==6);

    var colourRules = {};
    var colorHexes = {};

    var colourValues = Object.entries(colours);
    for(var i = colourValues.length - 1; i >= 0; i--) {
        var urlOverride = normalizeHex(urlColors[i]);
        var colourEntry = colourValues[i];
        var rule = `.${nonce}-colour-${colourEntry[1]} {fill: ${urlOverride || colourEntry[0]};}`;
        colourRules[`${nonce}-colour-${colourEntry[1]}`] = cssSheet.cssRules[cssSheet.insertRule(rule)];
        colorHexes[`${nonce}-colour-${colourEntry[1]}`] = urlOverride || colourEntry[0];
    }

    var colourRuleEntries = Object.entries(colourRules);

    location.hash = "/" + Object.values(colorHexes).reverse().map(x=>x.substring(1)).join("/");

    for(var i = colourRuleEntries.length - 1; i >= 0; i--) {
        //ghetto `let` using an IEFE
        (function() {
            var entry = colourRuleEntries[i];
            var li = document.createElement("li");
        
            var picker = createColorPicker(entry[1].style.fill);
            li.appendChild(picker);
            picker.addEventListener("change", function() {
                entry[1].style.fill = picker.value;
                colorHexes[entry[0]] = picker.value;

                location.hash = "/" + Object.values(colorHexes).reverse().map(x=>x.substring(1)).join("/");
            })
            colorList.appendChild(li);
        })();
    }

    var exportButton = document.createElement("button");
    exportButton.textContent = "Download Image";
    exportButton.classList.add("export-button");
    exportButton.addEventListener("click", function() {
        applyHexes(colorHexes);
        exportSvg(document.getElementById("result-svg"))
    });
    document.getElementById("results").appendChild(exportButton);
});

function genNonce() {
    return (Math.floor(Math.random() * 6) + 10).toString(16)
        + Math.random().toString(16).substring(2);
}

function threeHexToSixHex(hex) {
    hex = hex.replace("#","");
    if(hex.length != 3) throw "Illegal 3-hex " + hex;

    for(var i = 0; i < hex.length; i += 2) {
        hex = hex[0] + hex;
    }
    return "#" + hex;
}

function normalizeHex(hex) {
    if(typeof hex !== "string") return hex;
    if(hex.length == 6) return "#" + hex;
    if(hex.length < 6) return threeHexToSixHex(hex);
}