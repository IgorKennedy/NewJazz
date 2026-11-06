import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Política de Privacidade', alternates: { canonical: '/privacidade' } }
const h2 = { fontSize: '1.4rem', margin: '28px 0 8px' }
export default function Privacidade() {
  return (
    <main className="w" style={{ padding: '120px 22px 80px', maxWidth: 760 }}>
      <h1 style={{ fontSize: '2.4rem', marginBottom: 24 }}>Política de Privacidade</h1>
      <p>Esta página explica como a New Jazz trata os dados pessoais coletados neste site, conforme a Lei Geral de Proteção de Dados (LGPD).</p>
      <h2 style={h2}>Dados coletados</h2>
      <p>Nome, WhatsApp, e-mail, data e cidade do evento e observações, informados por você no formulário de orçamento. Também usamos cookies de medição e publicidade, somente se você aceitar.</p>
      <h2 style={h2}>Finalidade</h2>
      <p>Responder ao seu pedido de orçamento, enviar propostas e, com a sua autorização, comunicar novidades e ofertas da New Jazz.</p>
      <h2 style={h2}>Seus direitos</h2>
      <p>Você pode pedir acesso, correção ou exclusão dos seus dados e retirar a autorização a qualquer momento pelo e-mail newjazz.contato@gmail.com.</p>
      <p style={{ color: 'var(--mute)', fontSize: '.9rem', marginTop: 28 }}>Texto-modelo. Recomendamos a revisão por um profissional jurídico.</p>
      <p><a className="lnk" href="/">Voltar ao site</a></p>
    </main>
  )
}
