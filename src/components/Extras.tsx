'use client'
import { useEffect, useState } from 'react'

function addScript(src: string) { const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s) }

export default function Extras({ whatsapp, pixel, ga }: { whatsapp: string; pixel?: string | null; ga?: string | null }) {
  const [ck, setCk] = useState(false)

  function loadTracking() {
    const w = window as any
    if (pixel && !w.fbq) {
      const n: any = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []; w.fbq = w._fbq = n
      addScript('https://connect.facebook.net/en_US/fbevents.js')
      w.fbq('init', pixel); w.fbq('track', 'PageView')
    }
    if (ga && !w.gtag) {
      addScript(`https://www.googletagmanager.com/gtag/js?id=${ga}`)
      w.dataLayer = w.dataLayer || []
      w.gtag = function () { w.dataLayer.push(arguments) }
      w.gtag('js', new Date()); w.gtag('config', ga)
    }
  }

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.12 })
    document.querySelectorAll('.rv').forEach((el) => io.observe(el))
    const click = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('[data-fmt]')
      const mn = document.getElementById('mn') as HTMLInputElement | null
      if (mn && (e.target as HTMLElement).closest('.nav nav a')) mn.checked = false
      if (a) window.dispatchEvent(new CustomEvent('nj-fmt', { detail: a.getAttribute('data-fmt') }))
    }
    document.addEventListener('click', click)
    let c: string | null = null
    try { c = localStorage.getItem('nj_ck') } catch {}
    if (!c) setCk(true); else if (c === 'sim') loadTracking()
    return () => { io.disconnect(); document.removeEventListener('click', click) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function choose(v: string) { try { localStorage.setItem('nj_ck', v) } catch {} setCk(false); if (v === 'sim') loadTracking() }

  return (
    <>
      <a className="fab" href={`https://api.whatsapp.com/send/?phone=${whatsapp}&text=${encodeURIComponent('Olá, gostaria de um orçamento da New Jazz!')}`} target="_blank" rel="noopener">
        <svg className="ic"><use href="#msg" /></svg><span className="fabt">Orçamento rápido</span>
      </a>
      <div id="ck" role="dialog" aria-label="Cookies" style={{ display: ck ? 'block' : 'none' }}>
        Usamos cookies para medir o uso do site e mostrar anúncios relevantes. Você pode aceitar ou recusar.
        <div className="r"><button className="y" onClick={() => choose('sim')}>Aceitar</button><button className="n" onClick={() => choose('nao')}>Recusar</button></div>
      </div>
    </>
  )
}
