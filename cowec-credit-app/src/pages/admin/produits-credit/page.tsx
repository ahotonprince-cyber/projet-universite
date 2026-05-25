import { useState, useEffect } from 'react';

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
  actif: boolean;
}

const FORM_INIT = {
  nom: '',
  categorie: 'individuel',
  description: '',
  taux_annuel: '',
  type_taux: 'fixe',
  periodicite_taux: 'mensuel',
  taux_penalite: '',
  periode_grace: '',
  duree_min: '',
  duree_max: '',
  frequence_remboursement: 'mensuel',
  mode_remboursement: 'annuite_constante',
  montant_min: '',
  montant_max: '',
  frais_dossier: '',
};

const CAT_LABELS: Record<string, string> = {
  individuel: 'Individuel', solidaire: 'Solidaire',
  agricole: 'Agricole', logement: 'Logement', urgence: 'Urgence',
};

const CAT_COLORS: Record<string, string> = {
  individuel: 'bg-blue-100 text-blue-700',
  solidaire:  'bg-purple-100 text-purple-700',
  agricole:   'bg-green-100 text-green-700',
  logement:   'bg-orange-100 text-orange-700',
  urgence:    'bg-red-100 text-red-700',
};

export default function ProduitsCreditPage() {
  const [produits, setProduits]     = useState<Produit[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editItem, setEditItem]     = useState<Produit | null>(null);
  const [form, setForm]             = useState({ ...FORM_INIT });
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState<{ text: string; ok: boolean } | null>(null);
  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState('all');

  const token = localStorage.getItem('token');
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const showToast = (text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProduits = async () => {
    try {
      const res = await fetch('/api/admin/produits-credit', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setProduits(d.produits || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchProduits(); }, []);

  // ── Validation frontend ───────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nom.trim())           e.nom           = 'Nom requis';
    if (!form.taux_annuel)          e.taux_annuel   = 'Taux requis';
    if (Number(form.taux_annuel) <= 0) e.taux_annuel = 'Taux doit être > 0';
    if (!form.montant_min)          e.montant_min   = 'Requis';
    if (!form.montant_max)          e.montant_max   = 'Requis';
    if (Number(form.montant_min) >= Number(form.montant_max))
      e.montant_max = 'Doit être > montant min';
    if (!form.duree_min)            e.duree_min     = 'Requis';
    if (!form.duree_max)            e.duree_max     = 'Requis';
    if (Number(form.duree_min) >= Number(form.duree_max))
      e.duree_max = 'Doit être > durée min';
    return e;
  };

  const openModal = (p: Produit | null) => {
    setEditItem(p);
    setErrors({});
    setForm(p ? {
      nom: p.nom, categorie: p.categorie || 'individuel',
      description: p.description || '',
      taux_annuel: String(p.taux_annuel), type_taux: p.type_taux || 'fixe',
      periodicite_taux: p.periodicite_taux || 'mensuel',
      taux_penalite: String(p.taux_penalite || ''), periode_grace: String(p.periode_grace || ''),
      duree_min: String(p.duree_min), duree_max: String(p.duree_max),
      frequence_remboursement: p.frequence_remboursement || 'mensuel',
      mode_remboursement: p.mode_remboursement || 'annuite_constante',
      montant_min: String(p.montant_min), montant_max: String(p.montant_max),
      frais_dossier: String(p.frais_dossier || ''),
    } : { ...FORM_INIT });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const url    = editItem ? `/api/admin/produits-credit/${editItem.id}` : '/api/admin/produits-credit';
      const method = editItem ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(form) });
      const data   = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      showToast(editItem ? 'Produit mis à jour !' : 'Produit créé !');
      setModalOpen(false);
      fetchProduits();
    } catch (err: any) {
      showToast(err.message, false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return;
    const res = await fetch(`/api/admin/produits-credit/${id}`, { method: 'DELETE', headers: authHeaders });
    if (res.ok) { showToast('Produit supprimé'); fetchProduits(); }
  };

  const toggleActif = async (id: number, actif: boolean) => {
    await fetch(`/api/admin/produits-credit/${id}/toggle`, {
      method: 'PATCH', headers: authHeaders, body: JSON.stringify({ actif: !actif })
    });
    fetchProduits();
  };

  const f = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const filtered = produits.filter(p => {
    const q = search.toLowerCase();
    return (filterCat === 'all' || p.categorie === filterCat) &&
      (p.nom.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
  });

  const stats = {
    total:      produits.length,
    actifs:     produits.filter(p => p.actif).length,
    tauxMoyen:  produits.length ? (produits.reduce((a, p) => a + Number(p.taux_annuel), 0) / produits.length).toFixed(2) : '0.00',
    capitalMax: produits.reduce((a, p) => a + Number(p.montant_max), 0),
  };

  const Input = ({ label, name, type = 'text', placeholder = '', required = false }: any) => (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-1 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={(form as any)[name]}
        onChange={e => f(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors[name] ? 'border-red-400' : 'border-gray-200'}`}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-0.5">{errors[name]}</p>}
    </div>
  );

  const Select = ({ label, name, options, required = false }: any) => (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-1 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={(form as any)[name]}
        onChange={e => f(name, e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        {options.map(([v, l]: [string, string]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6">

      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-white text-sm shadow-lg ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.text}
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Produits de crédit</h1>
          <p className="text-sm text-gray-500">Catalogue des offres de crédit</p>
        </div>
        <button onClick={() => openModal(null)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Nouveau produit
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Produits',    value: stats.total,                                          color: 'text-gray-800' },
          { label: 'Actifs',      value: stats.actifs,                                         color: 'text-green-600' },
          { label: 'Taux moyen',  value: `${stats.tauxMoyen}%`,                               color: 'text-orange-500' },
          { label: 'Plafond max', value: `${Number(stats.capitalMax).toLocaleString('fr-FR')} FCFA`, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* FILTRES */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">Toutes catégories</option>
          {Object.entries(CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Produit</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Taux</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Durée</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Montant</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Remboursement</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Frais</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Statut</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">Aucun produit</td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <p className="font-semibold text-gray-800">{p.nom}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${CAT_COLORS[p.categorie] || 'bg-gray-100 text-gray-600'}`}>
                    {CAT_LABELS[p.categorie] || p.categorie}
                  </span>
                  {p.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{p.description}</p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-orange-600">{Number(p.taux_annuel).toFixed(2)}%</p>
                  <p className="text-xs text-gray-400 capitalize">{p.type_taux} / {p.periodicite_taux}</p>
                  {Number(p.taux_penalite) > 0 && (
                    <p className="text-xs text-red-400">Pénalité : {Number(p.taux_penalite).toFixed(2)}%</p>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-700">
                  {p.duree_min} – {p.duree_max} mois
                </td>
                <td className="px-5 py-4 text-gray-700">
                  <p>{Number(p.montant_min).toLocaleString('fr-FR')}</p>
                  <p className="text-gray-400 text-xs">→ {Number(p.montant_max).toLocaleString('fr-FR')} FCFA</p>
                </td>
                <td className="px-5 py-4 text-gray-600 text-xs">
                  <p className="capitalize">{p.frequence_remboursement?.replace('_', ' ')}</p>
                  <p className="text-gray-400 capitalize">{p.mode_remboursement?.replace(/_/g, ' ')}</p>
                </td>
                <td className="px-5 py-4 text-gray-700">
                  {Number(p.frais_dossier).toLocaleString('fr-FR')} FCFA
                </td>
                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => toggleActif(p.id, p.actif)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${p.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {p.actif ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-3">
                    <button onClick={() => openModal(p)} className="text-orange-500 hover:underline text-xs">Modifier</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:underline text-xs">Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-6 shadow-2xl">

            {/* Header modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {editItem ? 'Modifier le produit' : 'Nouveau produit de crédit'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-6">

              {/* MODULE 1 — Identification */}
              <section>
                <h3 className="text-sm font-bold text-orange-600 uppercase mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs">1</span>
                  Identification
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Input label="Nom du produit" name="nom" required placeholder="Ex: Micro-crédit commerce" /></div>
                  <Select label="Catégorie" name="categorie" required options={[
                    ['individuel','Individuel'],['solidaire','Solidaire'],
                    ['agricole','Agricole'],['logement','Logement'],['urgence','Urgence']
                  ]} />
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => f('description', e.target.value)}
                      rows={2}
                      placeholder="Objet et finalité du produit"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* MODULE 2 — Conditions financières */}
              <section>
                <h3 className="text-sm font-bold text-orange-600 uppercase mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs">2</span>
                  Conditions financières
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Montant minimum (FCFA)" name="montant_min" type="number" required placeholder="50000" />
                  <Input label="Montant maximum (FCFA)" name="montant_max" type="number" required placeholder="5000000" />
                  <Input label="Durée minimum (mois)" name="duree_min" type="number" required placeholder="3" />
                  <Input label="Durée maximum (mois)" name="duree_max" type="number" required placeholder="24" />
                </div>
              </section>

              {/* MODULE 3 — Taux */}
              <section>
                <h3 className="text-sm font-bold text-orange-600 uppercase mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs">3</span>
                  Taux et intérêts
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Type de taux" name="type_taux" required options={[
                    ['fixe','Fixe'],['degressif','Dégressif'],['flat','Flat']
                  ]} />
                  <Select label="Périodicité du taux" name="periodicite_taux" required options={[
                    ['mensuel','Mensuel'],['annuel','Annuel']
                  ]} />
                  <Input label="Taux d'intérêt (%)" name="taux_annuel" type="number" required placeholder="2.5" />
                  <Input label="Taux pénalité retard (%)" name="taux_penalite" type="number" placeholder="5" />
                  <Input label="Période de grâce (jours)" name="periode_grace" type="number" placeholder="0" />
                </div>
              </section>

              {/* MODULE 4 — Remboursement */}
              <section>
                <h3 className="text-sm font-bold text-orange-600 uppercase mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs">4</span>
                  Remboursement
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Fréquence de remboursement" name="frequence_remboursement" required options={[
                    ['hebdomadaire','Hebdomadaire'],['bimensuel','Bimensuel'],
                    ['mensuel','Mensuel'],['in_fine','In fine']
                  ]} />
                  <Select label="Mode de remboursement" name="mode_remboursement" required options={[
                    ['annuite_constante','Annuité constante'],
                    ['principal_constant','Principal constant'],
                    ['bullet','Bullet']
                  ]} />
                </div>
              </section>

              {/* MODULE 5 — Frais */}
              <section>
                <h3 className="text-sm font-bold text-orange-600 uppercase mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs">5</span>
                  Frais et commissions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Frais de dossier (FCFA)" name="frais_dossier" type="number" placeholder="2000" />
                </div>
              </section>

              {/* Récap rapide */}
              {form.taux_annuel && form.montant_min && form.montant_max && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-orange-700 mb-2">Aperçu du produit</p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div><span className="text-gray-400">Taux</span><br /><strong>{form.taux_annuel}% {form.periodicite_taux}</strong></div>
                    <div><span className="text-gray-400">Montants</span><br /><strong>{Number(form.montant_min).toLocaleString('fr-FR')} → {Number(form.montant_max).toLocaleString('fr-FR')} FCFA</strong></div>
                    <div><span className="text-gray-400">Durée</span><br /><strong>{form.duree_min} – {form.duree_max} mois</strong></div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer modal */}
            <div className="flex gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100">
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold"
              >
                {saving ? 'Enregistrement...' : editItem ? 'Mettre à jour' : 'Créer le produit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
