import React from "react";

const EdmundSchiefeling: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6  space-y-10">
      {/* Hero Section */}
      <section id="hero" className="text-center space-y-4">
        <h1 className="text-4xl font-bold">LERNE EDMUND SCHIEFELING (1882-1947) AUS ENGELSKIRCHEN KENNEN</h1>
        <p className="text-lg text-gray-700">
          Er war Chefredakteur, Journalist und Bürgermeister. Und vor allem Demokrat mit Mut und Herz.
        </p>
      </section>

      {/* Erinnerungsporal */}
      <section id="erinnerungsportal" className="space-y-4">
        <h2 className="text-2xl font-semibold">Erinnerungsportal</h2>
        <p>
          Mitten in der Gemeinde Engelskirchen liegt der Edmund-Schiefeling-Platz. Um seine Bedeutung zu verstehen,
          wurde ein multimediales Erinnerungsportal geschaffen.
        </p>
      </section>

      {/* Der Platz */}
      <section id="platz" className="space-y-4">
        <h2 className="text-2xl font-semibold">Der Platz</h2>
        <p>
          Die lebensgroße Illustration und die Audiostele auf dem Edmund-Schiefeling-Platz erzählen aus seinem Leben.
        </p>
      </section>

      {/* Lebensgeschichte */}
      <section id="lebensgeschichte" className="space-y-4">
        <h2 className="text-2xl font-semibold">Die Lebensgeschichte</h2>
        <p>
          Eine digitale Scrolly-Story bringt seine Zeit und Erlebnisse wieder zum Leben, eng angelehnt an seine
          Originalzitate.
        </p>
      </section>

      {/* Digitales Archiv */}
      <section id="archiv" className="space-y-4">
        <h2 className="text-2xl font-semibold">Das Archiv (In Kürze online)</h2>
        <p>
          Das „Digitale Archiv Schiefeling“ bietet eine Schlagwortsuche und zahlreiche historische Dokumente aus seinem
          Leben.
        </p>
      </section>

      {/* Route zum Platz */}
      <section id="route" className="space-y-4">
        <h2 className="text-2xl font-semibold">Die Route zum Platz</h2>
        <ul className="list-disc pl-6">
          <li>Chefredakteur der Bergischen Wacht</li>
          <li>Dokumentierte das Leben als Journalist</li>
          <li>Schrieb mutig gegen die NS-Propaganda</li>
          <li>Flucht in die Niederlande, mehrfach verhaftet</li>
          <li>Als Bürgermeister von Engelskirchen am Wiederaufbau beteiligt</li>
        </ul>
      </section>

      {/* Scrolly-Story */}
      <section id="scrolly-story" className="space-y-4">
        <h2 className="text-2xl font-semibold">Scrolly-Story</h2>
        <p>
          Erlebe Edmund Schiefelings Zeitgeschichte interaktiv mit der digitalen Scrolly-Story.
        </p>
      </section>

      {/* Digitales Archiv */}
      <section id="digitales-archiv" className="space-y-4">
        <h2 className="text-2xl font-semibold">Digitales Archiv</h2>
        <p>
          Unveröffentlichte Dokumente und historische Informationen stehen bald zur Verfügung.
        </p>
      </section>

      {/* Aktuelles */}
      <section id="aktuelles" className="space-y-4">
        <h2 className="text-2xl font-semibold">Aktuelles</h2>
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold">Ausstellung: „Edmund Schiefeling und wir in Engelskirchen“</h3>
            <p>12. Juni 2024</p>
          </div>
          <div>
            <h3 className="font-semibold">Einweihung der Hörstele auf dem Edmund-Schiefeling-Platz</h3>
            <p>8. März 2024</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EdmundSchiefeling;
