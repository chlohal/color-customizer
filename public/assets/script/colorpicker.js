

/** A HSL colour
 * @typedef {Object} Color
 * @property {number} hue - The hue of the colour, from 0 to 1
 * @property {number} saturation - The saturation of the colour, from 0 to 1
 * @property {number} lightness - The lightness of the colour, from 0 to 1
  */

/** @type {Color} */
var WHITE = {hue: 1, saturation: 1, lightness: 1};
/** @type {Color} */
var BLACK = {hue: 0, saturation: 0, lightness: 0};

/**
 * 
 * @param {Color|string} startingValue 
 */
function createColorPicker(startingValue) {
    if(startingValue === undefined) startingValue = {hue: 0, lightness: 0, saturation: 0};
    if(typeof startingValue === "string") startingValue = parseColor(startingValue);


    /**
     * @type {Color}
     */
    var color = Object.assign({}, startingValue);

    var parent = document.createElement("div");
    parent.classList.add("colorpicker");
    parent.tabIndex = 1;

    var slPicker = document.createElement("div");
    slPicker.classList.add("picker-sl-parent");
    parent.appendChild(slPicker);

    function moveSlKnobListener(event) {

        slKnob.style.top = event.offsetY + "px";
        slKnob.style.left = event.offsetX + "px";

        var saturationPercent = 1 - (event.offsetX / slPicker.clientWidth);
        saturationPercent = Math.max(0, Math.min(saturationPercent, 1));
        var darknessPercent = (event.offsetY / slPicker.clientHeight);
        darknessPercent = Math.max(0, Math.min(darknessPercent, 1));

        var hue = {hue: color.hue, saturation: 1, lightness: 0.5};
        var saturated = colorSuperimpose(WHITE, hue, saturationPercent, 1);
        var lighened = colorSuperimpose(BLACK, saturated, darknessPercent, 1);

        var final = lighened

        console.log({
            darknessPercent: darknessPercent, 
            saturationPercent: saturationPercent
        });

        Object.assign(color, final);

        color.hue = hue.hue;

        updateDisplay();
    }
    slPicker.addEventListener("click", moveSlKnobListener);

    var SlParentMouseDragging = false;
    slPicker.addEventListener("mousedown", function() {
        SlParentMouseDragging = true;
    });
    slPicker.addEventListener("mouseleave", function() {
        SlParentMouseDragging = false;
    });
    slPicker.addEventListener("mouseup", function() {
        SlParentMouseDragging = false;
    });
    slPicker.addEventListener("mousemove", function(event) {
        if(SlParentMouseDragging) moveSlKnobListener(event);
    });

    var satGradient = document.createElement("div");
    satGradient.classList.add("picker-gradient");
    satGradient.classList.add("saturation");
    slPicker.appendChild(satGradient);

    var ligGradient = document.createElement("div");
    ligGradient.classList.add("picker-gradient");
    ligGradient.classList.add("lightness");
    slPicker.appendChild(ligGradient);

    var slKnob = document.createElement("div");
    slKnob.classList.add("picker-sl-knob");
    slKnob.style.top = (100 - color.lightness*100) + "%";
    slKnob.style.left = (color.saturation*100) + "%";
    slPicker.appendChild(slKnob);

    var hueSlider = document.createElement("div");
    hueSlider.classList.add("hue-slider");
    
    var hueGradientTerms = [];
    for(var i = 0; i <= 1; i+= 1/360) {
        hueGradientTerms.push(`hsl(${i*360}, 100%, 50%)`);
    }
    hueSlider.style.background = `linear-gradient(90deg, ${hueGradientTerms.join(",")})`;
    
    function moveHKnobListener(event) {
        color.hue = Math.max(0, Math.min(event.offsetX / hueSlider.clientWidth, 1));
        hKnob.style.left = event.offsetX + "px";
        updateDisplay();
    }

    hueSlider.addEventListener("click", moveHKnobListener);

    var hParentMouseDragging = false;
    hueSlider.addEventListener("mousedown", function() {
        hParentMouseDragging = true;
    });
    hueSlider.addEventListener("mouseleave", function() {
        hParentMouseDragging = false;
    });
    hueSlider.addEventListener("mouseup", function() {
        hParentMouseDragging = false;
    });
    hueSlider.addEventListener("mousemove", function(event) {
        if(hParentMouseDragging) moveHKnobListener(event);
    });

    var hKnob = document.createElement("div");
    hKnob.classList.add("picker-h-knob");
    hKnob.style.left = (color.hue*100) + "%"
    hueSlider.appendChild(hKnob);

    parent.appendChild(hueSlider);


    var hexInputParent = document.createElement("span");
    var hexInput = document.createElement("input");
    hexInput.addEventListener("input", function() {
        var val = hexInput.value;
        if(hexInput.value.match(/^[0-9a-fA-F]{6}$/)) {
            color = parseHexColor(val);
            
            slKnob.style.top = (100 - color.lightness*100) + "%";
            slKnob.style.left = (color.saturation*100) + "%"
            hKnob.style.left = (color.hue*100) + "%"

            updateDisplay();
        }
    });
    hexInput.classList.add("color-picker-hex-box");
    hexInputParent.classList.add("color-picker-hex-box-parent");

    hexInputParent.appendChild(hexInput);
    parent.appendChild(hexInputParent);


    var input = document.createElement("input");
    input.type = "color";
    input.classList.add("color-picker-input");

    input.addEventListener("click", function(e) {
        e.preventDefault();
        var box = inputHolder.getClientRects()[0];

        inputHolder.classList.add("active");
        inputHolder.appendChild(parent);

        var top = box.top + box.height;
        if(parent.clientHeight + top > window.innerHeight) top += (window.innerHeight - (parent.clientHeight + top));
        parent.style.top = top + "px";

        var left = box.left;
        if(box.left + parent.clientWidth > window.innerWidth) left += (window.innerWidth - (box.left + parent.clientWidth));
        parent.style.left = left + "px";
    })

    var inputHolder = document.createElement("div");
    inputHolder.classList.add("color-picker-input-holder");

    inputHolder.addEventListener("focusout", function(e) {
        requestAnimationFrame(function() {
            if(!isChildOf(document.activeElement, inputHolder)) {
                inputHolder.classList.remove("active");
                if(parent.parentElement) parent.parentElement.removeChild(parent);
            }
        });
    });

    inputHolder.addEventListener("keydown", function(e) {
        if(e.key == "Escape" || e.which == 27 || e.code == "Escape") {
            inputHolder.classList.remove("active");
            if(parent.parentElement) parent.parentElement.removeChild(parent);
        }
    });

    inputHolder.appendChild(input);

    function updateDisplay() {
        slPicker.style.background = `hsl(${color.hue*360}, 100%, 50%)`;

        var hex = colorToHex(color);
        input.value = hex;
        inputHolder.value = hex;
        inputHolder.style.background = hex;
        slKnob.style.background = hex;
        hexInput.value = hex.substring(1);

        hKnob.style.background = `hsl(${color.hue*360},100%,50%)`;

        if ("createEvent" in document) {
            var event = document.createEvent("HTMLEvents");
            event.initEvent("change", false, true);
            inputHolder.dispatchEvent(event);
        }
        else {
            inputHolder.fireEvent("onchange");
        }
    }

    updateDisplay();

    return inputHolder;
}

