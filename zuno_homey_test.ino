
byte switchValue = 0;

ZUNO_SETUP_PRODUCT_ID(0x00, 0x01);
ZUNO_SETUP_BATTERY_HANDLER(my_battery_handler);

ZUNO_SETUP_CHANNELS(
  ZUNO_SWITCH_BINARY(switchValue, NULL)
);

ZUNO_SETUP_SLEEPING_MODE(ZUNO_SLEEPING_MODE_ALWAYS_AWAKE);

byte my_battery_handler() { 
  byte percents = 50 + random(50);
  return percents; 
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT); 
}

unsigned long lastReport = 0;
unsigned long lastLog = 0;
void loop() {

  unsigned long now = millis();
  
  digitalWrite(LED_PIN, switchValue == 0 ? LOW : HIGH);
  if (now > lastLog + 2000) {
    lastLog = now;
    Serial.print("Switch value: ");
    Serial.println(switchValue == 0 ? "LOW" : "HIGH");
  }
  
}
