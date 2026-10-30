import { Reveal } from './reveal'
import { SectionMark } from './section-mark'
import { ScrollLine } from './scroll-line'
import { Theodolite } from './illustrations'
import { IconPlot, IconSettle, IconSurvey, IconTraverse } from './icons'

const steps = [
  {
    name: 'Survey',
    Icon: IconSurvey,
    body: 'We assess where your people and processes stand today: skills, tools, data, and appetite for risk.',
  },
  {
    name: 'Plot',
    Icon: IconPlot,
    body: 'We design the route: which programmes, for whom, in what order, and how progress will be measured.',
  },
  {
    name: 'Traverse',
    Icon: IconTraverse,
    body: 'We deliver alongside your teams through workshops, labs, coaching and advisory sprints.',
  },
  {
    name: 'Settle',
    Icon: IconSettle,
    body: 'We embed the change with policies, internal champions and refreshers, then report what actually improved.',
  },
]

// Static offsets give the row a ridgeline rather than a flat shelf.
const lift = ['lg:mt-0', 'lg:mt-20', 'lg:mt-8', 'lg:mt-28']

export function Method() {
  return (
    <section id="method" aria-labelledby="method-title" className="on-pine relative mt-16 bg-pine text-paper lg:mt-24">
      <Theodolite className="pointer-events-none absolute -top-24 right-2 h-56 w-48 text-sage sm:right-10 sm:h-72 sm:w-60 lg:-top-32 lg:right-[2%] lg:h-[23rem] lg:w-[19rem] xl:right-[5%]" />

      <div className="wrap relative py-24 lg:py-40">
        <div className="grid grid-cols-12 gap-x-6">
          <SectionMark sheet="04" title="Method" tone="pine" className="col-span-12 lg:col-span-3" />
          <Reveal className="col-span-12 mt-8 lg:col-span-8 lg:mt-0">
            <h2 id="method-title" className="display text-display-lg max-w-[14ch]">
              Survey. Plot. Traverse. <em className="text-signal">Settle.</em>
            </h2>
            <p className="mt-8 max-w-[46ch] text-lede text-sage">
              Every engagement follows the same four bearings, scaled to the size of your organisation and the
              distance you need to cover.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-20 lg:mt-28">
          <ScrollLine
            axis="x"
            track="var(--pine-700)"
            className="absolute inset-x-0 top-[22px] hidden lg:block"
            offset={['start 85%', 'end 55%']}
          />
          <ol className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ name, Icon, body }, i) => (
            <Reveal as="li" key={name} delay={i * 0.1} className="relative">
              <div className="flex items-center gap-4">
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-signal bg-pine">
                  <span className="label text-signal">0{i + 1}</span>
                </span>
                <span className="h-px flex-1 bg-pine-700 lg:hidden" aria-hidden="true" />
              </div>
              <div className={lift[i]}>
                <Icon className="mt-8 h-12 w-12 text-paper" />
                <h3 className="display mt-5 text-[2rem] leading-none">{name}</h3>
                <p className="mt-4 max-w-[34ch] text-paper/80">{body}</p>
              </div>
            </Reveal>
          ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
