# UI Style Guide

## Overview

This site uses a dark leaderboard-first visual language with strong contrast, subtle glow, and compact information blocks. The style is clean, premium, and data-focused, not decorative.

## Visual Direction

- Base surface: near-black / zinc background.
- Accent colors: cyan for interactive and informational elements, yellow for rank 1 and progress emphasis, white and slate for neutral text.
- Card style: large rounded corners, thin borders, subtle gradients, minimal blur.
- Mood: modern, sharp, slightly futuristic, but still readable and practical.

## Core Principles

- Keep hierarchy obvious at a glance.
- Use spacing to separate sections instead of heavy visual effects.
- Let numbers and rank labels lead the layout.
- Keep the interface dense enough for data, but not cramped.
- Prefer consistency across the page over introducing new visual patterns.

## Card Pattern

Leaderboard cards should follow this structure:

1. Rank circle on the left.
2. User name and ID block next.
3. Stats in a row.
4. Discipline section on the far right.

### Card Behavior

- Top 1: yellow border and yellow emphasis.
- Top 2: silver / slate border and emphasis.
- Other ranks: dark card with subtle cyan or neutral tint.
- Hover states should be restrained, not flashy.

## Typography

- Font style: bold geometric sans with clear numeric readability.
- Titles: large, heavy, and compact.
- Labels: small, uppercase, muted.
- Numbers: large, tabular, and easy to compare.
- User names: readable first, never oversized to the point of clipping.

## Color Usage

- Cyan: controls, active states, secondary emphasis.
- Yellow: rank 1, strongest highlight, premium emphasis.
- Slate: supporting text, labels, secondary data.
- Red: only for low discipline or negative states.
- Avoid random bright colors that do not belong to the system.

## Progress Bar Pattern

- The progress bar should feel informative, not decorative.
- The bar sits below the discipline percentage when used inside leaderboard rows.
- Keep the bar shorter than the full stat column so it feels integrated.
- Use a simple fill with a clear colored track and no excessive glow.

## Responsive Rules

### Desktop

- Use a wide leaderboard row layout.
- Show all stats in a single line.
- Keep rank, name, stats, and discipline visually aligned.
- Use more horizontal space rather than stacking too much vertically.

### Mobile

- Use the same visual language as desktop.
- Reflow the layout into stacked blocks.
- Keep the same colors, borders, and emphasis rules.
- Reduce density slightly so the card stays readable on small screens.

## Interaction Rules

- Toggle states must re-render the content immediately.
- Search should filter without breaking the visual state.
- Hover and press feedback should be subtle and fast.
- Avoid hiding critical information behind overly decorative effects.

## What To Avoid

- Oversized user names that dominate the card.
- Very long progress bars that overpower the discipline column.
- Different design systems between mobile and desktop.
- Heavy glassmorphism or excessive blur.
- Weak contrast between labels and background.
- Busy borders, random shadows, or too many visual accents.

## Summary

The correct look for this site is: dark, clean, premium, data-first, with cyan/yellow accents and a strong leaderboard structure. Desktop and mobile should feel like the same product, not two different apps.
