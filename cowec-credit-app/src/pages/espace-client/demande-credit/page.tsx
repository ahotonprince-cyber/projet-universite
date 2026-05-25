import { useState, useEffect, useMemo } from 'react';

interface Produit {
  id: number;
  nom: string;
  categorie: string;
  description: string;
  taux_annuel: number;
  type_taux: string;
  periodicite_taux: string;
  taux_penalite: number;
  periode_grace: number;
  duree_min: number;
  duree_max: number;
  frequence_remboursement: string;
  mode_remboursement: string;
  montant_min: number;
  montant_max: number;
  frais_dossier: number;
}

const CAT_COLORS: Record<string, string> = {
  individuel: 'bg-blue-100 text-blue-700 border-blue-200',
  solidaire:  'bg-purple-100 text-purple-700 border-purple-200',
  agricole:   'bg-green-100 text-green-700 border-green-200',
  logement:   'bg-orange-100 text-orange-700 border-orange-200',
  urgence:    'bg-red-100 text-red-700 border-red-200',
};
const CAT_ICONS: Record<string, string> = {
  individuel: 'ri-user-line',
  solidaire:  'ri-group-line',
  agricole:   'ri-plant-line',
  logement:   'ri-home-line',
  urgence:    'ri-alarm-warning-line',
};
const CAT_LABELS: Record<string, string> = {
  individuel: 'Individuel', solidaire: 'Solidaire',
  agricole: 'Agricole', logement: 'Logement', urgence: 'Urgence',
};

const FREQ_LABELS: Record<string, string> = {
  hebdomadaire: 'Hebdomadaire', bimensuel: 'Bimensuel',
  mensuel: 'Mensuel', in_fine: 'In fine',
};
const MODE_LABELS: Record<string, string> = {
  annuite_constante: 'Annuité constante',
  principal_constant: 'Principal constant',
  bullet: 'Bullet',
};

const fmt = (n: number) => Number(n).toLocaleString('fr-FR');

// Calcul mensualité annuité constante
function calculerMensualite(montant: number, tauxMensuel: number, nbrMois: number): number {
  if (tauxMensuel === 0) return Math.round(montant / nbrMois);
  const r = tauxMensuel / 100;
  return Math.round(montant * r * Math.pow(1 + r, nbrMois) / (Math.pow(1 + r, nbrMois) - 1));
}

