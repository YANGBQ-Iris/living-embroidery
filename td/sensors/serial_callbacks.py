import time

def onReceive(dat,rowIndex,message,bytes):
    c=parent()
    try:
        pressure,soil=c.op('pressureLogicDAT').module.parse_packet(message)
    except (ValueError,KeyError,TypeError):
        c.store('invalidPackets',c.fetch('invalidPackets',0)+1)
        return
    first=c.fetch('lastPacket',None) is None
    c.store('rawPressure',pressure)
    c.store('rawSoil',soil)
    c.store('lastPacket',time.monotonic())
    c.store('packetCount',c.fetch('packetCount',0)+1)
    if first:
        c.op('pressureFilterCHOP').par.resetpulse.pulse()
        c.op('humidityFilterCHOP').par.resetpulse.pulse()
    history=c.fetch('history',[])
    history.append({'time':time.time(),'pressure':pressure,'soil':soil})
    c.store('history',history[-600:])
    c.op('latestPacketDAT').text=message.strip()
