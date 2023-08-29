#include "Arduino.h"

#define SWITCH_ON 0xff
#define SWITCH_OFF 0

ZUNO_SETUP_PRODUCT_ID(0x00, 0x01);
ZUNO_SETUP_SLEEPING_MODE(ZUNO_SLEEPING_MODE_ALWAYS_AWAKE);
ZUNO_SETUP_ASSOCIATIONS(ZUNO_ASSOCIATION_GROUP_SET_VALUE);
ZUNO_SETUP_CFGPARAMETER_HANDLER(config_parameter_changed);

byte switchValue = 0;
word lastVoltageValue = 0;
bool lastMotionValue = false;
uint32_t retriggerTimeout = 10;
uint32_t lightAutoOffTimeout = 1;

enum{
  BINARY_SENSOR_CHANNEL = 1,
  SWITCH_CHANNEL,
  BATTERY_VOLTAGE_CHANNEL
};

ZUNO_SETUP_CHANNELS(
  ZUNO_SENSOR_BINARY(ZUNO_SENSOR_BINARY_TYPE_MOTION, getterFunction),
  ZUNO_SWITCH_BINARY(switchValue, NULL),
  ZUNO_SENSOR_MULTILEVEL(ZUNO_SENSOR_MULTILEVEL_TYPE_VOLTAGE, SENSOR_MULTILEVEL_SCALE_VOLT, 2, 2, lastVoltageValue)
);

byte getterFunction(void) {
  byte result = lastMotionValue ? SWITCH_ON : SWITCH_OFF;
  return result;
}

void config_parameter_changed(uint8_t param, uint32_t value) {
   Serial.print("Received parameter change: ");
   Serial.print(param);
   Serial.print(" = ");
   Serial.println(value);
   if (param == 64) {
     retriggerTimeout = value;
     zunoSaveCFGParam(64, retriggerTimeout);
   }
   if (param == 65) {
     lightAutoOffTimeout = value;
     zunoSaveCFGParam(65, lightAutoOffTimeout);
   }
}

void setup() {
  Serial.begin(115200);
  Serial.println("Booting!");
  retriggerTimeout = zunoLoadCFGParam(64);
  lightAutoOffTimeout  = zunoLoadCFGParam(65);

  if (retriggerTimeout<0 || retriggerTimeout>60) {
    retriggerTimeout = 15;
    zunoSaveCFGParam(64, retriggerTimeout);
  }

  if (lightAutoOffTimeout<0 || lightAutoOffTimeout>120) {
    lightAutoOffTimeout = 0;
    zunoSaveCFGParam(65, lightAutoOffTimeout);
  }
}

unsigned long lastReport = 0;
unsigned long lastLog = 0;
unsigned long lightsSwichedOnTime = 0;

void loop() {

  unsigned long now = millis();

  if (zunoIsChannelUpdated(SWITCH_CHANNEL)) {
    if (switchValue != 0) {
      lightsSwichedOnTime = now;
    } else {
      lightsSwichedOnTime = 0;
    }
    Serial.print("Switch value: ");
    Serial.println(switchValue == 0 ? "LOW" : "HIGH");
  }

  if (switchValue != 0 && lightsSwichedOnTime>0) {
    if (now > lightsSwichedOnTime + 1000*lightAutoOffTimeout) {
      Serial.println("Switching lights off!");
      switchValue = 0;
      lightsSwichedOnTime = 0;
      zunoSendReport(SWITCH_CHANNEL);
    }
  }

  if (now > lastReport + 5000) {
    lastReport = now;

    if (switchValue != 0) {
      Serial.print("Time till auto off: ");
      unsigned long timeout = lightsSwichedOnTime + 60000*lightAutoOffTimeout - now;
      Serial.println(timeout/1000);
    }

    int value = random(100);
    if (value < 10) {
      lastVoltageValue = 300 + random(200);
      Serial.print("Battery voltage: ");
      Serial.println(lastVoltageValue / 100.0f);
      zunoSendReport(BATTERY_VOLTAGE_CHANNEL);

    }
    if (value > 80) {
      lastMotionValue = !lastMotionValue;
      Serial.print("Alarm value: ");
      Serial.println(getterFunction());
      zunoSendReport(BINARY_SENSOR_CHANNEL);
      if (lastMotionValue) {
        zunoSendToGroupSetValueCommand(CTRL_GROUP_1, SWITCH_ON);
      } else {
        zunoSendToGroupSetValueCommand(CTRL_GROUP_1, SWITCH_OFF);
      }
    }
  }

}
