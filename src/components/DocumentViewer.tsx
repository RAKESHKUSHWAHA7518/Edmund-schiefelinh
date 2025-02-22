import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  FileIcon,
  Filter,
  Search,
} from 'lucide-react';
import { collection, getDocs, query, where, and } from 'firebase/firestore';
import { db, storage, auth } from '../firebase';
import { ref, getDownloadURL } from 'firebase/storage';

interface Document {
  id: string;
  title: string;
  date: string;
  fileUrl: string;
  imageUrl?: string;
  fileType: 'image' | 'pdf' | 'doc' | 'docx';
  description: string;
  menuItemId: string; // Verknüpft Dokumente mit Menüelementen
  tags: string[];
  status: 'private' | 'public';
  createdAt: Date;
}

interface DocumentViewerProps {
  sectionId: string;
  selectedTags: string[];
}

export default function DocumentViewer({
  sectionId,
  selectedTags,
}: DocumentViewerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [embeddedUrl, setEmbeddedUrl] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [yearRange, setYearRange] = useState({ start: 1840, end: 2025 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  console.log(sectionId);
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        let q;
        const isAuthenticated = !!auth.currentUser;

        // Basis-Abfragebedingungen
        const conditions = [];

        // Füge Abschnittsfilter hinzu, wenn nicht 'all'
        if (sectionId !== 'all') {
          conditions.push(where('section', '==', sectionId));
        }

        // Füge Statusfilter basierend auf der Authentifizierung hinzu
        if (!isAuthenticated) {
          conditions.push(where('status', '==', 'public'));
        }

        // Erstelle die Abfrage
        if (conditions.length > 0) {
          q = query(collection(db, 'historical-documents'), and(...conditions));
        } else {
          q = query(collection(db, 'historical-documents'));
        }

        const querySnapshot = await getDocs(q);
        const docs: Document[] = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          docs.push({
            id: docSnap.id,
            title: data.title || '',
            date: data.date || '',
            fileUrl: data.fileUrl || '',
            imageUrl: data.imageUrl || undefined,
            fileType: data.fileType || 'image',
            description: data.description || '',
            menuItemId: data.menuItemId || '',
            tags: data.tags || [],
            status: data.status || 'private',
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });

        setDocuments(docs);
      } catch (err) {
        setError('Fehler beim Abrufen der Dokumente');
        console.error('Fehler beim Abrufen der Dokumente:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [sectionId, auth.currentUser]);

  const handleSelectDoc = async (doc: Document) => {
    setSelectedDoc(doc);
    setEmbeddedUrl('');

    try {
      if (doc.fileType === 'image' && doc.imageUrl) {
        setEmbeddedUrl(doc.imageUrl);
      } else if (
        doc.fileType === 'pdf' ||
        doc.fileType === 'doc' ||
        doc.fileType === 'docx'
      ) {
        const storagePath = doc.fileUrl.split('/o/')[1]?.split('?')[0];
        if (!storagePath) throw new Error('Ungültiger Speicherpfad in fileUrl');
        const decodedPath = decodeURIComponent(storagePath);
        const storageRef = ref(storage, decodedPath);
        const directLink = await getDownloadURL(storageRef);

        setEmbeddedUrl(
          `https://docs.google.com/gview?url=${encodeURIComponent(
            directLink
          )}&embedded=true`
        );
      }
    } catch (err) {
      console.error('Fehler bei der Vorschau-Erstellung:', err);
      setEmbeddedUrl('');
    }
  };

  // const handleDownload = async (fileUrl: string) => {
  //   if (!fileUrl) {
  //     alert('No file available for download');
  //     return;
  //   }
  //   setDownloadLoading(true);
  //   try {
  //     const storagePath = fileUrl.split('/o/')[1]?.split('?')[0];
  //     if (!storagePath) throw new Error('Invalid storage path');
  //     const decodedPath = decodeURIComponent(storagePath);
  //     const storageRef = ref(storage, decodedPath);
  //     const downloadUrl = await getDownloadURL(storageRef);
  //
  //     const filename = decodedPath.split('/').pop() || 'document';
  //     // Append a query parameter to force the file to download
  //     const forcedDownloadUrl =
  //       downloadUrl +
  //       `&response-content-disposition=attachment;filename=${encodeURIComponent(
  //         filename
  //       )}`;
  //     console.log(forcedDownloadUrl)
  //    console.log(downloadUrl)
  //     const link = document.createElement('a');
  //     link.href = forcedDownloadUrl;
  //     link.setAttribute('download', filename);
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (err) {
  //     console.error('Error downloading document:', err);
  //     alert('Error downloading document. Please try again.');
  //   } finally {
  //     setDownloadLoading(false);
  //   }
  // };

  // const handleDownload = async (fileUrl: string) => {
  //   if (!fileUrl) {
  //     alert('Keine Datei zum Download verfügbar');
  //     return;
  //   }
  //   setDownloadLoading(true);
  //   try {
  //     const storagePath = fileUrl.split('/o/')[1]?.split('?')[0];
  //     if (!storagePath) throw new Error('Ungültiger Speicherpfad');
  //     const decodedPath = decodeURIComponent(storagePath);
  //     const storageRef = ref(storage, decodedPath);
  //     const downloadUrl = await getDownloadURL(storageRef);

  //     const filename = decodedPath.split('/').pop() || 'document';
  //     // Füge einen Query-Parameter hinzu, um den Download zu erzwingen
  //     const forcedDownloadUrl =
  //       downloadUrl +
  //       `&response-content-disposition=attachment;filename=${encodeURIComponent(
  //         filename
  //       )}`;

  //     const link = document.createElement('a');
  //     link.href = forcedDownloadUrl;
  //     link.setAttribute('download', filename);
  //     link.target = '_blank';
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (err) {
  //     console.error('Fehler beim Herunterladen des Dokuments:', err);
  //     alert(
  //       'Fehler beim Herunterladen des Dokuments. Bitte versuchen Sie es erneut.'
  //     );
  //   } finally {
  //     setDownloadLoading(false);
  //   }
  // 


   const handleDownload = async (doc: Document) => {
    if (!doc.fileUrl && !doc.imageUrl) {
      alert('No file available for download');
      return;
    }

    setDownloadLoading(true);
    try {
      let downloadUrl: string;
      let filename: string;

      if (doc.fileType === 'image' && doc.imageUrl) {
        // For images, use the direct imageUrl
        downloadUrl = doc.imageUrl;
        filename = `${doc.title || 'image'}.${doc.imageUrl.split('.').pop()}`;
      } else {
        // For PDF, DOC, DOCX files, extract the storage path
        const storagePath = doc.fileUrl.split('/o/')[1]?.split('?')[0];
        if (!storagePath) throw new Error('Invalid storage path');
        const decodedPath = decodeURIComponent(storagePath);
        const storageRef = ref(storage, decodedPath);
        downloadUrl = await getDownloadURL(storageRef);
        filename = decodedPath.split('/').pop() || 'document';
      }

      // Debug logging
      console.log('Download URL:', downloadUrl);
      console.log('Filename:', filename);

      // Fetch the file as a blob
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();

      // Create a blob URL for the file
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger the download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke the blob URL after a short delay
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      console.error('Error downloading document:', err);
      // alert('Error downloading document. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };
  // Filtere Dokumente nach Suche, Datum, Schlagwörtern
  const filteredDocs = documents.filter((doc) => {
    const matchTitle = doc.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchYear =
      parseInt(doc.date) >= yearRange.start &&
      parseInt(doc.date) <= yearRange.end;
    const matchTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => doc.tags.includes(tag));
    return matchTitle && matchYear && matchTags;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Search + Range Filter */}
      <div className="mb-8 flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Nach Titel suchen..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{yearRange.start}</span>
          <input
            type="range"
            min="1840"
            max="2025"
            value={yearRange.start}
            onChange={(e) =>
              setYearRange((prev) => ({
                ...prev,
                start: parseInt(e.target.value),
              }))
            }
            className="w-32"
          />
          <input
            type="range"
            min="1840"
            max="2025"
            value={yearRange.end}
            onChange={(e) =>
              setYearRange((prev) => ({
                ...prev,
                end: parseInt(e.target.value),
              }))
            }
            className="w-32"
          />
          <span className="text-sm text-gray-600">{yearRange.end}</span>
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition hover:scale-105 relative"
            onClick={() => handleSelectDoc(doc)}
          >
            <div className="relative">
              {doc.fileType === 'image' ? (
                <img
                  src={doc.fileUrl}
                  alt={doc.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500">
                      {doc.fileType.toUpperCase()} Dokument
                    </span>
                  </div>
                </div>
              )}

              {/* Status badge */}
              <div className="absolute top-2 right-2">
                {doc.status === 'public' ? (
                  <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <Globe size={16} />
                  </div>
                ) : (
                  <div className="bg-gray-700 text-white p-2 rounded-full shadow-lg">
                    <Lock size={16} />
                  </div>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {doc.title}
              </h3>
              <p className="text-sm text-gray-500">{doc.date}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {doc.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 relative">
            <button
              onClick={() => {
                setSelectedDoc(null);
                setEmbeddedUrl('');
              }}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronLeft size={24} />
                </button>

                {selectedDoc.fileType === 'image' ? (
                  <img
                    src={selectedDoc.fileUrl}
                    alt={selectedDoc.title}
                    className="max-h-[60vh] object-contain"
                  />
                ) : (
                  <div className="w-full h-[60vh] bg-gray-50 flex items-center justify-center">
                    {embeddedUrl ? (
                      <iframe
                        src={embeddedUrl}
                        className="w-full h-full"
                        title={selectedDoc.title}
                      />
                    ) : (
                      <div>Vorschau wird geladen...</div>
                    )}
                  </div>
                )}

                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold">{selectedDoc.title}</h2>
                  {selectedDoc.status === 'private' ? (
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                      <Lock className="w-5 h-5 text-gray-700" />
                      <span className="text-sm font-medium text-gray-700">
                        Privates Dokument
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-green-100 px-3 py-1.5 rounded-full">
                      <Globe className="w-5 h-5 text-green-700" />
                      <span className="text-sm font-medium text-green-700">
                        Öffentliches Dokument
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{selectedDoc.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedDoc.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`text-sm px-3 py-1 rounded-full ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm text-gray-500">
                    Datum: {selectedDoc.date}
                  </span>
                  {/* <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(selectedDoc.fileUrl);
                    }}
                    disabled={downloadLoading}
                    className={`flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors ${
                      downloadLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {downloadLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                        Wird heruntergeladen...
                      </>
                    ) : (
                      <>
                        <Download size={20} />
                        Herunterladen
                      </>
                    )}
                  </button> */}

                    <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(selectedDoc);
                    }}
                    disabled={downloadLoading}
                    className={`flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors ${
                      downloadLoading
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {downloadLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                        Wird heruntergeladen...
                      </>
                    ) : (
                      <>
                        <Download size={20} />
                        Herunterladen
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">
            Keine Dokumente gefunden{' '}
            {sectionId !== 'all' && 'in diesem Abschnitt'}.
          </p>
          <p className="text-gray-400">
            Versuchen Sie, Ihre Suchkriterien oder Filter anzupassen
          </p>
        </div>
      )}
    </div>
  );
}
