// ard pw "arduino"
#include <Bridge.h>
#include <BridgeClient.h>
#include <MQTTClient.h>


BridgeClient net;
MQTTClient client;

int LED = 9;           // the PWM pin the LED is attached to
int brightness = 0;  // how bright the LED is max 145! (3V von 5V = 153 von 255)
int br_diff = 0, current_diff = 0;
int input_brightness = 100;
float incr = 0;
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

  client.subscribe("/lamp");
  // client.unsubscribe("/example");
}

void loop() {
  client.loop();

  if (!client.connected()) {
    connect();
  }

  // publish a message roughly every second.


  // as long the input brightness is not equal the current brightness
  // change value via the incr steps
  current_diff = input_brightness - brightness;
  if (abs(current_diff) >= abs(incr)) {
    brightness += incr;
    // but check that the brightness cannot go over the max or min value
    if (brightness < 0) {
      brightness = 0;
    } else if (brightness > 150) {
      brightness = 150;
    }
    
  }

//  if (millis() - lastMillis > 1000) {
//    lastMillis = millis();
//    Serial.print("current Brightness:    ");
//    Serial.println(brightness);
//    // client.publish("/hello", "world");
//   }
   
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

  if (message == "on") {
    running = true;
    brightness = 100;
    Serial.println("ON");
  } 
  
  else if (message == "off") {
    running = false;
    brightness = 0;
    Serial.println("OFF");
  }
  
  else if (message == "brighter") {
    if (brightness < 150) {
      brightness += 5;  // increment by 5
    }
    Serial.println("brighter: ");
    Serial.print(brightness);
  } 
  
  else if (message == "lessbright") {
    if (brightness > 0) {
      brightness -= 5;  // decrement by 5
    }
    Serial.println("less bright: ");
    Serial.print(brightness);
  }

  else if (message == "reset") {
    running = false;
    br_diff = 0; 
    current_diff = 0;
    brightness = 0;
    Serial.println("RESET");
  }

  else {
    // process message
   
    // Prepare the character array (the buffer) with a dynamic length
    char char_buf[message.length() + 1];
    
    // check string length
    int str_len = message.length() + 1; 
    
    message.toCharArray(char_buf, str_len);
    
    char delimiters[] = "-";
    char* valPosition;
    
    //This initializes strtok with our string to tokenize
    valPosition = strtok(char_buf, delimiters);
    // move it to the second token
    valPosition = strtok(NULL, delimiters);

    if (valPosition != NULL) {
      input_brightness = atoi(valPosition); //convert string to number

      // to smooth out brightness difference over time
      br_diff = input_brightness - brightness;
      // check if current brightness is higher or lower
     
      // lower brightness
      // and calculate step with rounding
      incr = float(br_diff) / 10;
      incr = int(incr);

      Serial.print("step :");
      Serial.println(incr);
      Serial.print("   total :");
      Serial.println(br_diff);
    }
  

  }
}
 






