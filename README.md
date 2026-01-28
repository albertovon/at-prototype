# Alternative Transportation Decision Model (EU261) Prototype

This prototype implements the deterministic decision model described in the spec. It accepts the questionnaire answers plus the global day/overnight flag and returns the resulting outcomes.

## Inputs

| Field | Values | When required |
| --- | --- | --- |
| `q1` | `airline`, `self`, `abandoned` | Always |
| `q2` | `yes`, `no` | Only when `q1=self` |
| `q3` | `same_day`, `next_day`, `two_plus_days`, `unknown` | Only when `q1=self` and `q2=yes` |
| `disruptionTiming` | `daytime`, `overnight` | Only when `q1=self` and `q2=yes` and `q3=next_day` |

## Outputs

The model returns a deterministic JSON object with:

- `arrivedAtFinalDestination`
- `alternativeTransportProvidedBy`
- `ticketRefund`
- `ticketRefundPlus`
- `reasonableMeasuresFulfilled`
- `scenario`

> Note: `reasonableMeasuresFulfilled` is `null` when the airline arranged the alternative, because that evaluation is deferred to the actual itinerary.

## Example usage

```bash
node decisionModel.js --q1=self --q2=yes --q3=next_day --disruptionTiming=overnight
```

Example output:

```json
{
  "arrivedAtFinalDestination": true,
  "alternativeTransportProvidedBy": "passenger",
  "ticketRefund": false,
  "ticketRefundPlus": true,
  "reasonableMeasuresFulfilled": true,
  "scenario": "self_booked_next_day_offer"
}
```

## Implementation notes

- Reasonable Measures default to `true` unless explicit airline failure is indicated.
- Missing or unknown offer timing does **not** penalize the claim.
- The model is intended to be embedded in the mid-flow claim checker.
