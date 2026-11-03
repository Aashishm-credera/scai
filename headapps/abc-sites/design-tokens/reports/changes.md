# Design Token Change Report

Baseline: `design-tokens/generated/baseline.json`

| Metric | Count |
|---|---|
| Baseline tokens | 2763 |
| Current tokens | 2767 |
| Unchanged | 2763 |
| 🚨 Removed (breaking) | **0** |
| ⚠️ Modified | 0 |
| ✅ Added | 4 |

## ✅ Added

<details><summary>Show new tokens</summary>

- `--abc-transition-control-duration` *(semantic)* = `90ms`
- `--abc-transition-control-duration@reduced` *(semantic)* = `0ms`
- `--abc-transition-control-easing` *(semantic)* = `0.2,0.8,0.3,1`
- `--abc-transition-control-easing@reduced` *(semantic)* = `0,0,1,1`

</details>

## Recommended action

1. Bump **MINOR**.
2. Run `npm run tokens:baseline`. It writes the CHANGELOG.md entry automatically.
