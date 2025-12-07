# Responsive Design Quick Reference

## Fluid Sizing Patterns

### Typography

```css
font-size: clamp(min, preferred, max);

h1: clamp(1.75rem, 5vw, 2.5rem)
h2: clamp(1.25rem, 4vw, 1.75rem)
body: clamp(0.875rem, 2.5vw, 1rem)
```

### Spacing

```css
padding: clamp(1rem, 3vw, 2rem);
gap: clamp(0.75rem, 2vw, 1rem);
margin: clamp(0.5rem, 2vw, 1.5rem);
```

### Elements

```css
border-radius: clamp(8px, 1.5vw, 12px);
width: clamp(2rem, 7vw, 5rem);
```

## Grid Patterns

### Auto-fit Responsive Grid

```css
grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
```

### Flexible Columns

```css
/* Mobile first */
grid-template-columns: 1fr;

/* Tablet */
@media (min-width: 640px) {
  grid-template-columns: repeat(2, 1fr);
}

/* Desktop */
@media (min-width: 768px) {
  grid-template-columns: repeat(3, 1fr);
}
```

## Container Width Patterns

```css
/* Prevent horizontal scroll */
max-width: calc(100vw - 2rem);
max-width: min(48rem, calc(100vw - 1rem));

/* Full width with padding */
width: 100%;
padding: clamp(1rem, 3vw, 2rem);
box-sizing: border-box;
```

## Touch Target Minimum

```css
min-height: 48px;
min-width: 48px;
touch-action: manipulation;
```

## Mobile Optimizations

```css
/* Smooth iOS scrolling */
-webkit-overflow-scrolling: touch;

/* Prevent text adjustment */
-webkit-text-size-adjust: 100%;

/* Custom tap highlight */
-webkit-tap-highlight-color: rgba(53, 214, 255, 0.3);

/* Prevent text selection on buttons */
-webkit-user-select: none;
user-select: none;
```

## Performance Hints

```css
/* Animated elements */
will-change: transform;

/* Large containers */
contain: layout style paint;

/* GPU acceleration */
transform: translateZ(0);
```

## Breakpoints

```css
/* Mobile First Approach */
@media (max-width: 360px) {
  /* Very small phones */
}
@media (max-width: 639px) {
  /* Mobile */
}
@media (min-width: 640px) {
  /* Small tablet */
}
@media (min-width: 768px) {
  /* Tablet/Desktop */
}
@media (min-width: 1024px) {
  /* Desktop */
}

/* Special cases */
@media (hover: none) and (pointer: coarse) {
  /* Touch devices */
}
@media (max-height: 600px) and (orientation: landscape) {
  /* Landscape */
}
```

## Dynamic Viewport

```css
/* Better mobile browser support */
min-height: 100vh;
min-height: 100dvh; /* Modern browsers */
```

## Viewport Meta Tag

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover"
/>
```
