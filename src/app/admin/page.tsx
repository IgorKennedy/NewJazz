'use client'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Row = Record<string, any>
const ST = ['Novo', 'Enviado', 'Negociação', 'Fechado', 'Perdido']
const R = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fd = (d?: string | null) => (d ? d.split('-').reverse().join('/') : '')

async function up(file: File, folder: string) {
  const path = `${folder}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`
  const { error } = await supabase.storage.from('media').upload(path, file, { contentType: file.type })
  if (error) throw error
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}

export default function Admin() {
  const [ses, setSes] = useState<any>(null), [ready, setReady] = useState(false), [tab, setTab] = useState('dash')
  const [leads, setLeads] = useState<Row[]>([]), [shows, setShows] = useState<Row[]>([]), [vids, setVids] = useState<Row[]>([]), [set, setSet] = useState<Row>({})
  const [pre, setPre] = useState<Row | null>(null)

  const load = useCallback(async () => {
    const [a, b, c, d] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('shows').select('*').order('show_date'),
      supabase.from('videos').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('*').eq('id', 1).single(),
    ])
    setLeads(a.data || []); setShows(b.data || []); setVids(c.data || []); setSet(d.data || {})
  }, [])
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSes(data.session); setReady(true) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSes(s))
    return () => data.subscription.unsubscribe()
  }, [])
  useEffect(() => { if (ses) load() }, [ses, load])

  if (!ready) return null
  if (!ses) return <Login />
  const T = [['dash', 'Dashboard'], ['leads', 'Clientes e leads'], ['calc', 'Calculadora'], ['agenda', 'Agenda'], ['video', 'Vídeos'], ['site', 'Site e repertório']]
  return (
    <div className="adm">
      <aside>
        <b>New Jazz Manager</b>
        {T.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
        <button style={{ marginTop: 'auto' }} onClick={() => supabase.auth.signOut()}>Sair</button>
      </aside>
      <main>
        {tab === 'dash' && <Dash leads={leads} shows={shows} />}
        {tab === 'leads' && <Leads leads={leads} load={load} orcar={(l: Row) => { setPre(l); setTab('calc') }} />}
        {tab === 'calc' && <Calc pre={pre} />}
        {tab === 'agenda' && <Agenda shows={shows} load={load} />}
        {tab === 'video' && <Videos vids={vids} load={load} />}
        {tab === 'site' && <Site set={set} load={load} />}
      </main>
    </div>
  )
}

function Login() {
  const [e, setE] = useState(''), [p, setP] = useState(''), [m, setM] = useState('')
  async function go() { const { error } = await supabase.auth.signInWithPassword({ email: e, password: p }); if (error) setM('E-mail ou senha incorretos.') }
  return (
    <div className="adm login"><div className="panel">
      <h1>New Jazz Manager</h1>
      <label>E-mail</label><input type="email" value={e} onChange={(x) => setE(x.target.value)} />
      <label style={{ marginTop: 12 }}>Senha</label><input type="password" value={p} onChange={(x) => setP(x.target.value)} onKeyDown={(x) => x.key === 'Enter' && go()} />
      <button className="btn" style={{ width: '100%', marginTop: 18 }} onClick={go}>Entrar</button>
      <p className="bad note">{m}</p>
    </div></div>
  )
}

function Dash({ leads, shows }: { leads: Row[]; shows: Row[] }) {
  const today = new Date().toISOString().slice(0, 10)
  const next = shows.filter((s) => s.show_date >= today).slice(0, 6)
  const n = (s: string) => leads.filter((l) => l.status === s).length
  return (
    <>
      <h1>Dashboard</h1>
      <div className="kp"><div>Leads totais<b>{leads.length}</b></div><div>Leads novos<b>{n('Novo')}</b></div><div>Fechados<b>{n('Fechado')}</b></div><div>Próximos shows<b>{next.length}</b></div></div>
      <div className="cols2">
        <div className="panel"><h2>Próximos shows</h2>{next.length ? next.map((s) => <div className="row" key={s.id}><span>{fd(s.show_date)} · {s.title}</span><span className="note">{s.city}</span></div>) : <p className="note">Nenhum show na agenda.</p>}</div>
        <div className="panel"><h2>Funil</h2>{ST.map((s) => <div className="row" key={s}><span>{s}</span><b>{n(s)}</b></div>)}</div>
      </div>
    </>
  )
}

