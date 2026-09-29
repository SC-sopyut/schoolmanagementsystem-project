# Patch: resources/js/app.tsx (layout resolver)

Your `app.tsx` picks a layout from the page-name prefix (`auth/` -> AuthLayout, `settings/` ->
AppLayout + SettingsLayout, `welcome` -> none). The new pages wrap themselves in `<CouncilLayout>`,
so they must resolve to **no layout**, otherwise the starter kit's default layout wraps them a second time.

Add these prefixes to the "no layout" branch (I don't have your file, so match its exact shape):

    name.startsWith('officer/') || name.startsWith('president/') ||
    name.startsWith('student/') || name.startsWith('documents/')   ->   return null / undefined
