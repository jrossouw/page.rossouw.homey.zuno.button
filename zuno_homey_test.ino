
byte switchValue = 1;
word lastVoltageValue = 0;

ZUNO_SETUP_PRODUCT_ID(0x00, 0x01);

enum{
  SWITCH_CHANNEL = 1,
  BATTERY_VOLTAGE_CHANNEL
};

ZUNO_SETUP_CHANNELS(
  ZUNO_SWITCH_BINARY(switchValue, NULL),
  ZUNO_SENSOR_MULTILEVEL(ZUNO_SENSOR_MULTILEVEL_TYPE_VOLTAGE, SENSOR_MULTILEVEL_SCALE_VOLT, 2, 2, lastVoltageValue)
);

ZUNO_SETUP_SLEEPING_MODE(ZUNO_SLEEPING_MODE_ALWAYS_AWAKE);

void setup() {
  Serial.begin(115200);
}

unsigned long lastReport = 0;
unsigned long lastLog = 0;
void loop() {

  unsigned long now = millis();

  if (now > lastLog + 2000) {
    lastLog = now;
    Serial.print("Switch value: ");
    Serial.println(switchValue == 0 ? "LOW" : "HIGH");
    lastVoltageValue = 300 + random(200);
    Serial.print("Battery voltage: ");
    Serial.println(lastVoltageValue / 100.0f);
    zunoSendReport(BATTERY_VOLTAGE_CHANNEL);
  }

}
