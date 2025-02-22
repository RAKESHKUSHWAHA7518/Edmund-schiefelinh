import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, BookOpen, Briefcase, Library, Upload, X, LogIn, LogOut, Settings, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Auth from './Auth';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface MenuItem {
  docId: string; // Firestore document ID
  id: string;   // Menüpunkt-ID (z.B. "1", "2.1")
  title: string;
  icon: JSX.Element;
  subItems?: MenuItem[];
  order: number;
  parentId: string | null;
}

interface SidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['korrespondenzen']);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({ title: '', id: '' });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Organisiere Menüelemente in einer Baumstruktur
  const organizeMenuItems = (items: MenuItem[]): MenuItem[] => {
    const itemMap = new Map<string, MenuItem>();
    const rootItems: MenuItem[] = [];

    // Erste Runde: Erstelle alle Menüpunkte
    items.forEach(item => {
      itemMap.set(item.id, { ...item, subItems: [] });
    });

    // Zweite Runde: Baue die Hierarchie auf
    items.forEach(item => {
      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          if (!parent.subItems) {
            parent.subItems = [];
          }
          parent.subItems.push(itemMap.get(item.id)!);
          // Sortiere Unterelemente nach Reihenfolge
          parent.subItems.sort((a, b) => a.order - b.order);
        }
      } else {
        rootItems.push(itemMap.get(item.id)!);
      }
    });

    // Sortiere Hauptelemente nach Reihenfolge
    return rootItems.sort((a, b) => a.order - b.order);
  };

  // Menüelemente aus Firebase abrufen
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const q = query(collection(db, 'menu-items'), orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        const items: MenuItem[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            docId: doc.id,
            id: data.id,
            title: data.title,
            icon: getIconComponent(data.iconName || 'FolderOpen'),
            order: data.order || 0,
            parentId: data.parentId
          });
        });
        
        const organizedItems = organizeMenuItems(items);
        setMenuItems(organizedItems);
      } catch (err) {
        console.error('Fehler beim Abrufen der Menüelemente:', err);
        setError('Fehler beim Laden der Menüelemente');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen size={18} />;
      case 'Briefcase':
        return <Briefcase size={18} />;
      case 'Library':
        return <Library size={18} />;
      default:
        return <FolderOpen size={18} />;
    }
  };

  const handleLogout = async () => {
    try {
      setSignOutError(null);
      await signOut(auth);
      navigate('/');
    } catch (error: any) {
      console.error('Fehler beim Abmelden:', error);
      setSignOutError(error.message);
    }
  };

  const handleAddMenuItem = async () => {
    if (!newMenuItem.title || !newMenuItem.id) return;

    try {
      const parts = newMenuItem.id.split('.');
      const parentId = parts.length > 1 ? parts.slice(0, -1).join('.') : null;
      const order = parseInt(parts[parts.length - 1]);

      const newItem = {
        id: newMenuItem.id,
        title: newMenuItem.title,
        iconName: 'FolderOpen',
        order: order || menuItems.length + 1,
        parentId,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'menu-items'), newItem);

      // Menüelemente aktualisieren
      const q = query(collection(db, 'menu-items'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const items: MenuItem[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          docId: doc.id,
          id: data.id,
          title: data.title,
          icon: getIconComponent(data.iconName || 'FolderOpen'),
          order: data.order || 0,
          parentId: data.parentId
        });
      });

      const organizedItems = organizeMenuItems(items);
      setMenuItems(organizedItems);

      // Falls ein Unterelement hinzugefügt wurde, erweitere den übergeordneten Eintrag
      if (parentId) {
        setExpandedItems(prev => [...prev, parentId]);
      }

      setNewMenuItem({ title: '', id: '' });
      setShowAddModal(false);
    } catch (err) {
      console.error('Fehler beim Hinzufügen des Menüpunkts:', err);
      setError('Fehler beim Hinzufügen des Menüpunkts');
    }
  };

  const handleDeleteMenuItem = async (docId: string) => {
    try {
      // Element löschen
      await deleteDoc(doc(db, 'menu-items', docId));
      
      // Menüelemente aktualisieren
      const q = query(collection(db, 'menu-items'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const items: MenuItem[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          docId: doc.id,
          id: data.id,
          title: data.title,
          icon: getIconComponent(data.iconName || 'FolderOpen'),
          order: data.order || 0,
          parentId: data.parentId
        });
      });

      const organizedItems = organizeMenuItems(items);
      setMenuItems(organizedItems);
    } catch (err) {
      console.error('Fehler beim Löschen des Menüpunkts:', err);
      setError('Fehler beim Löschen des Menüpunkts');
    }
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    return (
      <div key={item.docId} className="mb-1 group">
        <div
          className={`flex items-center justify-between py-2 px-3 rounded cursor-pointer ${
            activeSection === item.id ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
          onClick={() => {
            onSectionChange(item.title);
            if (hasSubItems) {
              toggleExpand(item.id);
            }
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            {item.icon}
            <span className="text-sm">{item.title}</span>
          </div>
          <div className="flex items-center">
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMenuItem(item.docId);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 rounded-full transition-all duration-200 mr-2"
              >
                <Trash2 size={14} />
              </button>
            )}
            {hasSubItems && (
              expandedItems.includes(item.id) 
                ? <ChevronDown size={16} />
                : <ChevronRight size={16} />
            )}
          </div>
        </div>
        
        {/* Unterelemente rendern */}
        {hasSubItems && expandedItems.includes(item.id) && (
          <div className="ml-8 mt-1">
            {item.subItems!.map(subItem => renderMenuItem(subItem))}
          </div>
        )}
      </div>
    );
  };

  const isAdmin = auth.currentUser?.displayName === 'admin';

  if (loading) {
    return (
      <div className="w-64 bg-[#1a1f2c] text-white h-screen fixed left-0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full md:w-64 lg:w-64 bg-[#1a1f2c] text-white h-screen fixed left-0 overflow-y-auto flex flex-col pb-24">
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold">Edmund Schiefeling</h1>
          </div>
          
          {error && (
            <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          {/* Auth-Bereich */}
          <div className="mb-6">
            {auth.currentUser ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Angemeldet als:
                  <br />
                  <span className="text-white">{auth.currentUser.email}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Rolle: <span className="text-white">{auth.currentUser.displayName || 'Benutzer'}</span>
                </p>
                {signOutError && (
                  <p className="text-sm text-red-400 mt-1">{signOutError}</p>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  <span>Abmelden</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <LogIn size={18} />
                <span>Anmelden</span>
              </button>
            )}
          </div>

          {/* Menüpunkt hinzufügen Button */}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors mb-4"
            >
              <Plus size={18} />
              <span>Menüpunkt hinzufügen</span>
            </button>
          )}

          <nav className="flex-1">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </div>

        {/* Nur für Admin: weitere Buttons */}
        {isAdmin && (
          <div className="p-4 space-y-2 border-t border-gray-700">
            <button
              onClick={() => navigate('/upload')}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              <Upload size={18} />
              <span>Dokument hochladen</span>
            </button>
            <button
              onClick={() => navigate('/manage')}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              <Settings size={18} />
              <span>Dokumente verwalten</span>
            </button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 mt-16 sm:mt-0">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Anmelden</h2>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <Auth onSuccess={() => setShowAuthModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Menüpunkt hinzufügen Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 mt-16 sm:mt-0">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Menüpunkt hinzufügen</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menüpunkt-Titel
                </label>
                <input
                  type="text"
                  value={newMenuItem.title}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Menüpunkt-Titel eingeben"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menüpunkt-ID
                </label>
                <input
                  type="text"
                  value={newMenuItem.id}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Menüpunkt-ID eingeben (z.B. 1, 2.1, 1.3)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Verwende das Format wie "1" für Hauptelemente, "2.1" für Unterelemente von Element 2
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAddMenuItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Hinzufügen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
