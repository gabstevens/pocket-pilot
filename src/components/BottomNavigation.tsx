import React from 'react';
import { PlusSquare, BarChart3, List, Settings } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNavigation: React.FC = () => {
  const { t } = useTransactions();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = location.pathname.substring(1) || 'add';

  return (
    <nav style={styles.nav}>
      <button 
        onClick={() => navigate('/add')}
        style={{ 
          ...styles.tab, 
          color: activeTab === 'add' ? 'var(--primary-color)' : 'var(--text-muted)'
        }}
      >
        <PlusSquare size={24} strokeWidth={activeTab === 'add' ? 2.5 : 2} />
        <span style={{ ...styles.label, fontWeight: activeTab === 'add' ? 700 : 500 }}>{t('nav.add')}</span>
      </button>
      <button 
        onClick={() => navigate('/stats')}
        style={{ 
          ...styles.tab, 
          color: activeTab === 'stats' ? 'var(--primary-color)' : 'var(--text-muted)'
        }}
      >
        <BarChart3 size={24} strokeWidth={activeTab === 'stats' ? 2.5 : 2} />
        <span style={{ ...styles.label, fontWeight: activeTab === 'stats' ? 700 : 500 }}>{t('nav.stats')}</span>
      </button>
      <button 
        onClick={() => navigate('/history')}
        style={{ 
          ...styles.tab, 
          color: activeTab === 'history' ? 'var(--primary-color)' : 'var(--text-muted)'
        }}
      >
        <List size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
        <span style={{ ...styles.label, fontWeight: activeTab === 'history' ? 700 : 500 }}>{t('nav.history')}</span>
      </button>
      <button 
        onClick={() => navigate('/settings')}
        style={{ 
          ...styles.tab, 
          color: activeTab === 'settings' ? 'var(--primary-color)' : 'var(--text-muted)'
        }}
      >
        <Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
        <span style={{ ...styles.label, fontWeight: activeTab === 'settings' ? 700 : 500 }}>{t('nav.settings')}</span>
      </button>
    </nav>
  );
};

const styles = {
  nav: {
    height: 'var(--nav-height)',
    backgroundColor: 'var(--bg-color)',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-around',
    zIndex: 100,
    width: '100%',
    flexShrink: 0,
  },
  tab: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    border: 'none',
    padding: 0,
    gap: '4px',
    height: '100%',
    cursor: 'pointer',
    background: 'none',
  },
  label: {
    fontSize: 'clamp(8px, 2.5vw, 10px)',
  }
};

export default BottomNavigation;
