export const FPS=30;export const cleanText=(s:string)=>s.replace(/[\s，。！？、,.!?]/g,'');
export const timing={scenes:[{i:0,text:'文字和颜色都能在工作台里修改',start:0,end:4,chars:[]}]};
export const atChar=(_scene:number,index:number)=>Math.min(4,index*4/16);