export default function DemandeCreditPage() {
  const [step, setStep]               = useState<1 | 2 | 3>(1);
  const [produits, setProduits]       = useState<Produit[]>([]);
  const [loadingProduits, setLoadingProduits] = useState(true);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [montant, setMontant]         = useState(0);
  const [duree, setDuree]             = useState(0);
  const [objet, setObjet]             = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [filterCat, setFilterCat]     = useState('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/client/produits-credit', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setProduits(d.produits || []))
      .catch(() => {})
      .finally(() => setLoadingProduits(false));
  }, []);

  const choisirProduit = (p: Produit) => {
    setSelectedProduit(p);
    setMontant(Math.round((Number(p.montant_min) + Number(p.montant_max)) / 2 / 50000) * 50000);
    setDuree(Number(p.duree_min) + Math.floor((Number(p.duree_max) - Number(p.duree_min)) / 2));
    setError('');
    setStep(2);
  };

  const tauxMensuel = useMemo(() => {
    if (!selectedProduit) return 0;
    const t = Number(selectedProduit.taux_annuel);
    return selectedProduit.periodicite_taux === 'mensuel' ? t : t / 12;
  }, [selectedProduit]);

  const mensualite  = useMemo(() => calculerMensualite(montant, tauxMensuel, duree), [montant, tauxMensuel, duree]);
  const totalInteret = useMemo(() => mensualite * duree - montant, [mensualite, duree, montant]);
  const totalRembourser = useMemo(() => montant + totalInteret, [montant, totalInteret]);
  const fraisDossier = useMemo(() => Number(selectedProduit?.frais_dossier || 0), [selectedProduit]);

  const handleSubmit = async () => {
    if (!selectedProduit || !objet) { setError('Veuillez renseigner l\'objet du crédit.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/client/demande-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          montant,
          duree_mois: duree,
          objet,
          description,
          taux_annuel: selectedProduit.taux_annuel,
          produit_id: selectedProduit.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCÈS ────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-double-line text-green-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h2>
          <p className="text-gray-500 mb-2">
            Votre demande de <strong>{fmt(montant)} FCFA</strong> ({selectedProduit?.nom}) a bien été soumise.
          </p>
          <p className="text-sm text-gray-400 mb-6">Un conseiller vous contactera sous 24–48h.</p>
          <button
            onClick={() => { setSubmitted(false); setStep(1); setSelectedProduit(null); setObjet(''); setDescription(''); }}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
          >
            Nouvelle demande
          </button>
        </div>
      </div>
    );
  }

  // ── ÉTAPE 1 : Choisir un produit ─────────────────────────────
  if (step === 1) {
    const filteredProduits = produits.filter(p => filterCat === 'all' || p.categorie === filterCat);

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Demande de crédit</h2>
          <p className="text-sm text-gray-500">Étape 1 / 3 — Choisissez un produit</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 text-xs">
          {[['1','Produit'],['2','Montant & durée'],['3','Confirmation']].map(([n, l], i) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                Number(n) === step ? 'bg-orange-500 text-white' : Number(n) < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{n}</div>
              <span className={Number(n) === step ? 'text-orange-600 font-medium' : 'text-gray-400'}>{l}</span>
              {i < 2 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Filtre catégorie */}
        <div className="flex gap-2 flex-wrap">
          {[['all','Tous'], ...Object.entries(CAT_LABELS)].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilterCat(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                filterCat === v ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {loadingProduits ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : filteredProduits.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <i className="ri-file-list-3-line text-4xl text-gray-300 block mb-2" />
            <p>Aucun produit disponible dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProduits.map(p => (
              <button
                key={p.id}
                onClick={() => choisirProduit(p)}
                className="bg-white border border-gray-200 hover:border-orange-400 hover:shadow-md rounded-xl p-5 text-left transition group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${CAT_COLORS[p.categorie] || 'bg-gray-100 text-gray-500'}`}>
                      <i className={CAT_ICONS[p.categorie] || 'ri-bank-line'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-800 group-hover:text-orange-600 transition">{p.nom}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${CAT_COLORS[p.categorie]}`}>
                          {CAT_LABELS[p.categorie]}
                        </span>
                      </div>
                      {p.description && <p className="text-sm text-gray-500 mb-2">{p.description}</p>}
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <i className="ri-money-dollar-circle-line text-orange-400" />
                          {fmt(Number(p.montant_min))} – {fmt(Number(p.montant_max))} FCFA
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line text-blue-400" />
                          {p.duree_min} – {p.duree_max} mois
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-percent-line text-green-400" />
                          {Number(p.taux_annuel).toFixed(2)}% / {p.periodicite_taux}
                        </span>
                        {Number(p.frais_dossier) > 0 && (
                          <span className="flex items-center gap-1">
                            <i className="ri-file-paper-line text-purple-400" />
                            Frais : {fmt(Number(p.frais_dossier))} FCFA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1 text-orange-500 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Choisir <i className="ri-arrow-right-line" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── ÉTAPE 2 : Montant & durée ─────────────────────────────────
  if (step === 2 && selectedProduit) {
    const minM = Number(selectedProduit.montant_min);
    const maxM = Number(selectedProduit.montant_max);
    const minD = Number(selectedProduit.duree_min);
    const maxD = Number(selectedProduit.duree_max);
    const step50 = Math.max(10000, Math.round((maxM - minM) / 20 / 10000) * 10000);

    // Durées prédéfinies dans la plage
    const dureesDisponibles: number[] = [];
    for (let d = minD; d <= maxD; d += (maxD - minD <= 12 ? 3 : 6)) {
      dureesDisponibles.push(d);
    }
    if (!dureesDisponibles.includes(maxD)) dureesDisponibles.push(maxD);

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Demande de crédit</h2>
          <p className="text-sm text-gray-500">Étape 2 / 3 — Configurez votre crédit</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 text-xs">
          {[['1','Produit'],['2','Montant & durée'],['3','Confirmation']].map(([n, l], i) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                Number(n) === step ? 'bg-orange-500 text-white' : Number(n) < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{Number(n) < step ? '✓' : n}</div>
              <span className={Number(n) === step ? 'text-orange-600 font-medium' : Number(n) < step ? 'text-green-600' : 'text-gray-400'}>{l}</span>
              {i < 2 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Produit sélectionné */}
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${CAT_COLORS[selectedProduit.categorie] || 'bg-gray-50 border-gray-200'}`}>
          <i className={`${CAT_ICONS[selectedProduit.categorie] || 'ri-bank-line'} text-lg`} />
          <div className="flex-1">
            <p className="font-semibold text-sm">{selectedProduit.nom}</p>
            <p className="text-xs opacity-70">Taux : {Number(selectedProduit.taux_annuel).toFixed(2)}% {selectedProduit.periodicite_taux} — {MODE_LABELS[selectedProduit.mode_remboursement]}</p>
          </div>
          <button onClick={() => setStep(1)} className="text-xs underline opacity-70 hover:opacity-100">Changer</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl border p-5 space-y-6">

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

            {/* Montant */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700">Montant souhaité</label>
                <span className="text-orange-600 font-bold">{fmt(montant)} FCFA</span>
              </div>
              <input
                type="range"
                min={minM} max={maxM} step={step50}
                value={montant}
                onChange={e => setMontant(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{fmt(minM)} FCFA</span>
                <span>{fmt(maxM)} FCFA</span>
              </div>
            </div>

            {/* Durée */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Durée de remboursement</label>
              <div className="flex flex-wrap gap-2">
                {dureesDisponibles.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuree(d)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                      duree === d ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {d} mois
                  </button>
                ))}
              </div>
            </div>

            {/* Objet */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Objet du crédit *</label>
              <select
                value={objet}
                onChange={e => setObjet(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Choisir l'objet...</option>
                <option>Commerce / Business</option>
                <option>Agriculture</option>
                <option>Immobilier / Logement</option>
                <option>Équipement</option>
                <option>Éducation</option>
                <option>Personnel</option>
                <option>Urgence médicale</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Description (optionnel)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Décrivez votre projet ou l'utilisation du crédit..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                ← Retour
              </button>
              <button
                disabled={!objet}
                onClick={() => { setError(''); setStep(3); }}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Continuer →
              </button>
            </div>
          </div>

          {/* RÉCAP SIMULATEUR */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-orange-500 text-white rounded-xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <i className="ri-calculator-line" /> Simulation
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-80">Montant emprunté</span>
                  <span className="font-semibold">{fmt(montant)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Durée</span>
                  <span className="font-semibold">{duree} mois</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Taux ({selectedProduit.periodicite_taux})</span>
                  <span className="font-semibold">{Number(selectedProduit.taux_annuel).toFixed(2)}%</span>
                </div>
                <div className="border-t border-white/30 pt-3 flex justify-between">
                  <span className="opacity-80">Intérêts totaux</span>
                  <span className="font-semibold">{fmt(totalInteret)} FCFA</span>
                </div>
                {fraisDossier > 0 && (
                  <div className="flex justify-between">
                    <span className="opacity-80">Frais de dossier</span>
                    <span className="font-semibold">{fmt(fraisDossier)} FCFA</span>
                  </div>
                )}
                <div className="border-t border-white/30 pt-3">
                  <div className="flex justify-between mb-1">
                    <span className="opacity-80">Mensualité</span>
                    <span className="text-xl font-bold">{fmt(mensualite)} FCFA</span>
                  </div>
                  <div className="flex justify-between text-xs opacity-70">
                    <span>Total à rembourser</span>
                    <span>{fmt(totalRembourser + fraisDossier)} FCFA</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
              <p className="font-semibold mb-1">Remboursement</p>
              <p>{FREQ_LABELS[selectedProduit.frequence_remboursement]} — {MODE_LABELS[selectedProduit.mode_remboursement]}</p>
              {Number(selectedProduit.taux_penalite) > 0 && (
                <p className="mt-1 text-red-500">Pénalité retard : {Number(selectedProduit.taux_penalite).toFixed(2)}%</p>
              )}
              {Number(selectedProduit.periode_grace) > 0 && (
                <p className="mt-1">Période de grâce : {selectedProduit.periode_grace} jours</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ÉTAPE 3 : Confirmation ────────────────────────────────────
  if (step === 3 && selectedProduit) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Demande de crédit</h2>
          <p className="text-sm text-gray-500">Étape 3 / 3 — Confirmation</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 text-xs">
          {[['1','Produit'],['2','Montant & durée'],['3','Confirmation']].map(([n, l], i) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                Number(n) === step ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
              }`}>{Number(n) < step ? '✓' : n}</div>
              <span className={Number(n) === step ? 'text-orange-600 font-medium' : 'text-green-600'}>{l}</span>
              {i < 2 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-3">Récapitulatif de votre demande</h3>

          {[
            ['Produit',          selectedProduit.nom],
            ['Catégorie',        CAT_LABELS[selectedProduit.categorie]],
            ['Montant demandé',  `${fmt(montant)} FCFA`],
            ['Durée',            `${duree} mois`],
            ['Taux',             `${Number(selectedProduit.taux_annuel).toFixed(2)}% ${selectedProduit.periodicite_taux}`],
            ['Mensualité est.',  `${fmt(mensualite)} FCFA`],
            ['Total intérêts',   `${fmt(totalInteret)} FCFA`],
            ['Frais de dossier', `${fmt(fraisDossier)} FCFA`],
            ['Total à rembourser', `${fmt(totalRembourser + fraisDossier)} FCFA`],
            ['Objet',            objet],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-semibold text-gray-800">{value}</span>
            </div>
          ))}

          {description && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              {description}
            </div>
          )}
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-700">
          En soumettant cette demande, vous acceptez que COWEC examine votre dossier. La mensualité affichée est une estimation — le montant définitif sera confirmé lors de l'approbation.
        </div>

        <div className="flex gap-3">
          <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            ← Modifier
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
          >
            {loading
              ? <><i className="ri-loader-4-line animate-spin" /> Envoi en cours...</>
              : <><i className="ri-send-plane-line" /> Soumettre ma demande</>
            }
          </button>
        </div>
      </div>
    );
  }

  return null;
}
