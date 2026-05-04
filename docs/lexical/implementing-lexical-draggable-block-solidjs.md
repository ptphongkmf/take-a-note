# Implementing Lexical Draggable Block Plugin in SolidJS

This document outlines the entire process of porting and fixing the Lexical `DraggableBlockPlugin` from React to SolidJS using the `@ryotarofr/lexical-solid` port. It details the initial problems, failed attempts, debugging steps, and the final working solution to serve as a reference for future SolidJS + Lexical integration.

## 1. The Initial Problem

The goal was to implement a Notion-like drag handle for block elements in a SolidJS-based Lexical editor. We used the reference implementation from Lexical's React playground and attempted to adapt it for `@ryotarofr/lexical-solid`.

**Initial Symptoms:**

- The draggable handle UI did not appear when hovering over text blocks.
- The drag handle component remained invisible (with `opacity: 0`).

## 2. Attempt 1: Component Structure Refactor (Failed)

**What we did:**
The initial port eagerly created JSX elements and stored them directly. We refactored `draggable-block.tsx` to follow SolidJS reactivity patterns. We created a factory function `createDraggableBlockPlugin()` that instantiated Solid signals (`anchorRef`, `menuRef`, `targetLineRef`) and returned the necessary components to be rendered conditionally.

**Why it didn't solve the core issue:**
While structurally correct for SolidJS, the drag handle still remained invisible. The menu elements were present in the DOM (verified via browser inspection), but the Lexical plugin's internal positioning logic was never triggering.

## 3. Attempt 2: Debugging DOM Hierarchy and Portal Mounting

**What we did:**
To figure out why the menu stayed invisible, we inspected the DOM tree and the plugin's source code. We checked if SolidJS's `<Portal>` was mounting the drag menu to the correct anchor container.

**What we learned:**
The `<Portal>` was actually mounting correctly inside the anchor div. The real issue lay deeper within the plugin's source code:

```javascript
// Inside LexicalDraggableBlockPlugin.jsx
function useDraggableBlockMenu(editor, anchorElem, ...) {
    const scrollerElem = anchorElem.parentElement;
    if (scrollerElem != null) {
        scrollerElem.addEventListener("mousemove", onMouseMove);
    }
}
```

If `scrollerElem` is null, the plugin silently fails to attach the mouse tracking events. This meant the code that updates the drag handle's opacity to `1` was never firing.

## 4. Attempt 3: Fixing SolidJS Ref Lifecycle with `onMount` (Failed)

**What we did:**
We realized that in SolidJS, a standard JSX `ref` assignment evaluates synchronously when the DOM node is constructed in memory, **before** it is appended to its parent. Because our plugin evaluated eagerly (the `<Show>` block was inside the plugin), it initialized while the anchor div was still floating in memory.

We tried fixing this by waiting for `onMount` to push the ref into the plugin:

```tsx
  let anchorDiv!: HTMLDivElement;
  onMount(() => {
    // Attempting to push the ref into an ALREADY RENDERED plugin
    draggableBlock.setAnchorRef(anchorDiv);
  });
```

**Why it failed:**
While `anchorDiv` was successfully created by the time `onMount` fired, it was **not yet attached to the main document body**.
Because the plugin component was *already rendered* in the tree, pushing the ref into it caused Lexical to immediately run its initialization math. At that exact microsecond, `anchorDiv.parentElement` was STILL evaluating to `null`. The plugin tried to attach events to a null parent and silently died.

## 5. Our First Working Solution: Polling for `isConnected`

**What we did:**
To guarantee that the `anchorElem` had its parent hierarchy fully established, we implemented a polling mechanism. We used `requestAnimationFrame` to wait until the DOM node was actually connected to the document before passing it to the plugin.

**The Code at the Time:**

```tsx
  let anchorDiv!: HTMLDivElement;

  onMount(() => {
    const checkParent = () => {
      if (anchorDiv && anchorDiv.isConnected) {
        draggableBlock.setAnchorRef(anchorDiv);
      } else {
        requestAnimationFrame(checkParent);
      }
    };
    checkParent();
  });
```

**Why it worked:**
It successfully forced the plugin to wait. `isConnected` only returned true when the node was fully attached to the parent document. Once connected, `anchorElem.parentElement` evaluated correctly, the `mousemove` events attached, and our drag handle finally appeared!

## 6. The Refinement Phase: Escaping the Polling Hack via Inversion of Control

**The Realization:**
While our polling loop in Step 5 technically worked, we realized it is a major anti-pattern in modern reactive frameworks. Continually querying the DOM with `requestAnimationFrame` is inefficient and brittle. It was essentially a duct-tape fix over a fundamental flaw in our component hierarchy: we were rendering the child plugin before its environment was ready, and then forcing it to wait.

Wait, but if `onMount` failed in Attempt 3 because the DOM wasn't fully attached, how do we get rid of the polling loop without breaking the app again?

The difference is **Render Deferral**. In Attempt 3, the plugin was already rendered and executing its internal logic. In our final solution, we use `onMount` to flip a Signal that controls a `<Show>` gatekeeper, preventing the plugin from existing at all until we are ready.

**The Final Refactored Solution:**
To eliminate the polling hack entirely, we gave complete control to the Parent component (`EditorInput`). We used a standard `let` variable to grab the ref, assigned it to a signal inside `onMount`, and most importantly, we moved the `<Show>` wrapper *outside* the plugin.

```tsx
export function EditorInput(props: EditorInputProps) {
  // 1. Declare standard let ref and a signal to track readiness
  let divWrapperRef: HTMLDivElement | undefined;
  const [wrapperRef, setWrapperRef] = createSignal<HTMLElement>();

  // 2. We don't pass this to the plugin! We just update a local Signal.
  onMount(() => {
    if (divWrapperRef) setWrapperRef(divWrapperRef);
  });

  return (
    <div ref={divWrapperRef} class="relative size-full">
      
      <LexicalComposer>...</LexicalComposer>

      
      
      <Show when="{wrapperRef()}">
        {(ref) => <DraggableBlockPlugin anchorRef="{ref()}"/>}
      </Show>
    </div>
  );
}
```

**Why this specific `onMount` works perfectly (and kills the polling):**
By updating a Signal inside `onMount`, we trigger a **new reactive render cycle**.

1. The parent `onMount` fires.
2. The `wrapperRef` signal updates.
3. SolidJS queues the `<Show>` block to resolve.
4. **Crucially:** By the time SolidJS actually mounts and renders the newly revealed `DraggableBlockPlugin`, the current execution thread has yielded, and the browser has successfully stitched the parent `<div>` into the main document.
5. When the plugin finally evaluates `anchorElem.parentElement`, it finds the fully attached container instantly! We fixed the lifecycle bug not by polling, but by forcing the plugin to render one "tick" later via `<Show>`.

### Key Takeaways

- **React vs Solid Lifecycles:** When porting React libraries (where `useEffect` fires after DOM paints and attachments are complete), beware of SolidJS's granular and eager DOM creation.
- **Silent Failures:** Always verify if event listeners are actually attaching. A missing `parentElement` will often cause silent failures in third-party DOM-manipulating plugins.
- **Trust the Reactive Graph:** Do not resort to `requestAnimationFrame` polling to wait for the DOM. Rely on **Inversion of Control**: let the component that physically owns the DOM elements use a Signal + `<Show>` block to guarantee child plugins receive a fully attached DOM node.
