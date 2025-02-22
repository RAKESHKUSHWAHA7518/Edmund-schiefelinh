import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  X,
  Filter,
  Search,
  Calendar,
  Tag,
  Folder,
  Globe,
  Lock,
  Clock,
  Check,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Document {
  id: string;
  title: string;
  date: string;
  imageUrl?: string;
  description: string;
  section: string;
  tags: string[];
  status: 'private' | 'public' | 'in_progress';
  createdAt: Date;
}

const statusOptions = [
  {
    value: 'public',
    label: 'Öffentlich',
    icon: Globe,
    color: 'bg-green-100 text-green-700',
    description: 'Für alle Benutzer sichtbar'
  },
  {
    value: 'private',
    label: 'Privat',
    icon: Lock,
    color: 'bg-gray-200 text-gray-700',
    description: 'Nur für authentifizierte Benutzer sichtbar'
  },
  {
    value: 'in_progress',
    label: 'In Bearbeitung',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700',
    description: 'Dokument wird verarbeitet'
  }
];

const availableTags = [
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

export default function DataDisplay() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const navigate = useNavigate();

  const sections = [
    { value: 'all', label: 'Alle Abschnitte' },
    { value: 'lebensdokumente', label: 'Lebensdokumente' },
    { value: 'korrespondenzen', label: 'Korrespondenzen' },
    { value: 'berufliche-dokumente', label: 'Berufliche Dokumente' },
    { value: 'werke', label: 'Werke' },
    { value: 'sammlungen', label: 'Sammlungen' }
  ];

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let q;
      if (selectedSection === 'all') {
        q = query(collection(db, 'historical-documents'), orderBy('createdAt', 'desc'));
      } else {
        q = query(
          collection(db, 'historical-documents'),
          where('section', '==', selectedSection),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const fetchedDocs: Document[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data) {
          fetchedDocs.push({
            id: docSnap.id,
            title: data.title || '',
            date: data.date || '',
            imageUrl: data.imageUrl || undefined,
            description: data.description || '',
            section: data.section || '',
            tags: Array.isArray(data.tags) ? data.tags : [],
            status: data.status || 'private',
            createdAt: data.createdAt?.toDate() || new Date()
          });
        }
      });

      setDocuments(fetchedDocs);
    } catch (err: any) {
      setError('Fehler beim Abrufen der Dokumente: ' + err.message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedSection]);

  const handleStatusChange = async (
    docId: string,
    newStatus: 'public' | 'private' | 'in_progress'
  ) => {
    setUpdatingStatus(docId);
    try {
      // Make sure you're updating the correct collection name if needed:
      const docRef = doc(db, 'historical-documents', docId);
      await updateDoc(docRef, {
        status: newStatus
      });

      setDocuments((prev) =>
        prev.map((doc) => (doc.id === docId ? { ...doc, status: newStatus } : doc))
      );
    } catch (err: any) {
      setError('Fehler beim Aktualisieren des Status: ' + err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleTagUpdate = async (docId: string, newTags: string[]) => {
    try {
      // Also ensure you update 'historical-documents' (or 'submissions') consistently
      const docRef = doc(db, 'historical-documents', docId);
      await updateDoc(docRef, {
        tags: newTags
      });

      setDocuments((prev) =>
        prev.map((doc) => (doc.id === docId ? { ...doc, tags: newTags } : doc))
      );
      setIsTagModalOpen(false);
      setEditingDocumentId(null);
    } catch (err: any) {
      setError('Fehler beim Aktualisieren der Schlagwörter: ' + err.message);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      (doc.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (doc.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 || selectedTags.every((t) => doc.tags.includes(t));
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesTags && matchesStatus;
  });

  const filteredTags = availableTags.filter((tag) =>
    tag.text.toLowerCase().includes(tagSearchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    const option = statusOptions.find((opt) => opt.value === status);
    if (!option) return null;
    const Icon = option.icon;
    return (
      <div className={`flex items-center gap-2 ${option.color} px-3 py-1.5 rounded-full`}>
        <Icon size={16} />
        <span className="text-sm font-medium">{option.label}</span>
      </div>
    );
  };

  const TagModal = ({ document }: { document: Document }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h3 className="text-lg font-semibold truncate pr-4">
            Schlagwörter bearbeiten für "{document.title}"
          </h3>
          <button
            onClick={() => {
              setIsTagModalOpen(false);
              setEditingDocumentId(null);
              setTagSearchTerm('');
            }}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Search Bar */}
          <div className="p-4 sm:p-6 border-b bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Schlagwörter suchen..."
                value={tagSearchTerm}
                onChange={(e) => setTagSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tags Grid - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredTags.map((tagObj) => {
                const isSelected = document.tags.includes(tagObj.text);
                return (
                  <button
                    key={tagObj.text}
                    onClick={() => {
                      const newTags = isSelected
                        ? document.tags.filter((t) => t !== tagObj.text)
                        : [...document.tags, tagObj.text];
                      handleTagUpdate(document.id, newTags);
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-sm ${tagObj.color} truncate`}>
                      {tagObj.text}
                    </span>
                    {isSelected && <Check size={16} className="text-blue-500 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-6 border-t bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-sm text-gray-600">
                {document.tags.length} Schlagwörter ausgewählt
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setIsTagModalOpen(false);
                    setEditingDocumentId(null);
                    setTagSearchTerm('');
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-500" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Dokumente verwalten</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-6 py-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Dokumente durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="min-w-[200px]">
            <div className="relative">
              <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sections.map((section) => (
                  <option key={section.value} value={section.value}>
                    {section.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="min-w-[200px]">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle Status</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tag Buttons */}
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag.text}
              onClick={() =>
                setSelectedTags((prev) =>
                  prev.includes(tag.text)
                    ? prev.filter((t) => t !== tag.text)
                    : [...prev, tag.text]
                )
              }
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                selectedTags.includes(tag.text)
                  ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Tag className="w-4 h-4 mr-1" />
              {tag.text}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Document Cards */}
      <div className="p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {doc.imageUrl && (
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img
                    src={doc.imageUrl}
                    alt={doc.title}
                    className="object-cover w-full h-48"
                  />
                  <div className="absolute top-2 right-2">{getStatusIcon(doc.status)}</div>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 flex-1">
                    {doc.title || 'Unbenanntes Dokument'}
                  </h3>
                </div>
                <p className="text-gray-700 mb-3 line-clamp-2">
                  {doc.description || 'Keine Beschreibung verfügbar'}
                </p>
                <div className="text-sm text-gray-600 mb-2 flex items-center">
                  <Folder className="w-4 h-4 mr-1" />
                  {sections.find((s) => s.value === doc.section)?.label ||
                    doc.section ||
                    'Unkategorisiert'}
                </div>

                {/* Tags */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Schlagwörter:</h4>
                  <button
                    onClick={() => {
                      setEditingDocumentId(doc.id);
                      setIsTagModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Schlagwörter bearbeiten
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {doc.tags && doc.tags.length > 0 ? (
                    doc.tags.map((tagStr) => {
                      const tObj = availableTags.find((x) => x.text === tagStr);
                      return (
                        <span
                          key={tagStr}
                          className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                            tObj?.color || 'text-gray-700'
                          } bg-gray-100`}
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tagStr}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-400 italic">Keine Schlagwörter</span>
                  )}
                </div>

                {/* Status Buttons */}
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Status ändern:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() =>
                            handleStatusChange(doc.id, opt.value as 'public' | 'private' | 'in_progress')
                          }
                          disabled={updatingStatus === doc.id}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${
                            doc.status === opt.value
                              ? `${opt.color} ring-2 ring-offset-1`
                              : 'bg-gray-50 hover:bg-gray-100'
                          } ${
                            updatingStatus === doc.id
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          {updatingStatus === doc.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
                          ) : (
                            <>
                              <Icon size={14} />
                              {opt.label}
                              {doc.status === opt.value && (
                                <Check size={14} className="ml-1" />
                              )}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-3 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Hinzugefügt: {doc.createdAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">
              Keine Dokumente gefunden {selectedSection !== 'all' && 'in diesem Abschnitt'}.
            </p>
            <p className="text-gray-400">
              Versuchen Sie, Ihre Filter oder Suchbegriffe anzupassen
            </p>
          </div>
        )}
      </div>

      {/* Tag Edit Modal */}
      {isTagModalOpen && editingDocumentId && (
        <TagModal document={documents.find((d) => d.id === editingDocumentId)!} />
      )}
    </div>
  );
}