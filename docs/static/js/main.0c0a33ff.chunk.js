(this.webpackJsonppartymoji=this.webpackJsonppartymoji||[]).push([[0],{230:function(e,a){},232:function(e,a){},245:function(e,a){},256:function(e,a){},371:function(e,a,n){"use strict";n.r(a);var t=n(0),r=n.n(t),i=n(50),o=n.n(i),c=n(26),s=n(5),u=n(433),l=n(448),d=n(416),m=n(423),f=n(437),j=n(439),h=function(e){return{name:e.name,params:e.params,description:e.description,fn:e.fn}},p=n(16),v=n(128),b=function(e){var a=Object(s.a)(e,3),n=a[0],t=a[1],r=a[2],i=function(e){var a=e.toString(16).toUpperCase();return 2===a.length?a:"0"+a};return"#".concat(i(n)).concat(i(t)).concat(i(r))},g=function(e){return[parseInt(e.toUpperCase().substr(1,2),16),parseInt(e.toUpperCase().substr(3,2),16),parseInt(e.toUpperCase().substr(5,2),16),255]},O=function(e){return e[3]<64},x=function(e){return[Math.floor(256*e.int32()),Math.floor(256*e.int32()),Math.floor(256*e.int32()),255]},C=function(e){var a=Object(s.a)(e,3),n=a[0],t=a[1],r=a[2];return Math.round((n+t+r)/3)},w=function(e){var a=Object(s.a)(e,4),n=a[0],t=a[1],r=a[2],i=a[3],o=function(e){return Math.max(Math.min(e,255),0)};return[o(n),o(t),o(r),o(i)]},M=function(e,a,n){var t=Object(s.a)(e,2),r=t[0],i=t[1],o=Object(s.a)(n,2),c=o[0],u=o[1];if(c<0||c>=r||u<0||u>=i)return[0,0,0,0];var l=P(e,c,u);return[a[l],a[l+1],a[l+2],a[l+3]]};function V(e){var a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"Unexpected falsy value";if(!e)throw new v.AssertionError({message:a,actual:e})}var y=function(e,a){var n=e.frames.map((function(n,t){return{data:a(n.data,t,e.frames.length)}}));return{dimensions:e.dimensions,frames:n}},S=function(e,a){for(var n=Object(s.a)(e,2),t=n[0],r=n[1],i=new Uint8Array(t*r*4),o=0;o<r;o+=1)for(var c=0;c<t;c+=1){var u=w(a([c,o])),l=P(e,c,o);i[l]=u[0],i[l+1]=u[1],i[l+2]=u[2],i[l+3]=u[3]}return i},F=function(e){return function(a){var n=a.image,t=a.random,r=a.parameters;return y(n,(function(a,i,o){return S(n.dimensions,(function(c){return e({image:n,dimensions:n.dimensions,random:t,parameters:r,coord:c,frameCount:o,frameIndex:i,getSrcPixel:function(e){return M(n.dimensions,a,e)}})}))}))}},I=function(e){return Object(p.a)(new Array(e)).map((function(e,a){return a}))},P=function(e,a,n){return 4*(a+n*Object(s.a)(e,1)[0])},k=function(e){var a=P(e.dimensions,e.coord[0],e.coord[1]);e.image[a]=e.color[0],e.image[a+1]=e.color[1],e.image[a+2]=e.color[2],e.image[a+3]=e.color[3]},T=function(e){var a=e.image,n=e.newWidth,t=e.newHeight,r=Object(s.a)(a.dimensions,2),i=r[0],o=r[1],c=i/n,u=o/t,l=[n,t];return{frames:a.frames.map((function(e){for(var r=new Uint8Array(n*t*4),i=0;i<t;i+=1)for(var o=0;o<n;o+=1){var s=Math.floor(o*c),d=Math.floor(i*u),m=M(a.dimensions,e.data,[s,d]);k({color:m,coord:[o,i],dimensions:l,image:r})}return{data:r}})),dimensions:[n,t]}},N=[[255,141,139,255],[254,214,137,255],[136,255,137,255],[135,255,255,255],[139,181,254,255],[215,140,255,255],[255,140,255,255],[255,104,247,255],[254,108,183,255],[255,105,104,255]],U=h({name:"Background Party",description:"Transparent pixels will flash bright party colors",params:[],fn:F((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=(0,e.getSrcPixel)(a);if(O(r)){var i=Math.floor(t/n*N.length);return N[i]}return r}))}),B=n(434),R=n(438),A=n(430),H=n(425),q=n(431),E=n(1),D=function(e){var a=e.name,n=e.options,t=e.value,r=e.description,i=e.onChange;return Object(E.jsxs)(d.a,{spacing:1,children:[Object(E.jsxs)(d.a,{direction:"row",spacing:1,children:[Object(E.jsx)(f.a,{variant:"body2",children:a}),r&&Object(E.jsx)(B.a,{title:r,children:Object(E.jsx)(R.a,{fontSize:"small",children:"help"})})]}),Object(E.jsx)(A.a,{children:Object(E.jsx)(H.a,{autoWidth:!0,value:t,onChange:function(e){return i({valid:!0,value:e.target.value})},children:n.map((function(e){return Object(E.jsx)(q.a,{value:e.value,children:e.name},e.value)}))})})]})};function W(e){return{name:e.name,defaultValue:e.defaultValue?{valid:!0,value:e.defaultValue}:{valid:!1},fn:function(a){return Object(E.jsx)(D,{name:e.name,value:a.value.valid?a.value.value:void 0,options:e.options,description:e.description,onChange:a.onChange})}}}var _=n(18),z=n.n(_),L=n(28),G=n(178),J=n.n(G),X=n(179),Y=n.n(X),K=n(95),Q=n.n(K),Z=function(){var e=Object(L.a)(z.a.mark((function e(a,n,t){var r,i,o;return z.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=Q()(a),e.next=3,ae(a);case 3:return i=e.sent,o=[],n.reduce((function(e,a){var n=a.transform.fn({image:e,parameters:a.params,random:r});return o.push(n),n}),i),e.next=8,Promise.all(o.map(function(){var e=Object(L.a)(z.a.mark((function e(a){var n,i;return z.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=ne(a,r),i=$(a.frames.map((function(e){return e.data})),n),e.next=4,ee(a.dimensions,i,n,t);case 4:return e.abrupt("return",e.sent);case 5:case"end":return e.stop()}}),e)})));return function(a){return e.apply(this,arguments)}}()));case 8:return e.abrupt("return",e.sent);case 9:case"end":return e.stop()}}),e)})));return function(a,n,t){return e.apply(this,arguments)}}(),$=function(e,a){return e.map((function(e){for(var n=new Uint8Array(e.length),t=0;t<e.length;t+=4)a&&e[t+3]<128?(n[t]=a[0],n[t+1]=a[1],n[t+2]=a[2],n[t+3]=a[3]):(n[t]=e[t],n[t+1]=e[t+1],n[t+2]=e[t+2],n[t+3]=255);return n}))},ee=function(){var e=Object(L.a)(z.a.mark((function e(a,n,t,r){return z.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e){var i=Object(s.a)(a,2),o=i[0],c=i[1],u=new Y.a(o,c);if(u.setFrameRate(r),u.setRepeat(0),t){var l=b(t).slice(1);u.setTransparent("0x".concat(l))}u.writeHeader();var d=[];u.on("data",(function(e){d.push(e)})),u.on("end",(function(){var a=URL.createObjectURL(new Blob(d,{type:"image/gif"}));e(a)})),n.forEach((function(e){u.addFrame(e)})),u.finish()})));case 1:case"end":return e.stop()}}),e)})));return function(a,n,t,r){return e.apply(this,arguments)}}(),ae=function(e){return new Promise((function(a,n){return J()(e,(function(e,t){return e?n(e):a({frames:[{data:Uint8Array.from(t.data)}],dimensions:[t.shape[0],t.shape[1]]})}))}))},ne=function(e,a){var n=!1,t=new Set,r=Object(s.a)(e.dimensions,2),i=r[0],o=r[1],c=b([0,255,0,255]);return e.frames.forEach((function(r){for(var s=0;s<o;s+=1)for(var u=0;u<i;u+=1){var l=M(e.dimensions,r.data,[u,s]);if(O(l))n=!0;else{var d=b(l);t.add(d),d===c&&(c=te(a,t))}}})),n?g(c):void 0},te=function e(a,n){var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,r=b(x(a));return t>2e3?r:n.has(r)?e(a,n,t+1):r},re=n(442),ie=function(e){var a=e.currentImageUrl,n=e.name,t=e.width,r=e.height,i=e.onChange;return Object(E.jsxs)(d.a,{maxWidth:300,children:[Object(E.jsxs)(re.a,{startIcon:Object(E.jsx)(R.a,{children:"image"}),variant:"contained",component:"label",children:[n,Object(E.jsx)("input",{type:"file",hidden:!0,accept:"image/png,image/jpg",name:"source-png",onChange:function(){var e=Object(L.a)(z.a.mark((function e(a){var n,t,r,o;return z.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=Array.from(null!==(n=a.target.files)&&void 0!==n?n:[]),r=t[0],e.next=4,oe(r);case 4:o=e.sent,i(o);case 6:case"end":return e.stop()}}),e)})));return function(a){return e.apply(this,arguments)}}()})]}),a&&Object(E.jsx)("img",{width:t,height:r,src:a,alt:"Source"})]})},oe=function(e){return new Promise((function(a){var n=new FileReader;n.onload=function(){return a(n.result)},n.readAsDataURL(e)}))};var ce,se=h({name:"Background Image",description:"Select another image to be used as a background or foreground",params:[function(e){var a=e.name;return{name:a,defaultValue:{valid:!1},fn:function(e){return Object(E.jsx)(ie,{currentImageUrl:e.value.valid?e.value.value.dataUrl:void 0,name:a,width:64,height:64,onChange:function(){var a=Object(L.a)(z.a.mark((function a(n){var t;return z.a.wrap((function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,ae(n);case 2:t=a.sent,e.onChange({valid:!0,value:{dataUrl:n,image:t}});case 4:case"end":return a.stop()}}),a)})));return function(e){return a.apply(this,arguments)}}()})}}}({name:"Image"}),W({name:"Type",defaultValue:"background",options:[{name:"Background",value:"background"},{name:"Foreground",value:"foreground"}]})],fn:function(e){var a=e.image,n=e.parameters,t=T({image:n[0].image,newWidth:a.dimensions[0],newHeight:a.dimensions[1]}),r=n[1];return y(a,(function(e){return S(a.dimensions,(function(n){var i=M(a.dimensions,e,n),o=M(t.dimensions,t.frames[0].data,n);return"background"===r?O(i)?o:i:O(o)?i:o}))}))}}),ue=n(428),le=n(443),de=function(e){var a=e.name,n=e.value,t=e.description,i=e.parse,o=e.onChange,c=r.a.useState(void 0===n?void 0:n.toString()),u=Object(s.a)(c,2),l=u[0],m=u[1],j=r.a.useState(""),h=Object(s.a)(j,2),p=h[0],v=h[1];return Object(E.jsxs)(d.a,{spacing:1,children:[Object(E.jsxs)(d.a,{direction:"row",spacing:1,children:[Object(E.jsx)(f.a,{variant:"body2",children:a}),t&&Object(E.jsx)(B.a,{title:t,children:Object(E.jsx)(R.a,{fontSize:"small",children:"help"})})]}),Object(E.jsxs)(A.a,{children:[Object(E.jsx)(ue.a,{error:!!p,defaultValue:n,onBlur:function(){if(void 0!==l&&(!n||l!==n.toString())){var e=i(l);e.valid?v(""):v(e.reason),o(e)}},onChange:function(e){m(e.target.value)}}),p&&Object(E.jsx)(le.a,{children:p})]})]})},me=function(e){return{name:e.name,defaultValue:void 0!==e.defaultValue?{valid:!0,value:e.defaultValue}:{valid:!1},fn:function(a){var n=e.min,t=e.max;return Object(E.jsx)(de,{name:e.name,description:e.description,parse:function(e){var a=parseFloat(e);return isNaN(a)?{valid:!1,reason:"Must be a number"}:void 0!==n&&a<n?{valid:!1,reason:"Must be greater than or equal to ".concat(n)}:void 0!==t&&a>t?{valid:!1,reason:"Must be less than or equal to ".concat(t)}:{valid:!0,value:a}},onChange:a.onChange,value:a.value.valid?a.value.value:void 0})}}},fe=h({name:"Bounce",description:"Make the image bounce up and down",params:[me({name:"Bounce Speed",defaultValue:5,min:0})],fn:F((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=e.getSrcPixel,i=e.parameters,o=Object(s.a)(a,2);return r([o[0],o[1]+Math.round(i[0]*Math.sin(t/n*2*Math.PI))])}))}),je=function(e){var a=e.name,n=e.value,t=e.description,i=e.parse,o=e.onChange,c=r.a.useState(void 0===n?void 0:n.toString()),u=Object(s.a)(c,2),l=u[0],m=u[1],j=r.a.useState(""),h=Object(s.a)(j,2),p=h[0],v=h[1];return Object(E.jsxs)(d.a,{spacing:1,children:[Object(E.jsxs)(d.a,{direction:"row",spacing:1,children:[Object(E.jsx)(f.a,{variant:"body2",children:a}),t&&Object(E.jsx)(B.a,{title:t,children:Object(E.jsx)(R.a,{fontSize:"small",children:"help"})})]}),Object(E.jsxs)(A.a,{children:[Object(E.jsx)(ue.a,{error:!!p,defaultValue:n,onBlur:function(){if(void 0!==l&&(!n||l!==n.toString())){var e=i(l);e.valid?v(""):v(e.reason),o(e)}},onChange:function(e){m(e.target.value)}}),p&&Object(E.jsx)(le.a,{children:p})]})]})},he=function(e){return{name:e.name,defaultValue:void 0!==e.defaultValue?{valid:!0,value:e.defaultValue}:{valid:!1},fn:function(a){var n=e.min,t=e.max;return Object(E.jsx)(je,{name:e.name,description:e.description,parse:function(e){var a=parseInt(e,10);return isNaN(a)?{valid:!1,reason:"Must be an integer"}:void 0!==n&&a<n?{valid:!1,reason:"Must be greater than or equal to ".concat(n)}:void 0!==t&&a>t?{valid:!1,reason:"Must be less than or equal to ".concat(t)}:{valid:!0,value:a}},onChange:a.onChange,value:a.value.valid?a.value.value:void 0})}}},pe=h({name:"Brightness",description:"Increase or decrease the brightness of the image",params:[he({name:"Amount",defaultValue:0,min:-100,max:100})],fn:F((function(e){var a=e.coord,n=e.getSrcPixel,t=e.parameters,r=Object(s.a)(t,1)[0]/100*255,i=n(a);return w([i[0]+r,i[1]+r,i[2]+r,i[3]])}))}),ve=h({name:"Circle",params:[me({name:"Radius",defaultValue:10,min:0})],fn:F((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=e.getSrcPixel,i=e.parameters,o=Object(s.a)(i,1)[0],c=Object(s.a)(a,2),u=c[0],l=c[1];return r([u+Math.round(o*Math.sin(-2*Math.PI*(t/n))),l+Math.round(o*Math.cos(-2*Math.PI*(t/n)))])}))}),be=h({name:"Expand",params:[me({name:"Radius",defaultValue:10,min:0})],fn:F((function(e){var a=e.dimensions,n=e.coord,t=e.frameCount,r=e.frameIndex,i=e.getSrcPixel,o=e.parameters,c=r/t,u=Math.cos(2*c*Math.PI)*o[0],l=Object(s.a)(a,2),d=l[0],m=l[1],f=d/2,j=m/2,h=Object(s.a)(n,2),p=h[0],v=h[1],b=(p-f)/d,g=(v-j)/m;return i([p-Math.floor(u*b),v-Math.round(u*g)])}))}),ge=h({name:"Fisheye",params:[me({name:"radius",defaultValue:10,min:0})],fn:F((function(e){var a=e.dimensions,n=e.coord,t=e.frameCount,r=e.frameIndex,i=e.getSrcPixel,o=e.parameters,c=r/t,u=c<.5,l=Object(s.a)(a,2),d=l[0],m=l[1],f=(u?c:1-c)*o[0],j=d/2,h=m/2,p=Object(s.a)(n,2),v=p[0],b=p[1],g=Math.atan2(h-b,j-v);return i([v+Math.round(f*Math.cos(g)),b+Math.round(f*Math.sin(g))])}))}),Oe=h({name:"Frame Count",description:"Set how many frames of animation there will be. This is required for all animation transforms",params:[he({name:"Number of Frames",defaultValue:10,min:1})],fn:function(e){var a=e.image,n=e.parameters,t=Object(s.a)(n,1)[0],r=a.frames,i=I(t).map((function(e){return{data:r[e]?r[e].data:r[r.length-1].data}}));return{dimensions:a.dimensions,frames:i}}}),xe=h({name:"Grayscale",params:[],fn:F((function(e){var a=e.coord,n=(0,e.getSrcPixel)(a);if(O(n))return[0,0,0,0];var t=C(n);return[t,t,t,255]}))}),Ce=n(64),we=h({name:"Hue Party",description:"Shift the hue by some amount",params:[],fn:F((function(e){var a=e.coord,n=e.getSrcPixel,t=e.frameCount,r=e.frameIndex/t*255,i=n(a),o=Object(s.a)(i,4),c=o[0],u=o[1],l=o[2],d=o[3],m=Ce.rgb.hsl(c,u,l),f=Object(s.a)(m,3),j=f[0],h=f[1],p=f[2],v=(j+r)%255,b=Ce.hsl.rgb([v,h,p]),g=Object(s.a)(b,3);return[g[0],g[1],g[2],d]}))}),Me=h({name:"Hue Shift",description:"Shift the hue by some amount",params:[he({name:"Amount",defaultValue:0,min:0,max:100})],fn:F((function(e){var a=e.coord,n=e.getSrcPixel,t=e.parameters,r=Object(s.a)(t,1)[0]/100*255,i=n(a),o=Object(s.a)(i,4),c=o[0],u=o[1],l=o[2],d=o[3],m=Ce.rgb.hsl(c,u,l),f=Object(s.a)(m,3),j=f[0],h=f[1],p=f[2],v=(j+r)%255,b=Ce.hsl.rgb([v,h,p]),g=Object(s.a)(b,3);return[g[0],g[1],g[2],d]}))}),Ve=function(e){var a=e.name,n=e.value,t=e.description,i=e.onChange,o=r.a.useState(n),c=Object(s.a)(o,2),u=c[0],l=c[1];return Object(E.jsxs)(d.a,{spacing:1,children:[Object(E.jsxs)(d.a,{direction:"row",spacing:1,children:[Object(E.jsx)(f.a,{variant:"body2",children:a}),t&&Object(E.jsx)(B.a,{title:t,children:Object(E.jsx)(R.a,{fontSize:"small",children:"help"})})]}),Object(E.jsx)(A.a,{children:Object(E.jsx)(ue.a,{defaultValue:n,onChange:function(e){return l(e.target.value)},onBlur:function(){return i(u?{valid:!0,value:u}:{valid:!1})}})})]})},ye=[[0,15,40,255],[150,150,175,255],[180,180,205,255],[210,210,235,255]],Se=h({name:"Lightning",params:[(ce={name:"Random Seed",defaultValue:"lightning"},{name:ce.name,defaultValue:void 0!==ce.defaultValue?{valid:!0,value:ce.defaultValue}:{valid:!1},fn:function(e){return Object(E.jsx)(Ve,{name:ce.name,description:ce.description,onChange:e.onChange,value:e.value.valid?e.value.value:void 0})}})],fn:function(e){var a=e.image,n=e.parameters,t=Q()(n[0]);return y(a,(function(e){var n=t(),r=n<.9?0:n<.95?1:n<.98?2:3;return S(a.dimensions,(function(n){var t=M(a.dimensions,e,n);if(O(t))return ye[r];if(r>0){var i=1.02*r;return[t[0]*i,t[1]*i,t[2]*i,t[3]]}return t}))}))}}),Fe=[[255,141,139,255],[254,214,137,255],[136,255,137,255],[135,255,255,255],[139,181,254,255],[215,140,255,255],[255,140,255,255],[255,104,247,255],[254,108,183,255],[255,105,104,255]],Ie=h({name:"Party",params:[],fn:F((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=(0,e.getSrcPixel)(a);if(O(r))return[0,0,0,0];var i=Math.floor(t/n*Fe.length),o=Fe[i],c=C(r);return[c*o[0]/255,c*o[1]/255,c*o[2]/255,255]}))}),Pe=n(184),ke=n(422),Te=n(444),Ne=n(445),Ue=function(e){var a=e.mainEle,n=e.children,t=r.a.useState(!0),i=Object(s.a)(t,2),o=i[0],c=i[1];return Object(E.jsx)(ke.a,{onClickAway:function(){return c(!0)},children:Object(E.jsxs)(Te.a,{children:[Object(E.jsx)(re.a,{onClick:function(){return c(!o)},style:{textTransform:"none"},children:Object(E.jsxs)(d.a,{direction:"row",spacing:4,children:[Object(E.jsx)("div",{children:a}),Object(E.jsx)(R.a,{children:o?"expand_less":"expand_more"})]})}),Object(E.jsx)(Ne.a,{in:!o,children:n})]})})},Be=function(e){var a=e.color;return Object(E.jsx)("div",{style:{width:"1.5em",height:"1.5em",backgroundColor:b(a)}})},Re=function(e){var a=e.name,n=e.value,t=e.description,r=e.onChange;return Object(E.jsx)(Ue,{mainEle:Object(E.jsxs)(d.a,{direction:"row",spacing:4,children:[Object(E.jsx)(f.a,{variant:"body2",children:a}),t&&Object(E.jsx)(B.a,{title:t,children:Object(E.jsx)(R.a,{children:"help"})}),n&&Object(E.jsx)(Be,{color:n})]}),children:Object(E.jsx)(Pe.a,{disableAlpha:!0,presetColors:[],color:n?b(n):void 0,onChangeComplete:function(e){return r({valid:!0,value:g(e.hex)})}})})};function Ae(e){return{name:e.name,defaultValue:e.defaultValue?{valid:!0,value:e.defaultValue}:{valid:!1},fn:function(a){return Object(E.jsx)(Re,{name:e.name,value:a.value.valid?a.value.value:void 0,onChange:a.onChange})}}}var He=n(446),qe=function(e){var a=e.name,n=e.newParamText,t=e.createNewParam,i=e.value,o=e.description,c=e.onChange,u=r.a.useState(void 0===i?[]:i.map((function(e,a){return{param:t(),pValue:e}}))),l=Object(s.a)(u,2),m=l[0],h=l[1];return Object(E.jsx)(j.a,{children:Object(E.jsxs)(d.a,{spacing:1,children:[Object(E.jsxs)(d.a,{direction:"row",spacing:1,children:[Object(E.jsx)(f.a,{variant:"body2",children:a}),o&&Object(E.jsx)(B.a,{title:o,children:Object(E.jsx)(R.a,{children:"help"})})]}),m.map((function(e,n){var t=e.param,r=e.pValue,i=t.fn({value:{valid:!0,value:r},onChange:function(e){if(e.valid){var a=m.map((function(a,r){return n===r?{param:t,pValue:e.value}:a}));h(a),c({valid:!0,value:a.map((function(e){return e.pValue}))})}}});return Object(E.jsxs)(d.a,{direction:"row",children:[Object(E.jsx)(He.a,{onClick:function(){var e=m.filter((function(e,a){return a!==n}));h(e),c({valid:!0,value:e.map((function(e){return e.pValue}))})},children:Object(E.jsx)(R.a,{children:"delete"})}),i]},"".concat(a,"-").concat(n))})),Object(E.jsx)(re.a,{variant:"contained",onClick:function(){var e=t(),a=[].concat(Object(p.a)(m),[{param:e,pValue:e.defaultValue.valid?e.defaultValue.value:void 0}]);h(a),e.defaultValue.valid&&c({valid:!0,value:a.map((function(e){return e.pValue}))})},children:n})]})})};function Ee(e){return{name:e.name,defaultValue:e.defaultValue?{valid:!0,value:e.defaultValue}:{valid:!1},fn:function(a){return Object(E.jsx)(qe,{name:e.name,newParamText:e.newParamText,value:a.value.valid?a.value.value:void 0,createNewParam:e.createNewParam,description:e.description,onChange:a.onChange})}}}var De=["#FF0000","#FF9600","#FFFF00","#00FF00","#00FF96","#00FFFF","#0000FF","#B400FF"].map(g),We=h({name:"Pinwheel",description:"Create a pinwheel of colors",params:[he({name:"Offset X",defaultValue:0}),he({name:"Offset Y",defaultValue:40}),he({name:"Group Count",defaultValue:1,min:1}),Ee({name:"Colors",newParamText:"New Color",description:"Colors for the pinwheel",defaultValue:De,createNewParam:function(){return Ae({name:"Color"})}})],fn:F((function(e){for(var a=e.coord,n=e.dimensions,t=e.frameCount,r=e.frameIndex,i=e.getSrcPixel,o=e.parameters,c=i(a),u=Object(s.a)(o,4),l=u[0],d=u[1],m=u[2],f=u[3],j=f.length*m,h=Math.round(360/j),p=f.length;"00"!==(j/p).toFixed(2).slice(-2);)p-=1;if(O(c)){var v=n[0]/2+l,b=n[1]/2+d,g=Object(s.a)(a,2),x=g[0]-v,C=g[1]-b,w=(360+180*Math.atan2(C,x)/Math.PI)%360,M=Math.floor(w/h)%p,V=r/t;return f[(Math.floor(V*p)+M)%p]}return c}))}),_e=["#FF0000","#FF9600","#FFFF00","#00FF00","#00FF96","#00FFFF","#0000FF","#B400FF"].map(g),ze=[se,U,fe,pe,ve,be,ge,Oe,xe,we,Me,Se,Ie,We,h({name:"Radiance",params:[he({name:"Group Count",defaultValue:1,min:1}),Ee({name:"Colors",newParamText:"New Color",description:"Colors radiating outwards",defaultValue:_e,createNewParam:function(){return Ae({name:"Color"})}})],fn:function(e){var a=e.image,n=e.parameters,t=Object(s.a)(n,2),r=t[0],i=t[1],o=I(r).flatMap((function(){return i})),c=Object(s.a)(a.dimensions,2),u=c[0],l=c[1],d=u/2,m=l/2;return y(a,(function(e,n,t){return S(a.dimensions,(function(r){var i=M(a.dimensions,e,r);if(O(i)){var c=Object(s.a)(r,2),f=c[0],j=c[1],h=f-d,p=j-m,v=Math.sqrt(u/2*(u/2)+l/2*(l/2)),b=Math.sqrt(p*p+h*h),g=Math.floor((1-b/v)*o.length)%o.length,x=n/t,C=(Math.floor(x*o.length)+g)%o.length;return o[C]}return i}))}))}}),h({name:"Resize",params:[he({name:"Width",defaultValue:128,min:1}),he({name:"Height",defaultValue:128,min:1})],fn:function(e){var a=e.image,n=e.parameters,t=Object(s.a)(n,2),r=t[0],i=t[1];return T({image:a,newWidth:r,newHeight:i})}}),h({name:"Resize Background",params:[he({name:"Width",defaultValue:128,min:0}),he({name:"Height",defaultValue:128,min:0})],fn:function(e){var a=e.image,n=e.parameters,t=Object(s.a)(a.dimensions,2),r=t[0],i=t[1],o=Object(s.a)(n,2),c=o[0],u=o[1];V(c>=r,"New width for resize-background needs to be greater than or equal to the original"),V(u>=i,"New height for resize-background needs to be greater than or equal to the original");var l=[c,u],d=(c-r)/2,m=(u-i)/2;return{frames:a.frames.map((function(e){for(var n=new Uint8Array(c*u*4),t=0;t<u;t+=1)for(var r=0;r<c;r+=1){var i=r>d&&r<c-d&&t>m&&t<u-m?M(a.dimensions,e.data,[r-d,t-m]):[0,0,0,0];k({color:i,coord:[r,t],dimensions:l,image:n})}return{data:n}})),dimensions:l}}}),h({name:"Ripple",params:[me({name:"Amplitude",defaultValue:10,description:"How strong the ripple effect should be"}),me({name:"Period",defaultValue:2,min:0,description:"How many ripples you want"})],fn:function(e){var a=e.image,n=e.parameters;return y(a,(function(e,t,r){var i=Object(s.a)(n,2),o=i[0],c=i[1],u=a.dimensions[1],l=t/r*2*Math.PI;return S(a.dimensions,(function(n){var t=Object(s.a)(n,2),r=t[0],i=t[1],d=Math.round(o*Math.sin(i/u*c*Math.PI+l));return M(a.dimensions,e,[r+d,i])}))}))}}),h({name:"Rotate",params:[W({name:"Direction",defaultValue:-1,options:[{name:"Clockwise",value:-1},{name:"Counter-Clockwise",value:1}]})],fn:F((function(e){var a=e.dimensions,n=e.coord,t=e.frameCount,r=e.frameIndex,i=e.getSrcPixel,o=e.parameters,c=Object(s.a)(o,1)[0],u=a[0]/2,l=a[1]/2,d=Object(s.a)(n,2),m=d[0]-u,f=d[1]-l,j=r/t*(c||1),h=Math.cos(2*Math.PI*j),p=Math.sin(2*Math.PI*j);return i([Math.round(u+m*h-f*p),Math.round(l+f*h+m*p)])}))}),h({name:"Roxbury",params:[],fn:function(e){var a=e.image;return y(a,(function(e,n,t){var r=n/t,i=Math.floor(4*r),o=4*(r-i/4),c=Math.PI/2*.2,u=0===i?0:1===i?o*c:2===i?c:(1-o)*c,l=Math.cos(1.35*-u),d=Math.sin(1.35*-u),m=.25*a.dimensions[0],f=.7*a.dimensions[1];return S(a.dimensions,(function(n){var t=Object(s.a)(n,2),r=t[0],i=t[1],o=Math.floor(r-m+8*Math.sin(u)),c=Math.floor(i-f+8*Math.cos(u)),j=[Math.round(m+o*l-c*d),Math.round(f+c*l+o*d)];return M(a.dimensions,e,j)}))}))}}),h({name:"Shake",params:[me({name:"Shake Speed",defaultValue:10,min:0})],fn:F((function(e){var a=e.coord,n=e.frameCount,t=e.frameIndex,r=e.getSrcPixel,i=e.parameters,o=Object(s.a)(i,1)[0],c=Object(s.a)(a,2),u=c[0],l=c[1];return r([u+Math.round(o*Math.cos(t/n*2*Math.PI)),l])}))}),h({name:"Solid Background",params:[Ae({name:"Background Color",defaultValue:g("#000000")})],fn:F((function(e){var a=e.coord,n=e.getSrcPixel,t=e.parameters,r=Object(s.a)(t,1)[0],i=n(a);return O(i)?r:i}))}),h({name:"Static",params:[me({name:"Strength",defaultValue:10,min:0})],fn:F((function(e){var a=e.coord,n=e.getSrcPixel,t=e.parameters,r=e.random,i=Object(s.a)(t,1)[0],o=n(a);return O(o)?[0,0,0,0]:Math.ceil(r()*i)>1?[255-o[0],255-o[1],255-o[2],o[3]]:o}))}),h({name:"Transparent Color",params:[Ae({name:"Transparent Color",defaultValue:g("#000000")}),he({name:"Tolerance",defaultValue:10,min:0,max:100})],fn:F((function(e){var a=e.coord,n=e.getSrcPixel,t=e.parameters,r=Object(s.a)(t,2),i=r[0],o=r[1],c=n(a),u=c[0]-i[0],l=c[1]-i[1],d=c[2]-i[2];return Math.sqrt(u*u+l*l+d*d)/255*100<=o?[c[0],c[1],c[2],0]:c}))}),h({name:"Transpose",params:[he({name:"X",defaultValue:0}),he({name:"Y",defaultValue:0})],fn:F((function(e){var a=e.coord,n=e.getSrcPixel,t=e.parameters,r=Object(s.a)(t,2),i=r[0],o=r[1],c=Object(s.a)(a,2);return n([c[0]+i,c[1]+o])}))})],Le=function(e){var a=ze.find((function(a){return a.name===e}));return V(a),a},Ge=n(447),Je=n(436),Xe=he({name:"Frames per Second",defaultValue:20,min:0}),Ye=function(e){var a=e.isDirty,n=e.computeDisabled,t=e.baseImageUrl,i=e.transforms,o=e.onComputed,c=r.a.useState({loading:!1,results:[],computeTime:void 0}),u=Object(s.a)(c,2),l=u[0],j=u[1],h=r.a.useState(!1),p=Object(s.a)(h,2),v=p[0],b=p[1],g=r.a.useState(20),O=Object(s.a)(g,2),x=O[0],C=O[1],w=n&&!v;return Object(E.jsxs)(d.a,{spacing:1,children:[Object(E.jsx)(f.a,{variant:"h5",children:"Create Gif"}),Xe.fn({value:{valid:!0,value:x},onChange:function(e){e.valid&&(C(e.value),b(!0))}}),Object(E.jsx)(re.a,{variant:"contained",endIcon:l.loading||!a&&!v?void 0:Object(E.jsx)(R.a,{children:"priority_high"}),disabled:w,onClick:Object(L.a)(z.a.mark((function e(){var a;return z.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:a=i.map((function(e){return{transform:Le(e.transformName),params:e.paramsValues.map((function(e){return V(e.valid),e.value}))}})),j({loading:!0}),setTimeout(Object(L.a)(z.a.mark((function e(){var n,r,c;return z.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,V(t,"No source image, this button should be disabled!"),n=Date.now(),e.next=5,Z(t,a,x);case 5:r=e.sent,c=Math.ceil((Date.now()-n)/1e3),j({loading:!1,computeTime:c,results:r.map((function(e,a){return{transformName:i[a].transformName,gif:e}}))}),b(!1),o(),e.next=16;break;case 12:e.prev=12,e.t0=e.catch(0),console.error(e.t0),console.error(e.t0.stack);case 16:case"end":return e.stop()}}),e,null,[[0,12]])}))));case 3:case"end":return e.stop()}}),e)}))),children:l.loading?Object(E.jsx)(Ge.a,{color:"inherit"}):"Compute"}),Object(E.jsx)(m.a,{}),Object(E.jsx)(Je.a,{container:!0,spacing:2,padding:1,columns:{xs:4,sm:8,md:12},children:!l.loading&&Object(E.jsxs)(E.Fragment,{children:[l.computeTime&&Object(E.jsxs)(f.a,{variant:"caption",children:["Compute Time: ",l.computeTime," seconds"]}),l.results.map((function(e,a){var n=e.gif,t=e.transformName;return Object(E.jsxs)(Je.a,{item:!0,xs:4,sm:4,md:4,children:[Object(E.jsx)(f.a,{variant:"subtitle2",children:t}),Object(E.jsx)("img",{src:n,alt:"gif-".concat(t,"-").concat(a)})]})}))]})})]})},Ke=n(427),Qe=function(e){var a=e.selectedTransform,n=e.possibleTransforms,t=e.index,i=e.onSelect,o=e.onRemove,s=e.onMoveLeft,u=e.onMoveRight;return Object(E.jsx)(j.a,{style:{padding:8},elevation:3,children:Object(E.jsxs)(d.a,{spacing:1,children:[Object(E.jsxs)(d.a,{direction:"row",spacing:2,children:[Object(E.jsx)(f.a,{variant:"subtitle1",children:t+1}),Object(E.jsx)(B.a,{title:"Delete transform",children:Object(E.jsx)(He.a,{"aria-label":"delete",onClick:o,children:Object(E.jsx)(R.a,{children:"delete"})})}),Object(E.jsx)(B.a,{title:"Move transform left",children:Object(E.jsx)(He.a,{"aria-label":"delete",onClick:s,disabled:!s,children:Object(E.jsx)(R.a,{children:"chevron_left"})})}),Object(E.jsx)(B.a,{title:"Move transform right",children:Object(E.jsx)(He.a,{"aria-label":"delete",onClick:u,disabled:!u,children:Object(E.jsx)(R.a,{children:"chevron_right"})})})]}),Object(E.jsx)(d.a,{direction:"row",spacing:4,children:Object(E.jsx)(A.a,{fullWidth:!0,children:Object(E.jsx)(Ke.a,{disableClearable:!0,value:a.transform.name,options:n.map((function(e){return e.name})),onChange:function(e,a){var t=n.find((function(e){return e.name===a}));i({transform:t,paramValues:t.params.map((function(e){return e.defaultValue}))})},renderInput:function(e){return Object(E.jsx)(ue.a,Object(c.a)(Object(c.a)({},e),{},{label:"Transform"}))}})})}),a.transform.description&&Object(E.jsx)(f.a,{variant:"caption",children:a.transform.description}),a.transform.params.length>0&&Object(E.jsx)(f.a,{variant:"subtitle1",children:"Parameters"}),Object(E.jsx)(d.a,{divider:Object(E.jsx)(m.a,{}),spacing:2,children:a.transform.params.map((function(e,n){var t=e.fn({value:a.paramValues[n],onChange:function(e){i(Object(c.a)(Object(c.a)({},a),{},{paramValues:a.paramValues.map((function(a,t){return t===n?e:a}))}))}});return Object(E.jsx)(r.a.Fragment,{children:t},"".concat(a.transform.name,"-").concat(e.name))}))})]})})},Ze=function(e){var a=e.currentTransforms,n=e.possibleTransforms,t=e.onTransformsChange;return Object(E.jsxs)(d.a,{spacing:1,children:[Object(E.jsx)(f.a,{variant:"h5",children:"Image Transforms"}),Object(E.jsx)(re.a,{fullWidth:!1,variant:"contained",onClick:function(){return t([].concat(Object(p.a)(a),[{transformName:n[0].name,paramsValues:n[0].params.map((function(e){return e.defaultValue}))}]))},children:"New Transform"}),Object(E.jsx)(Je.a,{container:!0,spacing:2,padding:1,columns:{xs:4,sm:8,md:12},children:a.map((function(e,r){return Object(E.jsx)(Je.a,{item:!0,xs:4,sm:4,md:4,children:Object(E.jsx)(Qe,{index:r,possibleTransforms:n,selectedTransform:{transform:Le(e.transformName),paramValues:e.paramsValues},onRemove:function(){return t(a.filter((function(e,a){return a!==r})))},onMoveLeft:r>0?function(){return t(a.map((function(e,n){return n===r-1?a[n+1]:r===n?a[r-1]:e})))}:void 0,onMoveRight:r<a.length-1?function(){return t(a.map((function(e,n){return n===r+1?a[n-1]:r===n?a[r+1]:e})))}:void 0,onSelect:function(e){return t(a.map((function(a,n){return r===n?{transformName:e.transform.name,paramsValues:e.paramValues,computedImage:void 0}:{transformName:a.transformName,paramsValues:a.paramsValues,computedImage:void 0}})))}})})}))})]})},$e=n(429),ea=n(134),aa=function(e){var a=e.state,n=e.onImport,t=r.a.useState(),i=Object(s.a)(t,2),o=i[0],c=i[1],u=r.a.useState(!1),l=Object(s.a)(u,2),j=l[0],h=l[1];return Object(E.jsxs)(d.a,{spacing:1,children:[o&&Object(E.jsx)($e.a,{severity:"info",children:o}),Object(E.jsx)(f.a,{variant:"subtitle1",children:"Export the current image and all of its transitions to the clipboard"}),Object(E.jsx)(re.a,{endIcon:Object(E.jsx)(R.a,{children:"file_upload"}),variant:"contained",onClick:function(){var e=ea.compressToBase64(JSON.stringify(a));navigator.clipboard.writeText(e),c("Copied to clipboard"),setTimeout((function(){return c(void 0)}),2e3)},children:"Export to clipboard"}),Object(E.jsx)(m.a,{}),Object(E.jsx)(f.a,{variant:"subtitle1",children:"Import an image and its transformations from the clipboard"}),j&&Object(E.jsx)($e.a,{severity:"error",children:"Error importing from clipboard"}),Object(E.jsx)(re.a,{endIcon:Object(E.jsx)(R.a,{children:"file_download"}),variant:"contained",onClick:Object(L.a)(z.a.mark((function e(){var a,t;return z.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,navigator.clipboard.readText();case 3:if(a=e.sent){e.next=7;break}return h(!0),e.abrupt("return");case 7:t=JSON.parse(ea.decompressFromBase64(a)),n(t),h(!1),e.next=16;break;case 12:e.prev=12,e.t0=e.catch(0),console.error(e.t0),h(!0);case 16:case"end":return e.stop()}}),e,null,[[0,12]])}))),children:"Import from clipboard"})]})},na=function(){var e=r.a.useState({dirty:!1,transforms:[],baseImage:void 0}),a=Object(s.a)(e,2),n=a[0],t=a[1];var i=!n.baseImage||0===n.transforms.length||!n.dirty||n.transforms.some((function(e){return Le(e.transformName).params.length>0&&e.paramsValues.every((function(e,a){return!1===e.valid}))}));return Object(E.jsxs)(E.Fragment,{children:[Object(E.jsx)(u.a,{}),Object(E.jsx)(l.a,{children:Object(E.jsxs)(d.a,{spacing:4,justifyContent:"space-evenly",divider:Object(E.jsx)(m.a,{}),children:[Object(E.jsx)(f.a,{variant:"h2",pt:4,children:"Partymoji"}),Object(E.jsxs)(d.a,{spacing:4,divider:Object(E.jsx)(m.a,{}),children:[Object(E.jsx)(j.a,{style:{padding:16},children:Object(E.jsxs)(d.a,{spacing:1,children:[Object(E.jsx)(f.a,{variant:"h5",children:"Source Image"}),Object(E.jsx)(ie,{name:"Choose a source image",currentImageUrl:n.baseImage,onChange:function(e){t(Object(c.a)(Object(c.a)({},n),{},{baseImage:e,dirty:!0}))}})]})}),Object(E.jsx)(j.a,{style:{padding:16},children:Object(E.jsx)(Ze,{currentTransforms:n.transforms,possibleTransforms:ze,onTransformsChange:function(e){return t(Object(c.a)(Object(c.a)({},n),{},{dirty:!0,transforms:e}))}})}),Object(E.jsx)(j.a,{style:{padding:16},children:Object(E.jsx)(Ye,{isDirty:n.dirty,baseImageUrl:n.baseImage,computeDisabled:i,transforms:n.transforms,onComputed:function(){return t(Object(c.a)(Object(c.a)({},n),{},{dirty:!1}))}})}),Object(E.jsx)(j.a,{style:{padding:16},children:Object(E.jsx)(aa,{state:n,onImport:function(e){return t(Object(c.a)(Object(c.a)({},e),{},{dirty:!0}))}})}),false,Object(E.jsx)("a",{href:"https://github.com/MikeyBurkman/partymoji",target:"_blank",rel:"noreferrer",children:Object(E.jsx)("img",{src:"https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",width:64,height:64,alt:"Github Link"})})]})]})})]})};o.a.render(Object(E.jsx)(r.a.StrictMode,{children:Object(E.jsx)(na,{})}),document.getElementById("root"))}},[[371,1,2]]]);
//# sourceMappingURL=main.0c0a33ff.chunk.js.map