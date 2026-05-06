import{Z as g,Y as v,b0 as R,a0 as k,d as N,x as u,b1 as j,aj as V,a1 as I,a2 as B,b2 as O,a as _,b3 as E,a4 as P,a5 as D,aS as W,r as b,aw as q,j as F,l as H,o as x,b as w,f as h,w as p,i as m,e as L,G as M,H as K,n as U,N as Y,B as C,h as S,m as G,a8 as z,_ as X}from"./index-BFfsFzPT.js";import{N as Z}from"./Form-AwhRUrc7.js";import{N as A}from"./Space-B62NZNK2.js";const J=g([g("@keyframes spin-rotate",`
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
 `,[R()])]),v("spin-body",`
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
 `)])]),Q={small:20,medium:18,large:16},ee=Object.assign(Object.assign({},B.props),{contentClass:String,contentStyle:[Object,String],description:String,stroke:String,size:{type:[String,Number],default:"medium"},show:{type:Boolean,default:!0},strokeWidth:Number,rotate:{type:Boolean,default:!0},spinning:{type:Boolean,validator:()=>!0,default:void 0},delay:Number}),te=N({name:"Spin",props:ee,slots:Object,setup(o){const{mergedClsPrefixRef:r,inlineThemeDisabled:a}=I(o),s=B("Spin","-spin",J,O,o,r),n=_(()=>{const{size:i}=o,{common:{cubicBezierEaseInOut:t},self:e}=s.value,{opacitySpinning:d,color:y,textColor:$}=e,T=typeof i=="number"?E(i):e[P("size",i)];return{"--n-bezier":t,"--n-opacity-spinning":d,"--n-size":T,"--n-color":y,"--n-text-color":$}}),l=a?D("spin",_(()=>{const{size:i}=o;return typeof i=="number"?String(i):i[0]}),n,o):void 0,f=W(o,["spinning","show"]),c=b(!1);return q(i=>{let t;if(f.value){const{delay:e}=o;if(e){t=window.setTimeout(()=>{c.value=!0},e),i(()=>{clearTimeout(t)});return}}c.value=f.value}),{mergedClsPrefix:r,active:c,mergedStrokeWidth:_(()=>{const{strokeWidth:i}=o;if(i!==void 0)return i;const{size:t}=o;return Q[typeof t=="number"?"medium":t]}),cssVars:a?void 0:n,themeClass:l==null?void 0:l.themeClass,onRender:l==null?void 0:l.onRender}},render(){var o,r;const{$slots:a,mergedClsPrefix:s,description:n}=this,l=a.icon&&this.rotate,f=(n||a.description)&&u("div",{class:`${s}-spin-description`},n||((o=a.description)===null||o===void 0?void 0:o.call(a))),c=a.icon?u("div",{class:[`${s}-spin-body`,this.themeClass]},u("div",{class:[`${s}-spin`,l&&`${s}-spin--rotate`],style:a.default?"":this.cssVars},a.icon()),f):u("div",{class:[`${s}-spin-body`,this.themeClass]},u(j,{clsPrefix:s,style:a.default?"":this.cssVars,stroke:this.stroke,"stroke-width":this.mergedStrokeWidth,class:`${s}-spin`}),f);return(r=this.onRender)===null||r===void 0||r.call(this),a.default?u("div",{class:[`${s}-spin-container`,this.themeClass],style:this.cssVars},u("div",{class:[`${s}-spin-content`,this.active&&`${s}-spin-content--spinning`,this.contentClass],style:this.contentStyle},a),u(V,{name:"fade-in-transition"},{default:()=>this.active?c:null})):c}}),ae={class:"p-4"},se={class:"grid gap-6"},ne=N({name:"PageDescription",__name:"index",setup(o){const r=F(),a=b(!1),s=b(!1),n=b({home:"",home_cn:"",research:"",research_cn:"",about:"",about_cn:""}),l=[{key:"home",label:"home",placeholder:"请输入home描述内容..."},{key:"home_cn",label:"home（中文）",placeholder:"请输入home中文描述内容..."},{key:"research",label:"research",placeholder:"请输入research描述内容..."},{key:"research_cn",label:"research（中文）",placeholder:"请输入research中文描述内容..."},{key:"about",label:"about",placeholder:"请输入about描述内容..."},{key:"about_cn",label:"about（中文）",placeholder:"请输入about中文描述内容..."}],f=async()=>{a.value=!0;try{const{data:t,error:e}=await z.from("description").select("*").eq("id",1).single();if(e)throw e;t&&(n.value={home:t.home||"",home_cn:t.home_cn||"",research:t.research||"",research_cn:t.research_cn||"",about:t.about||"",about_cn:t.about_cn||""}),r.success("页面描述加载成功")}catch(t){console.error("加载页面描述失败:",t),r.error("加载页面描述失败")}finally{a.value=!1}},c=async()=>{if(Object.values(n.value).every(e=>!e.trim())){r.warning("请至少填写一个页面描述");return}s.value=!0;try{const{error:e}=await z.from("description").update({home:n.value.home,home_cn:n.value.home_cn,research:n.value.research,research_cn:n.value.research_cn,about:n.value.about,about_cn:n.value.about_cn}).eq("id",1);if(e)throw e;r.success("页面描述保存成功")}catch(e){console.error("保存页面描述失败:",e),r.error("保存页面描述失败")}finally{s.value=!1}},i=()=>{n.value={home:"",home_cn:"",research:"",research_cn:"",about:"",about_cn:""},r.info("表单已重置")};return H(()=>{f()}),(t,e)=>(x(),w("div",ae,[h(m(G),{title:"页面描述维护",bordered:!1},{"header-extra":p(()=>[h(m(A),null,{default:p(()=>[h(m(C),{onClick:i,disabled:s.value},{default:p(()=>e[0]||(e[0]=[S(" 重置 ")])),_:1},8,["disabled"]),h(m(C),{type:"primary",onClick:c,loading:s.value,disabled:a.value},{default:p(()=>e[1]||(e[1]=[S(" 保存 ")])),_:1},8,["loading","disabled"])]),_:1})]),default:p(()=>[h(m(te),{show:a.value},{default:p(()=>[h(m(Z),{model:n.value,"label-placement":"top","label-width":"auto","require-mark-placement":"right-hanging"},{default:p(()=>[L("div",se,[(x(),w(M,null,K(l,d=>h(m(U),{key:d.key,label:d.label,path:d.key},{default:p(()=>[h(m(Y),{value:n.value[d.key],"onUpdate:value":y=>n.value[d.key]=y,type:"textarea",placeholder:d.placeholder,rows:6,maxlength:"1000","show-count":"",clearable:"",disabled:s.value},null,8,["value","onUpdate:value","placeholder","disabled"])]),_:2},1032,["label","path"])),64))])]),_:1},8,["model"])]),_:1},8,["show"])]),_:1})]))}}),le=X(ne,[["__scopeId","data-v-50623f80"]]);export{le as default};
