import React from 'react';import {AbsoluteFill,interpolate,useCurrentFrame} from 'remotion';import {useParams} from '../params';
export const PARAMS=[{type:'text',key:'title',label:'标题',default:'开始你的第一条视频'},{type:'color',key:'accent',label:'强调色',default:'#b9f363'}] as const;
export const Intro=({shot}:{shot?:unknown})=>{const frame=useCurrentFrame();const p=useParams('s01',PARAMS);return <AbsoluteFill style={{background:'#101c3e',fontFamily:'Microsoft YaHei, sans-serif',color:'#f8f7ee',padding:'180px 90px'}}><div style={{fontSize:36,color:p.accent,letterSpacing:5}}>TALKCRAFT · ONE CLICK</div><div style={{fontSize:98,fontWeight:900,lineHeight:1.25,marginTop:100,opacity:interpolate(frame,[0,15],[0,1],{extrapolateRight:'clamp'})}}>{p.title}</div><div style={{marginTop:100,fontSize:48,lineHeight:1.8}}>拖入动效　修改文字<br/>排列时间线　导出 MP4</div><svg width="860" height="400" viewBox="0 0 860 400" style={{marginTop:80}}><path d="M40 180H780" stroke={p.accent} strokeWidth="8" pathLength="1" strokeDasharray="1" strokeDashoffset={1-Math.min(1,frame/60)}/>{[120,430,740].map((x,i)=><circle key={x} cx={x} cy="180" r={28} fill={p.accent} opacity={frame>i*20?1:.15}/>)}</svg><div style={{position:'absolute',bottom:400,fontSize:40,color:'#aab7d4'}}>示例动画 · 无真人素材 · 提示音演示</div></AbsoluteFill>};
export const SCENES={
  s01:Intro,
};
export const SCENE_PARAMS={
  s01:PARAMS,
};
