(this.webpackJsonppartymoji=this.webpackJsonppartymoji||[]).push([[0],{128:function(e,a){},250:function(e,a){},252:function(e,a){},265:function(e,a){},269:function(e,a,n){"use strict";n.r(a);var t=n(0),r=n.n(t),s=n(105),i=n.n(s),c=n(22),o=n(4),u=n(6),l=n.n(u),m=n(16),d=n(1),f=function(e){var a=e.currentImageUrl,n=e.onChange;return Object(d.jsxs)("div",{className:"box",children:[Object(d.jsx)("h3",{className:"title",children:"Source Image"}),Object(d.jsx)("div",{className:"file block",children:Object(d.jsxs)("label",{className:"file-label",children:[Object(d.jsx)("input",{className:"file-input",type:"file",accept:"image/png,image/jpg",name:"source-png",onChange:function(){var e=Object(m.a)(l.a.mark((function e(a){var t,r,s,i;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=Array.from(null!==(t=a.target.files)&&void 0!==t?t:[]),s=r[0],e.next=4,j(s);case 4:i=e.sent,n(i);case 6:case"end":return e.stop()}}),e)})));return function(a){return e.apply(this,arguments)}}()}),Object(d.jsxs)("span",{className:"file-cta",children:[Object(d.jsx)("span",{className:"file-icon",children:Object(d.jsx)("i",{className:"fas fa-upload"})}),Object(d.jsx)("span",{className:"file-label",children:"Choose a source image"})]})]})}),a&&Object(d.jsx)("img",{src:a,alt:"Source"})]})},j=function(e){return new Promise((function(a){var n=new FileReader;n.onload=function(){return a(n.result)},n.readAsDataURL(e)}))},h=n(47),b=n(31),v=n.n(b),p=function(e){var a,n,t=e.selected,s=e.options,i=e.onChange,c=r.a.useState(!0),u=Object(o.a)(c,2),l=u[0],m=u[1],f=r.a.useCallback((function(){document.removeEventListener("click",f),m(!0)}),[]),j=null!==(a=null===(n=s.find((function(e){return e.value===t})))||void 0===n?void 0:n.name)&&void 0!==a?a:"";return Object(d.jsxs)("div",{className:"dropdown is-active",children:[Object(d.jsx)("div",{className:"dropdown-trigger",children:Object(d.jsxs)("button",{className:"button","aria-haspopup":"true",onClick:function(e){e.preventDefault(),l?(m(!1),setTimeout((function(){return document.addEventListener("click",f)}),0)):f()},children:[Object(d.jsx)("span",{children:j}),Object(d.jsx)("span",{className:"icon is-small",children:Object(d.jsx)("i",{className:"fas fa-angle-down","aria-hidden":"true"})})]})}),Object(d.jsx)("div",{className:"dropdown-menu",role:"menu",style:{visibility:l?"hidden":"visible"},children:Object(d.jsx)("div",{className:"dropdown-content",style:{height:"16em",overflowY:"auto"},children:s.map((function(e){var a=e.name,n=e.value;return Object(d.jsx)("a",{href:"#",className:v()("dropdown-item",{"is-active":t===n}),onClick:function(e){e.preventDefault(),f(),i(n)},children:a},n)}))})})]})},g=function(e){var a=e.mainEle,n=e.children,t=r.a.useState(!0),s=Object(o.a)(t,2),i=s[0],c=s[1];return Object(d.jsxs)("div",{children:[Object(d.jsxs)("div",{className:"is-clickable columns",onClick:function(){return c(!i)},children:[Object(d.jsx)("div",{className:"column is-four-fifths",children:a}),Object(d.jsx)("span",{className:"icon column",children:Object(d.jsx)("i",{className:v()("fas",i?"fa-chevron-up":"fa-chevron-down")})})]}),!i&&Object(d.jsx)("div",{children:n})]})},O=function(e){e.image;var a=e.selectedTransform,n=e.possibleTransforms,t=e.onSelect,r=e.onRemove,s=e.onMoveLeft,i=e.onMoveRight;return Object(d.jsxs)("div",{className:"card",style:{width:"300px"},children:[Object(d.jsx)("div",{className:"card-header-title",children:Object(d.jsxs)("div",{className:"columns is-desktop",children:[Object(d.jsx)("div",{className:"column",children:Object(d.jsx)(p,{selected:a.transform.name,options:n.map((function(e){return{name:e.name,value:e.name}})),onChange:function(e){var a=n.find((function(a){return a.name===e}));t({transform:a,paramValues:a.params.map((function(e){return{valid:!0,value:e.defaultValue}}))})}})}),Object(d.jsxs)("div",{className:"column columns",children:[s&&Object(d.jsx)("div",{className:"icon column is-clickable",onClick:s,children:Object(d.jsx)("i",{className:"fas fa-chevron-left","aria-hidden":"true"})}),i&&Object(d.jsx)("div",{className:"icon column is-clickable",onClick:i,children:Object(d.jsx)("i",{className:"fas fa-chevron-right","aria-hidden":"true"})}),Object(d.jsx)("div",{className:"icon column is-clickable",onClick:r,children:Object(d.jsx)("i",{className:"fas fa-trash","aria-hidden":"true"})})]})]})}),Object(d.jsx)("div",{className:"card-content",children:a.transform.params.map((function(e,n){var r=a.paramValues[n],s=e.fn({value:r.valid?r.value:e.defaultValue,onChange:function(e){t({transform:a.transform,paramValues:a.paramValues.map((function(a,t){return t===n?e:a}))})}});return Object(d.jsx)("div",{children:s},e.name)}))})]})},x=function(e){var a=e.currentTransforms,n=e.possibleTransforms,t=e.onTransformsChange;return Object(d.jsxs)("div",{className:"box",children:[Object(d.jsx)("h3",{className:"title",children:"Image Transforms"}),Object(d.jsx)("div",{className:"block",children:Object(d.jsx)("button",{className:"button",onClick:function(){return t([].concat(Object(h.a)(a),[{transform:n[0],paramsValues:n[0].params.map((function(e){return void 0!==e.defaultValue?{valid:!0,value:e.defaultValue}:{valid:!1}}))}]))},children:"New Transform"})}),Object(d.jsxs)("div",{className:"columns",children:[a.map((function(e,r){return Object(d.jsx)(O,{image:void 0,possibleTransforms:n,selectedTransform:{transform:e.transform,paramValues:e.paramsValues},onRemove:function(){return t(a.filter((function(e,a){return a!==r})))},onMoveLeft:r>0?function(){return t(a.map((function(e,n){return n===r-1?a[n+1]:r===n?a[r-1]:e})))}:void 0,onMoveRight:r<a.length-1?function(){return t(a.map((function(e,n){return n===r+1?a[n-1]:r===n?a[r+1]:e})))}:void 0,onSelect:function(e){return t(a.map((function(a,n){return r===n?{transform:e.transform,paramsValues:e.paramValues,computedImage:void 0}:{transform:a.transform,paramsValues:a.paramsValues,computedImage:void 0}})))}})})),Object(d.jsx)("div",{className:"box",style:{display:"none"}})]})]})},N=function(e){return{name:e.name,params:e.params,fn:e.fn}},C=n(68),M=function(e){var a=Object(o.a)(e,3),n=a[0],t=a[1],r=a[2],s=function(e){var a=e.toString(16).toUpperCase();return 2===a.length?a:"0"+a};return"#".concat(s(n)).concat(s(t)).concat(s(r))},V=function(e){return[parseInt(e.toUpperCase().substr(1,2),16),parseInt(e.toUpperCase().substr(3,2),16),parseInt(e.toUpperCase().substr(5,2),16),255]},k=function(e){return e[3]<64},w=function(e){return[Math.floor(256*e.int32()),Math.floor(256*e.int32()),Math.floor(256*e.int32()),255]},y=function(e){var a=Object(o.a)(e,3),n=a[0],t=a[1],r=a[2];return Math.round((n+t+r)/3)},S=function(e){var a=Object(o.a)(e,4),n=a[0],t=a[1],r=a[2],s=a[3],i=function(e){return Math.max(Math.min(e,255),0)};return[i(n),i(t),i(r),i(s)]},I=function(e,a,n){var t=Object(o.a)(e,2),r=t[0],s=t[1],i=Object(o.a)(n,2),c=i[0],u=i[1];if(c<0||c>=r||u<0||u>=s)return[0,0,0,0];var l=A(e,c,u);return[a[l],a[l+1],a[l+2],a[l+3]]};function P(e){var a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"Unexpected falsy value";if(!e)throw new C.AssertionError({message:a,actual:e})}var T,R=function(e,a){var n=e.frames.map((function(n,t){return{data:a(n.data,t,e.frames.length)}}));return{dimensions:e.dimensions,frames:n}},U=function(e,a){for(var n=Object(o.a)(e,2),t=n[0],r=n[1],s=new Uint8Array(t*r*4),i=0;i<r;i+=1)for(var c=0;c<t;c+=1){var u=S(a([c,i])),l=A(e,c,i);s[l]=u[0],s[l+1]=u[1],s[l+2]=u[2],s[l+3]=u[3]}return s},B=function(e){return function(a){var n=a.image,t=a.random,r=a.parameters;return R(n,(function(a,s,i){return U(n.dimensions,(function(c){return e({image:n,dimensions:n.dimensions,random:t,parameters:r,coord:c,frameCount:i,frameIndex:s,getSrcPixel:function(e){return I(n.dimensions,a,e)}})}))}))}},A=function(e,a,n){return 4*(a+n*Object(o.a)(e,1)[0])},E=function(e){var a=A(e.dimensions,e.coord[0],e.coord[1]);e.image[a]=e.color[0],e.image[a+1]=e.color[1],e.image[a+2]=e.color[2],e.image[a+3]=e.color[3]},L=[[255,141,139,255],[254,214,137,255],[136,255,137,255],[135,255,255,255],[139,181,254,255],[215,140,255,255],[255,140,255,255],[255,104,247,255],[254,108,183,255],[255,105,104,255]],D=N({name:"Background Party",params:[],fn:B((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=(0,e.getSrcPixel)(a);if(k(r)){var s=Math.floor(t/n*L.length);return L[s]}return r}))}),F=function(e){var a=e.name,n=e.value,t=e.parse,s=e.onChange,i=r.a.useState(n.toString()),c=Object(o.a)(i,2),u=c[0],l=c[1],m=r.a.useState(""),f=Object(o.a)(m,2),j=f[0],h=f[1];return Object(d.jsxs)("div",{className:"field",children:[Object(d.jsx)("label",{className:"label",children:a}),Object(d.jsx)("div",{className:"control has-icons-left has-icons-right",children:Object(d.jsx)("input",{className:"input",type:"text",defaultValue:n,onChange:function(e){l(e.target.value)},onBlur:function(){if(u!==n.toString()){var e=t(u);e.valid?h(""):h(e.reason),s(e)}}})}),j&&Object(d.jsx)("p",{className:"help is-danger",children:j})]})},q=function(e){return{name:e.name,defaultValue:e.defaultValue,fn:function(a){var n=e.min,t=e.max;return Object(d.jsx)(F,{name:e.name,parse:function(e){var a=parseFloat(e);return isNaN(a)?{valid:!1,reason:"Must be a number"}:void 0!==n&&a<n?{valid:!1,reason:"Must be greater than or equal to ".concat(n)}:void 0!==t&&a>t?{valid:!1,reason:"Must be less than or equal to ".concat(t)}:{valid:!0,value:a}},onChange:a.onChange,value:a.value})}}},z=N({name:"Bounce",params:[q({name:"Bounce Speed",defaultValue:5,min:0})],fn:B((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=e.getSrcPixel,s=e.parameters,i=Object(o.a)(a,2);return r([i[0],i[1]+Math.round(s[0]*Math.sin(t/n*2*Math.PI))])}))}),G=N({name:"Circle",params:[q({name:"Radius",defaultValue:10,min:0})],fn:B((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=e.getSrcPixel,s=e.parameters,i=Object(o.a)(s,1)[0],c=Object(o.a)(a,2),u=c[0],l=c[1];return r([u+Math.round(i*Math.sin(-2*Math.PI*(t/n))),l+Math.round(i*Math.cos(-2*Math.PI*(t/n)))])}))}),H=N({name:"Expand",params:[q({name:"Radius",defaultValue:10,min:0})],fn:B((function(e){var a=e.dimensions,n=e.coord,t=e.frameCount,r=e.frameIndex,s=e.getSrcPixel,i=e.parameters,c=r/t,u=Math.cos(2*c*Math.PI)*i[0],l=Object(o.a)(a,2),m=l[0],d=l[1],f=m/2,j=d/2,h=Object(o.a)(n,2),b=h[0],v=h[1],p=(b-f)/m,g=(v-j)/d;return s([b-Math.floor(u*p),v-Math.round(u*g)])}))}),J=N({name:"Fisheye",params:[q({name:"radius",defaultValue:10,min:0})],fn:B((function(e){var a=e.dimensions,n=e.coord,t=e.frameCount,r=e.frameIndex,s=e.getSrcPixel,i=e.parameters,c=r/t,u=c<.5,l=Object(o.a)(a,2),m=l[0],d=l[1],f=(u?c:1-c)*i[0],j=m/2,h=d/2,b=Object(o.a)(n,2),v=b[0],p=b[1],g=Math.atan2(h-p,j-v);return s([v+Math.round(f*Math.cos(g)),p+Math.round(f*Math.sin(g))])}))}),W=function(e){var a=e.name,n=e.value,t=e.parse,s=e.onChange,i=r.a.useState(n.toString()),c=Object(o.a)(i,2),u=c[0],l=c[1],m=r.a.useState(""),f=Object(o.a)(m,2),j=f[0],h=f[1];return Object(d.jsxs)("div",{className:"field",children:[Object(d.jsx)("label",{className:"label",children:a}),Object(d.jsx)("div",{className:"control has-icons-left has-icons-right",children:Object(d.jsx)("input",{className:"input",type:"text",defaultValue:n,onChange:function(e){l(e.target.value)},onBlur:function(){if(u!==n.toString()){var e=t(u);e.valid?h(""):h(e.reason),s(e)}}})}),j&&Object(d.jsx)("p",{className:"help is-danger",children:j})]})},Y=function(e){return{name:e.name,defaultValue:e.defaultValue,fn:function(a){var n=e.min,t=e.max;return Object(d.jsx)(W,{name:e.name,parse:function(e){var a=parseInt(e,10);return isNaN(a)?{valid:!1,reason:"Must be an integer"}:void 0!==n&&a<n?{valid:!1,reason:"Must be greater than or equal to ".concat(n)}:void 0!==t&&a>t?{valid:!1,reason:"Must be less than or equal to ".concat(t)}:{valid:!0,value:a}},onChange:a.onChange,value:a.value})}}},_=N({name:"Frame Count",params:[Y({name:"Number of Frames",defaultValue:10,min:1})],fn:function(e){var a,n=e.image,t=e.parameters,r=Object(o.a)(t,1)[0],s=n.frames,i=(a=r,Object(h.a)(new Array(a)).map((function(e,a){return a}))).map((function(e){return{data:s[e]?s[e].data:s[s.length-1].data}}));return{dimensions:n.dimensions,frames:i}}}),X=N({name:"Grayscale",params:[],fn:B((function(e){var a=e.coord,n=(0,e.getSrcPixel)(a);if(k(n))return[0,0,0,0];var t=y(n);return[t,t,t,255]}))}),K=n(45),Q=n.n(K),Z=function(e){var a=e.name,n=e.value,t=e.onChange,s=r.a.useState(n),i=Object(o.a)(s,2),c=i[0],u=i[1];return Object(d.jsxs)("div",{children:[Object(d.jsx)("label",{children:a}),Object(d.jsx)("br",{}),Object(d.jsx)("input",{type:"text",value:c,name:a,onChange:function(e){return u(e.target.value)},onBlur:function(){return t({valid:!0,value:n})}})]})},$=[[0,15,40,255],[150,150,175,255],[180,180,205,255],[210,210,235,255]],ee=N({name:"Lightning",params:[(T={name:"Random Seed",defaultValue:"lightning"},{name:T.name,defaultValue:T.defaultValue,fn:function(e){return Object(d.jsx)(Z,{name:T.name,onChange:e.onChange,value:e.value})}})],fn:function(e){var a=e.image,n=e.parameters,t=Q()(n[0]);return R(a,(function(e){var n=t(),r=n<.9?0:n<.95?1:n<.98?2:3;return U(a.dimensions,(function(n){var t=I(a.dimensions,e,n);if(k(t))return $[r];if(r>0){var s=1.02*r;return[t[0]*s,t[1]*s,t[2]*s,t[3]]}return t}))}))}}),ae=[[255,141,139,255],[254,214,137,255],[136,255,137,255],[135,255,255,255],[139,181,254,255],[215,140,255,255],[255,140,255,255],[255,104,247,255],[254,108,183,255],[255,105,104,255]],ne=N({name:"Party",params:[],fn:B((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=(0,e.getSrcPixel)(a);if(k(r))return[0,0,0,0];var s=Math.floor(t/n*ae.length),i=ae[s],c=y(r);return[c*i[0]/255,c*i[1]/255,c*i[2]/255,255]}))}),te=N({name:"Resize",params:[Y({name:"Width",defaultValue:128,min:1}),Y({name:"Height",defaultValue:128,min:1})],fn:function(e){var a=e.image,n=e.parameters,t=Object(o.a)(a.dimensions,2),r=t[0],s=t[1],i=Object(o.a)(n,2),c=i[0],u=i[1],l=r/c,m=s/u,d=[c,u];return{frames:a.frames.map((function(e){for(var n=new Uint8Array(c*u*4),t=0;t<u;t+=1)for(var r=0;r<c;r+=1){var s=Math.floor(r*l),i=Math.floor(t*m),o=I(a.dimensions,e.data,[s,i]);E({color:o,coord:[r,t],dimensions:d,image:n})}return{data:n}})),dimensions:[c,u]}}}),re=N({name:"Resize Background",params:[Y({name:"Width",defaultValue:128,min:0}),Y({name:"Height",defaultValue:128,min:0})],fn:function(e){var a=e.image,n=e.parameters,t=Object(o.a)(a.dimensions,2),r=t[0],s=t[1],i=Object(o.a)(n,2),c=i[0],u=i[1];P(c>=r,"New width for resize-background needs to be greater than or equal to the original"),P(u>=s,"New height for resize-background needs to be greater than or equal to the original");var l=[c,u],m=(c-r)/2,d=(u-s)/2;return{frames:a.frames.map((function(e){for(var n=new Uint8Array(c*u*4),t=0;t<u;t+=1)for(var r=0;r<c;r+=1){var s=r>m&&r<c-m&&t>d&&t<u-d?I(a.dimensions,e.data,[r-m,t-d]):[0,0,0,0];E({color:s,coord:[r,t],dimensions:l,image:n})}return{data:n}})),dimensions:l}}}),se=N({name:"Ripple",params:[q({name:"Amplitude",defaultValue:10}),q({name:"Period",defaultValue:2,min:0})],fn:function(e){var a=e.image,n=e.parameters;return R(a,(function(e,t,r){var s=Object(o.a)(n,2),i=s[0],c=s[1],u=a.dimensions[1],l=t/r*2*Math.PI;return U(a.dimensions,(function(n){var t=Object(o.a)(n,2),r=t[0],s=t[1],m=Math.round(i*Math.sin(s/u*c*Math.PI+l));return I(a.dimensions,e,[r+m,s])}))}))}}),ie=function(e){var a=e.name,n=e.options,t=e.value,r=e.onChange;return Object(d.jsxs)("div",{children:[Object(d.jsx)("label",{children:a}),Object(d.jsx)("br",{}),Object(d.jsx)(p,{onChange:function(e){return r({valid:!0,value:e})},selected:t,options:n})]})};var ce=N({name:"Rotate",params:[function(e){return{name:e.name,defaultValue:e.defaultValue,fn:function(a){return Object(d.jsx)(ie,{name:e.name,value:a.value,options:e.options,onChange:a.onChange})}}}({name:"Direction",defaultValue:-1,options:[{name:"Clockwise",value:-1},{name:"Counter-Clockwise",value:1}]})],fn:B((function(e){var a=e.dimensions,n=e.coord,t=e.frameCount,r=e.frameIndex,s=e.getSrcPixel,i=e.parameters,c=Object(o.a)(i,1)[0],u=a[0]/2,l=a[1]/2,m=Object(o.a)(n,2),d=m[0]-u,f=m[1]-l,j=r/t*(c||1),h=Math.cos(2*Math.PI*j),b=Math.sin(2*Math.PI*j);return s([Math.round(u+d*h-f*b),Math.round(l+f*h+d*b)])}))}),oe=N({name:"Roxbury",params:[],fn:function(e){var a=e.image;return R(a,(function(e,n,t){var r=n/t,s=Math.floor(4*r),i=4*(r-s/4),c=Math.PI/2*.2,u=0===s?0:1===s?i*c:2===s?c:(1-i)*c,l=Math.cos(1.35*-u),m=Math.sin(1.35*-u),d=.25*a.dimensions[0],f=.7*a.dimensions[1];return U(a.dimensions,(function(n){var t=Object(o.a)(n,2),r=t[0],s=t[1],i=Math.floor(r-d+8*Math.sin(u)),c=Math.floor(s-f+8*Math.cos(u)),j=[Math.round(d+i*l-c*m),Math.round(f+c*l+i*m)];return I(a.dimensions,e,j)}))}))}}),ue=N({name:"Shake",params:[q({name:"Shake Speed",defaultValue:10,min:0})],fn:B((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=e.getSrcPixel,s=e.parameters,i=Object(o.a)(s,1)[0],c=Object(o.a)(a,2),u=c[0],l=c[1];return r([u+Math.round(i*Math.cos(t/n*2*Math.PI)),l])}))}),le=n(112),me=function(e){var a=e.color;return Object(d.jsx)("div",{style:{width:"1.5em",height:"1.5em",backgroundColor:M(a)}})},de=function(e){var a=e.name,n=e.value,t=e.onChange;return Object(d.jsx)(g,{mainEle:Object(d.jsxs)("div",{className:"columns",children:[Object(d.jsx)("label",{className:"label column is-four-fifths",children:a}),Object(d.jsx)("span",{className:"column",children:Object(d.jsx)(me,{color:n})})]}),children:Object(d.jsx)(le.a,{disableAlpha:!0,presetColors:[],color:M(n),onChangeComplete:function(e){return t({valid:!0,value:V(e.hex)})}})})};function fe(e){return{name:e.name,defaultValue:e.defaultValue,fn:function(a){return Object(d.jsx)(de,{name:e.name,value:a.value,onChange:a.onChange})}}}var je=[_,D,z,G,H,J,X,ee,ne,te,re,se,ce,oe,ue,N({name:"Solid Background",params:[fe({name:"Background Color",defaultValue:V("#000000")})],fn:B((function(e){var a=e.coord,n=e.getSrcPixel,t=e.parameters,r=Object(o.a)(t,1)[0],s=n(a);return k(s)?r:s}))}),N({name:"Static",params:[q({name:"Strength",defaultValue:10,min:0})],fn:B((function(e){var a=e.coord,n=e.getSrcPixel,t=e.parameters,r=e.random,s=Object(o.a)(t,1)[0],i=n(a);return k(i)?[0,0,0,0]:Math.ceil(r()*s)>1?[255-i[0],255-i[1],255-i[2],i[3]]:i}))}),N({name:"Transparent Color",params:[fe({name:"Transparent Color",defaultValue:V("#000000")}),Y({name:"Tolerance",defaultValue:10,min:0,max:100})],fn:B((function(e){var a=e.coord,n=e.getSrcPixel,t=e.parameters,r=Object(o.a)(t,2),s=r[0],i=r[1],c=n(a),u=c[0]-s[0],l=c[1]-s[1],m=c[2]-s[2];return Math.sqrt(u*u+l*l+m*m)/255*100<=i?[c[0],c[1],c[2],0]:c}))}),N({name:"Transpose",params:[Y({name:"X",defaultValue:0}),Y({name:"Y",defaultValue:0})],fn:B((function(e){var a=e.coord,n=e.getSrcPixel,t=e.parameters,r=Object(o.a)(t,2),s=r[0],i=r[1],c=Object(o.a)(a,2);return n([c[0]+s,c[1]+i])}))})],he=n(110),be=n.n(he),ve=n(111),pe=n.n(ve),ge=function(){var e=Object(m.a)(l.a.mark((function e(a,n,t){var r,s,i;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=Q()(a),e.next=3,Ne(a);case 3:return s=e.sent,i=[],n.reduce((function(e,a){var n=a.transform.fn({image:e,parameters:a.params,random:r});return i.push(n),n}),s),e.next=8,Promise.all(i.map(function(){var e=Object(m.a)(l.a.mark((function e(a){var n,s;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=Ce(a,r),s=Oe(a.frames.map((function(e){return e.data})),n),e.next=4,xe(a.dimensions,s,n,t);case 4:return e.abrupt("return",e.sent);case 5:case"end":return e.stop()}}),e)})));return function(a){return e.apply(this,arguments)}}()));case 8:return e.abrupt("return",e.sent);case 9:case"end":return e.stop()}}),e)})));return function(a,n,t){return e.apply(this,arguments)}}(),Oe=function(e,a){return e.map((function(e){for(var n=new Uint8Array(e.length),t=0;t<e.length;t+=4)a&&e[t+3]<128?(n[t]=a[0],n[t+1]=a[1],n[t+2]=a[2],n[t+3]=a[3]):(n[t]=e[t],n[t+1]=e[t+1],n[t+2]=e[t+2],n[t+3]=255);return n}))},xe=function(){var e=Object(m.a)(l.a.mark((function e(a,n,t,r){return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e){var s=Object(o.a)(a,2),i=s[0],c=s[1],u=new pe.a(i,c);u.setFrameRate(r),u.setRepeat(0),t&&u.setTransparent(M(t)),u.writeHeader();var l=[];u.on("data",(function(e){l.push(e)})),u.on("end",(function(){var a=URL.createObjectURL(new Blob(l,{type:"image/gif"}));e(a)})),n.forEach((function(e){u.addFrame(e)})),u.finish()})));case 1:case"end":return e.stop()}}),e)})));return function(a,n,t,r){return e.apply(this,arguments)}}(),Ne=function(e){return new Promise((function(a,n){return be()(e,(function(e,t){return e?n(e):a({frames:[{data:Uint8Array.from(t.data)}],dimensions:[t.shape[0],t.shape[1]]})}))}))},Ce=function(e,a){var n=!1,t=new Set,r=Object(o.a)(e.dimensions,2),s=r[0],i=r[1],c=M([0,255,0,255]);return e.frames.forEach((function(r){for(var o=0;o<i;o+=1)for(var u=0;u<s;u+=1){var l=I(e.dimensions,r.data,[u,o]);if(k(l))n=!0;else{var m=M(l);t.add(m),m===c&&(c=Me(a,t))}}})),n?V(c):void 0},Me=function e(a,n){var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,r=M(w(a));return t>2e3?r:n.has(r)?e(a,n,t+1):r},Ve=Y({name:"Frames per Second",defaultValue:20,min:0}),ke=function(e){var a=e.isDirty,n=e.computeDisabled,t=e.baseImageUrl,s=e.transforms,i=e.onComputed,c=r.a.useState({loading:!1,results:[]}),u=Object(o.a)(c,2),f=u[0],j=u[1],h=r.a.useState(!1),b=Object(o.a)(h,2),p=b[0],g=b[1],O=r.a.useState(20),x=Object(o.a)(O,2),N=x[0],C=x[1],M=n&&!p;return Object(d.jsxs)("div",{className:"box",children:[Object(d.jsx)("h3",{className:"title",children:"Create Gif"}),Object(d.jsx)("div",{className:"block",children:Ve.fn({value:N,onChange:function(e){e.valid&&(C(e.value),g(!0))}})}),Object(d.jsx)("div",{className:"block",children:Object(d.jsxs)("button",{className:v()("button","block",{"is-loading":f.loading}),disabled:M,onClick:Object(m.a)(l.a.mark((function e(){var a;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:a=s.map((function(e){return{transform:e.transform,params:e.paramsValues.map((function(e){return P(e.valid),e.value}))}})),j({loading:!0}),setTimeout(Object(m.a)(l.a.mark((function e(){var n;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return P(t,"No source image, this button should be disabled!"),e.next=3,ge(t,a,N);case 3:n=e.sent,j({loading:!1,results:n}),g(!1),i();case 7:case"end":return e.stop()}}),e)}))));case 3:case"end":return e.stop()}}),e)}))),children:[Object(d.jsx)("span",{children:"Compute"})," ",(a||p)&&Object(d.jsx)("span",{className:"icon is-small",children:Object(d.jsx)("i",{className:"fas fa-exclamation-circle","aria-hidden":"true"})})]})}),Object(d.jsx)("div",{className:"block",children:Object(d.jsx)("div",{className:"columns",children:!f.loading&&f.results.map((function(e,a){return Object(d.jsxs)("div",{className:"column",children:[Object(d.jsx)("div",{children:s[a].transform.name}),Object(d.jsx)("img",{src:e,alt:"gif-".concat(s[a].transform.name)})]})}))})})]})},we=function(){var e=r.a.useState({dirty:!1,transforms:[],baseImage:void 0}),a=Object(o.a)(e,2),n=a[0],t=a[1],s=!n.baseImage||0===n.transforms.length||!n.dirty||n.transforms.some((function(e){return e.transform.params.length>0&&e.paramsValues.every((function(e,a){return!1===e.valid}))}));return Object(d.jsx)("section",{children:Object(d.jsxs)("div",{className:"container",children:[Object(d.jsx)("h1",{className:"title",style:{paddingTop:"16px"},children:"Partymoji"}),Object(d.jsxs)("div",{children:[Object(d.jsx)(f,{currentImageUrl:n.baseImage,onChange:function(e){t(Object(c.a)(Object(c.a)({},n),{},{baseImage:e,dirty:!0}))}}),Object(d.jsx)(x,{currentTransforms:n.transforms,possibleTransforms:je,onTransformsChange:function(e){return t(Object(c.a)(Object(c.a)({},n),{},{dirty:!0,transforms:e}))}}),Object(d.jsx)(ke,{isDirty:n.dirty,baseImageUrl:n.baseImage,computeDisabled:s,transforms:n.transforms,onComputed:function(){return t(Object(c.a)(Object(c.a)({},n),{},{dirty:!1}))}}),false,Object(d.jsx)("a",{href:"https://github.com/MikeyBurkman/partymoji",target:"_blank",rel:"noreferrer",children:Object(d.jsx)("img",{src:"https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",width:64,height:64,alt:"Github Link"})})]})]})})};i.a.render(Object(d.jsx)(r.a.StrictMode,{children:Object(d.jsx)(we,{})}),document.getElementById("root"))}},[[269,1,2]]]);
//# sourceMappingURL=main.c2283a0d.chunk.js.map