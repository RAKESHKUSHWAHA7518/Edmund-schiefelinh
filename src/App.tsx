import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { User } from 'firebase/auth';
import { auth, db } from './firebase';
import Sidebar from './components/Sidebar';
import FileUpload from './components/FileUpload';
import DocumentViewer from './components/DocumentViewer';
import DataDisplay from './components/DataDisplay';
import EdmundSchiefeling from './components/Content';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Menu, X } from 'lucide-react';
export type Tag = { text: string; color: string; };

export type Section = {
  id: string;
  title: string;
  tags: Tag[];
};

// Alle verfügbaren Schlagwörter über alle Abschnitte
const allTags: Tag[] = [
  { text: 'BERGISCHE WACHT', color: 'text-blue-400' },
  { text: 'ENTNAZIFIZIERUNG', color: 'text-pink-500' },
  { text: 'NACHKRIEFSZEIT', color: 'text-red-500' },
  { text: 'ROBERT LEY', color: 'text-yellow-500' },
  { text: 'WILHELM RIPHAHN', color: 'text-blue-500' },
  { text: 'EDMUND SCHIEFELING', color: 'text-purple-600' },
  { text: 'HEIMATPFLEGE', color: 'text-green-600' },
  { text: 'WIEDERAUFBAU', color: 'text-yellow-400' },
  { text: 'DRUCKEREI', color: 'text-orange-400' },
  { text: 'BURGERMEISTER', color: 'text-purple-500' },
  { text: 'PRESSEFREIHEIT', color: 'text-blue-500' },
  { text: 'SAALSCHLACHT', color: 'text-red-600' },
  { text: 'VERHAFTUNG', color: 'text-red-500' },
  { text: 'KONZENTRATIONSLAGER', color: 'text-gray-600' },
  { text: 'ERSTER WELTKRIEG', color: 'text-blue-600' },
  { text: 'FLUCHT', color: 'text-yellow-600' },
  { text: 'NATIONALSOZIALISMUS', color: 'text-red-700' },
  { text: 'OBERBERGISCHER BOTE', color: 'text-blue-500' },
  { text: 'WEIMARER REPUBLIK', color: 'text-yellow-500' },
  { text: 'ZENSUR', color: 'text-gray-500' },
  { text: 'ZWEITER WELTKRIEG', color: 'text-red-600' },
  { text: 'ENGELSKIRCHEN', color: 'text-yellow-400' }
];

interface MenuItem {
  id: string;
  title: string;
  parentId: string | null;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'all',
      title: 'Alle Dokumente',
      tags: allTags
    }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Menüelemente abrufen und in Abschnitte umwandeln
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const q = query(collection(db, 'menu-items'), orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        const items: MenuItem[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: data.id,
            title: data.title,
            parentId: data.parentId
          });
        });

        // Menüelemente in Abschnitte umwandeln
        const newSections: Section[] = [
          {
            id: 'all',
            title: 'Alle Dokumente',
            tags: allTags
          }
        ];

        items.forEach(item => {
          newSections.push({
            id: item.id,
            title: item.title,
            tags: allTags
          });
        });

        setSections(newSections);
      } catch (err) {
        console.error('Error fetching menu items:', err);
      }
    };

    fetchMenuItems();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const handleSectionChange = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setIsSidebarOpen(false);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const currentSection = sections.find(s => s.title === activeSectionId) || sections[0];

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex bg-gray-100">
          {/* Mobile-Menü-Schaltfläche */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden md:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:bg-blue-700"
          >
            {isSidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Sidebar mit mobilem Overlay */}
          <div 
            className={`
              fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300
              lg:hidden md:hidden
              ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
            onClick={() => setIsSidebarOpen(false)}
          >
            <div
              className={`
                fixed inset-y-0 left-0 w-full sm:w-80 bg-[#1a1f2c] transform transition-transform duration-300 overflow-y-auto
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              `}
              onClick={e => e.stopPropagation()}
            >
              <Sidebar
                activeSection={activeSectionId}
                onSectionChange={handleSectionChange}
              />
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden md:block lg:block w-64">
            <Sidebar
              activeSection={activeSectionId}
              onSectionChange={handleSectionChange}
            />
          </div>

          {/* Hauptinhalt */}
          <div className="flex-1">
            <div className="min-h-screen flex flex-col">
              <div className="flex-1">
                <Routes>
                  <Route path="/upload" element={<FileUpload />} />
                  <Route path="/manage" element={<DataDisplay />} />
                  <Route path="/portal" element={<EdmundSchiefeling />} />
                  <Route path="/" element={
                    <div className="p-4 lg:p-8">
                      <div className="bg-white rounded-lg shadow-sm mb-8">
                        <div className="p-4 lg:p-6">
                          <h2 className="text-xl font-semibold mb-4">{currentSection.title}</h2>
                          <div className="flex flex-wrap gap-2 lg:gap-3 p-4 bg-gray-50 rounded-lg">
                            {currentSection.tags.map((tag, index) => {
                              const fontSizes = ["text-sm", "text-base", "text-lg"];
                              const rotations = ["rotate-0", "rotate-1", "-rotate-1"];
                              const opacities = ["opacity-80", "opacity-90", "opacity-100"];
                              
                              const fontSize = fontSizes[Math.floor((index * 7) % fontSizes.length)];
                              const rotation = rotations[Math.floor((index * 3) % rotations.length)];
                              const opacity = opacities[Math.floor((index * 5) % opacities.length)];
                              
                              const baseClasses = `
                                inline-block
                                ${fontSize}
                                ${rotation}
                                ${opacity}
                                ${tag.color}
                                font-medium
                                px-3
                                lg:px-10
                                py-1.5
                                rounded-md
                                cursor-pointer
                                transform
                                transition-all
                                duration-300
                                ease-in-out
                                hover:scale-110
                                hover:-translate-y-0.5
                                hover:shadow-lg
                              `;

                              const selectedClasses = selectedTags.includes(tag.text)
                                ? "ring-2 ring-blue-500 ring-offset-2 shadow-md bg-white"
                                : "hover:bg-white/80";

                              return (
                                <span
                                  key={index}
                                  className={`${baseClasses} ${selectedClasses}`}
                                  onClick={() => handleTagClick(tag.text)}
                                  style={{
                                    transform: `translate(${Math.sin(index) * 4}px, ${Math.cos(index) * 4}px)`,
                                  }}
                                >
                                  {tag.text}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <DocumentViewer 
                        sectionId={activeSectionId} 
                        selectedTags={selectedTags}
                      />
                    </div>
                  } />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
