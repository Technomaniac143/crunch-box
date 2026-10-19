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

## Kitchen data boundaries

- Define kitchen context and its consumer hook in a component-free module so provider hot updates preserve the same context identity across split routes.
- Keep orders behind KitchenOrderService; until a live adapter is connected, disabling demo means an empty queue, not a live connection.
- Restore the browser-local demo choice after hydration; start/clear controls only reset in-memory sample orders and simulation timers, never database menu or auth records.
- Use environment-configured generated clients for the current Cloud integration; own-database deployment requirements belong in KITCHEN_HANDOFF.md, not hardcoded keys.
- Persist delivery fee through the Cloud delivery settings service with database-enforced admin-only writes; the order adapter applies it only to newly generated orders, leaving existing totals intact.
