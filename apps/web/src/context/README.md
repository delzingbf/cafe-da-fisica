React contexts for app-wide state (e.g. the shopping cart). Each context has a `somethingContext.ts`
(types + `createContext`) and a `SomethingProvider.tsx`; the matching hook lives in `../hooks`.
Pure helpers (storage, data syncing) go in their own `.ts` file so they can be unit-tested.
