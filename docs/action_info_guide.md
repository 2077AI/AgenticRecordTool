# ART Action Info Guide

This document describes the `action.info` payload reported by ART actions, based on the current implementation in `src/content/content.ts`.

For the overall export structure, see the [Data Format Guide](./data_format.md).

## Mouse Event Example

```ts
info: {
  clientX: e.clientX,
  clientY: e.clientY,
  pageX: e.pageX,
  pageY: e.pageY,
  layerX: e.layerX,
  layerY: e.layerY,
  screenX: e.screenX,
  screenY: e.screenY,
  altKey: e.altKey,
  offsetX: e.offsetX,
  offsetY: e.offsetY,
  shiftKey: e.shiftKey,
  metaKey: e.metaKey,
  target: {
    innerText: (e.target as HTMLElement)?.innerText?.slice(0, 10),
    className: (e.target as HTMLElement)?.className,
    xPath: getXPath(document.elementFromPoint(e.clientX, e.clientY)),
  },
}
```

## Purpose of `info`

`info` captures event context, including:

- Position data
- Modifier key states
- Target element information
- Input or keyboard data when applicable

It records the key data associated with an action.

## Field Reference

| Category | Field | Description |
| --- | --- | --- |
| Coordinates | `clientX` / `clientY` | Mouse position relative to the browser viewport, excluding page scroll offset |
| Coordinates | `pageX` / `pageY` | Mouse position relative to the full document, including page scroll offset |
| Coordinates | `screenX` / `screenY` | Mouse position relative to the screen |
| Coordinates | `offsetX` / `offsetY` | Mouse position relative to the top-left corner of the event target element |
| Coordinates | `layerX` / `layerY` | Mouse position relative to the current rendering layer (browser-dependent) |
| Modifier Keys | `altKey` | Whether the `Alt` key is pressed |
| Modifier Keys | `shiftKey` | Whether the `Shift` key is pressed |
| Modifier Keys | `metaKey` | Whether the `Meta` key is pressed; typically `Command` on macOS |
| Target Element | `target.innerText` | Target element text, truncated to the first 10 characters in the current implementation |
| Target Element | `target.className` | Target element class name, used for element identification |
| Target Element | `target.xPath` | XPath of the target element, used for element location |

## Differences Across Action Types

`info` is action-specific. In the current implementation:

- `MOUSE_DOWN`, `MOUSE_UP`: coordinates, modifier keys, and `target.innerText`, `target.className`, `target.xPath`
- `MOUSE_DRAG`: coordinates, modifier keys, and basic target fields
- `KEY_DOWN`: keyboard fields and modifier keys
- `INPUT`: input data and basic target identifiers
- `WHEEL`: mouse coordinates, modifier keys, target fields, plus `deltaX` and `deltaY`
- `CONTEXT_MENU`: mouse coordinates, modifier keys, target fields, plus `target.id` and `target.xPath`
- `RESULT_STATE`: no `info`

## Notes

- We will keep this document updated as the implementation evolves.

---

**Last Updated**: March 2026
