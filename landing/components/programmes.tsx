import { Reveal } from './reveal'
import { SectionMark } from './section-mark'
import { ScrollLine } from './scroll-line'
import { ButtonLink } from './button-link'
import { IconAdoption, IconConsulting, IconLiteracy, IconUpskilling } from './icons'
import { FoldedMap } from './illustrations'
import { briefingHref } from '@/lib/site'

type Programme = {
  wp: string
  title: React.ReactNode
  plain: string
  summary: string
  Icon: (p: { className?: string }) => React.JSX.Element
  details: [string, string][]
  /** Static class so each row steps further up the slope. */
  indent: string
}

const climbing: Programme[] = [
  {
    wp: 'WP-01',
    title: (
      <>
        AI literacy <em>programmes</em>
      </>
    ),
    plain: 'AI literacy programmes',
    summary:
      'Plain-language foundations in what AI is, what it isn’t, and how to use it responsibly. The common ground every later step is built on.',
    Icon: IconLiteracy,
    details: [
      ['For', 'Everyone, from the front line to the boardroom'],
      ['Format', 'Cohort workshops and self-paced modules, with certification'],
      ['You leave with', 'A shared vocabulary and sound everyday judgement'],
    ],
    indent: 'lg:col-[2/span_8] xl:col-[2/span_7]',
  },
  {
    wp: 'WP-02',
    title: (
      <>
        Workforce <em>upskilling</em>
      </>
    ),
    plain: 'Workforce upskilling',
    summary:
      'Role-specific training that turns general awareness into confident daily practice, using the tools and workflows your teams already have.',
    Icon: IconUpskilling,
    details: [
      ['For', 'Teams, functions and departments'],
      ['Format', 'Role-based tracks, hands-on labs, practice on real work'],
      ['You leave with', 'People who use AI in their actual jobs, well'],
    ],
    indent: 'lg:col-[3/span_8] xl:col-[4/span_7]',
  },
  {
    wp: 'WP-03',
    title: (
      <>
        Structured <em>adoption</em> courses
      </>
    ),
    plain: 'Structured AI adoption courses',
    summary:
      'A staged curriculum that takes a team from first experiments to standard operating practice, with milestones, assessment and policy kept in step.',
    Icon: IconAdoption,
    details: [
      ['For', 'Organisations rolling out AI tools'],
      ['Format', 'Multi-week programme, milestones and assessments'],
      ['You leave with', 'Adoption that sticks after the trainers leave'],
    ],
    indent: 'lg:col-[4/span_8] xl:col-[6/span_7]',
  },
]

