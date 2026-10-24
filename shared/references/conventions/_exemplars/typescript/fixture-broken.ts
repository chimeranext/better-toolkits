// Fixture NEGATIVO (clase backtick-Heimdall, T3/L1):
// un backtick suelto termina el template y el resto es syntax error.
// El gate DEBE fallar sobre este archivo; nunca se commitea "arreglado".
export const BROKEN = `cerrado antes de tiempo` + resto_sin_declarar`;
