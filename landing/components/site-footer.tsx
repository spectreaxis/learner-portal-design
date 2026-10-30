import { Wordmark } from './logo'
import { nav, site } from '@/lib/site'

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="on-pine bg-pine text-paper">
      <div className="wrap border-t border-pine-700 pb-10 pt-16 lg:pt-20">
        <div className="grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 md:col-span-5">
            <Wordmark />
            <p className="mt-6 max-w-[34ch] text-sage">
              AI competency training, advisory and consulting for organisations and individuals.
            </p>
          </div>
          <nav aria-label="Footer" className="col-span-12 sm:col-span-6 md:col-span-3 md:col-start-7">
            <p className="label text-sage">Explore</p>
            <ul className="mt-5 space-y-3">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-paper/85 hover:text-paper hover:underline hover:underline-offset-4">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="col-span-12 sm:col-span-6 md:col-span-3">
            <p className="label text-sage">Contact</p>
            <ul className="mt-5 space-y-3">
              <li>
                <a href={`mailto:${site.email}`} className="text-paper/85 hover:text-paper hover:underline hover:underline-offset-4">
                  {site.email}
                </a>
              </li>
              <li>
                <a href={site.portalUrl} className="text-paper/85 hover:text-paper hover:underline hover:underline-offset-4">
                  Learning portal
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-pine-700 pt-8 text-sage sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">© {year} {site.legalName}. All rights reserved.</p>
          <p className="label">Contour interval: one competency level</p>
        </div>
      </div>
    </footer>
  )
}
