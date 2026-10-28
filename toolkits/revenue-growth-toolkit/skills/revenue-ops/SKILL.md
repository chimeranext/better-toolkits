# Revenue Operations Skill — Multi-Tool Reference (B2B)

## Purpose

This skill analyzes sales pipeline health, forecast accuracy, and go-to-market efficiency for SaaS/B2B revenue teams — using the Python scripts in `scripts/`.

## Capabilities

- **Pipeline analyzer** (`pipeline_analyzer.py`): coverage ratios (3-4x quota), stage conversion, velocity, aging deals, concentration risk
- **Forecast accuracy** (`forecast_accuracy_tracker.py`): MAPE, bias, weighted accuracy, rating (excellent/good/fair/poor)
- **GTM efficiency** (`gtm_efficiency_calculator.py`): Magic Number, LTV:CAC, CAC payback, burn multiple, Rule of 40, NDR
- **Benchmarks**: `references/gtm-efficiency-benchmarks.md` (Red/Yellow/Green/Elite by funding stage + vertical)

## Usage

Given "review pipeline / forecast accuracy / GTM efficiency", run the corresponding script and benchmark the output against `references/gtm-efficiency-benchmarks.md`.

## References

- `references/gtm-efficiency-benchmarks.md`
- `references/models/b2b.md`
