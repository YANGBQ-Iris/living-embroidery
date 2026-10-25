// 双路独立测试：土壤模块 AO 接 A0，压力模块 AO 接 A1。
// 两模块经面包板共享 5V 和 GND，DO 均不接。
// 只输出原始读数；未标定前不表示湿度百分比、重量或压力单位。
const unsigned long SAMPLE_INTERVAL_MS = 250;
unsigned long lastSampleMs = 0;

void setup() {
  Serial.begin(115200);
  pinMode(A0, INPUT);
  pinMode(A1, INPUT);
  Serial.println(F("dual_raw_test_v1"));
}

void loop() {
  const unsigned long now = millis();
  if (now - lastSampleMs >= SAMPLE_INTERVAL_MS) {
    lastSampleMs = now;
    // 切换通道后先丢弃一次转换，减小前一通道对高阻信号的影响。
    analogRead(A0);
    const int soilRaw = analogRead(A0);
    analogRead(A1);
    const int pressureRaw = analogRead(A1);

    Serial.print(F("soil_raw="));
    Serial.print(soilRaw);
    Serial.print(F(",pressure_raw="));
    Serial.println(pressureRaw);
  }
}
