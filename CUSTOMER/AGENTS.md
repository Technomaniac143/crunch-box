<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Menu items, prices, combos live only in src/data/menu.ts and site settings/contact in src/data/site.ts — UI reads from these so prices change in one place.
- Cart is a React context persisted to localStorage (src/lib/cart.tsx); checkout is a demo that stores the order in sessionStorage — no backend until real ordering/payments are configured.
