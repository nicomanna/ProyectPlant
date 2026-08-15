#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <time.h>

// ─── WiFi ───
const char* SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// ─── API ───
const char* API_URL = "http://192.168.4.1:3000/api/sensors/ingest";
const char* ESP32_INGEST_SECRET = "2af4453c44189f691feba3a2042e0eeddf50292ac033e238266c5b552ca5c36e";

// ─── Pines de sensores ───
#define SOIL_MOISTURE_PIN 34   // ADC (capacitive soil moisture)
#define LIGHT_PIN 35           // ADC (photoresistor)
#define DHT_PIN 5              // Digital (DHT22)
#define DHT_TYPE DHT22

// ─── Instancias ───
DHT dht(DHT_PIN, DHT_TYPE);
HTTPClient http;

// ─── Configuración ───
const unsigned long READING_INTERVAL = 10000; // 10 segundos
unsigned long lastReadingTime = 0;

// ─── Calibración de sensores ───
// ADC del ESP32: 0-4095 (12 bits)
// Soil moisture: 0-100% (mapeado de 0-4095 ADC)
// Light: 0-100% (mapeado de 0-4095 ADC)
const int SOIL_MOISTURE_DRY = 4095;   // ADC cuando está seco
const int SOIL_MOISTURE_WET = 1500;   // ADC cuando está mojado
const int LIGHT_DARK = 0;
const int LIGHT_BRIGHT = 4095;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n=== Plant Tamagotchi ESP32 Simulator ===");

  // Inicializar sensores
  pinMode(SOIL_MOISTURE_PIN, INPUT);
  pinMode(LIGHT_PIN, INPUT);
  dht.begin();

  // Conectar a WiFi
  Serial.printf("Conectando a WiFi: %s\n", SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi conectado");
    Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n✗ No se pudo conectar a WiFi");
  }

  // Sincronizar hora con NTP (importante para recorded_at)
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.println("Sincronizando hora...");
  time_t now = time(nullptr);
  int timeoutSeconds = 20;
  while (now < 24 * 3600 && timeoutSeconds--) {
    delay(100);
    now = time(nullptr);
  }
  Serial.printf("Hora sincronizada: %s", ctime(&now));
}

void loop() {
  unsigned long currentTime = millis();

  if (currentTime - lastReadingTime >= READING_INTERVAL) {
    lastReadingTime = currentTime;

    // Leer sensores
    int soilMoistureRaw = analogRead(SOIL_MOISTURE_PIN);
    int lightRaw = analogRead(LIGHT_PIN);
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    // Validar lecturas
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("⚠ Error al leer DHT22");
      temperature = 22.0;  // Valor por defecto
      humidity = 50.0;
    }

    // Escalar a rangos físicos (0-100%)
    float soilMoisture = mapValue(soilMoistureRaw, SOIL_MOISTURE_DRY, SOIL_MOISTURE_WET, 0, 100);
    float light = mapValue(lightRaw, LIGHT_DARK, LIGHT_BRIGHT, 0, 100);

    // Acotar valores válidos
    soilMoisture = constrain(soilMoisture, 0, 100);
    light = constrain(light, 0, 100);
    temperature = constrain(temperature, -10, 50);
    humidity = constrain(humidity, 0, 100);

    // Construir JSON
    StaticJsonDocument<256> doc;
    doc["soil_moisture"] = round(soilMoisture * 10) / 10.0;
    doc["light_level"] = round(light * 10) / 10.0;
    doc["temperature"] = round(temperature * 10) / 10.0;
    doc["humidity"] = round(humidity * 10) / 10.0;

    // recorded_at en ISO 8601
    char timestamp[30];
    formatISO8601(timestamp);
    doc["recorded_at"] = timestamp;

    // Log
    Serial.println("\n📊 Lectura:");
    Serial.printf("  Humedad suelo: %.1f%% (raw: %d)\n", soilMoisture, soilMoistureRaw);
    Serial.printf("  Luz: %.1f%% (raw: %d)\n", light, lightRaw);
    Serial.printf("  Temperatura: %.1f°C\n", temperature);
    Serial.printf("  Humedad aire: %.1f%%\n", humidity);

    // Enviar a API
    postToAPI(doc);
  }
}

float mapValue(int raw, int min_raw, int max_raw, int min_physical, int max_physical) {
  if (raw <= min_raw) return min_physical;
  if (raw >= max_raw) return max_physical;
  return min_physical + (float)(raw - min_raw) / (max_raw - min_raw) * (max_physical - min_physical);
}

void formatISO8601(char* buffer) {
  time_t now = time(nullptr);
  struct tm* timeinfo = gmtime(&now);
  strftime(buffer, 30, "%Y-%m-%dT%H:%M:%S.000Z", timeinfo);
}

void postToAPI(JsonDocument& doc) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ WiFi no conectado, abortando POST");
    return;
  }

  String payload;
  serializeJson(doc, payload);

  Serial.printf("→ POST %s\n", API_URL);

  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + ESP32_INGEST_SECRET);

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode == 201) {
    Serial.printf("✓ Lectura enviada (201 Created)\n");
    String response = http.getString();
    // Parsear respuesta (opcional)
    Serial.printf("  Respuesta: %.50s...\n", response.c_str());
  } else if (httpResponseCode == 401) {
    Serial.printf("✗ Unauthorized (401) - Secret inválido\n");
  } else if (httpResponseCode > 0) {
    Serial.printf("✗ HTTP %d: %s\n", httpResponseCode, http.getString().c_str());
  } else {
    Serial.printf("✗ Error de conexión: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}
