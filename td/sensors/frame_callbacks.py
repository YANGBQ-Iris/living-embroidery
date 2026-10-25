import time

def onStart():
    c=parent()
    for key,value in {'progress':0.0,'wetness':0.0,'touching':False,'releasedAt':None,'lastPacket':None,'lastFrame':time.monotonic(),'startedAt':time.monotonic(),'lastReconnect':time.monotonic(),'reconnectAt':None,'rawPressure':1023.0,'rawSoil':1023.0,'packetCount':0,'history':[],'previousSimulate':bool(c.par.Simulate)}.items():
        c.store(key,value)

def onFrameStart(frame):
    c=parent();now=time.monotonic();dt=max(0.0,min(.1,now-c.fetch('lastFrame',now)))
    c.store('lastFrame',now)
    simulated=bool(c.par.Simulate)
    if simulated!=c.fetch('previousSimulate',simulated):
        c.store('touching',False);c.store('releasedAt',None);c.store('previousSimulate',simulated)
        for name in ('pressureFilterCHOP','humidityFilterCHOP'):
            c.op(name).par.resetpulse.pulse()
    stamp=c.fetch('lastPacket',None)
    connected=stamp is not None and now-stamp<float(c.par.Timeout) and bool(c.par.Readserial)
    reconnect=c.fetch('reconnectAt',None)
    if reconnect is not None and (simulated or now>=reconnect):
        c.op('serialDAT').par.active.expr='parent().par.Readserial and not parent().par.Simulate'
        c.store('reconnectAt',None)
    elif not simulated and bool(c.par.Readserial) and not connected and now-c.fetch('lastReconnect',now)>5:
        # Recover after unplug/replug; never open a second owner of the COM port.
        c.store('lastReconnect',now);c.op('serialDAT').par.active=False;c.store('reconnectAt',now+.15)
    valid=simulated or connected
    pressure_raw=float(c.par.Testpressure) if simulated else c.fetch('rawPressure',1023.0)
    soil_raw=float(c.par.Testsoil) if simulated else c.fetch('rawSoil',1023.0)
    pressure=float(c.op('pressureFilterCHOP')['pressure_raw'][-1]) if valid else 1023.0
    soil=float(c.op('humidityFilterCHOP')['soil_raw'][-1]) if valid else float(c.par.Dry)
    released=c.fetch('releasedAt',None);released_for=0 if released is None else now-released
    progress,touching,duration=c.op('pressureLogicDAT').module.step(c.fetch('progress',0),c.fetch('touching',False),pressure,dt,valid,float(c.par.Lightseconds),float(c.par.Heavyseconds),float(c.par.Disperseseconds),float(c.par.Presson),float(c.par.Pressoff),released_for,float(c.par.Releasedelay))
    c.store('releasedAt',None if touching else (now if released is None else released))
    c.store('progress',progress);c.store('touching',touching)
    old=c.fetch('wetness',0)
    target=c.op('moistureLogicDAT').module.target_wetness(soil,float(c.par.Dry),float(c.par.Wet)) if valid else 0.0
    wetness=c.op('moistureLogicDAT').module.approach(old,target,dt,float(c.par.Riseseconds),float(c.par.Fallseconds))
    c.store('wetness',wetness)
    for i,value in enumerate((progress,wetness,target,pressure_raw,soil_raw,int(touching),int(valid),duration)):
        getattr(c.op('statusCHOP').par,'value'+str(i)).val=value
    phase='assembled' if progress>=1 and touching else ('assembling' if touching else ('holding' if progress>0 and released_for<float(c.par.Releasedelay) else ('dispersing' if progress>0 else 'scattered')))
    c.store('snapshot',{'timestamp':int(time.time()*1000),'source':'simulation' if simulated else 'serial','connected':bool(connected and not simulated),'port':str(c.par.Port),'baud':115200,'packetCount':c.fetch('packetCount',0),'packetAgeMs':None if stamp is None else round((now-stamp)*1000),'pressure':{'raw':pressure_raw,'smooth':pressure,'progress':progress,'touching':bool(touching),'phase':phase,'assemblySeconds':duration,'releaseDelay':float(c.par.Releasedelay)},'moisture':{'raw':soil_raw,'smooth':soil,'target':target,'progress':wetness,'drying':bool(wetness<old),'dry':float(c.par.Dry),'wet':float(c.par.Wet)}})
