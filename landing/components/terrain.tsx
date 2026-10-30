import { Reveal } from './reveal'
import { SectionMark } from './section-mark'
import { IconFog, IconStalled, IconUneven } from './icons'

const hazards = [
  {
    Icon: IconUneven,
    title: 'Uneven literacy',
    body: 'A few enthusiasts race ahead while most colleagues stay unsure what is safe, useful or allowed.',
  },
  {
    Icon: IconStalled,
    title: 'Pilots that stall',
    body: 'Promising experiments never become everyday practice, because nobody planned the route beyond them.',
  },
  {
    Icon: IconFog,
    title: 'Risk in the fog',
    body: 'Data, accuracy and governance questions get answered by guesswork, or not at all.',
  },
]

export function Terrain() {
  return (
    <section aria-labelledby="terrain-title" className="relative pb-24 pt-28 sm:pt-36 lg:pb-40 lg:pt-48">
      <div className="wrap grid grid-cols-12 gap-x-6">
        <SectionMark sheet="02" title="The terrain" className="col-span-12 lg:col-span-3" />

        <div className="col-span-12 mt-8 lg:col-span-9 lg:mt-0">
          <Reveal>
            <h2 id="terrain-title" className="display text-display-lg max-w-[16ch] text-pine">
              The tools arrived <em>before</em> the map did.
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-9 gap-x-6 lg:mt-16">
            <Reveal className="col-span-9 md:col-span-5 md:col-start-4" delay={0.1}>
              <p className="text-lede text-pine/85">
                Most organisations now have access to capable AI. Far fewer have people who know how to use it
                well. Adoption rarely stalls on the technology. It stalls on confidence, judgement and a shared
                sense of where everyone is heading.
              </p>
            </Reveal>
          </div>

          <ul className="mt-16 border-t border-paper-300 lg:mt-24">
            {hazards.map(({ Icon, title, body }, i) => (
              <Reveal
                as="li"
                key={title}
                delay={i * 0.08}
                className="group grid grid-cols-9 items-start gap-x-6 gap-y-3 border-b border-paper-300 py-7 sm:py-8"
              >
                <span className="label col-span-2 pt-1.5 text-moss sm:col-span-1">H-0{i + 1}</span>
                <Icon className="col-span-2 h-10 w-10 text-pine transition-transform duration-500 ease-survey group-hover:-translate-y-0.5 sm:col-span-1" />
                <h3 className="display col-span-9 text-[1.625rem] leading-tight sm:col-span-3 sm:pt-0.5">{title}</h3>
                <p className="col-span-9 max-w-[38ch] text-pine/80 sm:col-span-4 sm:pt-1.5">{body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
