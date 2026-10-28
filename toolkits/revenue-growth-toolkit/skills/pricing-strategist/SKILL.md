# Pricing Strategist Skill — Multi-Tool Reference (B2B / B2C)

## Purpose

This skill helps pick a **pricing model**, validate willingness-to-pay (Van
Westendorp PSM), and design Good/Better/Best packaging. It emits a **model and a
range** — never a single number (the human owns the final price).

## Capabilities

- **Model picker**: score subscription / usage / value / freemium / hybrid by fit
- **WTP analyzer**: Van Westendorp PSM on survey data → Range of Acceptable Prices
- **Packaging designer**: Good/Better/Best tiers with anti-pattern detection (decoy tier, feature dump, no upgrade trigger)

## Scripts (stdlib)

- `scripts/pricing_model_picker.py`
- `scripts/wtp_analyzer.py`
- `scripts/packaging_designer.py`

> ⚠️ These three scripts are the **documented surface** from the reference skill
> (alirezarezvani pricing-strategist). Implement them against the reference canon:
> Skok, Tunguz, Ramanujam, van Westendorp, ProfitWell. They are marked as pending
> implementation in `tasks.md` — do not fake them.

## Usage

Given "what should we charge / which pricing model / tier packaging", run the model
picker first, then WTP if survey data exists, then packaging. Recommend model + range.

## References

- `references/gtm-efficiency-benchmarks.md` (does pricing feed efficiency)
- Pricing canon: Skok · Tunguz · Ramanujam (*Monetizing Innovation*) · van Westendorp (1976) · ProfitWell
