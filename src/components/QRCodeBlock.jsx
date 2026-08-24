import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function QRCodeBlock({ url }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, {
      width: 240,
      margin: 1,
      color: { dark: '#0a9370', light: '#ffffff' },
    }).then((data) => {
      if (!cancelled) setDataUrl(data);
    }).catch(() => {
      if (!cancelled) setError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) {
    return (
      <div className="plai-card" style={{ textAlign: 'center' }}>
        <p className="plai-empty">QR code indisponible — utilisez le lien ci-dessous</p>
        <p style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '1.1rem' }}>{url}</p>
      </div>
    );
  }

  if (!dataUrl) {
    return <div className="plai-empty">Génération du QR code…</div>;
  }

  return (
    <div className="plai-card" style={{ textAlign: 'center' }}>
      <img src={dataUrl} alt={`QR code pour rejoindre la session : ${url}`} width={240} height={240} />
      <p style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '1.1rem' }}>{url}</p>
    </div>
  );
}