/**
 * 
 * @param {Color} foreground The foreground colour to combine at foregroundOpacity.
 * @param {Color} background The background colour
 * @param {number} foregroundOpacity The opacity of the foreground, in the range [0, 1]
 * @param {number} backgroundOpacity The opacity of the background, in the range [0, 1]
 * @returns {Color} The combined color
 */
function colorSuperimpose(foreground, background, foregroundOpacity, backgroundOpacity) {

    var rgbArray = over(foreground.hue, foreground.saturation, foreground.lightness,
                        background.hue, background.saturation, background.lightness,
                        foregroundOpacity, backgroundOpacity);
    return {
        hue: rgbArray[0],
        saturation: rgbArray[1],
        lightness: rgbArray[2],
        opacity: rgbArray[3]
    }
}

function over(rA, gA, bA,
              rB, gB, bB,
              aA, aB) {

    var a0 = aA + aB * (1 - aA);

    var r0 = ((rA * aA) + (rB * aB * (1 - aA))) / a0;
    var g0 = ((gA * aA) + (gB * aB * (1 - aA))) / a0;
    var b0 = ((bA * aA) + (bB * aB * (1 - aA))) / a0;

    return [r0, g0, b0, a0];
}

function isChildOf(child, parent) {
    while(child.parentElement) {
        if(child.parentElement == parent) return true;
        else child = child.parentElement;
    }
    return false;
}

/**
 * Convert a color to the CSS HSL() function
 * @param {Color} color Color to convert
 * @returns {string} CSS function
 */
function colorToCss(color) {
    return `hsl(${color.hue*360}, ${color.saturation*100}%, ${color.lightness*100}%)`;
}

/**
 * Convert Color object to a hex code (#FFFFFF)
 * @param {Color} color The color to convert
 * @returns {string} Result hex code
 */
function colorToHex(color) {

    var rgbArray = hslToRgb(color.hue, color.saturation, color.lightness);

    var r = pad(Math.floor(rgbArray[0]).toString(16), 2);
    var g = pad(Math.floor(rgbArray[1]).toString(16), 2);
    var b = pad(Math.floor(rgbArray[2]).toString(16), 2);

    return "#" + r + g + b;
}

function pad(s, l) {
    s = s + "";

    while(s.length < l) s = "0" + s;

    return s;
}

function parseColor(color) {
    if(typeof color !== "string") return color;

    if(color.toLowerCase().match(/#?\w{6}/)) return parseHexColor(color);

    if(color.toLowerCase().match(/rgb\(\d+, *\d+, *\d+\)/)) return parseRgbFunction(color);

    else throw "Unknown color " + color;
}

function parseRgbFunction(color) {
    var regex = /rgb\((\d+), *(\d+), *(\d+)\)/;

    var result = regex.exec(color);

    return parseHexColor(
        pad(parseFloat(result[1]).toString(16), 2) +
        pad(parseFloat(result[2]).toString(16), 2) +
        pad(parseFloat(result[3]).toString(16), 2)
    );
}

/**
 * Convert a hex code (#FFFFFF) to a Color object
 * @param {string} hex The hex code of a colour
 * @returns {Color} Result color
 */
function parseHexColor(hex) {
    if(hex.charAt(0) == "#") hex = hex.substring(1);
    if(hex.length != 6) throw "Illegal hex code `" + hex + "`";

    var r = hex.substring(0, 2);
    var g = hex.substring(2, 4);
    var b = hex.substring(4, 6);

    var hslArray = rgbToHsl(
        parseInt(r, 16),
        parseInt(g, 16),
        parseInt(b, 16)
    );

    return {
        hue: hslArray[0],
        saturation: hslArray[1],
        lightness: hslArray[2]
    };
}

  /**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
  
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
  
    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
  
      h /= 6;
    }
  
    return [ h, s, l ];
  }

  /**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
    var r, g, b;
  
    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
  
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
  
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
  
    return [ r * 255, g * 255, b * 255 ];
  }