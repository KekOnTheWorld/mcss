const attributes = "animation,animation-delay,animation-direction,animation-duration,animation-fill-mode,animation-iteration-count,animation-name,animation-play-state,animation-timing-function,backface-visibility,background,background-attachment,background-clip,background-color,background-image,background-origin,background-position,background-position-x,background-position-y,background-repeat,background-size,border,border-style,border-width,border-color,border-bottom,border-bottom-color,border-bottom-left-radius,border-bottom-right-radius,border-bottom-style,border-bottom-width,border-collapse,border-image,border-left,border-left-color,border-left-style,border-left-width,border-radius,border-right,border-right-color,border-right-style,border-right-width,border-spacing,border-top,border-top-color,border-top-left-radius,border-top-right-radius,border-top-style,border-top-width,bottom,box-shadow,box-sizing,caption-side,clear,clip,color,columns,column-count,column-fill,column-gap,column-rule,column-rule-color,column-rule-style,column-rule-width,column-span,column-width,content,counter-increment,counter-reset,cursor,direction,display,empty-cells,float,font,font-family,font-size,font-style,font-variant,font-weight,height,hyphens,left,letter-spacing,line-height,list-style,list-style-image,list-style-position,list-style-type,margin,margin-bottom,margin-left,margin-right,margin-top,max-height,max-width,min-height,min-width,opacity,orphans,outline,outline-color,outline-style,outline-width,overflow,overflow-x,overflow-y,padding,padding-bottom,padding-left,padding-right,padding-top,page-break-after,page-break-before,page-break-inside,perspective,perspective-origin,position,quotes,right,tab-size,table-layout,text-align,text-align-last,text-decoration,text-decoration-color,text-decoration-line,text-decoration-style,text-indent,text-shadow,text-transform,top,transform,transform-style,transition,transition-delay,transition-duration,transition-property,transition-timing-function,unicode-bidi,vertical-align,visibility,white-space,widows,width,word-spacing,z-index".split(",");
const words = "black,gray,white,none".split(",");
const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-,:=[]*\"/?";

console.log(attributes.length);

// Bit operations
function num2bits(num, len) {
    let mul = 1;
    let bytes = [];
    for(let i = 0; i < len; i++) {
        bytes.push((num&mul)===0?0:1);
        mul *= 2;
    }
    return bytes;
}

function bits2num(bits) {
    let mul = 1;
    let num = 0;
    for(let b of bits) {
        num += b*mul;
        mul *= 2;
    }
    return num;
}

function bytes2bits(bytes) {
    let bits = [];
    for(let b of bytes) {
        bits = bits.concat(num2bits(b, 8));
    }
    return bits;
}

function bits2bytes(bits) {
    let bytes = [];
    for(let i = 0; i < bits.length; i+=8) {
        bytes.push(bits2num(bits.slice(i, i+8)));
    }
    return bytes;
}


// Selector operations
function encodeString(s, c, l) {
    let bits = [];
    for(let i in s) {
        bits = bits.concat(num2bits(c.indexOf(s[i]), l));
    }
    return bits;
}

function decodeString(b, s, e, c, l) {
    let str = "";
    for(let i = s; i < b.length; i+=l) {
        str += c[bits2num(b.slice(i, i+l))];
        if(i+7>e) return str;
    }
}

// Compiling
function compile(css) {
    let bits = [];
    let selectorStart = 0;
    let inSelector = false;
    let attributeStart;
    let valueStart;
    for(let i in css) {
        i = parseInt(i);
        if(inSelector) {
            if(css[i] === "}") {
                bits = bits.slice(0, selectorStart-1).concat(num2bits(bits.length - selectorStart, 5)).concat(bits.slice(selectorStart));
                selectorStart = i+1;
                inSelector = false;
            } else if(attributeStart && css[i] === ":") {
                bits = bits.concat(num2bits(attributes.indexOf(css.slice(attributeStart, i).replaceAll(" ", "")), 8));
                attributeStart = undefined;
                valueStart = i+1;
            } else if(css[i] === ";" && valueStart) {
                let val = css.slice(valueStart, i);
                let rval = val.replaceAll(" ", "");
                if(words.includes(rval)) {
                    bits = bits.concat([0, 0, 0]);
                    bits = bits.concat(num2bits(words.indexOf(val.replaceAll(" ", "")), 5));
                } else if(rval.endsWith("px")) {
                    bits = bits.concat([0, 0, 1]);
                    bits = bits.concat(num2bits(parseInt(rval.slice(0, rval.length-2)), 11));
                } else if(rval.endsWith("%")) {
                    bits = bits.concat([0, 1, 0]);
                    bits = bits.concat(num2bits(parseInt(rval.slice(0, rval.length-1)), 7));
                } else if(rval.startsWith("#")) {
                    bits = bits.concat([0, 1, 1]);
                    bits = bits.concat(num2bits(parseInt(rval.slice(1), 16), 24));
                } else {
                    let enc = encodeString(val, chars, 6);
                    bits = bits.concat([1, 0, 0]);
                    bits = bits.concat(num2bits(enc.length/6, 5));
                    bits = bits.concat(enc);
                }
                valueStart = undefined;
            } else if(!attributeStart && !["\n", " "].includes(css[i])) {
                attributeStart = i;
            }
        } else {
            if(css[i] === "{") {
                inSelector = true;
                let enc = encodeString(css.slice(selectorStart, i).replaceAll(" ", "").replaceAll("\n", ""), chars, 6);
                bits = bits.concat(num2bits(enc.length/6, 5));
                bits = bits.concat(enc);
                bits.push(0x0);
                selectorStart = bits.length;
            }
        }
    }
    return bits;
}

function decompile(bytes) {

}

let bits = encodeString("div::-webkit-scrollbar", chars, 6);
console.log(decodeString(bits, 0, bits.length, chars, 6));

// Methods
const mcss = {
    encodeString,
    decodeString,
    bits2bytes,
    bytes2bits,
    compile,
    decompile
}