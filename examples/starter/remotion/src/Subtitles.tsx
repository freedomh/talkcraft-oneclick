import React from 'react';
export const phrases=()=>[{text:'文字和颜色都能在工作台里修改',start:0,end:4,dark:true}];
export const SubtitleLine=({text,children}:{text?:string;children?:React.ReactNode})=><div style={{position:'absolute',left:80,right:140,bottom:240,zIndex:40,color:'white',fontFamily:'Microsoft YaHei,sans-serif',fontSize:46,fontWeight:700,textAlign:'center'}}>{text??children}</div>;
export const Subtitles=()=> <SubtitleLine text="文字和颜色都能在工作台里修改"/>;
