# Guidelines for cfg-web-sdk

## General

## TypeScript

-   Try to make invalid states unrepresentable

```tsx
// GOOD
interface Props {
	status: "info" | "warning" | "error";
}

// BAD
interface Props {
	isInfo: boolean;
	isWarning: boolean;
	isError: boolean;
}
```

## Styles

-   use BEM
-   use camelCase for names
-   keep low specificity
    -   Do not use id selectors
    -   Do not use html tag selectors

```css
/* GOOD */
.block__element--modifier {
	display: none;
}

/* BAD */
div.parent p.child span.specific {
	display: none;
}
```
