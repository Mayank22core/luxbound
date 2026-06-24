interface MainMenuProps {
  onStart: () => void;
  onSettings: () => void;
}

export function MainMenu({ onStart, onSettings }: MainMenuProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, rgba(30,0,50,0.9) 0%, rgba(5,0,10,0.98) 100%)',
        fontFamily: '"Courier New", monospace',
        color: '#fff',
        zIndex: 20,
      }}
    >
      <h1
        style={{
          fontSize: '48px',
          fontWeight: 'bold',
          letterSpacing: '8px',
          textTransform: 'uppercase',
          color: '#8b0000',
          textShadow: '0 0 20px #8b0000, 0 0 40px #440000',
          marginBottom: '8px',
        }}
      >
        LUXBOUND
      </h1>
      <p
        style={{
          fontSize: '14px',
          letterSpacing: '6px',
          textTransform: 'uppercase',
          color: '#7b2fff',
          textShadow: '0 0 10px #7b2fff',
          marginBottom: '60px',
        }}
      >
        Vampire Escape
      </p>

      <button
        onClick={onStart}
        style={{
          width: '220px',
          padding: '14px 24px',
          marginBottom: '16px',
          background: 'transparent',
          border: '1px solid #8b0000',
          color: '#8b0000',
          fontSize: '14px',
          fontFamily: '"Courier New", monospace',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#8b0000';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.boxShadow = '0 0 20px #8b0000';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#8b0000';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Enter Dungeon
      </button>

      <button
        onClick={onSettings}
        style={{
          width: '220px',
          padding: '14px 24px',
          background: 'transparent',
          border: '1px solid #333',
          color: '#666',
          fontSize: '14px',
          fontFamily: '"Courier New", monospace',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#7b2fff';
          e.currentTarget.style.color = '#7b2fff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#333';
          e.currentTarget.style.color = '#666';
        }}
      >
        Settings
      </button>

      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '2px',
        }}
      >
        PHASE 1 BUILD
      </div>
    </div>
  );
}
