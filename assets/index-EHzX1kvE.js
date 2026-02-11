import{R as g,Q as v,a$ as T,S as k,d as N,x as u,b0 as V,ad as j,T as I,U as $,b1 as O,a as _,b2 as E,W as P,X as W,aR as D,r as b,ar as L,j as M,l as q,o as x,b as w,f as h,w as p,i as m,e as F,L as U,M as H,n as K,N as X,B as C,h as S,m as Q,a0 as z,_ as Y}from"./index-BorE06jw.js";import{N as A}from"./Form-S25K7sDX.js";import{N as G}from"./Space-2VR87iPm.js";const J=g([g("@keyframes spin-rotate",`
 from {
 transform: rotate(0);
 }
 to {
 transform: rotate(360deg);
 }
 `),v("spin-container",`
 position: relative;
 `,[v("spin-body",`
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translateX(-50%) translateY(-50%);
 `,[T()])]),v("spin-body",`
 display: inline-flex;
 align-items: center;
 justify-content: center;
 flex-direction: column;
 `),v("spin",`
 display: inline-flex;
 height: var(--n-size);
 width: var(--n-size);
 font-size: var(--n-size);
 color: var(--n-color);
 `,[k("rotate",`
 animation: spin-rotate 2s linear infinite;
 `)]),v("spin-description",`
 display: inline-block;
 font-size: var(--n-font-size);
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 margin-top: 8px;
 `),v("spin-content",`
 opacity: 1;
 transition: opacity .3s var(--n-bezier);
 pointer-events: all;
 `,[k("spinning",`
 user-select: none;
 -webkit-user-select: none;
 pointer-events: none;
 opacity: var(--n-opacity-spinning);
 `)])]),Z={small:20,medium:18,large:16},ee=Object.assign(Object.assign({},$.props),{contentClass:String,contentStyle:[Object,String],description:String,stroke:String,size:{type:[String,Number],default:"medium"},show:{type:Boolean,default:!0},strokeWidth:Number,rotate:{type:Boolean,default:!0},spinning:{type:Boolean,validator:()=>!0,default:void 0},delay:Number}),te=N({name:"Spin",props:ee,slots:Object,setup(o){const{mergedClsPrefixRef:i,inlineThemeDisabled:a}=I(o),s=$("Spin","-spin",J,O,o,i),n=_(()=>{const{size:r}=o,{common:{cubicBezierEaseInOut:t},self:e}=s.value,{opacitySpinning:d,color:y,textColor:B}=e,R=typeof r=="number"?E(r):e[P("size",r)];return{"--n-bezier":t,"--n-opacity-spinning":d,"--n-size":R,"--n-color":y,"--n-text-color":B}}),l=a?W("spin",_(()=>{const{size:r}=o;return typeof r=="number"?String(r):r[0]}),n,o):void 0,f=D(o,["spinning","show"]),c=b(!1);return L(r=>{let t;if(f.value){const{delay:e}=o;if(e){t=window.setTimeout(()=>{c.value=!0},e),r(()=>{clearTimeout(t)});return}}c.value=f.value}),{mergedClsPrefix:i,active:c,mergedStrokeWidth:_(()=>{const{strokeWidth:r}=o;if(r!==void 0)return r;const{size:t}=o;return Z[typeof t=="number"?"medium":t]}),cssVars:a?void 0:n,themeClass:l==null?void 0:l.themeClass,onRender:l==null?void 0:l.onRender}},render(){var o,i;const{$slots:a,mergedClsPrefix:s,description:n}=this,l=a.icon&&this.rotate,f=(n||a.description)&&u("div",{class:`${s}-spin-description`},n||((o=a.description)===null||o===void 0?void 0:o.call(a))),c=a.icon?u("div",{class:[`${s}-spin-body`,this.themeClass]},u("div",{class:[`${s}-spin`,l&&`${s}-spin--rotate`],style:a.default?"":this.cssVars},a.icon()),f):u("div",{class:[`${s}-spin-body`,this.themeClass]},u(V,{clsPrefix:s,style:a.default?"":this.cssVars,stroke:this.stroke,"stroke-width":this.mergedStrokeWidth,class:`${s}-spin`}),f);return(i=this.onRender)===null||i===void 0||i.call(this),a.default?u("div",{class:[`${s}-spin-container`,this.themeClass],style:this.cssVars},u("div",{class:[`${s}-spin-content`,this.active&&`${s}-spin-content--spinning`,this.contentClass],style:this.contentStyle},a),u(j,{name:"fade-in-transition"},{default:()=>this.active?c:null})):c}}),ae={class:"p-4"},se={class:"grid gap-6"},ne=N({name:"PageDescription",__name:"index",setup(o){const i=M(),a=b(!1),s=b(!1),n=b({home:"",home_cn:"",research:"",research_cn:"",about:"",about_cn:""}),l=[{key:"home",label:"home",placeholder:"请输入home描述内容..."},{key:"home_cn",label:"home（中文）",placeholder:"请输入home中文描述内容..."},{key:"research",label:"research",placeholder:"请输入research描述内容..."},{key:"research_cn",label:"research（中文）",placeholder:"请输入research中文描述内容..."},{key:"about",label:"about",placeholder:"请输入about描述内容..."},{key:"about_cn",label:"about（中文）",placeholder:"请输入about中文描述内容..."}],f=async()=>{a.value=!0;try{const{data:t,error:e}=await z.from("description").select("*").eq("id",1).single();if(e)throw e;t&&(n.value={home:t.home||"",home_cn:t.home_cn||"",research:t.research||"",research_cn:t.research_cn||"",about:t.about||"",about_cn:t.about_cn||""}),i.success("页面描述加载成功")}catch(t){console.error("加载页面描述失败:",t),i.error("加载页面描述失败")}finally{a.value=!1}},c=async()=>{if(Object.values(n.value).every(e=>!e.trim())){i.warning("请至少填写一个页面描述");return}s.value=!0;try{const{error:e}=await z.from("description").update({home:n.value.home,home_cn:n.value.home_cn,research:n.value.research,research_cn:n.value.research_cn,about:n.value.about,about_cn:n.value.about_cn}).eq("id",1);if(e)throw e;i.success("页面描述保存成功")}catch(e){console.error("保存页面描述失败:",e),i.error("保存页面描述失败")}finally{s.value=!1}},r=()=>{n.value={home:"",home_cn:"",research:"",research_cn:"",about:"",about_cn:""},i.info("表单已重置")};return q(()=>{f()}),(t,e)=>(x(),w("div",ae,[h(m(Q),{title:"页面描述维护",bordered:!1},{"header-extra":p(()=>[h(m(G),null,{default:p(()=>[h(m(C),{onClick:r,disabled:s.value},{default:p(()=>e[0]||(e[0]=[S(" 重置 ")])),_:1},8,["disabled"]),h(m(C),{type:"primary",onClick:c,loading:s.value,disabled:a.value},{default:p(()=>e[1]||(e[1]=[S(" 保存 ")])),_:1},8,["loading","disabled"])]),_:1})]),default:p(()=>[h(m(te),{show:a.value},{default:p(()=>[h(m(A),{model:n.value,"label-placement":"top","label-width":"auto","require-mark-placement":"right-hanging"},{default:p(()=>[F("div",se,[(x(),w(U,null,H(l,d=>h(m(K),{key:d.key,label:d.label,path:d.key},{default:p(()=>[h(m(X),{value:n.value[d.key],"onUpdate:value":y=>n.value[d.key]=y,type:"textarea",placeholder:d.placeholder,rows:6,maxlength:"1000","show-count":"",clearable:"",disabled:s.value},null,8,["value","onUpdate:value","placeholder","disabled"])]),_:2},1032,["label","path"])),64))])]),_:1},8,["model"])]),_:1},8,["show"])]),_:1})]))}}),le=Y(ne,[["__scopeId","data-v-50623f80"]]);export{le as default};
