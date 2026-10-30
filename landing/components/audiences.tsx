import { Reveal } from './reveal'
import { SectionMark } from './section-mark'
import { ButtonLink } from './button-link'
import { Signpost } from './illustrations'
import { briefingHref, site } from '@/lib/site'

const forOrgs = [
  'Literacy programmes rolled out across every level, with completion tracking',
  'Upskilling tracks matched to roles, tools and real workflows',
  'Adoption courses paced to your rollout, with policy kept in step',
  'Board and leadership advisory on strategy, risk and governance',
]

export function Audiences() {
  return (
    <section id="who" aria-labelledby="who-title" className="relative py-24 lg:py-40">
      <div className="wrap grid grid-cols-12 gap-x-6">
        <SectionMark sheet="05" title="Who it’s for" className="col-span-12 lg:col-span-3" />

        {/* Organisations: the larger territory */}
        <div className="col-span-12 mt-8 lg:col-span-6 lg:mt-0">
          <Reveal>
            <h2 id="who-title" className="display text-display-lg text-pine">
              For <em>organisations</em>
            </h2>
            <p className="mt-8 max-w-[44ch] text-lede text-pine/85">
              Companies, public bodies and non-profits that want their people to use AI with confidence, and their
              leaders to know where it belongs.
            </p>
          </Reveal>
          <ul className="mt-12 border-t border-paper-300">
            {forOrgs.map((item, i) => (
              <Reveal as="li" key={item} delay={i * 0.06} className="group flex gap-5 border-b border-paper-300 py-5">
                <svg viewBox="0 0 28 12" className="mt-[0.45rem] h-3 w-7 shrink-0" aria-hidden="true">
                  <path
                    d="M0 6h20"
                    stroke="var(--signal-deep)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="transition-[stroke-dashoffset] duration-700 ease-survey group-hover:[stroke-dashoffset:-8]"
                  />
                  <circle cx="24" cy="6" r="3" fill="var(--pine)" />
                </svg>
                <span className="text-[1.0625rem] text-pine">{item}</span>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-10" delay={0.1}>
            <ButtonLink href={briefingHref}>Plan an organisation-wide programme</ButtonLink>
          </Reveal>
        </div>

        {/* Individuals: an offset sheet under the signpost */}
        <div className="relative col-span-12 mt-24 sm:col-span-10 sm:col-start-2 md:col-span-7 md:col-start-6 lg:col-span-3 lg:col-start-10 lg:mt-36">
          <Signpost className="relative z-0 mx-auto -mb-20 h-60 w-56 text-pine lg:-mb-24 lg:h-72 lg:w-64" />
          <Reveal className="sheet relative z-10 bg-paper-200 p-7 sm:p-8">
            <h3 className="display text-display-md text-pine">
              For <em>individuals</em>
            </h3>
            <p className="mt-5 text-pine">
              Professionals, students and the simply curious. Learn at your own pace on the Cogniwise learning
              portal, and earn a certificate for each module you complete.
            </p>
            <ButtonLink href={site.portalUrl} variant="ghost" className="mt-8 w-full justify-between border-pine/40">
              Open the learning portal
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
