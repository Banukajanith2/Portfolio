import { cn } from "@/lib/utils";

/**
 * The blueprint grid, drawn behind one section rather than behind the page.
 *
 * It used to live in <Aurora> as a single fixed, viewport-anchored layer under
 * everything. That is gone, and the grid now belongs to three sections -
 * 02 Capabilities, 04 Archive, 06 Credentials - for two reasons:
 *
 * 1. **Two grids cannot coexist.** The ambient layer was `fixed`, so it stayed
 *    put while a section-scoped one scrolled past it. Two 72px grids drifting
 *    against each other beat into doubled lines and moiré, which is the same
 *    failure the circuit board's LAYER_GAP note describes. Painting it once,
 *    in the section, is the fix - not tuning the opacities until the
 *    interference is tolerable.
 * 2. **Alternating gives the page rhythm.** Every other section now has
 *    texture, so the plain ones read as deliberate rests instead of the whole
 *    page carrying one uniform wash nobody notices.
 *
 * The mask is the load-bearing part. Without it the grid stops dead at the
 * section boundary and the seam is more visible than the grid itself; the
 * ellipse keeps the middle at full strength and dissolves the top and bottom
 * edges into the neighbouring sections.
 *
 * **It must not carry a negative z-index, and the section's content must be
 * positioned.** `-z-10` looks like the obvious way to put a decorative layer
 * behind everything, and it renders nothing at all: a negative-z child paints
 * at step 2 of the root stacking context, while `body`'s own opaque background
 * paints at step 3 and covers it. `section` is `relative` with `z-index: auto`,
 * so it never forms a context of its own to trap the negative value. The layer
 * therefore paints at auto/0, and each section marks its `.section-container`
 * `relative` so the content lands above it.
 *
 * Server component - it is four CSS declarations and has no state.
 */
export function SectionGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 grid-backdrop",
        // Wider than the section and shorter than it, for the same reason the
        // hero's vignette is: the left and right edges must stay at full
        // strength or the grid reads as clipped, while the top and bottom have
        // to fall away well inside the box so the section boundary never shows.
        "[mask-image:radial-gradient(ellipse_120%_58%_at_50%_50%,#000_35%,transparent_100%)]",
        "[-webkit-mask-image:radial-gradient(ellipse_120%_58%_at_50%_50%,#000_35%,transparent_100%)]",
        className
      )}
    />
  );
}
