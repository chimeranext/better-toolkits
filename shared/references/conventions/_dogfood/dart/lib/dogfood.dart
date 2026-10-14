/// Parsea una lectura cruda a lux. Retorna null si el sensor saturó.
double? parseLux(int raw) {
  if (raw == 0xFFFF) return null;
  return raw / 1.2;
}
