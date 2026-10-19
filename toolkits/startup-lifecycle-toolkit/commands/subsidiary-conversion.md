# /startup-lifecycle:subsidiary-conversion

Guide to converting a LATAM entity (e.g., Costa Rica SRL) into a wholly owned subsidiary of a US LLC/PBC.

## Audience

Founders who already have an active LATAM entity and want to convert it into a subsidiary of their US LLC/PBC.

## The problem

```
Costa Rica SRL (active, billing)
    ↓
How to convert into wholly owned subsidiary of Delaware LLC/PBC?
```

## Options

### Option 1: Statutory Conversion (Recommended)

**What it is**: Legal conversion of the SRL to a subsidiary of the US LLC.

**Steps**:
1. Create the US LLC/PBC in Delaware
2. The US LLC acquires 100% of the SRL's shares
3. The SRL becomes a wholly owned subsidiary
4. Establish MSA B2B between US LLC and SRL for services

**Advantages**:
- The SRL continues to exist (not dissolved)
- Existing contracts are maintained
- SRL employees stay

**Disadvantages**:
- Requires a lawyer in both jurisdictions
- May have tax implications in CR

### Option 2: New entity + dissolve the SRL

**What it is**: Create a new entity in Delaware and dissolve the SRL.

**Steps**:
1. Create the US LLC/PBC in Delaware
2. Transfer contracts, IP, and assets to the US LLC
3. Dissolve the SRL in CR
4. Move employees to contracts with the US LLC

**Advantages**:
- Cleaner (single entity)
- No SRL inheritance

**Disadvantages**:
- Lose existing SRL contracts
- May have dissolution costs
- Employees have to renegotiate contracts

### Option 3: Maintain both entities

**What it is**: Maintain the SRL in CR and create a US LLC that controls it.

**Steps**:
1. Create the US LLC/PBC in Delaware
2. Sign an administration agreement between US LLC and SRL
3. The US LLC administers the SRL as a subsidiary
4. Establish MSA B2B between both

**Advantages**:
- The SRL continues operating as before
- Existing contracts are maintained
- More flexibility

**Disadvantages**:
- Two entities to maintain
- More compliance costs

## Transfer pricing

When you have a US LLC and an SRL in CR, you need to establish transfer pricing for the services exchanged:

| From | To | What | How |
|------|-----|------|-----|
| SRL (CR) | US LLC (DE) | Software development | Cost-plus markup 5-10% |
| US LLC (DE) | SRL (CR) | Administrative services | Cost-plus markup 5-10% |

**Arm's-length principle**: Prices between related entities must be what unrelated entities would charge for the same services.

## MSA B2B (Master Services Agreement)

You need an MSA between the US LLC and the SRL to:

- Define what services are exchanged
- Establish transfer pricing
- Define payment conditions
- Protect IP
- Establish confidentiality

## Taxes in CR

| Tax | Impact |
|-----|--------|
| **Income tax** | The SRL continues paying taxes in CR on local income |
| **Dividend tax** | If the US LLC receives dividends from the SRL, there may be withholding |
| **Transfer pricing** | Need transfer pricing documentation if SRL and US LLC are related parties |

## References

- [`references/subsidiary-conversion/protocol.md`](../../references/subsidiary-conversion/protocol.md) — Detailed protocol
- [Cooley GO — Wholly Owned Subsidiary](https://www.cooleygo.com/documents/wholly-owned-subsidiary-incorporation-package-generator/)
- [`../entity-formation/index.md`](../entity-formation/index.md) — How to form the US LLC/PBC
