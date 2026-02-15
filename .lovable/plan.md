
# Bring Back TypewriterEffect with Truthful Text

## Change

Re-add the `TypewriterEffect` component to the hero headline, cycling through real, truthful descriptions of what SteerSolo turns a WhatsApp business into. The effect will replace the static "professional store" text with a rotating set of honest, benefit-driven phrases.

## Typewriter Texts (all truthful)

The effect will cycle through these phrases in the gradient-colored span:

1. "professional store"
2. "trusted brand"
3. "money-making machine"
4. "customer magnet"

These are all truthful outcomes that SteerSolo delivers -- no fake metrics or inflated claims.

## Headline Structure

The headline will read:

> Turn your WhatsApp business into a **[typewriter effect]** in 10 minutes.

Where the colored, animated text cycles through the phrases above.

## File Modified

- `src/pages/Index.tsx` -- Import `TypewriterEffect`, replace the static `<span>professional store</span>` with the typewriter component using the gradient styling
