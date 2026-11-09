'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const OPTS: Record<string, { l: string; i: string[]; h: string }> = {
  'Cerimônia': { l: 'Só a cerimônia ou com recepção?', i: ['Só a cerimônia', 'Cerimônia + recepção'], h: 'A banda acompanha a cerimônia pelo tempo que ela durar. Quer um instrumento adicional, como teclado? Consulte a disponibilidade nas observações.' },
  'Pocket': { l: 'Quanto tempo de apresentação?', i: ['1 hora', '2 horas', '3 horas'], h: '' },
  'Corporativo': { l: 'Quanto tempo de apresentação?', i: ['1 hora', '2 horas', '3 horas'], h: '' },
}

export default function LeadForm({ whatsapp }: { whatsapp: string }) {
  const [fmt, setFmt] = useState(''), [opt, setOpt] = useState('')
  const [f, setF] = useState({ name: '', zap: '', email: '', date: '', city: '', notes: '' })
  const [ok, setOk] = useState(false), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  useEffect(() => {
    const h = (e: any) => { setFmt(e.detail); setOpt('') }
    window.addEventListener('nj-fmt', h)
    return () => window.removeEventListener('nj-fmt', h)
  }, [])

  async function send() {
    const z = f.zap.replace(/\D/g, '')
    if (!fmt) return setErr('Escolha o formato do evento.')
    if (!opt) return setErr('Escolha uma opção do formato.')
    if (!f.name.trim()) return setErr('Digite seu nome.')
    if (z.length < 10) return setErr('Digite seu WhatsApp com DDD.')
    if (!ok) return setErr('Marque a autorização de contato para continuar.')
    setErr(''); setBusy(true)
    const { error } = await supabase.from('leads').insert({ name: f.name.trim(), whatsapp: f.zap, email: f.email || null, format: fmt, option: opt, event_date: f.date || null, city: f.city || null, notes: f.notes || null, consent: true })
    if (error) console.error(error)
    const w = window as any
    w.fbq?.('track', 'Lead'); w.gtag?.('event', 'generate_lead')
    const d = f.date ? f.date.split('-').reverse().join('/') : 'a definir'
    const msg = `Olá, sou ${f.name.trim()} e gostaria de um orçamento da New Jazz.\nFormato: ${fmt} (${opt})\nData: ${d}\nCidade: ${f.city || 'a definir'}${f.email ? '\nE-mail: ' + f.email : ''}${f.notes ? '\nObservações: ' + f.notes : ''}`
    window.location.href = `https://api.whatsapp.com/send/?phone=${whatsapp}&text=${encodeURIComponent(msg)}`
  }

  return (
    <section id="orcamento" style={{ background: 'var(--card)' }}>
      <div className="w">
        <h2 className="rv">Peça seu orçamento.</h2>
        <p className="sub rv">Menos de um minuto. Ao enviar, o WhatsApp abre com a sua mensagem pronta.</p>
        <div className="fb rv">
          <fieldset>
            <legend>Qual é o formato?</legend>
            <div className="chips">
              {Object.keys(OPTS).map((k) => (
                <span key={k}><input type="radio" name="fmt" id={'f' + k} checked={fmt === k} onChange={() => { setFmt(k); setOpt('') }} /><label htmlFor={'f' + k}>{k}</label></span>
              ))}
            </div>
          </fieldset>
          {fmt && (
            <fieldset>
              <legend>{OPTS[fmt].l}</legend>
              <div className="chips">
                {OPTS[fmt].i.map((t) => (
                  <span key={t}><input type="radio" name="opt" id={'o' + t} checked={opt === t} onChange={() => setOpt(t)} /><label htmlFor={'o' + t}>{t}</label></span>
                ))}
              </div>
              {OPTS[fmt].h && <p className="hint">{OPTS[fmt].h}</p>}
            </fieldset>
          )}
          <fieldset>
            <legend>Seus dados</legend>
            <div className="g2 f">
              <div><label className="t" htmlFor="nome">Nome</label><input id="nome" autoComplete="name" value={f.name} onChange={set('name')} /></div>
              <div><label className="t" htmlFor="zap">WhatsApp com DDD</label><input id="zap" type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 90000-0000" value={f.zap} onChange={set('zap')} /></div>
              <div><label className="t" htmlFor="mail">E-mail</label><input id="mail" type="email" autoComplete="email" value={f.email} onChange={set('email')} /></div>
              <div><label className="t" htmlFor="data">Data do evento</label><input id="data" type="date" value={f.date} onChange={set('date')} /></div>
              <div><label className="t" htmlFor="cid">Cidade do evento</label><input id="cid" value={f.city} onChange={set('city')} /></div>
              <div style={{ gridColumn: '1/-1' }}><label className="t" htmlFor="obs">Observações (opcional)</label><textarea id="obs" rows={3} placeholder="Local, número de convidados, pedidos especiais..." value={f.notes} onChange={set('notes')} /></div>
            </div>
          </fieldset>
          <label className="check"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /><span>Autorizo a New Jazz a entrar em contato e a usar meus dados para enviar propostas e novidades, conforme a <a href="/privacidade" style={{ textDecoration: 'underline' }}>Política de Privacidade</a>.</span></label>
          <button className="btn wa" type="button" onClick={send} disabled={busy}>{busy ? 'Enviando...' : 'Enviar pelo WhatsApp'}</button>
          <div className="err" role="alert">{err}</div>
        </div>
      </div>
    </section>
  )
}
