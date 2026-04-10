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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/espace-client');
    }, 1500);
  };

  const steps = [
    { num: 1, label: 'Identité' },
    { num: 2, label: 'Informations' },
    { num: 3, label: 'Sécurité' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=african%20woman%20entrepreneur%20smiling%20holding%20phone%20mobile%20banking%20fintech%20app%2C%20warm%20orange%20background%2C%20modern%20professional%20setting%2C%20confident%20expression%2C%20financial%20empowerment&width=700&height=900&seq=signup-bg-01&orientation=portrait"
          alt="Inscription COWEC"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/75 via-orange-500/50 to-orange-900/80" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <i className="ri-bank-line text-orange-500 text-xl" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">COWEC</h1>
              <p className="text-orange-100 text-xs">Microfinance</p>
            </div>
          </div>
          <div>
            <h2 className="text-white text-3xl font-bold leading-tight mb-4">
              Rejoignez des milliers de clients satisfaits
            </h2>
            <div className="space-y-3">
              {['Accès rapide aux crédits', 'Remboursements flexibles', 'Suivi en temps réel', 'Support 24/7'].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-check-line text-white text-xs" />
                  </div>
                  <span className="text-orange-100 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Créer un compte</h2>
            <p className="text-gray-500 text-sm">Remplissez le formulaire pour rejoindre COWEC</p>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                  step > s.num ? 'bg-green-500 text-white' : step === s.num ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.num ? <i className="ri-check-line text-xs" /> : s.num}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${step === s.num ? 'text-orange-500' : 'text-gray-400'}`}>{s.label}</span>
                {i < steps.length - 1 && <div className={`flex-1 h-px ${step > s.num ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom *</label>
                    <input
                      type="text"
                      value={form.prenom}
                      onChange={(e) => update('prenom', e.target.value)}
                      placeholder="Aminata"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.prenom ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
                    <input
                      type="text"
                      value={form.nom}
                      onChange={(e) => update('nom', e.target.value)}
                      placeholder="Diallo"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.nom ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                      <i className="ri-mail-line text-gray-400 text-sm" />
                    </div>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="votre@email.com"
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                      <i className="ri-phone-line text-gray-400 text-sm" />
                    </div>
                    <input
                      type="tel"
                      value={form.telephone}
                      onChange={(e) => update('telephone', e.target.value)}
                      placeholder="+221 77 000 00 00"
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.telephone ? 'border-red-400' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                </div>
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer whitespace-nowrap"
                >
                  Continuer <i className="ri-arrow-right-line ml-1" />
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse *</label>
                  <input
                    type="text"
                    value={form.adresse}
                    onChange={(e) => update('adresse', e.target.value)}
                    placeholder="Dakar, Médina, Rue 12"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.adresse ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Profession *</label>
                  <select
                    value={form.profession}
                    onChange={(e) => update('profession', e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.profession ? 'border-red-400' : 'border-gray-200'}`}
                  >
                    <option value="">Sélectionner...</option>
                    <option>Commerçant(e)</option>
                    <option>Agriculteur/Agricultrice</option>
                    <option>Artisan(e)</option>
                    <option>Fonctionnaire</option>
                    <option>Entrepreneur(e)</option>
                    <option>Pêcheur/Pêcheuse</option>
                    <option>Éleveur/Éleveuse</option>
                    <option>Autre</option>
                  </select>
                  {errors.profession && <p className="text-red-500 text-xs mt-1">{errors.profession}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de naissance *</label>
                  <input
                    type="date"
                    value={form.dateNaissance}
                    onChange={(e) => update('dateNaissance', e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.dateNaissance ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.dateNaissance && <p className="text-red-500 text-xs mt-1">{errors.dateNaissance}</p>}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line mr-1" /> Retour
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Continuer <i className="ri-arrow-right-line ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                      <i className="ri-lock-line text-gray-400 text-sm" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      placeholder="Minimum 8 caractères"
                      className={`w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center cursor-pointer">
                      <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 text-sm`} />
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  {form.password && (
                    <div className="mt-2 flex gap-1">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className={`flex-1 h-1 rounded-full ${form.password.length >= i * 2 ? (form.password.length >= 8 ? 'bg-green-400' : 'bg-orange-400') : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe *</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                      <i className="ri-lock-2-line text-gray-400 text-sm" />
                    </div>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => update('confirmPassword', e.target.value)}
                      placeholder="Répétez le mot de passe"
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.acceptTerms}
                    onChange={(e) => update('acceptTerms', e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-orange-500 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-600">
                    J'accepte les{' '}
                    <span className="text-orange-500 font-medium cursor-pointer">conditions d'utilisation</span>
                    {' '}et la{' '}
                    <span className="text-orange-500 font-medium cursor-pointer">politique de confidentialité</span>
                    {' '}de COWEC Microfinance.
                  </span>
                </label>
                {errors.acceptTerms && <p className="text-red-500 text-xs">{errors.acceptTerms}</p>}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line mr-1" /> Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all disabled:opacity-70 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    {loading ? <><i className="ri-loader-4-line animate-spin" /> Création...</> : <><i className="ri-user-add-line" /> Créer mon compte</>}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link to="/client/connexion" className="text-orange-500 hover:text-orange-600 font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
