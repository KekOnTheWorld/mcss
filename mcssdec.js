function mcssdecompile(b) {
    try {
        const mc = (c)=>("0".repeat(6-c.length)) + c;
        let s;
        let aS;
        let aI = 0;
        let css = "";
        for(let i = 0; i < b.length; i++) {
            if(!s) {
                aI = 0;
                let l = bn(b.slice(i, i+5))*6;
                if(l===0) return css;
                i+=5;
                s = ds(b.slice(i, i+l), sc, 6);
                i+=l;
                aS = bn(b.slice(i, i+5));
                i+=4;
                css += s + " { ";
            } else {
                aI++;
                let a = at[bn(b.slice(i, i+8))];
                let t = bn(b.slice(i+8, i+11));
                i+=11;
                if(t===0) {
                    css += a + ": " + wd[bn(b.slice(i, i+5))] + "; ";
                    i+=4;
                } else if(t===1) {
                    css += a + ": #" + mc(bn(b.slice(i, i+24)).toString(16)) + "; ";
                    i+=23;
                } else if(t===2) {
                    let t = Object.keys(e)[bn(b.slice(i, i+3))];
                    css += a + ": " + bn(b.slice(i+3, i+e[t]+3)) + t + "; ";
                    i+=e[t]+2;
                } else if(t===3) {
                    css += a + ": " + bn(b.slice(i, i+6)) + "px " + wd[bn(b.slice(i+6, i+9))] + " #" + mc(bn(b.slice(i+9, i+33)).toString(16)) + "; ";
                    i+=32;
                } else if(t===7) {
                    let l = bn(b.slice(i, i+5))*6;
                    css += a + ": " + ds(b.slice(i+5, i+5+l), vc, 6) + "; ";
                    i+=l+4;
                }
                if(aI>=aS) {
                    s = undefined;
                    aS = undefined;
                    css += "} ";
                }
            }
        }
        return css;
    } catch(e) {return undefined;}
}