import { useState, useMemo } from 'react';
import { ChevronRight, Plus, X, BookHeart } from 'lucide-react';
import { Recipe, CATEGORIES } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  recipes: Recipe[];
  searchQuery: string;
  selectedRecipe: Recipe | null;
  onSelectRecipe: (r: Recipe) => void;
  onAddRecipe: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onGoHome?: () => void;
}

export function Sidebar({
  recipes,
  searchQuery,
  selectedRecipe,
  onSelectRecipe,
  onAddRecipe,
  isOpen,
  setIsOpen,
  onGoHome
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const groupedRecipes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const result: Record<string, Recipe[]> = {};
    
    recipes.forEach(r => {
      if (q) {
        if (r.title.toLowerCase().includes(q) || r.ingredients.some(i => i.toLowerCase().includes(q))) {
           if (!result[r.category]) result[r.category] = [];
           result[r.category].push(r);
        }
      } else {
        if (!result[r.category]) result[r.category] = [];
        result[r.category].push(r);
      }
    });

    // sort inside each category
    Object.keys(result).forEach(k => {
      result[k].sort((a, b) => a.title.localeCompare(b.title));
    });

    return result;
  }, [recipes, searchQuery]);

  // If searching, auto-expand categories that have results
  const isSearching = searchQuery.length > 0;
  
  // order by CATEGORIES
  const sortedCategories = CATEGORIES.filter(cat => groupedRecipes[cat]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/20 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 w-[300px] xl:w-[320px] bg-sand-dark border-r border-border z-50 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0 shadow-2xl lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 shrink-0 border-b border-border bg-sand-dark flex items-center justify-between">
          <div 
            onClick={() => {
              if (onGoHome) onGoHome();
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <BookHeart className="text-accent group-hover:scale-110 transition-transform" />
            <span className="font-serif text-lg font-bold">Les Saveurs de Paméla</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="lg:hidden p-1.5 text-text-muted hover:text-text-main bg-surface rounded-full shadow-sm border border-border"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
          {sortedCategories.map(cat => {
            const isExpanded = isSearching || expandedCategories[cat];
            const catRecipes = groupedRecipes[cat];
            return (
              <div key={cat} className="mb-1">
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-bold uppercase tracking-wider text-text-main hover:bg-surface transition-colors"
                >
                  <span className="truncate pr-2">{cat}</span>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <span className="text-[10px] font-bold">
                      {catRecipes.length}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={14} strokeWidth={3} />
                    </motion.div>
                  </div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="py-1 px-1 mb-3 flex flex-col gap-0.5 border-l-[1.5px] border-border ml-[18px] pl-3 mt-1 relative">
                        {catRecipes.map(recipe => {
                          const isSelected = selectedRecipe?.id === recipe.id;
                          return (
                            <button
                              key={recipe.id}
                              onClick={() => {
                                onSelectRecipe(recipe);
                                setIsOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-1.5 rounded-md text-[14px] transition-colors truncate relative",
                                isSelected 
                                  ? "bg-accent/10 text-accent font-medium shadow-sm" 
                                  : "text-text-muted hover:bg-surface hover:text-text-main"
                              )}
                            >
                              {recipe.title}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="p-4 shrink-0 border-t border-border bg-sand-dark">
          <button
            onClick={() => {
              onAddRecipe();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-text-main text-white hover:bg-black transition-all shadow-md active:scale-95"
          >
            <Plus size={16} />
            Ajouter une recette
          </button>
        </div>
      </aside>
    </>
  );
}
