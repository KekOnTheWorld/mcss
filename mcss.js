const attributes = "animation,animation-delay,animation-direction,animation-duration,animation-fill-mode,animation-iteration-count,animation-name,animation-play-state,animation-timing-function,backface-visibility,background,background-attachment,background-clip,background-color,background-image,background-origin,background-position,background-position-x,background-position-y,background-repeat,background-size,border,border-style,border-width,border-color,border-bottom,border-bottom-color,border-bottom-left-radius,border-bottom-right-radius,border-bottom-style,border-bottom-width,border-collapse,border-image,border-left,border-left-color,border-left-style,border-left-width,border-radius,border-right,border-right-color,border-right-style,border-right-width,border-spacing,border-top,border-top-color,border-top-left-radius,border-top-right-radius,border-top-style,border-top-width,bottom,box-shadow,box-sizing,caption-side,clear,clip,color,columns,column-count,column-fill,column-gap,column-rule,column-rule-color,column-rule-style,column-rule-width,column-span,column-width,content,counter-increment,counter-reset,cursor,direction,display,empty-cells,float,font,font-family,font-size,font-style,font-variant,font-weight,height,hyphens,left,letter-spacing,line-height,list-style,list-style-image,list-style-position,list-style-type,margin,margin-bottom,margin-left,margin-right,margin-top,max-height,max-width,min-height,min-width,opacity,orphans,outline,outline-color,outline-style,outline-width,overflow,overflow-x,overflow-y,padding,padding-bottom,padding-left,padding-right,padding-top,page-break-after,page-break-before,page-break-inside,perspective,perspective-origin,position,quotes,right,tab-size,table-layout,text-align,text-align-last,text-decoration,text-decoration-color,text-decoration-line,text-decoration-style,text-indent,text-shadow,text-transform,top,transform,transform-style,transition,transition-delay,transition-duration,transition-property,transition-timing-function,unicode-bidi,vertical-align,visibility,white-space,widows,width,word-spacing,z-index".split(",");
const words = "black,gray,white,blue,transparent,none,border-box,scroll,hidden,visible".split(",");
const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-,:=[]*\"#?>.";
const e = {"%": 7, "px": 11, "vw": 7, "vh": 7, "s": 7, "ms": 12};

console.log(chars.length);

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
    let attrSize = 0;
    for(let i in css) {
        i = parseInt(i);
        let c = css[i];
        if(inSelector) {
            if(c === "}") {
                bits = bits.slice(0, selectorStart).concat(num2bits(attrSize, 5)).concat(bits.slice(selectorStart));
                selectorStart = i+1;
                inSelector = false;
            } else if(attributeStart && c === ":") {
                bits = bits.concat(num2bits(attributes.indexOf(css.slice(attributeStart, i).replaceAll(" ", "")), 8));
                attributeStart = undefined;
                valueStart = i+1;
            } else if(c === ";" && valueStart) {
                attrSize++;
                let val = css.slice(valueStart, i);
                let rval = val.replaceAll(" ", "");
                if(words.includes(rval)) {
                    bits = bits.concat([0, 0, 0]);
                    bits = bits.concat(num2bits(words.indexOf(val.replaceAll(" ", "")), 5));
                } else if(rval.startsWith("#")) {
                    bits = bits.concat([1, 0, 0]);
                    bits = bits.concat(num2bits(parseInt(rval.slice(1), 16), 24));
                } else {
                    let fo = false;
                    Object.keys(e).forEach((f, i)=>{
                        if(rval.endsWith(f)) {
                            fo = true;
                            bits = bits.concat([0, 1, 0]);
                            bits = bits.concat(num2bits(i, 3));
                            bits = bits.concat(num2bits(parseInt(rval.slice(0, rval.length-f.length)), e[f]));
                        }
                    });
                    if(!fo) {
                        let enc = encodeString(val, chars, 6);
                        bits = bits.concat([1, 1, 1]);
                        bits = bits.concat(num2bits(enc.length/6, 5));
                        bits = bits.concat(enc);
                    }
                }
                valueStart = undefined;
                attributeStart = undefined;
            } else if(!attributeStart && !["\n", " "].includes(c)) {
                attributeStart = i;
            }
        } else {
            if(c === "{") {
                attrSize = 0;
                inSelector = true;
                let enc = encodeString(css.slice(selectorStart, i).replaceAll(" ", "").replaceAll("\n", ""), chars, 6);
                bits = bits.concat(num2bits(enc.length/6, 5));
                bits = bits.concat(enc);
                selectorStart = bits.length;
            }
        }
    }
    return bits;
}

function decompile(bits) {
    let s;
    let aS;
    let aI = 0;
    let css = "";
    for(let i = 0; i < bits.length; i++) {
        if(!s) {
            aI = 0;
            let l = bits2num(bits.slice(i, i+5))*6;
            i+=5;
            s = decodeString(bits, i, i+l, chars, 6);
            i+=l;
            aS = bits2num(bits.slice(i, i+5));
            i+=4;
            css += s + " { ";
        } else {
            aI++;
            let a = attributes[bits2num(bits.slice(i, i+8))];
            i+=8;
            let t = bits2num(bits.slice(i, i+3));
            i+=3;
            if(t===0) {
                let c = words[bits2num(bits.slice(i, i+5))];
                i+=4;
                css += a + ": " + c + "; ";
            } else if(t===1) {
                let c = bits2num(bits.slice(i, i+24));
                c = c.toString(16);
                c = ("0".repeat(6-c.length)) + c;
                css += a + ": #" + c + "; ";
                i+=23;
            }
            if(aI>=aS) {
                s = undefined;
                aS = undefined;
                css += "} ";
            }
        }
    }
    console.log(css);
}

// Methods
const mcss = {
    encodeString,
    decodeString,
    bits2bytes,
    bytes2bits,
    compile,
    decompile
}