#include <Bridge.h>
#include <BridgeClient.h>
#include <MQTTClient.h>

BridgeClient net;
MQTTClient client;

int LED = 9;           // the PWM pin the LED is attached to
int brightness = 100;  // how bright the LED is
boolean running = false;
String message = "";


unsigned long lastMillis = 0;

void setup() {
  Bridge.begin();
  Serial.begin(9600);

  client.begin("broker.shiftr.io", net);

  connect();

  pinMode(LED, OUTPUT);      // sets the digital pin as output
}

void connect() {
  Serial.print("connecting...");
  while (!client.connect("arduino__led-lamp", "e0b7ded5", "04f776d89819bfdb")) {
    Serial.print(".");
  }

  Serial.println("\nconnected!");

  client.subscribe("/radio");
  // client.unsubscribe("/example");
}

void loop() {
  client.loop();

  if (!client.connected()) {
    connect();
  }

  // publish a message roughly every second.
// if (millis() - lastMillis > 1000) {
//   lastMillis = millis();
//
//   // client.publish("/hello", "world");
// }

  // set the brightness of pin 9:
  analogWrite(LED, brightness);
}

void messageReceived(String topic, String payload, char * bytes, unsigned int length) {
  Serial.print("incoming: ");
  Serial.print(topic);
  Serial.print(" - ");
  Serial.print(payload);
  Serial.println();
  // save message (payload) in string
  message = payload;

  if (message == "volume up") {
    if (brightness < 180) {
      brightness += 5;  // increment by 5
    }
    Serial.println("volume up: ");
    Serial.print(brightness);
  } 
  
  else if (message == "volume down") {
    if (brightness > 0) {
      brightness -= 5;  // decrement by 5
    }
    Serial.println("volume down: ");
    Serial.print(brightness);
  }
}