function Leads({ leads, load, orcar }: { leads: Row[]; load: () => void; orcar: (l: Row) => void }) {
  async function status(id: string, s: string) { await supabase.from('leads').update({ status: s }).eq('id', id); load() }
  function csv() {
    const rows = leads.filter((l) => l.consent).map((l) => [l.name, l.whatsapp, l.email || '', l.city || '', l.format || ''].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    const b = new Blob(['\ufeffNome,WhatsApp,E-mail,Cidade,Formato\n' + rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'contatos-newjazz.csv'; a.click()
  }
  return (
    <>
      <h1>Clientes e leads</h1>
      <p className="note" style={{ marginBottom: 12 }}>Pedidos de orçamento do site. O CSV traz só quem autorizou contato e serve para públicos de remarketing (Meta e Google).</p>
      <p style={{ marginBottom: 14 }}><button className="btn g s" onClick={csv}>Baixar contatos (CSV)</button></p>
      <div className="panel tw"><table>
        <thead><tr><th>Data</th><th>Cliente</th><th>WhatsApp</th><th>Formato</th><th>Evento</th><th>Cidade</th><th>Status</th><th></th></tr></thead>
        <tbody>{leads.map((l) => (
          <tr key={l.id}>
            <td>{new Date(l.created_at).toLocaleDateString('pt-BR')}</td><td>{l.name}</td><td>{l.whatsapp}</td><td>{l.format} {l.option && `(${l.option})`}</td><td>{fd(l.event_date)}</td><td>{l.city}</td>
            <td><select value={l.status} onChange={(e) => status(l.id, e.target.value)} style={{ width: 130 }}>{ST.map((s) => <option key={s}>{s}</option>)}</select></td>
            <td><button className="btn g s" onClick={() => orcar(l)}>Orçar</button></td>
          </tr>
        ))}</tbody>
      </table>{!leads.length && <p className="note">Nenhum lead ainda.</p>}</div>
    </>
  )
}

function Calc({ pre }: { pre: Row | null }) {
  const [c, setC] = useState<Row>({ name: pre?.name || '', zap: pre?.whatsapp || '', fmt: pre ? `${pre.format || ''} ${pre.option ? '(' + pre.option + ')' : ''}`.trim() : '', date: pre?.event_date || '', city: pre?.city || '', nm: '4', ca: '', ga: '100', al: '50', en: '4', ev: '100', ad: '300', so: '0', ou: '0', hx: '0', ng: '' })
  const s = (k: string) => (e: any) => setC({ ...c, [k]: e.target.value })
  const g = (k: string) => +c[k] || 0
  const C = g('nm') * (g('ca') + g('ga') + g('al')) + g('en') * g('ev') + g('ad') + g('so') + g('ou')
  const pm = C / 0.9, base = g('ng') || pm, tot = base + g('hx') * 1000, falta = pm - base
  const st = !g('ca') ? ['Defina o cachê', 'warn'] : falta > 0.005 ? ['Prejuízo', 'bad'] : base < pm * 1.05 ? ['No limite', 'warn'] : ['Viável', 'ok']
  const ind = g('ca') + g('ga') + g('al') + g('ev')

  async function pdf() {
    const { jsPDF } = await import('jspdf')
    const d = new jsPDF(); let y = 58
    d.setFillColor(0, 0, 0); d.rect(0, 0, 210, 40, 'F'); d.setTextColor(169, 187, 112); d.setFontSize(26); d.text('NEW JAZZ', 20, 26); d.setFontSize(10); d.text('Proposta comercial', 150, 26)
    d.setTextColor(30, 30, 30); d.setFontSize(11)
    const L = [['Orçamento', 'NJ-' + new Date().toISOString().slice(0, 10).replace(/-/g, '')], ['Cliente', c.name || 'Cliente'], ['Formato', c.fmt || 'Show'], ['Data do evento', fd(c.date) || 'a definir'], ['Local', c.city || 'a definir'], ['Formação', `${g('nm')} músicos (baixo, guitarra, bateria e trompete)`], ['Validade', '7 dias']]
    L.forEach(([k, v]) => { d.setFont('helvetica', 'bold'); d.text(k + ':', 20, y); d.setFont('helvetica', 'normal'); d.text(String(v), 65, y); y += 9 })
    y += 8; d.setFontSize(13); d.text('Investimento total', 20, y); d.setFontSize(22); d.text(R(tot), 20, y + 11); y += 28; d.setFontSize(10)
    ;['Condições de pagamento: 50% para reservar a data e 50% no dia do evento, antes da apresentação.', 'Hora adicional: R$ 1.000,00 por hora, sujeita à disponibilidade.', 'Mudanças de estrutura ou localização estão sujeitas a novo orçamento.'].forEach((t) => { d.text(t, 20, y); y += 7 })
    d.save(`Proposta-NewJazz-${(c.name || 'cliente').replace(/\s+/g, '-')}.pdf`)
  }
  function wa() {
    const z = String(c.zap).replace(/\D/g, ''); if (z.length < 10) return alert('Informe o WhatsApp do cliente.')
    window.open(`https://api.whatsapp.com/send/?phone=55${z.replace(/^55/, '')}&text=${encodeURIComponent(`Olá, ${c.name}! Segue a proposta da New Jazz para ${c.fmt} em ${fd(c.date) || 'data a definir'}. Valor total: ${R(tot)}. Qualquer dúvida, estou à disposição.`)}`, '_blank')
  }
  const F = (k: string, l: string, t = 'text', ph = '') => <div><label>{l}</label><input type={t} value={c[k]} onChange={s(k)} placeholder={ph} /></div>
  return (
    <>
      <h1>Calculadora de precificação</h1>
      <p className="note" style={{ marginBottom: 14 }}>Preço mínimo = custos ÷ 0,90, pois 10% do valor total vai para o caixa da banda.</p>
      <div className="cols2">
        <div>
          <div className="panel"><h2>Cliente e evento</h2><div className="fgr">{F('name', 'Nome')}{F('zap', 'WhatsApp')}{F('fmt', 'Formato')}{F('date', 'Data', 'date')}{F('city', 'Cidade')}</div></div>
          <div className="panel"><h2>Custos</h2><div className="fgr">
            {F('nm', 'Músicos', 'number')}{F('ca', 'Cachê por músico (R$)', 'number', 'defina')}{F('ga', 'Gasolina por músico', 'number')}{F('al', 'Alimentação e água', 'number')}{F('en', 'Músicos com equipamento', 'number')}{F('ev', 'Equipamento por músico', 'number')}{F('ad', 'Administração', 'number')}{F('so', 'Sonorização (terceiro)', 'number')}{F('ou', 'Pedágio e outros', 'number')}{F('hx', 'Horas extras (R$ 1.000 cada)', 'number')}{F('ng', 'Preço negociado (R$)', 'number', 'vazio = preço mínimo')}
          </div><p className="note">Cachês de 1h e 2h ainda precisam ser definidos por você; por isso o campo começa vazio.</p></div>
        </div>
        <div className="panel" style={{ alignSelf: 'start' }}>
          <h2>Resultado</h2>
          <div className="row"><span>Custo total necessário</span><b>{R(C)}</b></div>
          <div className="row"><span>Preço mínimo sustentável</span><b>{R(pm)}</b></div>
          <div className="row"><span>Preço negociado</span><b>{R(base)}</b></div>
          {g('hx') > 0 && <div className="row"><span>Horas extras</span><b>{R(g('hx') * 1000)}</b></div>}
          <div className="row"><span>Total ao cliente</span><b className="big">{R(tot)}</b></div>
          <div className="row"><span>Caixa da banda (10%)</span><b>{R(tot * 0.1)}</b></div>
          <div className="row"><span>Por músico (com equipamento)</span><b>{R(ind)}</b></div>
          <div className="row"><span>Situação</span><b className={st[1]}>{st[0]}</b></div>
          {falta > 0.005 && g('ca') > 0 && <p className="bad note">Faltam {R(falta)} para o orçamento ser viável.</p>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}><button className="btn" onClick={pdf}>Baixar PDF</button><button className="btn g" onClick={wa}>Enviar no WhatsApp</button></div>
          <p className="note" style={{ marginTop: 10 }}>O WhatsApp envia a mensagem com o valor. Anexe o PDF baixado na conversa.</p>
        </div>
      </div>
    </>
  )
}

function Agenda({ shows, load }: { shows: Row[]; load: () => void }) {
  const [f, setF] = useState({ d: '', t: '', c: '', p: '1' })
  async function add() { if (!f.d || !f.t) return; await supabase.from('shows').insert({ show_date: f.d, title: f.t, city: f.c, is_public: f.p === '1' }); setF({ d: '', t: '', c: '', p: '1' }); load() }
  async function del(id: string) { await supabase.from('shows').delete().eq('id', id); load() }
  async function tog(s: Row) { await supabase.from('shows').update({ is_public: !s.is_public }).eq('id', s.id); load() }
  return (
    <>
      <h1>Agenda</h1>
      <div className="panel"><h2>Novo show</h2>
        <div className="fgr">
          <div><label>Data</label><input type="date" value={f.d} onChange={(e) => setF({ ...f, d: e.target.value })} /></div>
          <div><label>Evento / local</label><input value={f.t} onChange={(e) => setF({ ...f, t: e.target.value })} /></div>
          <div><label>Cidade</label><input value={f.c} onChange={(e) => setF({ ...f, c: e.target.value })} /></div>
          <div><label>Exibir no site?</label><select value={f.p} onChange={(e) => setF({ ...f, p: e.target.value })}><option value="1">Sim, público</option><option value="0">Não, privado</option></select></div>
        </div><button className="btn" onClick={add}>Adicionar à agenda</button>
      </div>
      <div className="panel"><h2>Todos os shows</h2>
        {shows.map((s) => <div className="row" key={s.id}><span>{fd(s.show_date)} · {s.title} · {s.city}</span><span><button className="btn g s" onClick={() => tog(s)}>{s.is_public ? 'Público' : 'Privado'}</button> <button className="btn g s" onClick={() => del(s.id)}>Remover</button></span></div>)}
        {!shows.length && <p className="note">Agenda vazia.</p>}
        <p className="note" style={{ marginTop: 10 }}>Só shows públicos aparecem no site (data, local e cidade), em até 1 minuto.</p>
      </div>
    </>
  )
}

function Videos({ vids, load }: { vids: Row[]; load: () => void }) {
  const [t, setT] = useState(''), [u, setU] = useState(''), [msg, setMsg] = useState('')
  async function addYt() { if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(u.trim())) return setMsg('Cole um link válido do YouTube.'); await supabase.from('videos').insert({ title: t || 'Vídeo', url: u.trim(), kind: 'youtube' }); setT(''); setU(''); setMsg(''); load() }
  async function addFile(e: any) {
    const f: File = e.target.files[0]; if (!f) return; setMsg('Enviando...')
    try { const url = await up(f, 'videos'); await supabase.from('videos').insert({ title: t || f.name, url, kind: 'file' }); setMsg(''); load() } catch (x: any) { setMsg('Erro no envio: ' + x.message) }
  }
  return (
    <>
      <h1>Vídeos</h1>
      <div className="cols2">
        <div className="panel"><h2>Link do YouTube</h2><label>Título</label><input value={t} onChange={(e) => setT(e.target.value)} /><label style={{ marginTop: 10 }}>Link</label><input value={u} onChange={(e) => setU(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." /><button className="btn" style={{ marginTop: 14 }} onClick={addYt}>Publicar no site</button></div>
        <div className="panel"><h2>Enviar arquivo de vídeo</h2><input type="file" accept="video/*" onChange={addFile} /><p className="note" style={{ marginTop: 10 }}>Limite do plano gratuito do Supabase: 50 MB por arquivo. Para vídeos maiores, use o YouTube.</p></div>
      </div>
      <p className="bad note">{msg}</p>
      <div className="panel"><h2>Vídeos no site</h2>
        {vids.map((v) => <div className="row" key={v.id}><span>{v.title} <span className="note">({v.kind === 'file' ? 'arquivo' : 'YouTube'})</span></span><button className="btn g s" onClick={async () => { await supabase.from('videos').delete().eq('id', v.id); load() }}>Remover</button></div>)}
        {!vids.length && <p className="note">Nenhum vídeo ainda.</p>}
      </div>
    </>
  )
}

function Site({ set, load }: { set: Row; load: () => void }) {
  const [f, setF] = useState<Row>({}), [msg, setMsg] = useState('')
  useEffect(() => { setF({ ...set, hero_images: set.hero_images || [] }) }, [set])
  const s = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  async function img(i: number, file?: File) {
    if (!file) return; setMsg('Enviando imagem...')
    try { const url = await up(file, 'hero'); const a = [...(f.hero_images || [])]; a[i] = url; setF({ ...f, hero_images: a }); setMsg('Imagem enviada. Clique em Salvar.') } catch (x: any) { setMsg('Erro: ' + x.message) }
  }
  async function pdf(file?: File) {
    if (!file) return; setMsg('Enviando PDF...')
    try { setF({ ...f, pdf_url: await up(file, 'repertorio') }); setMsg('PDF enviado. Clique em Salvar.') } catch (x: any) { setMsg('Erro: ' + x.message) }
  }
  async function save() {
    const { error } = await supabase.from('settings').update({ hero_title: f.hero_title, hero_sub: f.hero_sub, whatsapp: String(f.whatsapp || '').replace(/\D/g, ''), instagram: String(f.instagram || '').replace('@', ''), email: f.email, pixel_id: f.pixel_id || null, ga_id: f.ga_id || null, hero_images: (f.hero_images || []).filter(Boolean), pdf_url: f.pdf_url || null }).eq('id', 1)
    setMsg(error ? 'Erro ao salvar: ' + error.message : 'Salvo. O site atualiza em até 1 minuto.'); load()
  }
  return (
    <>
      <h1>Site e repertório</h1>
      <div className="panel"><h2>Banner principal</h2>
        <label>Título</label><input value={f.hero_title || ''} onChange={s('hero_title')} /><label style={{ marginTop: 10 }}>Subtítulo</label><textarea rows={2} value={f.hero_sub || ''} onChange={s('hero_sub')} />
        <h2 style={{ marginTop: 20 }}>Imagens do banner (até 3, em ordem)</h2>
        <div className="fgr">{[0, 1, 2].map((i) => <div key={i}><label>Imagem {i + 1} {f.hero_images?.[i] ? '(enviada)' : '(padrão)'}</label><input type="file" accept="image/*" onChange={(e) => img(i, e.target.files?.[0])} /></div>)}</div>
        <p className="note">Use fotos horizontais, de pelo menos 1920 × 1080. Sem imagens enviadas, o site usa as fotos padrão.</p>
      </div>
      <div className="panel"><h2>Repertório em PDF</h2><input type="file" accept="application/pdf" onChange={(e) => pdf(e.target.files?.[0])} />
        <p className="note" style={{ marginTop: 8 }}>{f.pdf_url ? <>Publicado: <a className="lnk" href={f.pdf_url} target="_blank" rel="noopener">abrir PDF</a></> : 'Nenhum PDF publicado. A seção só aparece no site quando houver um arquivo.'}</p></div>
      <div className="panel"><h2>Contatos e rastreamento</h2><div className="fgr">
        <div><label>WhatsApp (com 55)</label><input value={f.whatsapp || ''} onChange={s('whatsapp')} /></div>
        <div><label>E-mail</label><input value={f.email || ''} onChange={s('email')} /></div>
        <div><label>Instagram (sem @)</label><input value={f.instagram || ''} onChange={s('instagram')} /></div>
        <div><label>ID do Pixel da Meta</label><input value={f.pixel_id || ''} onChange={s('pixel_id')} /></div>
        <div><label>ID do Google Analytics (G-...)</label><input value={f.ga_id || ''} onChange={s('ga_id')} /></div>
      </div><p className="note">Os pixels só carregam depois que o visitante aceita os cookies.</p></div>
      <button className="btn" onClick={save}>Salvar e publicar</button> <span className="note">{msg}</span>
    </>
  )
}
