"""Original procedural garden score, no downloaded recordings or paid services."""
from pathlib import Path
import numpy as np
import wave, subprocess, json, os, tempfile

ROOT=Path(__file__).resolve().parents[1]
SR=44100
DURATION=64
N=SR*DURATION
mix=np.zeros((N,2),dtype=np.float64)
rng=np.random.default_rng(4821)

def hz(midi): return 440*2**((midi-69)/12)
def add(signal,start,pan=0):
    indices=(np.arange(len(signal))+int(start*SR))%N
    # Cyclic placement preserves reverb/decay across the loop boundary.
    np.add.at(mix[:,0],indices,signal*np.sqrt((1-pan)/2))
    np.add.at(mix[:,1],indices,signal*np.sqrt((1+pan)/2))

# Four spacious 16-second chords. Voicing stays in a calm register.
chords=[[48,55,59,64],[45,52,59,60],[41,53,57,64],[43,50,57,62]]
for bar,chord in enumerate(chords):
    t=np.arange(SR*22)/SR
    env=np.minimum(t/3,1)*np.maximum(0,np.minimum((22-t)/5,1))
    env=np.sin(env*np.pi/2)**2
    for j,note in enumerate(chord):
        f=hz(note)
        pad=np.sin(2*np.pi*f*t+.004*np.sin(2*np.pi*.09*t))
        pad+=.24*np.sin(2*np.pi*(f*1.0018)*t)
        pad+=.10*np.sin(2*np.pi*f*2*t)
        add(pad*env*.085,bar*16-2,(j-1.5)*.23)

# Felt-piano-like additive timbre, with fast-decaying upper partials.
def piano(note,duration=7):
    t=np.arange(int(SR*duration))/SR
    attack=1-np.exp(-t*150)
    signal=np.zeros_like(t)
    for k,weight in enumerate([1,.38,.16,.075,.035],1):
        f=hz(note)*k*np.sqrt(1+.00013*k*k)
        signal+=weight*np.sin(2*np.pi*f*t)*np.exp(-t/(2.4/(k**.65)))
    return signal*attack

# A deliberately sparse original motif; every phrase leaves space.
melody=[(2,76),(5,79),(9,74),(13,71),(19,72),(23,76),(27,79),
        (34,76),(38,81),(43,79),(50,74),(54,69),(59,71)]
for index,(start,note) in enumerate(melody):
    signal=piano(note-12)*.12
    pan=float(np.sin(index*1.7)*.4)
    add(signal,start,pan)
    add(signal*.18,start+.37,-pan)
    add(signal*.11,start+.71,pan)
for bar,chord in enumerate(chords):
    for index,offset in enumerate([.8,4.8,8.8,12.8]):
        signal=piano(chord[index]+12)*.045
        add(signal,bar*16+offset,(index-1.5)*.16)

# Very soft airy bed, smoothed deterministic noise with slow amplitude breathing.
noise=rng.normal(0,1,N)
kernel=np.ones(500)/500
noise=np.convolve(noise,kernel,mode='same')
phase=np.arange(N)/SR
noise*=.035*(.6+.4*np.sin(2*np.pi*phase/32)**2)
mix[:,0]+=noise;mix[:,1]+=np.roll(noise,800)
dry=mix.copy()
for delay,gain in [(.131,.16),(.283,.11),(.461,.075),(.719,.035)]:
    mix+=np.roll(dry,int(delay*SR),axis=0)[:,::-1]*gain
mix/=max(1,float(np.max(np.abs(mix)))/.64)
# Tiny cyclic join repair, below audible note attacks.
for i in range(220):
    f=i/220
    average=(mix[i]+mix[-220+i])/2
    mix[i]=average*(1-f)+mix[i]*f
    mix[-220+i]=mix[-220+i]*(1-f)+average*f
edge=np.sin(np.linspace(0,np.pi/2,int(SR*.025)))**2
mix[:len(edge)]*=edge[:,None]
mix[-len(edge):]*=edge[::-1,None]
out=ROOT/'assets/audio';out.mkdir(parents=True,exist_ok=True)
temp=Path(tempfile.mkdtemp(prefix='symbiotic-audio-'))
wav=temp/'garden-original.wav'
with wave.open(str(wav),'wb') as file:
    file.setnchannels(2);file.setsampwidth(2);file.setframerate(SR)
    file.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes())
ffmpeg=os.environ.get('FFMPEG','ffmpeg')
subprocess.run([str(ffmpeg),'-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','160k',str(out/'garden-interlude.mp3')],check=True)
metadata={'name':'Garden Interlude — felt piano edition','durationSeconds':DURATION,'sampleRate':SR,'channels':2,'creation':'Original local procedural synthesis: warm felt-piano-like additive partials, soft pads, deterministic air bed, cyclic delays. No third-party recordings; synthesized, not an acoustic piano recording.','peak':float(np.max(np.abs(mix))),'rms':float(np.sqrt(np.mean(mix**2))),'file':'garden-interlude.mp3','bytes':(out/'garden-interlude.mp3').stat().st_size}
(out/'composition.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(metadata,ensure_ascii=False))
