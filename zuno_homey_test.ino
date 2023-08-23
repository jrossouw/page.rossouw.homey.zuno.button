
byte switchValue = 1;
word lastVoltageValue = 0;
bool lastMotionValue = false;

#define SWITCH_ON 0xff
#define SWITCH_OFF 0

ZUNO_SETUP_PRODUCT_ID(0x00, 0x01);

ZUNO_SETUP_SLEEPING_MODE(ZUNO_SLEEPING_MODE_ALWAYS_AWAKE);

ZUNO_SETUP_ASSOCIATIONS(ZUNO_ASSOCIATION_GROUP_SET_VALUE);

enum{
  SWITCH_CHANNEL = 1,
  BATTERY_VOLTAGE_CHANNEL,
  BINARY_SENSOR_CHANNEL
};

ZUNO_SETUP_CHANNELS(
  ZUNO_SWITCH_BINARY(switchValue, NULL),
  ZUNO_SENSOR_MULTILEVEL(ZUNO_SENSOR_MULTILEVEL_TYPE_VOLTAGE, SENSOR_MULTILEVEL_SCALE_VOLT, 2, 2, lastVoltageValue),
  ZUNO_SENSOR_BINARY_MOTION(getterMotion)
);

byte getterMotion(void) {
  return lastMotionValue ? SWITCH_ON : SWITCH_OFF;
}

void setup() {
  Serial.begin(115200);
}

unsigned long lastReport = 0;
unsigned long lastLog = 0;
void loop() {

  unsigned long now = millis();

  if (now > lastLog + 1000) {
    lastLog = now;
    Serial.print("Switch value: ");
    Serial.println(switchValue == 0 ? "LOW" : "HIGH");
  }

  if (now > lastReport + 5000) {
    lastReport = now;
    int value = random(100);
    if (value < 20) {
      lastVoltageValue = 300 + random(200);
      Serial.print("Battery voltage: ");
      Serial.println(lastVoltageValue / 100.0f);
      zunoSendReport(BATTERY_VOLTAGE_CHANNEL);
    }
    if (value > 80) {
      lastMotionValue = !lastMotionValue;
      Serial.print("Alarm value: ");
      Serial.println(getterMotion());
      zunoSendReport(BINARY_SENSOR_CHANNEL);
      if (lastMotionValue) {
        zunoSendToGroupSetValueCommand(CTRL_GROUP_1, SWITCH_ON);
      } else {
        zunoSendToGroupSetValueCommand(CTRL_GROUP_1, SWITCH_OFF);
      }
    }
  }

}
