parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"KcYi":[function(require,module,exports) {
function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(t)}function t(){"use strict";t=function(){return r};var n,r={},o=Object.prototype,i=o.hasOwnProperty,a=Object.defineProperty||function(e,t,n){e[t]=n.value},c="function"==typeof Symbol?Symbol:{},u=c.iterator||"@@iterator",s=c.asyncIterator||"@@asyncIterator",l=c.toStringTag||"@@toStringTag";function d(e,t,n){return Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}),e[t]}try{d({},"")}catch(n){d=function(e,t,n){return e[t]=n}}function f(e,t,n,r){var o=t&&t.prototype instanceof w?t:w,i=Object.create(o.prototype),c=new T(r||[]);return a(i,"_invoke",{value:A(e,n,c)}),i}function h(e,t,n){try{return{type:"normal",arg:e.call(t,n)}}catch(e){return{type:"throw",arg:e}}}r.wrap=f;var p="suspendedStart",y="suspendedYield",v="executing",m="completed",g={};function w(){}function E(){}function b(){}var x={};d(x,u,function(){return this});var L=Object.getPrototypeOf,k=L&&L(L(B([])));k&&k!==o&&i.call(k,u)&&(x=k);var S=b.prototype=w.prototype=Object.create(x);function I(e){["next","throw","return"].forEach(function(t){d(e,t,function(e){return this._invoke(t,e)})})}function j(t,n){function r(o,a,c,u){var s=h(t[o],t,a);if("throw"!==s.type){var l=s.arg,d=l.value;return d&&"object"==e(d)&&i.call(d,"__await")?n.resolve(d.__await).then(function(e){r("next",e,c,u)},function(e){r("throw",e,c,u)}):n.resolve(d).then(function(e){l.value=e,c(l)},function(e){return r("throw",e,c,u)})}u(s.arg)}var o;a(this,"_invoke",{value:function(e,t){function i(){return new n(function(n,o){r(e,t,n,o)})}return o=o?o.then(i,i):i()}})}function A(e,t,r){var o=p;return function(i,a){if(o===v)throw Error("Generator is already running");if(o===m){if("throw"===i)throw a;return{value:n,done:!0}}for(r.method=i,r.arg=a;;){var c=r.delegate;if(c){var u=M(c,r);if(u){if(u===g)continue;return u}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if(o===p)throw o=m,r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);o=v;var s=h(e,t,r);if("normal"===s.type){if(o=r.done?m:y,s.arg===g)continue;return{value:s.arg,done:r.done}}"throw"===s.type&&(o=m,r.method="throw",r.arg=s.arg)}}}function M(e,t){var r=t.method,o=e.iterator[r];if(o===n)return t.delegate=null,"throw"===r&&e.iterator.return&&(t.method="return",t.arg=n,M(e,t),"throw"===t.method)||"return"!==r&&(t.method="throw",t.arg=new TypeError("The iterator does not provide a '"+r+"' method")),g;var i=h(o,e.iterator,t.arg);if("throw"===i.type)return t.method="throw",t.arg=i.arg,t.delegate=null,g;var a=i.arg;return a?a.done?(t[e.resultName]=a.value,t.next=e.nextLoc,"return"!==t.method&&(t.method="next",t.arg=n),t.delegate=null,g):a:(t.method="throw",t.arg=new TypeError("iterator result is not an object"),t.delegate=null,g)}function O(e){var t={tryLoc:e[0]};1 in e&&(t.catchLoc=e[1]),2 in e&&(t.finallyLoc=e[2],t.afterLoc=e[3]),this.tryEntries.push(t)}function P(e){var t=e.completion||{};t.type="normal",delete t.arg,e.completion=t}function T(e){this.tryEntries=[{tryLoc:"root"}],e.forEach(O,this),this.reset(!0)}function B(t){if(t||""===t){var r=t[u];if(r)return r.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var o=-1,a=function e(){for(;++o<t.length;)if(i.call(t,o))return e.value=t[o],e.done=!1,e;return e.value=n,e.done=!0,e};return a.next=a}}throw new TypeError(e(t)+" is not iterable")}return E.prototype=b,a(S,"constructor",{value:b,configurable:!0}),a(b,"constructor",{value:E,configurable:!0}),E.displayName=d(b,l,"GeneratorFunction"),r.isGeneratorFunction=function(e){var t="function"==typeof e&&e.constructor;return!!t&&(t===E||"GeneratorFunction"===(t.displayName||t.name))},r.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,b):(e.__proto__=b,d(e,l,"GeneratorFunction")),e.prototype=Object.create(S),e},r.awrap=function(e){return{__await:e}},I(j.prototype),d(j.prototype,s,function(){return this}),r.AsyncIterator=j,r.async=function(e,t,n,o,i){void 0===i&&(i=Promise);var a=new j(f(e,t,n,o),i);return r.isGeneratorFunction(t)?a:a.next().then(function(e){return e.done?e.value:a.next()})},I(S),d(S,l,"Generator"),d(S,u,function(){return this}),d(S,"toString",function(){return"[object Generator]"}),r.keys=function(e){var t=Object(e),n=[];for(var r in t)n.push(r);return n.reverse(),function e(){for(;n.length;){var r=n.pop();if(r in t)return e.value=r,e.done=!1,e}return e.done=!0,e}},r.values=B,T.prototype={constructor:T,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=n,this.done=!1,this.delegate=null,this.method="next",this.arg=n,this.tryEntries.forEach(P),!e)for(var t in this)"t"===t.charAt(0)&&i.call(this,t)&&!isNaN(+t.slice(1))&&(this[t]=n)},stop:function(){this.done=!0;var e=this.tryEntries[0].completion;if("throw"===e.type)throw e.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var t=this;function r(r,o){return c.type="throw",c.arg=e,t.next=r,o&&(t.method="next",t.arg=n),!!o}for(var o=this.tryEntries.length-1;o>=0;--o){var a=this.tryEntries[o],c=a.completion;if("root"===a.tryLoc)return r("end");if(a.tryLoc<=this.prev){var u=i.call(a,"catchLoc"),s=i.call(a,"finallyLoc");if(u&&s){if(this.prev<a.catchLoc)return r(a.catchLoc,!0);if(this.prev<a.finallyLoc)return r(a.finallyLoc)}else if(u){if(this.prev<a.catchLoc)return r(a.catchLoc,!0)}else{if(!s)throw Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return r(a.finallyLoc)}}}},abrupt:function(e,t){for(var n=this.tryEntries.length-1;n>=0;--n){var r=this.tryEntries[n];if(r.tryLoc<=this.prev&&i.call(r,"finallyLoc")&&this.prev<r.finallyLoc){var o=r;break}}o&&("break"===e||"continue"===e)&&o.tryLoc<=t&&t<=o.finallyLoc&&(o=null);var a=o?o.completion:{};return a.type=e,a.arg=t,o?(this.method="next",this.next=o.finallyLoc,g):this.complete(a)},complete:function(e,t){if("throw"===e.type)throw e.arg;return"break"===e.type||"continue"===e.type?this.next=e.arg:"return"===e.type?(this.rval=this.arg=e.arg,this.method="return",this.next="end"):"normal"===e.type&&t&&(this.next=t),g},finish:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.finallyLoc===e)return this.complete(n.completion,n.afterLoc),P(n),g}},catch:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.tryLoc===e){var r=n.completion;if("throw"===r.type){var o=r.arg;P(n)}return o}}throw Error("illegal catch attempt")},delegateYield:function(e,t,r){return this.delegate={iterator:B(e),resultName:t,nextLoc:r},"next"===this.method&&(this.arg=n),g}},r}function n(e,t){return c(e)||a(e,t)||o(e,t)||r()}function r(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function o(e,t){if(e){if("string"==typeof e)return i(e,t);var n={}.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?i(e,t):void 0}}function i(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}function a(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var r,o,i,a,c=[],u=!0,s=!1;try{if(i=(n=n.call(e)).next,0===t){if(Object(n)!==n)return;u=!1}else for(;!(u=(r=i.call(n)).done)&&(c.push(r.value),c.length!==t);u=!0);}catch(e){s=!0,o=e}finally{try{if(!u&&null!=n.return&&(a=n.return(),Object(a)!==a))return}finally{if(s)throw o}}return c}}function c(e){if(Array.isArray(e))return e}function u(e,t,n,r,o,i,a){try{var c=e[i](a),u=c.value}catch(e){return void n(e)}c.done?t(u):Promise.resolve(u).then(r,o)}function s(e){return function(){var t=this,n=arguments;return new Promise(function(r,o){var i=e.apply(t,n);function a(e){u(i,r,o,a,c,"next",e)}function c(e){u(i,r,o,a,c,"throw",e)}a(void 0)})}}window.video=document.getElementById("video");var l=document.getElementById("canvas");window.progressContainer=document.getElementById("progress-container");var d,f,h=document.getElementById("progress-filled"),p=document.getElementById("progress-thumb"),y=document.querySelector(".loading"),v=document.getElementById("file-input"),m=document.getElementById("select-video"),g=document.getElementById("restart"),w=document.getElementById("close-button"),E=document.getElementById("left-side"),b=document.getElementById("right-side"),x=document.querySelector(".divider"),L=document.getElementById("linkage"),k=!1,S=[],I=16/9,j=720;function A(){return M.apply(this,arguments)}function M(){return(M=s(t().mark(function e(){var n;return t().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,n=poseDetection.SupportedModels.MoveNet,e.next=4,poseDetection.createDetector(n);case 4:d=e.sent,console.log("MoveNet loaded successfully"),k=!0,e.next=12;break;case 9:e.prev=9,e.t0=e.catch(0),console.error("Error loading the MoveNet model",e.t0);case 12:case"end":return e.stop()}},e,null,[[0,9]])}))).apply(this,arguments)}function O(){f=document.createElement("canvas");var e=video.videoWidth/video.videoHeight;f.width=j,f.height=Math.round(j/e)}function P(){var e,t,n=E.getBoundingClientRect(),r=n.width,o=n.height;r/o>I?e=(t=o)*I:t=(e=r)/I,l.width=e,l.height=t,l.style.position="absolute",l.style.top="".concat((o-t)/2,"px"),S.length>0&&T(S)}function T(e){S=e;var t=l.getContext("2d");t.clearRect(0,0,l.width,l.height);var r=l.width/f.width,o=l.height/f.height,i=Math.min(l.width,l.height),a=.01*i,c=.005*i;if(e.length>0){var u=e[0];u.keypoints.forEach(function(e){e.score>.2&&(t.beginPath(),t.arc(e.x*r,e.y*o,a,0,2*Math.PI),t.fillStyle="red",t.fill())}),poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet).forEach(function(e){var i=n(e,2),a=i[0],s=i[1],l=u.keypoints[a],d=u.keypoints[s];l.score>.2&&d.score>.2&&(t.beginPath(),t.moveTo(l.x*r,l.y*o),t.lineTo(d.x*r,d.y*o),t.strokeStyle="red",t.lineWidth=c,t.stroke())});var s=B(u.keypoints);_(t,s)}}function B(e){var t={};return[{name:"A1",points:[6,5,"horizontal"]},{name:"A2",points:[6,12,"vertical"]},{name:"A3",points:[12,6,8]},{name:"A4",points:[6,8,10]},{name:"A5",points:[6,12,14]},{name:"A6",points:[12,14,16]}].forEach(function(r){var o=n(r.points.map(function(t){return"string"==typeof t?t:e[t]}),3),i=o[0],a=o[1],c=o[2];i.score>.2&&a.score>.2&&(t[r.name]=C(i,a,c))}),t}function N(e,t){return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))}function C(){var e=arguments.length<=0?void 0:arguments[0],t=arguments.length<=1?void 0:arguments[1],n=t.x-e.x,r=t.y-e.y;if("horizontal"===(arguments.length<=2?void 0:arguments[2]))return-Math.atan2(r,n)*(180/Math.PI);if("vertical"===(arguments.length<=2?void 0:arguments[2]))return Math.atan2(n,r)*(180/Math.PI);if(3===arguments.length){var o=arguments.length<=2?void 0:arguments[2],i=N(e,t),a=N(t,o),c=N(e,o);return Math.acos((a*a+i*i-c*c)/(2*a*i))*(180/Math.PI)}throw new Error("Invalid number of arguments. Use either 2 or 3 arguments.")}function _(e,t){e.font="14px Arial",e.fillStyle="white",e.strokeStyle="black",e.lineWidth=3;for(var r=30,o=0,i=Object.entries(t);o<i.length;o++){var a=n(i[o],2),c=a[0],u=a[1],s="".concat(c,": ").concat(u.toFixed(1),"°");e.strokeText(s,10,r),e.fillText(s,10,r),r+=20}}function q(e){return D.apply(this,arguments)}function D(){return(D=s(t().mark(function e(n){var r;return t().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(!(r=n.target.files[0])){e.next=20;break}return video.src=URL.createObjectURL(r),y.style.display="block",l.style.display="none",m.style.display="none",e.next=8,video.play();case 8:return video.pause(),e.next=11,J();case 11:w.style.display="flex",n.target.value="",l.style.display="block",l.style.pointerEvents="auto",video.style.display="block",document.querySelector(".controls").style.display="flex",P(),O(),re();case 20:case"end":return e.stop()}},e)}))).apply(this,arguments)}document.addEventListener("DOMContentLoaded",A),video.addEventListener("loadedmetadata",function(){I=video.videoWidth/video.videoHeight,P(),O()}),video.addEventListener("timeupdate",H),progressContainer.addEventListener("mousedown",X),m.addEventListener("click",function(){return v.click()}),v.addEventListener("change",q),g.addEventListener("click",R),w.addEventListener("click",Z),L.addEventListener("click",function(){L.classList.toggle("checked")});var F=document.getElementById("play-pause-animation");function G(){video.paused?(video.play(),F.className="play-pause-animation play",L.classList.contains("checked")&&requestAnimationFrame(re)):(video.pause(),F.className="play-pause-animation pause"),F.style.display="block",setTimeout(function(){F.style.display="none"},1e3)}function R(){video.currentTime=0,video.play(),requestAnimationFrame(re)}l.addEventListener("click",G);var U=document.getElementById("record-data");function W(){var e=video.currentTime,t=B(S[0].keypoints);jointsData=[{time:e,angles:t}],z(e),window.newCard()}function z(e){var t=e/video.duration*98+1,n=document.createElement("div");n.className="progress-marker",n.style.left="".concat(t,"%"),n.addEventListener("click",function(t){t.stopPropagation(),video.currentTime=e,H(),video.paused&&re()}),progressContainer.appendChild(n)}function H(){var e=video.currentTime/video.duration*98+2,t=p.clientWidth;h.style.width="calc(".concat(e,"% - ").concat(t,"px)"),p.style.left="calc(".concat(e,"% - ").concat(t,"px)"),L.classList.contains("checked")&&re()}function X(e){$(e),document.addEventListener("mousemove",$),document.addEventListener("mouseup",Y),document.body.style.userSelect="none"}function Y(){document.removeEventListener("mousemove",$),document.removeEventListener("mouseup",Y),document.body.style.userSelect="",video.paused&&re()}function $(e){var t=progressContainer.getBoundingClientRect(),n=(e.clientX-t.left)/t.width*video.duration;video.currentTime=n}function J(){return K.apply(this,arguments)}function K(){return(K=s(t().mark(function e(){var n,r,o,i,a,c,u;return t().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:n=video.duration,r=20,o=document.createElement("canvas"),i=o.getContext("2d"),o.width=160,o.height=90,a=0;case 7:if(!(a<r)){e.next=20;break}return c=a/r*n,e.next=11,Q(video,c);case 11:(u=document.createElement("div")).className="progress-thumbnail",u.style.display="none",progressContainer.insertBefore(u,h),i.drawImage(video,0,0,o.width,o.height),u.style.backgroundImage="url(".concat(o.toDataURL(),")");case 17:a++,e.next=7;break;case 20:y.style.display="none",document.querySelectorAll(".progress-thumbnail").forEach(function(e){return e.style.display="block"}),video.currentTime=0;case 24:case"end":return e.stop()}},e)}))).apply(this,arguments)}function Q(e,t){return V.apply(this,arguments)}function V(){return(V=s(t().mark(function e(n,r){return t().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise(function(e){n.currentTime=r,n.addEventListener("seeked",e,{once:!0})}));case 1:case"end":return e.stop()}},e)}))).apply(this,arguments)}function Z(){video.pause(),video.src="",m.style.display="flex",l.style.display="none",video.style.display="none",document.querySelector(".controls").style.display="none",w.style.display="none",document.querySelectorAll(".progress-thumbnail").forEach(function(e){return e.remove()})}window.jointsData=[],U.addEventListener("click",W);var ee=!1;function te(e){if(ee){var t=document.querySelector(".container").getBoundingClientRect(),n=e.clientX-t.left;n>400&&n<t.width-400&&(E.style.width="".concat(n,"px"),b.style.width="".concat(t.width-n,"px"),P())}}function ne(){ee=!1,document.removeEventListener("mousemove",te),document.removeEventListener("mouseup",ne),document.body.style.userSelect=""}function re(){return oe.apply(this,arguments)}function oe(){return(oe=s(t().mark(function e(){return t().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(!(video.readyState>=2&&k)){e.next=7;break}return f.getContext("2d").drawImage(video,0,0,f.width,f.height),e.next=5,d.estimatePoses(f,{flipHorizontal:!1});case 5:T(e.sent);case 7:video.paused||requestAnimationFrame(re);case 8:case"end":return e.stop()}},e)}))).apply(this,arguments)}x.addEventListener("mousedown",function(e){ee=!0,document.addEventListener("mousemove",te),document.addEventListener("mouseup",ne),document.body.style.userSelect="none"}),window.addEventListener("resize",function(){P(),O()});
},{}]},{},["KcYi"], null)