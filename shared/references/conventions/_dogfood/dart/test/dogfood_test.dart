import 'package:test/test.dart';

import '../lib/dogfood.dart';

void main() {
  test('rechaza saturado', () {
    expect(parseLux(0xFFFF), isNull);
  });
  test('escala lineal', () {
    expect(parseLux(12), closeTo(10.0, 1e-9));
  });
}
