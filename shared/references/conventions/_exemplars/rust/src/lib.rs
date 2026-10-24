//! Sample del dogfood `rust@0.1.0`: parseo total (sin panics en el API
//! público), testeado, formateado y sin warnings de clippy.

/// Parsea una lectura cruda `u16` a lux. `None` si el sensor saturó.
#[must_use]
pub fn parse_lux(raw: u16) -> Option<f32> {
    if raw == u16::MAX {
        return None;
    }
    Some(f32::from(raw) / 1.2)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rechaza_saturado() {
        assert_eq!(parse_lux(u16::MAX), None);
    }

    #[test]
    fn escala_lineal() {
        let got = parse_lux(12).unwrap_or_default();
        assert!((got - 10.0).abs() < f32::EPSILON, "got={got}");
    }
}
