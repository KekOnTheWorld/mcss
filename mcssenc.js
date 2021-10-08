function mcsscompile(css) {
    let b = [];
    let sS = 0;
    let iS = false;
    let aS;
    let vS;
    let aSi = 0;
    let a;
    for(let i in css) {
        i = parseInt(i);
        let c = css[i];
        if(iS) {
            if(c === "}") {
                b = b.slice(0, sS).concat(nb(aSi, 5)).concat(b.slice(sS));
                sS = i+1;
                iS = false;
            } else if(aS && c === ":" && !vS) {
                a = css.slice(aS, i).replaceAll(" ", "");
                b = b.concat(nb(at.indexOf(a), 8));
                aS = undefined;
                vS = i+1;
            } else if(c === ";" && vS) {
                aSi++;
                let val = css.slice(vS, i);
                let rval = val.replaceAll(" ", "");
                if(wd.includes(rval)) {
                    b = b.concat([0, 0, 0]);
                    b = b.concat(nb(wd.indexOf(val.replaceAll(" ", "")), 5));
                } else if(rval.startsWith("#")) {
                    b = b.concat([1, 0, 0]);
                    b = b.concat(nb(parseInt(rval.slice(1), 16), 24));
                } else if((a.startsWith("border") || a.startsWith("outline")) && a !== "border-radius") {
                    let aval = val.replaceAll(/^ /g, "").split(" ");
                    if(aval.length !== 3) return;
                    b = b.concat([1, 1, 0]);
                    b = b.concat(nb(parseInt(aval[0]), 6));
                    b = b.concat(nb(wd.indexOf(aval[1]), 3));
                    b = b.concat(nb(parseInt(aval[2].slice(1), 16), 24));
                } else {
                    let fo = false;
                    Object.keys(e).forEach((f, i)=>{
                        if(rval.match(new RegExp("^[0-9]+" + f + "$", "g"))) {
                            fo = true;
                            b = b.concat([0, 1, 0]);
                            b = b.concat(nb(i, 3));
                            b = b.concat(nb(parseInt(rval.slice(0, rval.length-f.length)), e[f]));
                       }
                    });
                    if(!fo) {
                        rval = val;
                        if(rval.startsWith(" ")) rval = rval.slice(1);
                        let enc = es(rval, vc, 6);
                        b = b.concat([1, 1, 1]);
                        b = b.concat(nb(enc.length/6, 5));
                        b = b.concat(enc);
                    }
                }
                vS = undefined;
                aS = undefined;
            } else if(!aS && !["\n", " "].includes(c)) {
                aS = i;
            }
        } else {
            if(c === "{") {
                aSi = 0;
                iS = true;
                let enc = es(css.slice(sS, i).replaceAll(" ", "").replaceAll("\n", ""), sc, 6);
                b = b.concat(nb(enc.length/6, 5));
                b = b.concat(enc);
                sS = b.length;
            }
        }
    }
    return b;
}