import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { recipes as rawRecipes } from './data/recipes';
import { Recipe } from './types';
import { RecipeDetail } from './components/RecipeDetail';
import { AddRecipe } from './components/AddRecipe';
import { Sidebar } from './components/Sidebar';
import { Menu, Search, Sparkles, Utensils } from 'lucide-react';

// --- CONFIGURATION DE SÉCURITÉ : IMAGES À BANNIR ---
const BANNED_IMAGE_IDS = [
  'photo-1607532941433-304659e8198a', // Identifiant précis de l'image de la bûche par défaut (petits pots)
  'photo-1504674900247-0877df9cc836', // Identifiant de l'image de cuisine générique par défaut
  'photo-1582722872445-44dc5f7e3c8f'  // Identifiant de l'image des œufs par défaut
];

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentView, setCurrentView] = useState<'none' | 'recipe' | 'add'>('none');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);

  // --- 1. MOTEUR DE RECHERCHE D'IMAGES HAUTE DÉFINITION ---
  const findProfessionalImage = useCallback(async (recipeTitle: string) => {
    try {
      // On construit une requête ultra-ciblée pour la photographie culinaire professionnelle
      const query = `${recipeTitle} gourmet plated food photography professional`;
      const response = await fetch('/api/search-image?q=' + encodeURIComponent(query));
      if (!response.ok) return null;
      
      const searchResults = await response.json();
      
      if (searchResults && searchResults.results && searchResults.results.length > 0) {
        // On parcourt les résultats pour être sûr de ne pas reprendre une image bannie
        for (const result of searchResults.results) {
          if (result.image) {
            const isBanned = BANNED_IMAGE_IDS.some(id => result.image.includes(id));
            if (!isBanned) {
              return result.image; // On retourne la première image de qualité qui n'est pas bannie
            }
          }
        }
      }
    } catch (error) {
      console.error(`Erreur de recherche pour : ${recipeTitle}`, error);
    }
    return null;
  }, []);

  // --- 2. SYNCHRONISATION ET CORRECTION AUTOMATIQUE ---
  useEffect(() => {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then((persistent) => {
        if (persistent) {
          console.log("Stockage persistant activé : Les données ne seront pas supprimées.");
        } else {
          console.log("Stockage persistant refusé par le navigateur.");
        }
      });
    }

    const processRecipes = async () => {
      // Restore from local storage or use rawRecipes
      const savedCustom = localStorage.getItem('pamela_custom_database');
      let baseList = rawRecipes.map((r, index) => {
        let cat = r.category;
        if (cat === "BASES SALÉES") cat = "Bases Salées";
        else if (cat === "ENTRÉES") cat = "Entrées";
        else if (cat === "SAVEURS D’ASIE") cat = "Saveurs d'Asie";
        else if (cat === "PLATS EXPRESS") cat = "Plats Express";
        else if (cat === "TOUT CHOCOLAT") cat = "Tout Chocolat";
        else if (cat === "VIANDE") cat = "Viande";
        return { ...r, category: cat, id: `${r.id}-${index}` };
      });

      if (savedCustom) {
        try {
          const parsed = JSON.parse(savedCustom) as Recipe[];
          if (parsed && parsed.length > 0) {
            baseList = parsed;
          }
        } catch (e) {
          console.error("Erreur parsing pamela_custom_database", e);
        }
      }

      setRecipes(baseList);

      // Étape B : Correction des images "en cascade"
      const correctedList = await Promise.all(baseList.map(async (recipe) => {
        const currentUrl = recipe.imageUrl || '';
        
        // On définit si l'image actuelle est mauvaise (vide ou dans la liste noire)
        const isBadImage = !currentUrl || BANNED_IMAGE_IDS.some(id => currentUrl.includes(id));

        if (isBadImage) {
          console.log(`[Image Engine] Correction forcée pour : ${recipe.title}`);
          const newImage = await findProfessionalImage(recipe.title);
          return { ...recipe, imageUrl: newImage || currentUrl };
        }
        
        return recipe;
      }));

      setRecipes(correctedList);
    };

    processRecipes();
  }, [findProfessionalImage]);

  // --- CHARGEMENT AU DÉMARRAGE (Load) ---
  useEffect(() => {
    const savedRecents = localStorage.getItem('pamela_recent_recipes');
    if (savedRecents && recipes.length > 0) {
      try {
        const parsedIds = JSON.parse(savedRecents) as string[];
        // On reconstruit les objets recettes complets à partir des IDs stockés
        const reconstructed = parsedIds
          .map(id => recipes.find(r => r.id === id))
          .filter((r): r is Recipe => !!r);
        setRecentRecipes(reconstructed);
      } catch (e) {
        console.error("Erreur de lecture du stockage", e);
      }
    }
  }, [recipes]); // Se déclenche une fois que les recettes sont chargées

  // --- SAUVEGARDE AUTOMATIQUE (Save) ---
  useEffect(() => {
    if (recentRecipes.length > 0) {
      const idsToSave = recentRecipes.map(r => r.id);
      localStorage.setItem('pamela_recent_recipes', JSON.stringify(idsToSave));
    }
  }, [recentRecipes]);

  const resetToHome = useCallback(() => {
    setCurrentView('none');
    setSelectedRecipe(null);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // --- 3. LOGIQUE DE NAVIGATION ET SÉLECTION ---
  const handleSelectRecipe = useCallback((recipe: Recipe | null) => {
    if (!recipe) {
      resetToHome();
      return;
    }

    setSelectedRecipe(recipe);
    setCurrentView('recipe');
    
    setRecentRecipes(prev => {
      const filtered = prev.filter(r => r.id !== recipe.id);
      return [recipe, ...filtered].slice(0, 10);
    });

    setSearchQuery('');
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetToHome]);

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return recipes;
    return recipes.filter(r => 
      r.title.toLowerCase().includes(q)
    );
  }, [searchQuery, recipes]);

  return (
    <div className="min-h-screen bg-sand flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar 
        recipes={recipes}
        searchQuery={searchQuery}
        selectedRecipe={selectedRecipe}
        onSelectRecipe={handleSelectRecipe}
        onAddRecipe={() => setCurrentView('add')}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:px-12">
          
          <div className="lg:hidden mb-6 flex items-center gap-3 bg-sand z-30 sticky top-0 py-2 border-b border-border">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 -ml-2 text-text-muted hover:text-text-main rounded-xl hover:bg-surface transition-colors shrink-0"
            >
              <Menu size={24} />
            </button>
            <h1 onClick={resetToHome} className="font-serif text-2xl font-bold cursor-pointer truncate">
              Les Saveurs de Paméla
            </h1>
          </div>

          <AnimatePresence mode="wait">
            {currentView === 'recipe' && selectedRecipe ? (
              <motion.div 
                key={selectedRecipe.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }} 
                className="h-full w-full"
              >
                <RecipeDetail 
                  recipe={selectedRecipe} 
                  onBack={resetToHome} 
                  onUpdate={(updatedRecipe) => {
                    setRecipes(prev => {
                      const newList = prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r);
                      localStorage.setItem('pamela_custom_database', JSON.stringify(newList));
                      return newList;
                    });
                    setSelectedRecipe(updatedRecipe);
                  }}
                />
              </motion.div>
            ) : currentView === 'add' ? (
              <motion.div key="add" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full w-full">
                <AddRecipe key="add" />
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{opacity:0}} className="space-y-12">
                {/* TITRE ET RECHERCHE */}
                <div className="space-y-8 hidden lg:block">
                  <h1 onClick={resetToHome} className="font-serif text-4xl font-bold cursor-pointer hover:text-accent transition-colors">
                    Les Saveurs de Paméla
                  </h1>
                  
                  <div className="relative max-w-2xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-light" size={20} />
                    <input 
                      type="text"
                      placeholder="Chercher une recette (ex: Bûche fraise...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white h-16 pl-16 pr-8 rounded-2xl shadow-sm border border-border focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="lg:hidden relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" size={18} />
                    <input 
                      type="text"
                      placeholder="Chercher une recette..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white h-14 pl-12 pr-6 rounded-2xl shadow-sm border border-border focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all text-sm"
                    />
                </div>

                {/* GRILLE DE RECETTES */}
                <div>
                  <h2 className="font-serif text-2xl mb-8">
                    {searchQuery ? `Résultats (${filteredRecipes.length})` : 'Dernières consultations'}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {(searchQuery ? filteredRecipes : recentRecipes).map(r => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        key={r.id}
                        onClick={() => handleSelectRecipe(r)}
                        className="bg-white rounded-3xl flex flex-col overflow-hidden border border-border cursor-pointer group hover:border-accent/40 shadow-sm active:scale-95 transition-transform duration-100 motion-safe"
                        style={{ touchAction: 'manipulation' }}
                      >
                        <div className="aspect-[4/3] overflow-hidden bg-sand-dark relative">
                          {!r.imageUrl && <div className="absolute inset-0 flex items-center justify-center animate-pulse"><Sparkles className="text-accent/20" /></div>}
                          <img 
                            src={r.imageUrl || 'https://images.unsplash.com/photo-1547517023-7ca0c162f816'} 
                            alt={r.title} 
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1547517023-7ca0c162f816'; e.currentTarget.style.opacity = '1'; }}
                          />
                        </div>
                        <div className="p-4 md:p-5 flex-1">
                          <h3 className="font-serif text-sm md:text-base line-clamp-2">{r.title}</h3>
                          <p className="text-[10px] text-text-muted uppercase tracking-widest mt-2 font-bold">{r.category}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {(!searchQuery && recentRecipes.length === 0) && (
                     <div className="text-center text-text-muted py-12 flex flex-col items-center">
                        <Utensils size={32} className="mb-4 text-text-light" />
                        <p>Commencez à explorer vos recettes !</p>
                     </div>
                  )}

                  {(searchQuery && filteredRecipes.length === 0) && (
                     <div className="text-center text-text-muted py-12">
                        <p>Aucune recette ne correspond à votre recherche.</p>
                     </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
