# Browser verification (rendered-output lane)

STATUS: PASS

- generated_at: 2026-10-12T17:21:31Z
- pages: PAGE-004
- viewports: 320, 480, 768, 1024, 1440
- axe-core: 4.14.0
- screenshots: 5

fail-severity findings: 0
warnings: 10

## Warnings

- [PAGE-004 @320] target_size: 4 interactive control(s) under 24px
- [PAGE-004 @320] reduced_motion: 99 element(s) declare motion under prefers-reduced-motion
- [PAGE-004 @480] target_size: 4 interactive control(s) under 24px
- [PAGE-004 @480] reduced_motion: 99 element(s) declare motion under prefers-reduced-motion
- [PAGE-004 @768] target_size: 4 interactive control(s) under 24px
- [PAGE-004 @768] reduced_motion: 99 element(s) declare motion under prefers-reduced-motion
- [PAGE-004 @1024] target_size: 4 interactive control(s) under 24px
- [PAGE-004 @1024] reduced_motion: 99 element(s) declare motion under prefers-reduced-motion
- [PAGE-004 @1440] target_size: 4 interactive control(s) under 24px
- [PAGE-004 @1440] reduced_motion: 99 element(s) declare motion under prefers-reduced-motion

## Scope note

This lane proves automated rendered criteria only. It does NOT perform
or substitute for manual accessibility review (keyboard-only operation,
VoiceOver/NVDA, 200%/400% zoom) and is not a visual-regression PASS
(which requires a reference baseline).
