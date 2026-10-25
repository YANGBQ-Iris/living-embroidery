"""ADC values decrease as pressure increases; all durations are seconds."""
import math


def parse_packet(message):
    fields = dict(cell.strip().split('=', 1) for cell in message.strip().split(','))
    raw = float(fields['pressure_raw'])
    soil = float(fields.get('soil_raw', 1023))
    if not all(math.isfinite(v) and 0 <= v <= 1023 for v in (raw, soil)):
        raise ValueError('Expected ADC readings in 0..1023')
    return raw, soil


def step(progress, touching, raw, dt, valid=True, light=8, heavy=10,
         disperse=3, press_on=800, press_off=900, released_for=0, release_delay=2):
    if not all(math.isfinite(v) for v in (progress, raw, dt)):
        raise ValueError('Non-finite control input')
    light = max(6.0, light)
    heavy = max(light, heavy)
    if not valid:
        touching = False
    elif touching:
        touching = raw < press_off
    else:
        touching = raw <= press_on
    # <=90 is heavy. >=250 is light; interpolate in between without a speed jump.
    blend = min(1.0, max(0.0, (raw-90.0)/160.0))
    duration = heavy + (light-heavy)*blend
    # Never catch up a frozen UI frame by jumping the plant straight to assembled.
    dt = max(0.0, min(dt, .1))
    velocity = 1.0/duration if touching else (0.0 if released_for < release_delay else -1.0/max(.1, disperse))
    return min(1.0, max(0.0, progress + dt*velocity)), touching, duration


def self_test():
    assert parse_packet('soil_raw=1023,pressure_raw=300\r\n') == (300, 1023)
    for bad in ('boot', '1,2', 'soil_raw=1', 'pressure_raw=nan', 'pressure_raw=-1', 'pressure_raw=1024'):
        try:
            parse_packet(bad)
        except (ValueError, KeyError):
            pass
        else:
            raise AssertionError(bad)
    for raw, seconds in ((50,10), (90,10), (250,8), (500,8)):
        p, touch = 0, False
        for _ in range(int((seconds-.1)*100)):
            p,touch,duration = step(p,touch,raw,.01)
        assert p < 1 and duration == seconds
        for _ in range(12):
            p,touch,_ = step(p,touch,raw,.01)
        assert p == 1
    p,t,_ = step(1,True,1023,.1)
    assert p == 1 and not t
    assert step(.7,False,1023,.1,released_for=1.999)[0] == .7
    assert step(.7,False,1023,.1,released_for=2)[0] < .7
    assert step(.7,False,350,.1,released_for=1)[0] > .7
    p,t,_ = step(.5,True,300,.1,valid=False,released_for=2)
    assert p < .5 and not t
    assert not step(0,False,850,.01)[1]
    assert step(0,True,850,.01)[1]
    assert not step(0,True,900,.01)[1]
    assert step(0,False,500,.1,light=1)[2] == 6
    assert step(0,False,50,9)[0] <= .0100001
    print('PASS: parser, 8s light/10s heavy, 6s floor, 2s release hold, re-touch, stale link, UI stall')


if __name__ == '__main__':
    self_test()
