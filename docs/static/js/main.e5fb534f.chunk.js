(this.webpackJsonppartymoji=this.webpackJsonppartymoji||[]).push([[0],{134:function(e,a){},136:function(e,a){},149:function(e,a){},160:function(e,a){},269:function(e,a,n){"use strict";n.r(a);var t=n(0),r=n.n(t),s=n(105),i=n.n(s),o=n(14),c=n(4),u=function(e){return{name:e.name,params:e.params,fn:e.fn}},l=n(47),m=n(68),d=function(e){var a=Object(c.a)(e,3),n=a[0],t=a[1],r=a[2],s=function(e){var a=e.toString(16).toUpperCase();return 2===a.length?a:"0"+a};return"#".concat(s(n)).concat(s(t)).concat(s(r))},f=function(e){return[parseInt(e.toUpperCase().substr(1,2),16),parseInt(e.toUpperCase().substr(3,2),16),parseInt(e.toUpperCase().substr(5,2),16),255]},v=function(e){return e[3]<64},h=function(e){return[Math.floor(256*e.int32()),Math.floor(256*e.int32()),Math.floor(256*e.int32()),255]},j=function(e){var a=Object(c.a)(e,3),n=a[0],t=a[1],r=a[2];return Math.round((n+t+r)/3)},b=function(e){var a=Object(c.a)(e,4),n=a[0],t=a[1],r=a[2],s=a[3],i=function(e){return Math.max(Math.min(e,255),0)};return[i(n),i(t),i(r),i(s)]},p=function(e,a,n){var t=Object(c.a)(e,2),r=t[0],s=t[1],i=Object(c.a)(n,2),o=i[0],u=i[1];if(o<0||o>=r||u<0||u>=s)return[0,0,0,0];var l=C(e,o,u);return[a[l],a[l+1],a[l+2],a[l+3]]};function g(e){var a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"Unexpected falsy value";if(!e)throw new m.AssertionError({message:a,actual:e})}var O=function(e,a){var n=e.frames.map((function(n,t){return{data:a(n.data,t,e.frames.length)}}));return{dimensions:e.dimensions,frames:n}},x=function(e,a){for(var n=Object(c.a)(e,2),t=n[0],r=n[1],s=new Uint8Array(t*r*4),i=0;i<r;i+=1)for(var o=0;o<t;o+=1){var u=b(a([o,i])),l=C(e,o,i);s[l]=u[0],s[l+1]=u[1],s[l+2]=u[2],s[l+3]=u[3]}return s},N=function(e){return function(a){var n=a.image,t=a.random,r=a.parameters;return O(n,(function(a,s,i){return x(n.dimensions,(function(o){return e({image:n,dimensions:n.dimensions,random:t,parameters:r,coord:o,frameCount:i,frameIndex:s,getSrcPixel:function(e){return p(n.dimensions,a,e)}})}))}))}},C=function(e,a,n){return 4*(a+n*Object(c.a)(e,1)[0])},M=function(e){var a=C(e.dimensions,e.coord[0],e.coord[1]);e.image[a]=e.color[0],e.image[a+1]=e.color[1],e.image[a+2]=e.color[2],e.image[a+3]=e.color[3]},w=function(e){var a=e.image,n=e.newWidth,t=e.newHeight,r=Object(c.a)(a.dimensions,2),s=r[0],i=r[1],o=s/n,u=i/t,l=[n,t];return{frames:a.frames.map((function(e){for(var r=new Uint8Array(n*t*4),s=0;s<t;s+=1)for(var i=0;i<n;i+=1){var c=Math.floor(i*o),m=Math.floor(s*u),d=p(a.dimensions,e.data,[c,m]);M({color:d,coord:[i,s],dimensions:l,image:r})}return{data:r}})),dimensions:[n,t]}},V=[[255,141,139,255],[254,214,137,255],[136,255,137,255],[135,255,255,255],[139,181,254,255],[215,140,255,255],[255,140,255,255],[255,104,247,255],[254,108,183,255],[255,105,104,255]],k=u({name:"Background Party",params:[],fn:N((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=(0,e.getSrcPixel)(a);if(v(r)){var s=Math.floor(t/n*V.length);return V[s]}return r}))}),y=n(26),S=n.n(y),I=n(1),P=function(e){var a,n,t=e.selected,s=e.options,i=e.onChange,o=r.a.useState(!0),u=Object(c.a)(o,2),l=u[0],m=u[1],d=r.a.useCallback((function(){document.removeEventListener("click",d),m(!0)}),[]),f=null!==(a=null===(n=s.find((function(e){return e.value===t})))||void 0===n?void 0:n.name)&&void 0!==a?a:"";return Object(I.jsxs)("div",{className:"dropdown is-active",children:[Object(I.jsx)("div",{className:"dropdown-trigger",children:Object(I.jsxs)("button",{className:"button","aria-haspopup":"true",onClick:function(e){e.preventDefault(),l?(m(!1),setTimeout((function(){return document.addEventListener("click",d)}),0)):d()},children:[Object(I.jsx)("span",{children:f}),Object(I.jsx)("span",{className:"icon is-small",children:Object(I.jsx)("i",{className:"fas fa-angle-down","aria-hidden":"true"})})]})}),Object(I.jsx)("div",{className:"dropdown-menu",role:"menu",style:{visibility:l?"hidden":"visible"},children:Object(I.jsx)("div",{className:"dropdown-content",style:{maxHeight:"16em",overflowY:"auto"},children:s.map((function(e){var a=e.name,n=e.value;return Object(I.jsx)("a",{href:"#",className:S()("dropdown-item",{"is-active":t===n}),onClick:function(e){e.preventDefault(),d(),i(n)},children:a},n)}))})})]})},T=function(e){var a=e.name,n=e.options,t=e.value,r=e.onChange;return Object(I.jsxs)("div",{children:[Object(I.jsx)("label",{children:a}),Object(I.jsx)("br",{}),Object(I.jsx)(P,{onChange:function(e){return r({valid:!0,value:e})},selected:t,options:n})]})};function U(e){return{name:e.name,defaultValue:e.defaultValue?{valid:!0,value:e.defaultValue}:{valid:!1},fn:function(a){return Object(I.jsx)(T,{name:e.name,value:a.value.valid?a.value.value:void 0,options:e.options,onChange:a.onChange})}}}var R=n(6),B=n.n(R),A=n(11),F=n(106),E=n.n(F),L=n(107),D=n.n(L),H=n(45),q=n.n(H),W=function(){var e=Object(A.a)(B.a.mark((function e(a,n,t){var r,s,i;return B.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=q()(a),e.next=3,J(a);case 3:return s=e.sent,i=[],n.reduce((function(e,a){var n=a.transform.fn({image:e,parameters:a.params,random:r});return i.push(n),n}),s),e.next=8,Promise.all(i.map(function(){var e=Object(A.a)(B.a.mark((function e(a){var n,s;return B.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=Y(a,r),s=z(a.frames.map((function(e){return e.data})),n),e.next=4,G(a.dimensions,s,n,t);case 4:return e.abrupt("return",e.sent);case 5:case"end":return e.stop()}}),e)})));return function(a){return e.apply(this,arguments)}}()));case 8:return e.abrupt("return",e.sent);case 9:case"end":return e.stop()}}),e)})));return function(a,n,t){return e.apply(this,arguments)}}(),z=function(e,a){return e.map((function(e){for(var n=new Uint8Array(e.length),t=0;t<e.length;t+=4)a&&e[t+3]<128?(n[t]=a[0],n[t+1]=a[1],n[t+2]=a[2],n[t+3]=a[3]):(n[t]=e[t],n[t+1]=e[t+1],n[t+2]=e[t+2],n[t+3]=255);return n}))},G=function(){var e=Object(A.a)(B.a.mark((function e(a,n,t,r){return B.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e){var s=Object(c.a)(a,2),i=s[0],o=s[1],u=new D.a(i,o);if(u.setFrameRate(r),u.setRepeat(0),t){var l=d(t).slice(1);u.setTransparent("0x".concat(l))}u.writeHeader();var m=[];u.on("data",(function(e){m.push(e)})),u.on("end",(function(){var a=URL.createObjectURL(new Blob(m,{type:"image/gif"}));e(a)})),n.forEach((function(e){u.addFrame(e)})),u.finish()})));case 1:case"end":return e.stop()}}),e)})));return function(a,n,t,r){return e.apply(this,arguments)}}(),J=function(e){return new Promise((function(a,n){return E()(e,(function(e,t){return e?n(e):a({frames:[{data:Uint8Array.from(t.data)}],dimensions:[t.shape[0],t.shape[1]]})}))}))},Y=function(e,a){var n=!1,t=new Set,r=Object(c.a)(e.dimensions,2),s=r[0],i=r[1],o=d([0,255,0,255]);return e.frames.forEach((function(r){for(var c=0;c<i;c+=1)for(var u=0;u<s;u+=1){var l=p(e.dimensions,r.data,[u,c]);if(v(l))n=!0;else{var m=d(l);t.add(m),m===o&&(o=_(a,t))}}})),n?f(o):void 0},_=function e(a,n){var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,r=d(h(a));return t>2e3?r:n.has(r)?e(a,n,t+1):r},X=function(e){var a=e.currentImageUrl,n=e.name,t=e.width,r=e.height,s=e.onChange;return Object(I.jsxs)(I.Fragment,{children:[Object(I.jsx)("div",{className:"file block",children:Object(I.jsxs)("label",{className:"file-label",children:[Object(I.jsx)("input",{className:"file-input",type:"file",accept:"image/png,image/jpg",name:"source-png",onChange:function(){var e=Object(A.a)(B.a.mark((function e(a){var n,t,r,i;return B.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=Array.from(null!==(n=a.target.files)&&void 0!==n?n:[]),r=t[0],e.next=4,K(r);case 4:i=e.sent,s(i);case 6:case"end":return e.stop()}}),e)})));return function(a){return e.apply(this,arguments)}}()}),Object(I.jsxs)("span",{className:"file-cta",children:[Object(I.jsx)("span",{className:"file-icon",children:Object(I.jsx)("i",{className:"fas fa-upload"})}),Object(I.jsx)("span",{className:"file-label",children:n})]})]})}),a&&Object(I.jsx)("img",{width:t,height:r,src:a,alt:"Source"})]})},K=function(e){return new Promise((function(a){var n=new FileReader;n.onload=function(){return a(n.result)},n.readAsDataURL(e)}))};var Q,Z=u({name:"Background Image",params:[(Q={name:"Image"},{name:Q.name,defaultValue:{valid:!1},fn:function(e){return Object(I.jsxs)("div",{children:[Object(I.jsx)("label",{children:Q.name}),Object(I.jsx)("br",{}),Object(I.jsx)(X,{name:"Image",currentImageUrl:e.value.valid?e.value.value.dataUrl:void 0,width:64,height:64,onChange:function(){var a=Object(A.a)(B.a.mark((function a(n){var t;return B.a.wrap((function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,J(n);case 2:t=a.sent,e.onChange({valid:!0,value:{dataUrl:n,image:t}});case 4:case"end":return a.stop()}}),a)})));return function(e){return a.apply(this,arguments)}}()})]})}}),U({name:"Type",defaultValue:"background",options:[{name:"Background",value:"background"},{name:"Foreground",value:"foreground"}]})],fn:function(e){var a=e.image,n=e.parameters,t=w({image:n[0].image,newWidth:a.dimensions[0],newHeight:a.dimensions[1]}),r=n[1];return O(a,(function(e){return x(a.dimensions,(function(n){var s=p(a.dimensions,e,n),i=p(t.dimensions,t.frames[0].data,n);return"background"===r?v(s)?i:s:v(i)?s:i}))}))}}),$=function(e){var a=e.name,n=e.value,t=e.parse,s=e.onChange,i=r.a.useState(void 0===n?void 0:n.toString()),o=Object(c.a)(i,2),u=o[0],l=o[1],m=r.a.useState(""),d=Object(c.a)(m,2),f=d[0],v=d[1];return Object(I.jsxs)("div",{className:"field",children:[Object(I.jsx)("label",{className:"label",children:a}),Object(I.jsx)("div",{className:"control has-icons-left has-icons-right",children:Object(I.jsx)("input",{className:"input",type:"text",defaultValue:n,onChange:function(e){l(e.target.value)},onBlur:function(){if(void 0!==u&&(!n||u!==n.toString())){var e=t(u);e.valid?v(""):v(e.reason),s(e)}}})}),f&&Object(I.jsx)("p",{className:"help is-danger",children:f})]})},ee=function(e){return{name:e.name,defaultValue:void 0!==e.defaultValue?{valid:!0,value:e.defaultValue}:{valid:!1},fn:function(a){var n=e.min,t=e.max;return Object(I.jsx)($,{name:e.name,parse:function(e){var a=parseFloat(e);return isNaN(a)?{valid:!1,reason:"Must be a number"}:void 0!==n&&a<n?{valid:!1,reason:"Must be greater than or equal to ".concat(n)}:void 0!==t&&a>t?{valid:!1,reason:"Must be less than or equal to ".concat(t)}:{valid:!0,value:a}},onChange:a.onChange,value:a.value.valid?a.value.value:void 0})}}},ae=u({name:"Bounce",params:[ee({name:"Bounce Speed",defaultValue:5,min:0})],fn:N((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=e.getSrcPixel,s=e.parameters,i=Object(c.a)(a,2);return r([i[0],i[1]+Math.round(s[0]*Math.sin(t/n*2*Math.PI))])}))}),ne=u({name:"Circle",params:[ee({name:"Radius",defaultValue:10,min:0})],fn:N((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=e.getSrcPixel,s=e.parameters,i=Object(c.a)(s,1)[0],o=Object(c.a)(a,2),u=o[0],l=o[1];return r([u+Math.round(i*Math.sin(-2*Math.PI*(t/n))),l+Math.round(i*Math.cos(-2*Math.PI*(t/n)))])}))}),te=u({name:"Expand",params:[ee({name:"Radius",defaultValue:10,min:0})],fn:N((function(e){var a=e.dimensions,n=e.coord,t=e.frameCount,r=e.frameIndex,s=e.getSrcPixel,i=e.parameters,o=r/t,u=Math.cos(2*o*Math.PI)*i[0],l=Object(c.a)(a,2),m=l[0],d=l[1],f=m/2,v=d/2,h=Object(c.a)(n,2),j=h[0],b=h[1],p=(j-f)/m,g=(b-v)/d;return s([j-Math.floor(u*p),b-Math.round(u*g)])}))}),re=u({name:"Fisheye",params:[ee({name:"radius",defaultValue:10,min:0})],fn:N((function(e){var a=e.dimensions,n=e.coord,t=e.frameCount,r=e.frameIndex,s=e.getSrcPixel,i=e.parameters,o=r/t,u=o<.5,l=Object(c.a)(a,2),m=l[0],d=l[1],f=(u?o:1-o)*i[0],v=m/2,h=d/2,j=Object(c.a)(n,2),b=j[0],p=j[1],g=Math.atan2(h-p,v-b);return s([b+Math.round(f*Math.cos(g)),p+Math.round(f*Math.sin(g))])}))}),se=function(e){var a=e.name,n=e.value,t=e.parse,s=e.onChange,i=r.a.useState(void 0===n?void 0:n.toString()),o=Object(c.a)(i,2),u=o[0],l=o[1],m=r.a.useState(""),d=Object(c.a)(m,2),f=d[0],v=d[1];return Object(I.jsxs)("div",{className:"field",children:[Object(I.jsx)("label",{className:"label",children:a}),Object(I.jsx)("div",{className:"control has-icons-left has-icons-right",children:Object(I.jsx)("input",{className:"input",type:"text",defaultValue:n,onChange:function(e){l(e.target.value)},onBlur:function(){if(void 0!==u&&(!n||u!==n.toString())){var e=t(u);e.valid?v(""):v(e.reason),s(e)}}})}),f&&Object(I.jsx)("p",{className:"help is-danger",children:f})]})},ie=function(e){return{name:e.name,defaultValue:void 0!==e.defaultValue?{valid:!0,value:e.defaultValue}:{valid:!1},fn:function(a){var n=e.min,t=e.max;return Object(I.jsx)(se,{name:e.name,parse:function(e){var a=parseInt(e,10);return isNaN(a)?{valid:!1,reason:"Must be an integer"}:void 0!==n&&a<n?{valid:!1,reason:"Must be greater than or equal to ".concat(n)}:void 0!==t&&a>t?{valid:!1,reason:"Must be less than or equal to ".concat(t)}:{valid:!0,value:a}},onChange:a.onChange,value:a.value.valid?a.value.value:void 0})}}},oe=u({name:"Frame Count",params:[ie({name:"Number of Frames",defaultValue:10,min:1})],fn:function(e){var a,n=e.image,t=e.parameters,r=Object(c.a)(t,1)[0],s=n.frames,i=(a=r,Object(l.a)(new Array(a)).map((function(e,a){return a}))).map((function(e){return{data:s[e]?s[e].data:s[s.length-1].data}}));return{dimensions:n.dimensions,frames:i}}}),ce=u({name:"Grayscale",params:[],fn:N((function(e){var a=e.coord,n=(0,e.getSrcPixel)(a);if(v(n))return[0,0,0,0];var t=j(n);return[t,t,t,255]}))}),ue=function(e){var a=e.name,n=e.value,t=e.onChange,s=r.a.useState(n),i=Object(c.a)(s,2),o=i[0],u=i[1];return Object(I.jsxs)("div",{children:[Object(I.jsx)("label",{children:a}),Object(I.jsx)("br",{}),Object(I.jsx)("input",{type:"text",value:o,name:a,onChange:function(e){return u(e.target.value)},onBlur:function(){return t(n?{valid:!0,value:n}:{valid:!1})}})]})},le=[[0,15,40,255],[150,150,175,255],[180,180,205,255],[210,210,235,255]],me=u({name:"Lightning",params:[function(e){return{name:e.name,defaultValue:void 0!==e.defaultValue?{valid:!0,value:e.defaultValue}:{valid:!1},fn:function(a){return Object(I.jsx)(ue,{name:e.name,onChange:a.onChange,value:a.value.valid?a.value.value:void 0})}}}({name:"Random Seed",defaultValue:"lightning"})],fn:function(e){var a=e.image,n=e.parameters,t=q()(n[0]);return O(a,(function(e){var n=t(),r=n<.9?0:n<.95?1:n<.98?2:3;return x(a.dimensions,(function(n){var t=p(a.dimensions,e,n);if(v(t))return le[r];if(r>0){var s=1.02*r;return[t[0]*s,t[1]*s,t[2]*s,t[3]]}return t}))}))}}),de=[[255,141,139,255],[254,214,137,255],[136,255,137,255],[135,255,255,255],[139,181,254,255],[215,140,255,255],[255,140,255,255],[255,104,247,255],[254,108,183,255],[255,105,104,255]],fe=u({name:"Party",params:[],fn:N((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=(0,e.getSrcPixel)(a);if(v(r))return[0,0,0,0];var s=Math.floor(t/n*de.length),i=de[s],o=j(r);return[o*i[0]/255,o*i[1]/255,o*i[2]/255,255]}))}),ve=u({name:"Resize",params:[ie({name:"Width",defaultValue:128,min:1}),ie({name:"Height",defaultValue:128,min:1})],fn:function(e){var a=e.image,n=e.parameters,t=Object(c.a)(n,2),r=t[0],s=t[1];return w({image:a,newWidth:r,newHeight:s})}}),he=u({name:"Resize Background",params:[ie({name:"Width",defaultValue:128,min:0}),ie({name:"Height",defaultValue:128,min:0})],fn:function(e){var a=e.image,n=e.parameters,t=Object(c.a)(a.dimensions,2),r=t[0],s=t[1],i=Object(c.a)(n,2),o=i[0],u=i[1];g(o>=r,"New width for resize-background needs to be greater than or equal to the original"),g(u>=s,"New height for resize-background needs to be greater than or equal to the original");var l=[o,u],m=(o-r)/2,d=(u-s)/2;return{frames:a.frames.map((function(e){for(var n=new Uint8Array(o*u*4),t=0;t<u;t+=1)for(var r=0;r<o;r+=1){var s=r>m&&r<o-m&&t>d&&t<u-d?p(a.dimensions,e.data,[r-m,t-d]):[0,0,0,0];M({color:s,coord:[r,t],dimensions:l,image:n})}return{data:n}})),dimensions:l}}}),je=u({name:"Ripple",params:[ee({name:"Amplitude",defaultValue:10}),ee({name:"Period",defaultValue:2,min:0})],fn:function(e){var a=e.image,n=e.parameters;return O(a,(function(e,t,r){var s=Object(c.a)(n,2),i=s[0],o=s[1],u=a.dimensions[1],l=t/r*2*Math.PI;return x(a.dimensions,(function(n){var t=Object(c.a)(n,2),r=t[0],s=t[1],m=Math.round(i*Math.sin(s/u*o*Math.PI+l));return p(a.dimensions,e,[r+m,s])}))}))}}),be=u({name:"Rotate",params:[U({name:"Direction",defaultValue:-1,options:[{name:"Clockwise",value:-1},{name:"Counter-Clockwise",value:1}]})],fn:N((function(e){var a=e.dimensions,n=e.coord,t=e.frameCount,r=e.frameIndex,s=e.getSrcPixel,i=e.parameters,o=Object(c.a)(i,1)[0],u=a[0]/2,l=a[1]/2,m=Object(c.a)(n,2),d=m[0]-u,f=m[1]-l,v=r/t*(o||1),h=Math.cos(2*Math.PI*v),j=Math.sin(2*Math.PI*v);return s([Math.round(u+d*h-f*j),Math.round(l+f*h+d*j)])}))}),pe=u({name:"Roxbury",params:[],fn:function(e){var a=e.image;return O(a,(function(e,n,t){var r=n/t,s=Math.floor(4*r),i=4*(r-s/4),o=Math.PI/2*.2,u=0===s?0:1===s?i*o:2===s?o:(1-i)*o,l=Math.cos(1.35*-u),m=Math.sin(1.35*-u),d=.25*a.dimensions[0],f=.7*a.dimensions[1];return x(a.dimensions,(function(n){var t=Object(c.a)(n,2),r=t[0],s=t[1],i=Math.floor(r-d+8*Math.sin(u)),o=Math.floor(s-f+8*Math.cos(u)),v=[Math.round(d+i*l-o*m),Math.round(f+o*l+i*m)];return p(a.dimensions,e,v)}))}))}}),ge=u({name:"Shake",params:[ee({name:"Shake Speed",defaultValue:10,min:0})],fn:N((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=e.getSrcPixel,s=e.parameters,i=Object(c.a)(s,1)[0],o=Object(c.a)(a,2),u=o[0],l=o[1];return r([u+Math.round(i*Math.cos(t/n*2*Math.PI)),l])}))}),Oe=n(112),xe=function(e){var a=e.mainEle,n=e.children,t=r.a.useState(!0),s=Object(c.a)(t,2),i=s[0],o=s[1];return Object(I.jsxs)("div",{children:[Object(I.jsxs)("div",{className:"is-clickable columns",onClick:function(){return o(!i)},children:[Object(I.jsx)("div",{className:"column is-four-fifths",children:a}),Object(I.jsx)("span",{className:"icon column",children:Object(I.jsx)("i",{className:S()("fas",i?"fa-chevron-up":"fa-chevron-down")})})]}),!i&&Object(I.jsx)("div",{children:n})]})},Ne=function(e){var a=e.color;return Object(I.jsx)("div",{style:{width:"1.5em",height:"1.5em",backgroundColor:d(a)}})},Ce=function(e){var a=e.name,n=e.value,t=e.onChange;return console.log("value",n),Object(I.jsx)(xe,{mainEle:Object(I.jsxs)("div",{className:"columns",children:[Object(I.jsx)("label",{className:"label column is-four-fifths",children:a}),Object(I.jsx)("span",{className:"column",children:n&&Object(I.jsx)(Ne,{color:n})})]}),children:Object(I.jsx)(Oe.a,{disableAlpha:!0,presetColors:[],color:n?d(n):void 0,onChangeComplete:function(e){return t({valid:!0,value:f(e.hex)})}})})};function Me(e){return{name:e.name,defaultValue:e.defaultValue?{valid:!0,value:e.defaultValue}:{valid:!1},fn:function(a){return console.log("params",a),Object(I.jsx)(Ce,{name:e.name,value:a.value.valid?a.value.value:void 0,onChange:a.onChange})}}}var we=[oe,k,Z,ae,ne,te,re,ce,me,fe,ve,he,je,be,pe,ge,u({name:"Solid Background",params:[Me({name:"Background Color",defaultValue:f("#000000")})],fn:N((function(e){var a=e.coord,n=e.getSrcPixel,t=e.parameters,r=Object(c.a)(t,1)[0],s=n(a);return v(s)?r:s}))}),u({name:"Static",params:[ee({name:"Strength",defaultValue:10,min:0})],fn:N((function(e){var a=e.coord,n=e.getSrcPixel,t=e.parameters,r=e.random,s=Object(c.a)(t,1)[0],i=n(a);return v(i)?[0,0,0,0]:Math.ceil(r()*s)>1?[255-i[0],255-i[1],255-i[2],i[3]]:i}))}),u({name:"Transparent Color",params:[Me({name:"Transparent Color",defaultValue:f("#000000")}),ie({name:"Tolerance",defaultValue:10,min:0,max:100})],fn:N((function(e){var a=e.coord,n=e.getSrcPixel,t=e.parameters,r=Object(c.a)(t,2),s=r[0],i=r[1],o=n(a),u=o[0]-s[0],l=o[1]-s[1],m=o[2]-s[2];return Math.sqrt(u*u+l*l+m*m)/255*100<=i?[o[0],o[1],o[2],0]:o}))}),u({name:"Transpose",params:[ie({name:"X",defaultValue:0}),ie({name:"Y",defaultValue:0})],fn:N((function(e){var a=e.coord,n=e.getSrcPixel,t=e.parameters,r=Object(c.a)(t,2),s=r[0],i=r[1],o=Object(c.a)(a,2);return n([o[0]+s,o[1]+i])}))})],Ve=ie({name:"Frames per Second",defaultValue:20,min:0}),ke=function(e){var a=e.isDirty,n=e.computeDisabled,t=e.baseImageUrl,s=e.transforms,i=e.onComputed,o=r.a.useState({loading:!1,results:[]}),u=Object(c.a)(o,2),l=u[0],m=u[1],d=r.a.useState(!1),f=Object(c.a)(d,2),v=f[0],h=f[1],j=r.a.useState(20),b=Object(c.a)(j,2),p=b[0],O=b[1],x=n&&!v;return Object(I.jsxs)("div",{className:"box",children:[Object(I.jsx)("h3",{className:"title",children:"Create Gif"}),Object(I.jsx)("div",{className:"block",children:Ve.fn({value:{valid:!0,value:p},onChange:function(e){e.valid&&(O(e.value),h(!0))}})}),Object(I.jsx)("div",{className:"block",children:Object(I.jsxs)("button",{className:S()("button","block",{"is-loading":l.loading}),disabled:x,onClick:Object(A.a)(B.a.mark((function e(){var a;return B.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:a=s.map((function(e){return{transform:e.transform,params:e.paramsValues.map((function(e){return g(e.valid),e.value}))}})),m({loading:!0}),setTimeout(Object(A.a)(B.a.mark((function e(){var n;return B.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return g(t,"No source image, this button should be disabled!"),e.next=3,W(t,a,p);case 3:n=e.sent,m({loading:!1,results:n}),h(!1),i();case 7:case"end":return e.stop()}}),e)}))));case 3:case"end":return e.stop()}}),e)}))),children:[Object(I.jsx)("span",{children:"Compute"})," ",(a||v)&&Object(I.jsx)("span",{className:"icon is-small",children:Object(I.jsx)("i",{className:"fas fa-exclamation-circle","aria-hidden":"true"})})]})}),Object(I.jsx)("div",{className:"block",children:Object(I.jsx)("div",{className:"columns",children:!l.loading&&l.results.map((function(e,a){return Object(I.jsxs)("div",{className:"column",children:[Object(I.jsx)("div",{children:s[a].transform.name}),Object(I.jsx)("img",{src:e,alt:"gif-".concat(s[a].transform.name)})]})}))})})]})},ye=function(e){e.image;var a=e.selectedTransform,n=e.possibleTransforms,t=e.onSelect,r=e.onRemove,s=e.onMoveLeft,i=e.onMoveRight;return Object(I.jsxs)("div",{className:"card",style:{width:"300px"},children:[Object(I.jsx)("div",{className:"card-header-title",children:Object(I.jsxs)("div",{className:"columns is-desktop",children:[Object(I.jsx)("div",{className:"column",children:Object(I.jsx)(P,{selected:a.transform.name,options:n.map((function(e){return{name:e.name,value:e.name}})),onChange:function(e){var a=n.find((function(a){return a.name===e}));t({transform:a,paramValues:a.params.map((function(e){return e.defaultValue}))})}})}),Object(I.jsxs)("div",{className:"column columns",children:[s&&Object(I.jsx)("div",{className:"icon column is-clickable",onClick:s,children:Object(I.jsx)("i",{className:"fas fa-chevron-left","aria-hidden":"true"})}),i&&Object(I.jsx)("div",{className:"icon column is-clickable",onClick:i,children:Object(I.jsx)("i",{className:"fas fa-chevron-right","aria-hidden":"true"})}),Object(I.jsx)("div",{className:"icon column is-clickable",onClick:r,children:Object(I.jsx)("i",{className:"fas fa-trash","aria-hidden":"true"})})]})]})}),Object(I.jsx)("div",{className:"card-content",children:a.transform.params.map((function(e,n){var r=e.fn({value:a.paramValues[n],onChange:function(e){console.log("changing to ",e),t(Object(o.a)(Object(o.a)({},a),{},{paramValues:a.paramValues.map((function(a,t){return t===n?e:a}))}))}});return Object(I.jsx)("div",{children:r},e.name)}))})]})},Se=function(e){var a=e.currentTransforms,n=e.possibleTransforms,t=e.onTransformsChange;return Object(I.jsxs)("div",{className:"box",children:[Object(I.jsx)("h3",{className:"title",children:"Image Transforms"}),Object(I.jsx)("div",{className:"block",children:Object(I.jsx)("button",{className:"button",onClick:function(){return t([].concat(Object(l.a)(a),[{transform:n[0],paramsValues:n[0].params.map((function(e){return e.defaultValue}))}]))},children:"New Transform"})}),Object(I.jsxs)("div",{className:"columns",children:[a.map((function(e,r){return Object(I.jsx)(ye,{image:void 0,possibleTransforms:n,selectedTransform:{transform:e.transform,paramValues:e.paramsValues},onRemove:function(){return t(a.filter((function(e,a){return a!==r})))},onMoveLeft:r>0?function(){return t(a.map((function(e,n){return n===r-1?a[n+1]:r===n?a[r-1]:e})))}:void 0,onMoveRight:r<a.length-1?function(){return t(a.map((function(e,n){return n===r+1?a[n-1]:r===n?a[r+1]:e})))}:void 0,onSelect:function(e){return t(a.map((function(a,n){return r===n?{transform:e.transform,paramsValues:e.paramValues,computedImage:void 0}:{transform:a.transform,paramsValues:a.paramsValues,computedImage:void 0}})))}})})),Object(I.jsx)("div",{className:"box",style:{display:"none"}})]})]})},Ie=function(){var e=r.a.useState({dirty:!1,transforms:[],baseImage:void 0}),a=Object(c.a)(e,2),n=a[0],t=a[1];var s=!n.baseImage||0===n.transforms.length||!n.dirty||n.transforms.some((function(e){return e.transform.params.length>0&&e.paramsValues.every((function(e,a){return!1===e.valid}))}));return Object(I.jsx)("section",{children:Object(I.jsxs)("div",{className:"container",children:[Object(I.jsx)("h1",{className:"title",style:{paddingTop:"16px"},children:"Partymoji"}),Object(I.jsxs)("div",{children:[Object(I.jsxs)("div",{className:"box",children:[Object(I.jsx)("h3",{className:"title",children:"Source Image"}),Object(I.jsx)(X,{name:"Choose a source image",currentImageUrl:n.baseImage,onChange:function(e){t(Object(o.a)(Object(o.a)({},n),{},{baseImage:e,dirty:!0}))}})]}),Object(I.jsx)(Se,{currentTransforms:n.transforms,possibleTransforms:we,onTransformsChange:function(e){return t(Object(o.a)(Object(o.a)({},n),{},{dirty:!0,transforms:e}))}}),Object(I.jsx)(ke,{isDirty:n.dirty,baseImageUrl:n.baseImage,computeDisabled:s,transforms:n.transforms,onComputed:function(){return t(Object(o.a)(Object(o.a)({},n),{},{dirty:!1}))}}),false,Object(I.jsx)("a",{href:"https://github.com/MikeyBurkman/partymoji",target:"_blank",rel:"noreferrer",children:Object(I.jsx)("img",{src:"https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",width:64,height:64,alt:"Github Link"})})]})]})})};i.a.render(Object(I.jsx)(r.a.StrictMode,{children:Object(I.jsx)(Ie,{})}),document.getElementById("root"))}},[[269,1,2]]]);
//# sourceMappingURL=main.e5fb534f.chunk.js.map