export function Programmes() {
  return (
    <section id="programmes" aria-labelledby="programmes-title" className="relative pb-24 lg:pb-28">
      <div className="wrap">
        <div className="grid grid-cols-12 gap-x-6">
          <SectionMark sheet="03" title="Programmes" className="col-span-12 lg:col-span-3" />
          <Reveal className="col-span-12 mt-8 lg:col-span-9 lg:mt-0">
            <h2 id="programmes-title" className="display text-display-lg text-pine">
              Four ways in.
              <br />
              One <em>ascent.</em>
            </h2>
          </Reveal>
          <Reveal className="col-span-12 mt-8 md:col-span-6 md:col-start-7 lg:col-span-4 lg:col-start-8 lg:mt-12" delay={0.1}>
            <p className="text-pine/80">
              Start wherever you are. Each programme stands on its own, and each is a waypoint on the same route,
              so the work you do at one carries through to the next.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-16 lg:mt-24">
          <ScrollLine className="absolute bottom-24 left-[11px] top-3 lg:left-[calc((100%-264px)/24)]" />
          <ol>

          {climbing.map((p, i) => (
            <li key={p.wp} className="group relative grid grid-cols-12 gap-x-6 pb-16 sm:pb-20 lg:pb-24">
              {/* Waypoint on the route line */}
              <div className="absolute left-0 top-1 lg:left-[calc((100%-264px)/24-11px)]" aria-hidden="true">
                <span className="relative block h-[23px] w-[23px] rounded-full border-[2.5px] border-signal bg-paper transition-colors duration-500 ease-survey group-hover:bg-signal">
                  <span className="absolute inset-[5.5px] rounded-full bg-pine" />
                </span>
              </div>

              <Reveal
                className={`col-span-12 pl-12 lg:pl-0 ${p.indent}`}
                delay={0.05}
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="label text-signal-deep">{p.wp}</p>
                    <h3 className="display text-display-md mt-3 text-pine transition-transform duration-500 ease-survey group-hover:translate-x-1.5">
                      {p.title}
                    </h3>
                  </div>
                  <p.Icon className="mt-1 h-12 w-12 shrink-0 text-pine sm:h-14 sm:w-14" />
                </div>
                <p className="mt-5 max-w-[52ch] text-[1.0625rem] leading-relaxed text-pine/80">{p.summary}</p>
                <dl className="mt-8 grid gap-x-8 gap-y-5 border-t border-paper-300 pt-6 sm:grid-cols-3">
                  {p.details.map(([k, v]) => (
                    <div key={k}>
                      <dt className="label text-moss">{k}</dt>
                      <dd className="mt-2 text-[0.9375rem] leading-snug text-pine">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
              <span className="sr-only">{i < climbing.length - 1 ? `Next: ${climbing[i + 1].plain}` : ''}</span>
            </li>
          ))}

          {/* Summit: strategic consulting, set on pine */}
          <li className="group relative">
            <div className="absolute left-0 top-14 z-10 hidden lg:left-[calc((100%-264px)/24-11px)] lg:block" aria-hidden="true">
              <svg viewBox="0 0 24 22" className="h-[23px] w-[25px]">
                <path d="M12 1.5l10.5 19h-21z" fill="var(--pine)" stroke="var(--signal)" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <Reveal className="on-pine relative overflow-hidden bg-pine text-paper lg:ml-[calc((100%-264px)/6+48px)]">
              <FoldedMap className="pointer-events-none absolute -right-28 -top-20 h-[22rem] w-[22rem] text-sage opacity-25 sm:-right-16 sm:h-[28rem] sm:w-[28rem] lg:-right-10 lg:-top-10 lg:h-[34rem] lg:w-[34rem] lg:opacity-50 xl:-right-6" />
              <div className="relative grid grid-cols-12 gap-x-6 px-6 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-20">
                <div className="col-span-12 lg:col-span-6">
                  <div className="flex items-center gap-4">
                    <IconConsulting className="h-11 w-11 text-paper" />
                    <p className="label text-signal">WP-04 / Summit</p>
                  </div>
                  <h3 className="display text-display-lg mt-5">
                    Strategic AI <em>consulting</em>
                  </h3>
                  <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-relaxed text-paper/85">
                    Advisory for leaders deciding where AI belongs in the business and how to get it there:
                    readiness assessment, use-case prioritisation, governance and a sequenced roadmap. We stay
                    alongside your team through delivery rather than handing over a slide deck.
                  </p>
                  <div className="mt-10">
                    <ButtonLink href={briefingHref} className="hover:!bg-paper hover:!text-pine">
                      Talk to an advisor
                    </ButtonLink>
                  </div>
                </div>
                <dl className="col-span-12 mt-14 grid gap-x-8 gap-y-6 border-t border-pine-700 pt-8 sm:grid-cols-3 lg:mt-20">
                  {[
                    ['For', 'Executives, boards and transformation leads'],
                    ['Format', 'Assessment, workshops and advisory sprints'],
                    ['You leave with', 'A costed AI roadmap you can defend'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="label text-sage">{k}</dt>
                      <dd className="mt-2 text-paper">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </li>
          </ol>
        </div>
      </div>
    </section>
  )
}
