import { EditorWindow } from "@/components/editor/EditorWindow";
import { Reveal } from "@/components/ui/Reveal";
import { SectionGrid } from "@/components/ui/SectionGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Section 04. Replaces the dense index list that used to live in
 * OtherProjects.tsx.
 *
 * The list was a fine appendix and read as one - scanned in two seconds and
 * forgotten, with the description hidden behind a cursor-following panel that
 * touch users never saw. The editor shows all six at rest and puts the full
 * description, stack, tags and status on screen for whichever one is open.
 *
 * Everything interactive lives inside <EditorWindow>, which is the only client
 * component here; this wrapper stays a server component.
 */
export function Archive() {
  return (
    <section className="relative py-24 sm:py-32">
      <SectionGrid />

      <div className="section-container relative">
        <SectionHeading
          index="04"
          label="Archive"
          title="Everything else"
          description="Smaller builds, experiments and coursework worth keeping around. Open a folder to read one."
        />

        {/* amount 0.08 rather than the default: the window is tall enough that
            waiting for a real fraction of it to be on screen would hold the
            entrance until it is nearly past. */}
        <Reveal className="mt-12" amount={0.08} y={36}>
          <EditorWindow />
        </Reveal>
      </div>
    </section>
  );
}
