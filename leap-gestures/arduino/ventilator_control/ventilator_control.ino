#include <Bridge.h>
#include <BridgeClient.h>
#include <MQTTClient.h>

BridgeClient net;
MQTTClient client;

int RELAYPIN = 2;                 // LED connected to digital pin 2
boolean running = false;
String message = "";


unsigned long lastMillis = 0;

void setup() {
  Bridge.begin();
  Serial.begin(9600);

  client.begin("broker.shiftr.io", net);

  connect();

  pinMode(RELAYPIN, OUTPUT);      // sets the digital pin as output
}

void connect() {
  Serial.print("connecting...");
  while (!client.connect("arduino__ventilator", "e0b7ded5", "04f776d89819bfdb")) {
    Serial.print(".");
  }

  Serial.println("\nconnected!");

  client.subscribe("/ventilator");
  // client.unsubscribe("/example");
}

void loop() {
  client.loop();

  if(!client.connected()) {
    connect();
  }

  // publish a message roughly every second.
 if(millis() - lastMillis > 1000) {
   lastMillis = millis();

   // client.publish("/hello", "world");
 }
}

void messageReceived(String topic, String payload, char * bytes, unsigned int length) {
  Serial.print("incoming: ");
  Serial.print(topic);
  Serial.print(" - ");
  Serial.print(payload);
  Serial.println();
  // save message (payload) in string
  message = payload;
  // change lamp accordingly
  if (message == "on") {
    running = true;
    digitalWrite(RELAYPIN, HIGH);
    Serial.println("ON");
  } else if (message == "off") {
    running = false;
    digitalWrite(RELAYPIN, LOW);
    Serial.println("OFF");
  }
}
