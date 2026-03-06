

# Fix Final CTA Section Green Gradient

The final CTA section uses a hardcoded `hsl(175,55%,30%)` (teal-ish green) in the `via` stop, which clashes with the page's Nigerian Green palette (`--accent: 145 60% 38%` and `--primary: 215 65% 25%`).

## Change

**File: `src/pages/Index.tsx` line 183**

Replace the gradient from:
```
bg-gradient-to-br from-primary via-[hsl(175,55%,30%)] to-accent
```
To:
```
bg-gradient-to-br from-primary via-[hsl(160,50%,28%)] to-accent
```

This shifts the `via` color from a teal (175°) closer to the accent green (145°), creating a smoother blend between the Adire indigo blue (`--primary`) and Nigerian green (`--accent`).

