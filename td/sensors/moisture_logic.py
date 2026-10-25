import math


def parse_packet(message):
    cells=dict(cell.strip().split('=',1) for cell in message.strip().split(','))
    soil=float(cells['soil_raw'])
    pressure=float(cells.get('pressure_raw',1023))
    if not all(math.isfinite(x) and 0<=x<=1023 for x in (soil,pressure)):
        raise ValueError('ADC values must be finite and in 0..1023')
    return soil,pressure


def target_wetness(raw,dry=1023,wet=591):
    if not all(math.isfinite(x) for x in (raw,dry,wet)) or dry<=wet:
        raise ValueError('Calibration requires dry > wet')
    return min(1.0,max(0.0,(dry-raw)/(dry-wet)))


def approach(current,target,dt,rise=6,fall=6):
    dt=max(0.0,min(.1,dt))
    speed=1/max(.1,rise if target>current else fall)
    return min(target,current+dt*speed) if target>current else max(target,current-dt*speed)


def self_test():
    assert parse_packet('soil_raw=591,pressure_raw=1023\r\n')==(591,1023)
    for bad in ('boot','1,2','soil_raw=nan','soil_raw=-1','pressure_raw=5','soil_raw=1024'):
        try: parse_packet(bad)
        except (ValueError,KeyError): pass
        else: raise AssertionError(bad)
    assert target_wetness(1023)==0 and target_wetness(591)==1
    assert target_wetness(807)==.5
    assert target_wetness(400)==1
    try: target_wetness(600,600,600)
    except ValueError: pass
    else: raise AssertionError('Invalid calibration accepted')
    p=0
    for _ in range(599): p=approach(p,1,.01)
    assert p<1
    for _ in range(3): p=approach(p,1,.01)
    assert p==1
    for _ in range(602): p=approach(p,0,.01)
    assert p==0
    assert approach(.4,.4,.1)==.4
    assert approach(.4,.5,.1)>.4 and approach(.4,.3,.1)<.4
    print('PASS: parser, calibration, proportional target, smooth reveal/dissolve, dry reset')


if __name__=='__main__': self_test()
