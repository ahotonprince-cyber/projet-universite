import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type Step = 1 | 2 | 3;

export default function InscriptionPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    adresse: '', profession: '', dateNaissance: '',
    password: '', confirmPassword: '', acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.prenom) e.prenom = 'Prénom requis';
    if (!form.nom) e.nom = 'Nom requis';
    if (!form.email) e.email = 'Email requis';
    if (!form.telephone) e.telephone = 'Téléphone requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.adresse) e.adresse = 'Adresse requise';
    if (!form.profession) e.profession = 'Profession requise';
    if (!form.dateNaissance) e.dateNaissance = 'Date de naissance requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!form.password) e.password = 'Mot de passe requis';
    else if (form.password.length < 8) e.password = 'Minimum 8 caractères';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas';
    if (!form.acceptTerms) e.acceptTerms = 'Vous devez accepter les conditions';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          telephone: form.telephone,
          adresse: form.adresse,
          profession: form.profession,
          dateNaissance: form.dateNaissance,
          password: form.password
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'inscription");

      navigate('/client/connexion', { state: { message: 'Compte créé avec succès. Veuillez vous connecter.' } });
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Identité' },
    { num: 2, label: 'Informations' },
    { num: 3, label: 'Sécurité' },
  ];

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay léger */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/50 via-black/30 to-orange-800/40" />

      {/* Contenu */}
      <div className="relative z-10 flex flex-col min-h-screen p-6 md:p-10">

        {/* Header : Logo + avantages */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-auto">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl flex items-center justify-center">
              <i className="ri-bank-line text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold tracking-wide drop-shadow-md">COWEC</h1>
              <p className="text-orange-200 text-sm drop-shadow">Microfinance</p>
            </div>
          </div>

          {/* Avantages en ligne */}
          <div className="flex flex-wrap gap-4">
            {['Accès rapide aux crédits', 'Remboursements flexibles', 'Suivi en temps réel', 'Support 24/7'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-check-line text-white text-xs" />
                </div>
                <span className="text-orange-100 text-xs drop-shadow">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire centré */}
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-lg bg-black/40 backdrop-blur-lg border border-white/15 rounded-2xl p-8 shadow-2xl">

            {/* Titre */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1 drop-shadow">Créer un compte</h2>
              <p className="text-white/60 text-sm">Remplissez le formulaire pour rejoindre COWEC</p>
            </div>

            {/* Steps */}
            <div className="flex items-center gap-2 mb-7">
              {steps.map((s, i) => (
                <div key={s.num} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                    step > s.num ? 'bg-green-500 text-white' : step === s.num ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/40'
                  }`}>
                    {step > s.num ? <i className="ri-check-line text-xs" /> : s.num}
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${step === s.num ? 'text-orange-300' : 'text-white/40'}`}>{s.label}</span>
                  {i < steps.length - 1 && <div className={`flex-1 h-px ${step > s.num ? 'bg-green-400' : 'bg-white/20'}`} />}
                </div>
              ))}
            </div>

            {/* Erreur générale */}
            {errors.general && (
              <div className="mb-5 p-3 bg-red-500/20 border border-red-400/40 rounded-lg flex items-start gap-2">
                <i className="ri-error-warning-line text-red-300 mt-0.5" />
                <p className="text-red-200 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Step 1 — Identité */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Prénom *</label>
                      <input
                        type="text"
                        value={form.prenom}
                        onChange={(e) => update('prenom', e.target.value)}
                        placeholder="Aminata"
                        className={`w-full px-3 py-2.5 bg-white/10 border rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${errors.prenom ? 'border-red-400' : 'border-white/20'}`}
                      />
                      {errors.prenom && <p className="text-red-300 text-xs mt-1">{errors.prenom}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Nom *</label>
                      <input
                        type="text"
                        value={form.nom}
                        onChange={(e) => update('nom', e.target.value)}
                        placeholder="Diallo"
                        className={`w-full px-3 py-2.5 bg-white/10 border rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${errors.nom ? 'border-red-400' : 'border-white/20'}`}
                      />
                      {errors.nom && <p className="text-red-300 text-xs mt-1">{errors.nom}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">Adresse email *</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                        <i className="ri-mail-line text-white/50 text-sm" />
                      </div>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="votre@email.com"
                        className={`w-full pl-9 pr-4 py-2.5 bg-white/10 border rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${errors.email ? 'border-red-400' : 'border-white/20'}`}
                      />
                    </div>
                    {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">Téléphone *</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                        <i className="ri-phone-line text-white/50 text-sm" />
                      </div>
                      <input
                        type="tel"
                        value={form.telephone}
                        onChange={(e) => update('telephone', e.target.value)}
                        placeholder="+229 97 000 000"
                        className={`w-full pl-9 pr-4 py-2.5 bg-white/10 border rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${errors.telephone ? 'border-red-400' : 'border-white/20'}`}
                      />
                    </div>
                    {errors.telephone && <p className="text-red-300 text-xs mt-1">{errors.telephone}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer shadow-lg shadow-orange-500/30"
                  >
                    Continuer <i className="ri-arrow-right-line ml-1" />
                  </button>
                </div>
              )}

              {/* Step 2 — Informations */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">Adresse *</label>
                    <input
                      type="text"
                      value={form.adresse}
                      onChange={(e) => update('adresse', e.target.value)}
                      placeholder="Cotonou, Cadjehoun, Rue 12"
                      className={`w-full px-3 py-2.5 bg-white/10 border rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${errors.adresse ? 'border-red-400' : 'border-white/20'}`}
                    />
                    {errors.adresse && <p className="text-red-300 text-xs mt-1">{errors.adresse}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">Profession *</label>
                    <select
                      value={form.profession}
                      onChange={(e) => update('profession', e.target.value)}
                      className={`w-full px-3 py-2.5 bg-white/10 border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${errors.profession ? 'border-red-400' : 'border-white/20'}`}
                    >
                      <option value="" className="bg-gray-800">Sélectionner...</option>
                      <option className="bg-gray-800">Commerçant(e)</option>
                      <option className="bg-gray-800">Agriculteur/Agricultrice</option>
                      <option className="bg-gray-800">Artisan(e)</option>
                      <option className="bg-gray-800">Fonctionnaire</option>
                      <option className="bg-gray-800">Entrepreneur(e)</option>
                      <option className="bg-gray-800">Pêcheur/Pêcheuse</option>
                      <option className="bg-gray-800">Éleveur/Éleveuse</option>
                      <option className="bg-gray-800">Autre</option>
                    </select>
                    {errors.profession && <p className="text-red-300 text-xs mt-1">{errors.profession}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">Date de naissance *</label>
                    <input
                      type="date"
                      value={form.dateNaissance}
                      onChange={(e) => update('dateNaissance', e.target.value)}
                      className={`w-full px-3 py-2.5 bg-white/10 border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${errors.dateNaissance ? 'border-red-400' : 'border-white/20'}`}
                    />
                    {errors.dateNaissance && <p className="text-red-300 text-xs mt-1">{errors.dateNaissance}</p>}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-white/20 text-white/80 font-semibold rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <i className="ri-arrow-left-line mr-1" /> Retour
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer shadow-lg shadow-orange-500/30"
                    >
                      Continuer <i className="ri-arrow-right-line ml-1" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 — Sécurité */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">Mot de passe *</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                        <i className="ri-lock-line text-white/50 text-sm" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                        placeholder="Minimum 8 caractères"
                        className={`w-full pl-9 pr-10 py-2.5 bg-white/10 border rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${errors.password ? 'border-red-400' : 'border-white/20'}`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                        <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-white/50 text-sm`} />
                      </button>
                    </div>
                    {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password}</p>}
                    {form.password && (
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`flex-1 h-1 rounded-full ${form.password.length >= i * 2 ? (form.password.length >= 8 ? 'bg-green-400' : 'bg-orange-400') : 'bg-white/20'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">Confirmer le mot de passe *</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                        <i className="ri-lock-2-line text-white/50 text-sm" />
                      </div>
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => update('confirmPassword', e.target.value)}
                        placeholder="Répétez le mot de passe"
                        className={`w-full pl-9 pr-4 py-2.5 bg-white/10 border rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${errors.confirmPassword ? 'border-red-400' : 'border-white/20'}`}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-red-300 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.acceptTerms}
                      onChange={(e) => update('acceptTerms', e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-orange-400 flex-shrink-0"
                    />
                    <span className="text-sm text-white/70">
                      J'accepte les{' '}
                      <span className="text-orange-300 font-medium cursor-pointer hover:text-orange-200">conditions d'utilisation</span>
                      {' '}et la{' '}
                      <span className="text-orange-300 font-medium cursor-pointer hover:text-orange-200">politique de confidentialité</span>
                      {' '}de COWEC Microfinance.
                    </span>
                  </label>
                  {errors.acceptTerms && <p className="text-red-300 text-xs">{errors.acceptTerms}</p>}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 border border-white/20 text-white/80 font-semibold rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <i className="ri-arrow-left-line mr-1" /> Retour
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
                    >
                      {loading ? <><i className="ri-loader-4-line animate-spin" /> Création...</> : <><i className="ri-user-add-line" /> Créer mon compte</>}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <p className="mt-6 text-center text-sm text-white/60">
              Déjà un compte ?{' '}
              <Link to="/client/connexion" className="text-orange-300 hover:text-orange-200 font-semibold transition-colors">
                Se connecter
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}