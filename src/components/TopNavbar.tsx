import React, { useState } from "react";
import { Archive, Map, BookOpen, Bell, Database, Menu, X } from "lucide-react";

const TopNavbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [show, setShow] = useState(false);

  const navItems = [
    { title: "ERINNERUNGSPORTAL", icon: Archive, href: "#erinnerungsportal" },
    { title: "EDMUND-SCHIEFELING-PLATZ", icon: Map, href: "#platz" },
    { title: "SCROLLY-STORY", icon: BookOpen, href: "#scrolly-story" },
    { title: "AKTUELLES", icon: Bell, href: "#aktuelles" },
    { title: "DIGITALES ARCHIV", icon: Database, href: "#digitales-archiv" },
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setShow(true);
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-md z-50">
        <div className="h-16 px-4 lg:px-6 flex items-center justify-between lg:justify-center">
          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden   p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          <nav className="hidden   lg:flex items-center space-x-3">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={index}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className="group flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                  <span className="text-sm font-medium text-nowrap text-gray-700 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </span>
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <nav className="p-4">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <a
                    key={index}
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg mb-2"
                  >
                    <Icon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">{item.title}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {show && (
        <div className="max-w-4xl mx-auto p-6 space-y-10 mt-20">
          <button onClick={() => setShow(false)} className="fixed top-20 right-6 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-600" />
          </button>

          <section id="hero" className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Edmund Schiefeling</h1>
            <h1 className="text-2xl font-bold uppercase leading-snug">
              LERNE EDMUND SCHIEFELING (1882-1947) AUS ENGELSKIRCHEN KENNEN
              Er war Chefredakteur, Journalist und Bürgermeister. Und vor allem Demokrat mit Mut und Herz.
            </h1>
            <img 
              src="https://wordpress.p671117.webspaceconfig.de/wp-content/uploads/2024/09/schiefeling_240317_layout_01_screen1.jpg"
              alt="Edmund Schiefeling"
              className="max-w-full h-auto mx-auto"
            />
          </section>

          <section id="erinnerungsportal" className="space-y-4">
            <h2 className="text-2xl font-semibold">Erinnerungsportal</h2>
            <h3 className="text-2xl font-semibold">Ein Denkmal? Ein großer Schatz!</h3>
            <p>
              Mitten in der Gemeinde Engelskirchen liegt der EdmundSchiefeling-Platz. Aber wer war der Namensgeber eigentlich? 
              Und was hat ihn bedeutsam für Engelskirchen gemacht? Um diese und viele weitere Fragen zu beantworten, ist rund um 
              Edmund Schiefeling ein multimediales Erinnerungsportal entstanden, das seine Geschichte auf vielfältige Weise erlebbar macht.
            </p>
            <p className="py-2">
              Alle Generationen sind herzlich eingeladen, Edmund Schiefeling mit seiner Haltung und seinen Überzeugungen besser 
              kennenzulernen und damit gleichzeitig in die lokale Geschichte einzutauchen. Der Gewinn? Ein tiefer Einblick in die 
              historischen Zusammenhänge vor Ort als Türöffner in ein großes Stück Weltgeschichte.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <section id="platz" className="space-y-4">
              <h2 className="text-2xl font-semibold">Der Platz</h2>
              <p>Die lebensgroße Illustration und die Audiostele auf dem Edmund-Schiefeling-Platz erzählen aus seinem Leben.</p>
              <img 
                src="https://wordpress.p671117.webspaceconfig.de/wp-content/uploads/2024/08/2_BILD_DerPlatz-819x1024.jpg"
                alt="Edmund-Schiefeling-Platz"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </section>

            <section id="lebensgeschichte" className="space-y-4">
              <h2 className="text-2xl font-semibold">Die Lebensgeschichte</h2>
              <p>Eine digitale Scrolly-Story bringt seine Zeit und Erlebnisse wieder zum Leben, eng angelehnt an seine Originalzitate.</p>
              <img 
                src="https://wordpress.p671117.webspaceconfig.de/wp-content/uploads/2024/08/3_Bild_Lebensgeschichte.jpg"
                alt="Lebensgeschichte"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </section>

            <section id="digitales-archiv" className="space-y-4">
              <h2 className="text-2xl font-semibold">Digitales Archiv</h2>
              <p>Unveröffentlichte Dokumente und historische Informationen stehen bald zur Verfügung.</p>
              <img 
                src="https://wordpress.p671117.webspaceconfig.de/wp-content/uploads/2024/08/4_Bild_DasArchiv.jpg"
                alt="Digitales Archiv"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </section>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-bold italic">
              «Edmund Schiefeling ist für mich ein echter Demokrat, der schon ab 1920 mutig gegen die Nationalsozialisten angekämpft hat.»
              <br />— Peter Ruland, Heimatforscher
            </h2>

            <div className="mt-8 space-y-8">
              <div>
                <h2 className="text-2xl font-bold uppercase">EDMUND-SCHIEFELING-PLATZ</h2>
                <h3 className="text-lg font-semibold mt-2">Kennenlernen auf Augenhöhe</h3>
                <p className="mt-2">
                  Das Herzstück des Portals befindet sich auf dem Edmund-Schiefeling-Platz. Es besteht aus einer sorgfältig 
                  gestalteten Illustration, die vom Leben Edmund Schiefelings erzählt und alle Generationen anspricht. Ergänzt 
                  wird sie durch eine Hörstation mit Informationen aus den Jahren 1933, 1940 und 1946. Die Stele lädt zum 
                  Verweilen ein und zum Immer-mal-wieder Vorbeischauen, um nach und nach die vielfältigen Informationen über 
                  die verschiedenen Sinne aufzunehmen.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  Mit Astrid Jaekel wurde für das Projekt eine international renommierte Illustratorin gewonnen.
                </h3>
                <p className="mt-2">
                  Sie schafft es immer wieder, Menschen aus der Geschichte mit ihren Geschichten ins öffentliche Leben zu 
                  bringen und dabei alle Generationen anzusprechen. Die verschiedenen Elemente in der Illustration auf dem 
                  Edmund-Schiefeling-Platz sind eng mit der Lebensgeschichte des Namensgebers verknüpft.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold">Die Route zum Platz</h3>
                <ul className="list-decimal list-inside mt-2 space-y-2">
                  <li>Edmund Schiefeling (1882-1947) war Chefredakteur der Bergischen Wacht.</li>
                  <li>Er stammte aus Engelskirchen.</li>
                  <li>Als Journalist dokumentierte er das Leben.</li>
                  <li>Er schrieb mutig gegen die Propaganda der Nazis.</li>
                  <li>Damit machte er sich zahlreiche Feinde.</li>
                  <li>Aus Angst um Leib und Leben sah er sich gezwungen, seine Familie zu verlassen und in die Niederlande zu fliehen.</li>
                  <li>Nach seiner Rückkehr wurde er mehrfach verhaftet.</li>
                  <li>Ab Kriegsende widmete er sich als Bürgermeister von Engelskirchen dem Wiederaufbau.</li>
                  <li>Die Gemeinde war durch den 2. Weltkrieg stark zerstört.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold uppercase">SCROLLY-STORY</h2>
            <h3 className="text-lg font-semibold mt-2">Zeitgeschichte erleben</h3>
            <p className="mt-2">
              Die Scrolly-Story ermöglicht es, Edmund Schiefelings Zeit auf lebendige Weise zu erleben und bietet eine 
              eindrückliche Perspektive darauf, wie viel er für seine mutige Haltung einstecken und aushalten musste. 
              Die Scrolly ist ideal für alle, die sich in die Zeit von Edmund Schiefeling zurückversetzen lassen möchten.
            </p>
            <a href="#" className="text-blue-600 font-semibold mt-2 inline-block hover:text-blue-800">
              Zur Scrolly-Story
            </a>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold uppercase">DIGITALES ARCHIV</h2>
            <h3 className="text-lg font-semibold mt-2">Mehr herausfinden</h3>
            <p className="mt-2">
              Das Digitale Archiv Schiefeling macht eine Fülle von Informationen mit bislang unveröffentlichten Dokumenten 
              zugänglich. Es birgt einen großen Schatz an Dokumenten, Korrespondenzen und Fotos von Edmund Schiefeling und 
              dem privaten Familienbesitz. Hier gibt es jede Menge Material, um selbst zu forschen. Denn es lohnt sich sehr, 
              sich mit diesem mutigen Mann zu beschäftigen. Als Verfechter von Demokratie und Meinungsfreiheit während der 
              dunklen Tage des Nationalsozialismus hat er ein Erbe hinterlassen, das bis heute inspiriert.
            </p>
            <a href="#" className="text-blue-600 font-semibold mt-2 inline-block hover:text-blue-800">
              In Kürze online
            </a>
          </section>

          <section id="aktuelles" className="space-y-4">
            <h2 className="text-2xl font-semibold">Aktuelles</h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-xl">Ausstellung: „Edmund Schiefeling und wir in Engelskirchen"</h3>
                <p className="text-gray-600 mt-2">12. Juni 2024</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-xl">Einweihung der Hörstele auf dem Edmund-Schiefeling-Platz</h3>
                <p className="text-gray-600 mt-2">8. März 2024</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default TopNavbar;