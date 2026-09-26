#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// AquaSafeAI API Endpoint
const char* serverName = "http://YOUR_SERVER_IP:8000/api/v1/ingest/readings";

// Device Configuration
const char* deviceUid = "ESP32-WATER-01";
const char* sourceId = "source-a";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi network.");
}

void loop() {
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // Read real sensors here. For this example, we mock values.
    float ph = 7.2;
    float turbidity = 2.5;
    float tds = 320.0;
    float conductivity = 490.0;
    float temperature = 28.5;

    // Build JSON Payload
    StaticJsonDocument<512> doc;
    doc["event_id"] = String(random(1000000, 9999999)); // Simplified UUID
    doc["device_uid"] = deviceUid;
    doc["source_id"] = sourceId;
    doc["timestamp"] = "2026-09-11T12:00:00Z"; // In production, sync time via NTP
    doc["data_source"] = "DEVICE";

    JsonObject readings = doc.createNestedObject("readings");
    readings["ph"] = ph;
    readings["turbidity"] = turbidity;
    readings["tds"] = tds;
    readings["conductivity"] = conductivity;
    readings["temperature"] = temperature;

    String requestBody;
    serializeJson(doc, requestBody);

    // Send HTTP POST
    int httpResponseCode = http.POST(requestBody);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String payload = http.getString();
      Serial.println(payload);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }

  // Send reading every 5 minutes
  delay(300000); 
}
