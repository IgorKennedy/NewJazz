import { supabase } from '@/lib/supabase'
import { SPRITE, HEADER, FEAT, FORMATOS, SOBRE, COMO, GAL, FAQ_SEC, FOOTER, FAQ } from '@/lib/content'
import Hero from '@/components/Hero'
import LeadForm from '@/components/LeadForm'
import Extras from '@/components/Extras'

export const revalidate = 60 // agenda, vídeos e textos atualizam em até 60 segundos

const DEF = { hero_title: 'Jazz ao vivo. Para momentos que ficam.', hero_sub: 'Quarteto instrumental para casamentos, empresas e restaurantes.', whatsapp: '5511973260429', instagram: 'newjazz.oficial', hero_images: [] as string[], pdf_url: null as string | null, pixel_id: null as string | null, ga_id: null as string | null }
const H = (html: string) => ({ __html: html })
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const ytId = (u: string) => u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1]

export default async function Home() {
  const today = new Date().toISOString().slice(0, 10)
  const [s, sh, v] = await Promise.all([
    supabase.from('settings').select('*').eq('id', 1).single(),
    supabase.from('shows').select('*').eq('is_public', true).gte('show_date', today).order('show_date'),
    supabase.from('videos').select('*').order('created_at', { ascending: false }),
  ])
  const set = { ...DEF, ...(s.data || {}) }
  const hero = set.hero_images?.length ? set.hero_images : ['/img/band-1.jpg', '/img/band-2.jpg', '/img/band-3.jpg']
  const shows = sh.data || [], vids = v.data || []

  const ld = [
    { '@context': 'https://schema.org', '@type': 'MusicGroup', name: 'New Jazz', url: 'https://www.newjazzoficial.com.br/', description: 'Quarteto instrumental de jazz, MPB e clássicos internacionais para casamentos, eventos corporativos e restaurantes.', genre: ['Jazz', 'MPB'], telephone: '+55 11 97326-0429', areaServed: ['Atibaia', 'Piracaia', 'Bom Jesus dos Perdões'], sameAs: [`https://www.instagram.com/${set.instagram}`] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={H(JSON.stringify(ld).replace(/</g, '\\u003c'))} />
      <div dangerouslySetInnerHTML={H(SPRITE)} />
      <div dangerouslySetInnerHTML={H(HEADER)} />
      <main id="topo">
        <Hero images={hero} title={set.hero_title} sub={set.hero_sub} />
        <div dangerouslySetInnerHTML={H(FEAT + FORMATOS + SOBRE + COMO)} />

        <section id="agenda" style={{ background: 'var(--card)' }}>
          <div className="w">
            <h2 className="rv">Onde a New Jazz vai tocar.</h2>
            <p className="sub rv">Próximos shows abertos ao público.</p>
            <div className="agl rv">
              {shows.length ? shows.map((x: any) => {
                const [, m, d] = x.show_date.split('-')
                return (
                  <div className="ag" key={x.id}>
                    <div className="dt"><b>{d}</b><span>{MES[+m - 1]}</span></div>
                    <div><p><b>{x.title}</b></p><small>{x.city}</small></div>
                  </div>
                )
              }) : <p className="sub">Novas datas em breve. Siga a banda no Instagram.</p>}
            </div>
          </div>
        </section>

        <section id="video">
          <div className="w">
            <h2 className="rv">Veja e ouça a New Jazz.</h2>
            {vids.length > 0 && (
              <div className="vgrid rv">
                {vids.map((x: any) => {
                  const id = x.kind === 'youtube' ? ytId(x.url) : null
                  return id
                    ? <iframe key={x.id} className="vid" loading="lazy" title={x.title || 'Vídeo da New Jazz'} src={`https://www.youtube-nocookie.com/embed/${id}`} allow="encrypted-media; picture-in-picture" allowFullScreen />
                    : <video key={x.id} className="vid" controls preload="none" src={x.url} title={x.title || ''} />
                })}
              </div>
            )}
            <div dangerouslySetInnerHTML={H(GAL)} />
          </div>
        </section>

        {set.instagram && (
          <section id="instagram" style={{ background: 'var(--card)', textAlign: 'center' }}>
            <div className="w rv">
              <h2>Acompanhe no Instagram.</h2>
              <p className="sub">Bastidores, vídeos e novidades em @{set.instagram}.</p>
              <p style={{ marginTop: 28 }}><a className="btn" href={`https://www.instagram.com/${set.instagram}`} target="_blank" rel="noopener">Seguir no Instagram</a></p>
            </div>
          </section>
        )}

        {set.pdf_url && (
          <section id="repertorio" style={{ textAlign: 'center' }}>
            <div className="w rv">
              <svg className="ic" style={{ width: 40, height: 40, color: 'var(--g2)' }}><use href="#music" /></svg>
              <h2 style={{ marginTop: 14 }}>Repertório.</h2>
              <p className="sub">Jazz, MPB e clássicos internacionais. Veja a lista completa e escolha o que combina com o seu evento.</p>
              <p style={{ marginTop: 28 }}><a className="btn" href={set.pdf_url} target="_blank" rel="noopener">Ver repertório completo (PDF)</a></p>
            </div>
          </section>
        )}

        <div dangerouslySetInnerHTML={H(FAQ_SEC)} />
        <LeadForm whatsapp={set.whatsapp} />
      </main>
      <div dangerouslySetInnerHTML={H(FOOTER)} />
      <Extras whatsapp={set.whatsapp} pixel={set.pixel_id} ga={set.ga_id} />
    </>
  )
}
