export function absorptionOpacity(y,surface,radius){
 const depth=Math.max(0,Math.min(1,(y-surface)/(radius*2.4+44)));
 return 1-depth*depth*(3-2*depth);
}
export function waterDropState(t,i,s,w=1280,h=800){
 const phase=(t*(.055+s*.07)+i*.067)%1;
 const x=w*(.16+.69*((Math.sin(i*27.1)+1)/2)),y=phase*h*1.3-80;
 const radius=20+Math.sin(i*3)*12+s*23;
 const surface=h*.77+Math.sin(x*.009+t*.5)*15;
 const opacity=absorptionOpacity(y,surface,radius);
 return {x,y,radius,surface,opacity,scale:.78+.22*opacity,impact:Math.max(0,(y-surface)/(radius*2.4+44))};
}
