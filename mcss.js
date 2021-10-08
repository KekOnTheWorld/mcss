const self = document.scripts[document.scripts.length-1];
function require(n) {
    let script = document.createElement('script');
    script.src = n;
    script.type = 'text/javascript';
    document.querySelector("head").insertBefore(script, self);
}

require("./bitutil.js");
require("./mcssdec.js");
require("./mcssenc.js");
self.remove();