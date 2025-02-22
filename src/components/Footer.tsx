import React, { useState, useEffect } from 'react';
import { collection, addDoc, Timestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import {
  X,
  Upload,
  Calendar,
  Tag,
  FileText,
  ChevronDown,
  Globe,
  Lock,
  Clock,
  ArrowLeft,
  FileIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
const auth = getAuth();

interface MenuItem {
  id: string;
  title: string;
  parentId: string | null;
}

interface HistoricalDocument {
  title: string;
  date: string;
  fileUrl?: string;
  fileType: 'image' | 'pdf';
  description: string;
  section: string;
  tags: string[];
  status: 'private' | 'public' | 'in_progress';
  createdAt: Date;
}

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

const statusOptions = [
  {
    value: 'public',
    label: 'Öffentlich',
    icon: Globe,
    description: 'Für alle Benutzer sichtbar',
    color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  },
  {
    value: 'private',
    label: 'Privat',
    icon: Lock,
    description: 'Nur für authentifizierte Benutzer sichtbar',
    color: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
  },
  {
    value: 'in_progress',
    label: 'In Bearbeitung',
    icon: Clock,
    description: 'Dokument wird verarbeitet',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
  },
];

export default function FileUpload() {
  const [formData, setFormData] = useState<HistoricalDocument>({
    title: '',
    date: '',
    description: '',
    section: '',
    tags: [],
    status: 'private',
    fileType: 'image',
    createdAt: new Date(),
  });

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const navigate = useNavigate();

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
            id: data.id,
            title: data.title,
            parentId: data.parentId
          });
        });
        
        setMenuItems(items);
      } catch (err) {
        console.error('Fehler beim Abrufen der Menüelemente:', err);
        setError('Fehler beim Laden der Menüelemente');
      }
    };

    fetchMenuItems();
  }, []);

  const filteredTags = availableTags.filter((tag) =>
    tag.text.toLowerCase().includes(tagSearchTerm.toLowerCase())
  );

  const toggleTag = (tagText: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagText)
        ? prev.tags.filter((t) => t !== tagText)
        : [...prev.tags, tagText],
    }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Dateigröße muss kleiner als 5MB sein');
        return;
      }

      const isImage = selectedFile.type.startsWith('image/');
      const isPDF = selectedFile.type === 'application/pdf';

      if (!isImage && !isPDF) {
        setError('Datei muss ein Bild oder PDF sein');
        return;
      }

      setFile(selectedFile);
      setFormData((prev) => ({
        ...prev,
        fileType: isImage ? 'image' : 'pdf',
      }));

      if (isImage) {
        const previewUrl = URL.createObjectURL(selectedFile);
        setFilePreview(previewUrl);
      } else {
        setFilePreview('');
      }

      setError('');
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const storageRef = ref(
      storage,
      `historical-documents/${timestamp}_${file.name}`
    );
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!formData.section) {
      setError('Bitte wähle einen Abschnitt');
      setLoading(false);
      return;
    }

    try {
      let fileUrl = '';
      if (file) {
        fileUrl = await uploadFile(file);
      }
      const user = auth.currentUser;

      const docData = {
        ...formData,
        fileUrl,
        createdAt: Timestamp.fromDate(new Date()),
        userId: user?.uid,
      };

      await addDoc(collection(db, 'historical-documents'), docData);

      setFormData({
        title: '',
        date: '',
        description: '',
        section: '',
        tags: [],
        status: 'private',
        fileType: 'image',
        createdAt: new Date(),
      });

      setFile(null);
      setFilePreview('');
      setSuccess(true);
    } catch (err: any) {
      setError('Fehler beim Hinzufügen des Dokuments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Organisiere Menüelemente in einer Hierarchie für das Dropdown
  const getMenuItemLabel = (item: MenuItem) => {
    if (item.parentId) {
      const parent = menuItems.find(m => m.id === item.parentId);
      return parent ? `${parent.title} > ${item.title}` : item.title;
    }
    return item.title;
  };
  console.log(menuItems)
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden">
      <div className="h-full overflow-y-auto px-4 custom-scrollbar">
        <div className="max-w-4xl mx-auto py-6">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Historisches Dokument hochladen
                  </h2>
                  <p className="mt-1 text-gray-600">
                    Füge ein neues Dokument zum historischen Archiv hinzu
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Dokument erfolgreich hochgeladen!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4" />
                      Dokumenttitel
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dokumenttitel eingeben"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" />
                      Datum
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    placeholder="z.B. 1914"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Beschreibung
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Dokumentbeschreibung eingeben"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Abschnitt
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        section: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Wähle einen Abschnitt</option>
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.title}>
                        {getMenuItemLabel(item)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schlagwörter
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between bg-white"
                    >
                      <span className="text-gray-700">
                        {formData.tags.length === 0
                          ? 'Schlagwörter auswählen'
                          : `${formData.tags.length} Schlagwörter ausgewählt`}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {isTagDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                        <div className="p-2">
                          <input
                            type="text"
                            placeholder="Suche Schlagwörter..."
                            value={tagSearchTerm}
                            onChange={(e) => setTagSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                          {filteredTags.map((tag) => (
                            <div
                              key={tag.text}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                              onClick={() => toggleTag(tag.text)}
                            >
                              <span className={`${tag.color}`}>{tag.text}</span>
                              {formData.tags.includes(tag.text) && (
                                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.tags.map((tag) => {
                      const tagInfo = availableTags.find((t) => t.text === tag);
                      return (
                        <span
                          key={tag}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            tagInfo?.color || 'text-gray-700'
                          } bg-gray-100`}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className="ml-2 inline-flex items-center p-0.5 rounded-full hover:bg-gray-200 focus:outline-none"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <FileIcon className="w-4 h-4" />
                      Dokumentdatei (Bild oder PDF)
                    </div>
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Datei hochladen</span>
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">oder per Drag & Drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF, PDF bis zu 5MB
                      </p>
                    </div>
                  </div>

                  {file && (
                    <div className="mt-4">
                      <div className="relative inline-block">
                        {formData.fileType === 'image' && filePreview ? (
                          <img
                            src={filePreview}
                            alt="Vorschau"
                            className="max-h-48 rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                            <FileIcon className="w-8 h-8 text-gray-400" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setFilePreview('');
                            setFormData((prev) => ({
                              ...prev,
                              fileType: 'image',
                            }));
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {loading ? 'Wird hochgeladen...' : 'Dokument hochladen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
