import Script from 'next/script'

const PIXEL_ID = '27097607443269654'

export default function MetaPixel() {
  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');

            // Cliques em links (WhatsApp e Instagram)
            document.addEventListener('click', function (e) {
              var a = e.target && e.target.closest ? e.target.closest('a') : null;
              if (!a || !a.href) return;
              var href = a.href.toLowerCase();
              if (href.indexOf('wa.me') > -1 || href.indexOf('whatsapp.com') > -1) {
                fbq('track', 'Contact', { content_name: 'WhatsApp' });
              } else if (href.indexOf('instagram.com') > -1) {
                fbq('trackCustom', 'ClickInstagram');
              }
            });

            // Seções vistas (uma vez por seção)
            if ('IntersectionObserver' in window) {
              var seen = {};
              var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                  var id = en.target.id;
                  if (en.isIntersecting && !seen[id]) {
                    seen[id] = true;
                    fbq('trackCustom', 'ViewSection', { section: id });
                  }
                });
              }, { threshold: 0.4 });
              document.querySelectorAll('section[id]').forEach(function (s) { io.observe(s); });
            }
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
