"use strict";(self.webpackChunkreact_gravity=self.webpackChunkreact_gravity||[]).push([[583],{"./src/components/StarRenderer/StarRenderer.stories.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,RedGiant:()=>RedGiant,WhiteDwarf:()=>WhiteDwarf,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});const __WEBPACK_DEFAULT_EXPORT__={title:"Astronomy/StarRenderer",component:__webpack_require__("./src/components/StarRenderer/StarRenderer.tsx")._,parameters:{layout:"centered"},args:{template:{size:50,color:"#FFD700",mass:1e3,luminosity:1},glowIntensity:15}},Default={},RedGiant={args:{template:{size:100,color:"#FF4500",mass:2e3,luminosity:2},glowIntensity:25}},WhiteDwarf={args:{template:{size:25,color:"#E0FFFF",mass:500,luminosity:.5},glowIntensity:10}},__namedExportsOrder=["Default","RedGiant","WhiteDwarf"];Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"{}",...Default.parameters?.docs?.source}}},RedGiant.parameters={...RedGiant.parameters,docs:{...RedGiant.parameters?.docs,source:{originalSource:'{\n  args: {\n    template: {\n      size: 100,\n      color: "#FF4500",\n      mass: 2000,\n      luminosity: 2\n    },\n    glowIntensity: 25\n  }\n}',...RedGiant.parameters?.docs?.source}}},WhiteDwarf.parameters={...WhiteDwarf.parameters,docs:{...WhiteDwarf.parameters?.docs,source:{originalSource:'{\n  args: {\n    template: {\n      size: 25,\n      color: "#E0FFFF",\n      mass: 500,\n      luminosity: 0.5\n    },\n    glowIntensity: 10\n  }\n}',...WhiteDwarf.parameters?.docs?.source}}}},"./src/components/StarRenderer/StarRenderer.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{_:()=>StarRenderer});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js");const StarRenderer=({mass})=>{const solarMass=mass/5e4;const color=(mass=>{const temp=Math.min(3e3*Math.pow(mass,.5)+2e3,4e4);if(mass>=50)return"#000000";if(temp<3500)return`rgb(${Math.min(temp/10,255)}, ${temp/20}, 0)`;if(temp<5e3)return`rgb(255, ${Math.min((temp-3500)/6,255)}, 0)`;if(temp<6e3)return`rgb(255, 255, ${Math.min((temp-5e3)/4,255)})`;{const redGreen=Math.max(255-(temp-6e3)/50,100);return`rgb(${redGreen}, ${redGreen}, 255)`}})(solarMass),glow=(mass=>mass>=50?30:10*Math.pow(mass,.4)+5)(solarMass),accretionStyle=(mass=>mass<50?{}:{border:"1px solid #FF00FF",boxShadow:"\n      0 0 4px #FF00FF,\n      0 0 8px rgba(255, 0, 255, 0.5),\n      0 0 12px rgba(0, 0, 255, 0.3),\n      inset 0 0 4px #FF00FF,\n      inset 0 0 8px rgba(255, 0, 255, 0.5)\n    ",animation:"rotate 3s linear infinite"})(solarMass),size=(mass=>{if(mass>=50)return 15;const x=mass/20,bellCurve=10*Math.exp(-Math.pow(x-1,2));return Math.round(5+bellCurve)})(solarMass);return react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment,null,react__WEBPACK_IMPORTED_MODULE_0__.createElement("style",null,"\n          @keyframes rotate {\n            from { transform: translate(-50%, -50%) rotate(0deg); }\n            to { transform: translate(-50%, -50%) rotate(360deg); }\n          }\n        "),react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{style:{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%, -50%)",width:size,height:size,backgroundColor:color,borderRadius:"50%",boxShadow:solarMass>=50?`0 0 ${glow}px 5px rgba(0, 0, 0, 0.8)`:`0 0 ${glow}px ${color}`,transition:"all 0.3s ease",...accretionStyle}}))};StarRenderer.__docgenInfo={description:"",methods:[],displayName:"StarRenderer",props:{mass:{required:!0,tsType:{name:"number"},description:""}}}}}]);