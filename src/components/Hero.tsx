'use client'
import { useEffect, useState } from 'react'

export default function Hero({ images, title, sub }: { images: string[]; title: string; sub: string }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (images.length < 2) return
    const t = setInterval(() => setI((x) => (x + 1) % images.length), 6000)
    return () => clearInterval(t)
  }, [images.length])
  const [first, ...rest] = title.split('. ')
  return (
    <section className="hero" id="hero">
      {images.map((src, k) => (
        <div key={src + k} className={'slide' + (k === i ? ' on' : '')}>
          <img src={src} alt="Banda New Jazz em apresentação ao vivo" loading={k === 0 ? 'eager' : 'lazy'} />
        </div>
      ))}
      <div className="hc">
        <h1>{rest.length ? <>{first}.<br />{rest.join('. ')}</> : title}</h1>
        <p>{sub}</p>
        <a className="btn" href="#orcamento">Pedir orçamento</a> <a className="btn o" href="#video">Ouvir a banda</a>
      </div>
      <div className="dots">
        {images.map((_, k) => <button key={k} className={k === i ? 'on' : ''} aria-label={`Imagem ${k + 1}`} onClick={() => setI(k)} />)}
      </div>
    </section>
  )
}
