import React from 'react';
import { PlusSquare, BarChart3, List, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavItemProps {
  to: string;
  id: string;
  icon: LucideIcon;
  label: string;
  activeTab: string;
  onNavigate: (to: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, id, icon: Icon, label, activeTab, onNavigate }) => {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={() => onNavigate(to)}
      className={`nav-tab ${isActive ? 'nav-tab-active' : ''}`}
    >
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className={`nav-label ${isActive ? 'nav-label-active' : ''}`}>{label}</span>
    </button>
  );
};

const BottomNavigation: React.FC = () => {
  const { t } = useTransactions();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = location.pathname.substring(1) || 'add';

  return (
    <nav className="bottom-nav">
      <NavItem to="/add" id="add" icon={PlusSquare} label={t('nav.add')} activeTab={activeTab} onNavigate={navigate} />
      <NavItem to="/stats" id="stats" icon={BarChart3} label={t('nav.stats')} activeTab={activeTab} onNavigate={navigate} />
      <NavItem to="/history" id="history" icon={List} label={t('nav.history')} activeTab={activeTab} onNavigate={navigate} />
      <NavItem to="/settings" id="settings" icon={Settings} label={t('nav.settings')} activeTab={activeTab} onNavigate={navigate} />
    </nav>
  );
};

export default BottomNavigation;
