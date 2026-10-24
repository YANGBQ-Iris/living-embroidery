// A short liquid plop and soft splash, synthesised locally without a sample fetch.
export function createWaterDropBuffer(context){
 const rate=context.sampleRate,duration=.42,buffer=context.createBuffer(1,Math.ceil(rate*duration),rate),data=buffer.getChannelData(0);
 let phase=0,noise=0,seed=713;
 for(let i=0;i<data.length;i++){
  const t=i/rate;
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const white=seed/4294967296*2-1;noise+=.18*(white-noise);
  // Rising, rapidly damped bubble resonance avoids a sustained bell-like note.
  const frequency=470+1150*(1-Math.exp(-t*33));phase+=Math.PI*2*frequency/rate;
  const attack=1-Math.exp(-t*1200),body=attack*Math.exp(-t*25);
  const bubble=(Math.sin(phase)+.16*Math.sin(phase*1.71))*body*.48;
  const splash=noise*(1-Math.exp(-t*190))*Math.exp(-t*17)*.6;
  const tail=Math.sin(phase*.53)*Math.exp(-t*30)*attack*.08;
  const end=Math.min(1,(duration-t)/.025);
  data[i]=(bubble+splash+tail)*end;
 }
 return buffer;
}
