import test from 'node:test';
import assert from 'node:assert/strict';
import {sensorStatus} from '../scripts/sensor-api.mjs';
test('sensor status distinguishes real serial data, simulation, disconnect and stale TD',()=>{
 const now=10000,data={timestamp:now,source:'serial',connected:true,packetAgeMs:250,pressure:{raw:350},moisture:{raw:807},frames:{}};
 assert.equal(sensorStatus(data,now).connected,true);
 assert.equal(sensorStatus({...data,packetAgeMs:1600},now).connected,false);
 assert.equal(sensorStatus({...data,pressure:{raw:NaN}},now).connected,false);
 const sim=sensorStatus({...data,source:'simulation'},now);assert.equal(sim.connected,false);assert.equal(sim.source,'simulation');assert.equal(sim.tdConnected,true);
 const stale=sensorStatus(data,now+2501);assert.equal(stale.connected,false);assert.equal(stale.tdConnected,false);assert.equal(stale.pressure,null);
 assert.equal(sensorStatus(null,now).tdConnected,false);
});
