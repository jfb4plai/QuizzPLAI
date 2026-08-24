import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function QRCodeBlock({ url, size = 240, compact = false }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, {
      width: size,
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
  }, [url, size]);

  if (error) {
    if (compact) return <p className="plai-empty">QR indisponible</p>;
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

  if (compact) {
    return <img src={dataUrl} alt={`QR code pour rejoindre la session : ${url}`} width={size} height={size} />;
  }

  return (
    <div className="plai-card" style={{ textAlign: 'center' }}>
      <img src={dataUrl} alt={`QR code pour rejoindre la session : ${url}`} width={size} height={size} />
      <p style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '1.1rem' }}>{url}</p>
    </div>
  );
}
