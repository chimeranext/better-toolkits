# Procurement platforms per country (B2G)

| Country | Platform | URL / notes |
| --- | --- | --- |
| Costa Rica | SICOP | https://www.sicop.go.cr/ — open data dumps (CSV/JSON/ZIP) |
| México | CompraNet | https://compranet.hacienda.gob.mx/ |
| Guatemala | Guatecompras | https://guatecompras.gt/ |
| Colombia | SECOP | https://www.contratos.gov.co/ |
| Brasil | ComprasNet | https://www.gov.br/compras |
| Argentina | COMPR.AR | https://comprar.gob.ar/ |
| Chile | Mercado Público | https://www.mercadopublico.cl/ |

## Adapter pattern

Each platform publishes records in slightly different schemas. `tender_normalizer.py`
maps each source's raw fields to the normalized `Tender` model. Add a new source by
extending the `KEYS` map in that script.
