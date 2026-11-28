// Plays each exercise video while it is on screen and pauses it when it leaves. The videos have
// `preload="none"` and no `autoplay` attribute, so a video downloads only when it first plays: the
// ones further down the page and in the other tabs cost no data until they are seen. Without this
// script the page still works: the thumbnail shows and a tap on the video plays it.
//
// `html.ts` inlines the source of this function with `toString()` (Node has already stripped the
// types), so it runs in the browser and must not use anything from outside its own body.
export function autoplay(): void {
  if (!('IntersectionObserver' in window)) return
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const { target, isIntersecting } of entradas) {
        if (!(target instanceof HTMLVideoElement)) continue
        // A muted, inline video may play without a tap; where the browser still refuses (iOS Low
        // Power Mode), the thumbnail and the controls stay.
        if (isIntersecting) target.play().catch(() => undefined)
        else target.pause()
      }
    },
    // Half of the video in view. A video in a hidden tab never intersects.
    { threshold: 0.5 },
  )
  for (const video of document.querySelectorAll('.item-video')) observador.observe(video)
}
