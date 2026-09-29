# Fix: register two policies explicitly (bug in the first package)

Laravel picks a policy by the class of the model you pass to `authorize()`. Two policies I
wrote in the first package take a *different* model than their name implies, so auto-discovery
misses them and those calls would fail with "This action is unauthorized" for everyone:

- `TaskPolicy::manageBoard(User, Committee)`  -> called as `authorize('manageBoard', $committee)`
- `VotePolicy::vote(User, Election, string)`  -> called as `authorize('vote', [$election, $position])`

Add to `AppServiceProvider::boot()`:

```php
use Illuminate\Support\Facades\Gate;

Gate::policy(\App\Models\Committee::class, \App\Policies\TaskPolicy::class);
Gate::policy(\App\Models\Election::class, \App\Policies\VotePolicy::class);
```

(`Task`, `Event`, `Concern`, `Document`, `DocumentFolder` are auto-discovered - no entry needed.)
