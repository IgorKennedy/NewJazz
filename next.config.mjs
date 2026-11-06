const r = (s, d) => ({ source: s, destination: d, permanent: true })
export default {
  reactStrictMode: true,
  // Redirecionamentos 301 das páginas antigas do Google Sites (confira as URLs reais antes de trocar o domínio)
  async redirects() {
    return [r('/quem-somos', '/#sobre'), r('/formatos-de-shows', '/#formatos'), r('/casamentos', '/#formatos'), r('/contato', '/#orcamento'), r('/orcamento', '/#orcamento'), r('/feedbacks', '/')]
  },
}
