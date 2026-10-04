export function Footer() {
  return (
    <footer className="plai-footer">
      <img src="/plai-logo.jpg" alt="Logo PLAI" width={102} height={40} />
      <span>Pôle Liégeois d'Accompagnement vers une École Inclusive</span>
      <p>
        Code :{' '}
        <a href="https://polyformproject.org/licenses/noncommercial/1.0.0" target="_blank" rel="noopener noreferrer">PolyForm Noncommercial 1.0.0</a>
        {' · '}Contenus :{' '}
        <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a>
        {' · '}Jean-François Beguin, jfb4plai.com
      </p>
    </footer>
  );
}
