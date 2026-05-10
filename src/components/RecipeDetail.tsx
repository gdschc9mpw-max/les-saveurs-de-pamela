import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Utensils, Edit3, Save, X, Plus, Minus, Camera } from 'lucide-react';
import { Recipe } from '../types';
import { cn } from '../lib/utils';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onUpdate: (r: Recipe) => void;
}

export function RecipeDetail({ recipe, onBack, onUpdate }: RecipeDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState(recipe);
  const [multiplier, setMultiplier] = useState(1);
  const hasImage = !!editedRecipe.imageUrl;

  const saveChanges = () => {
    onUpdate(editedRecipe);
    setIsEditing(false);
  };

  const adjustQuantity = (ingredient: string) => {
    return ingredient.replace(/(\d+(?:[.,]\d+)?)/g, (match) => {
      let val = parseFloat(match.replace(',', '.')) * multiplier;
      // Arrondir à 2 décimales si nécessaire pour éviter les nombres float horribles
      val = Math.round(val * 100) / 100;
      return val.toString().replace('.', ',');
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col min-h-full pb-32 lg:pb-12 bg-surface lg:rounded-[2rem] lg:m-4 lg:shadow-sm border border-border overflow-hidden relative"
    >
      {/* Immersive Header */}
      <div className="relative h-[45vh] lg:h-[50vh] min-h-[350px] w-full group overflow-hidden bg-sand-dark">
        <div className="absolute inset-0 bg-stone-900/20 mix-blend-multiply z-10 transition-opacity group-hover:bg-stone-900/10" />
        <img 
          src={editedRecipe.imageUrl || 'https://images.unsplash.com/photo-1495195129352-aeb325a55b65?w=800'} 
          alt={editedRecipe.title} 
          className={cn(
            "w-full h-full object-cover transition-all duration-700 ease-out"
          )}
          onLoad={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1547517023-7ca0c162f816?w=800";
          }}
          style={{ opacity: 0 }}
        />
        
        {isEditing && (
          <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 cursor-pointer text-white z-30 transition-colors hover:bg-black/70">
            <Camera size={48} />
            <p className="mt-2 font-bold font-sans">Choisir une photo</p>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setEditedRecipe({ ...editedRecipe, imageUrl: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }} 
            />
          </label>
        )}
        
        {/* Top actions */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex flex-col items-center justify-center rounded-full bg-surface/80 backdrop-blur-md shadow-sm border border-surface/50 text-text-main hover:bg-surface hover:scale-105 active:scale-95 transition-all"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Title Content over image (bottom gradient) */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 p-6 lg:p-12 pt-24 z-20",
          hasImage ? "bg-gradient-to-t from-black/80 via-black/40 to-transparent" : "bg-gradient-to-t from-black/60 to-transparent"
        )}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className={cn(
              "inline-block px-3 py-1 backdrop-blur-md rounded-full text-[10px] font-semibold tracking-widest uppercase mb-4",
              hasImage ? "bg-surface/20 border border-white/20 text-white/90" : "bg-black/20 text-white/90 border border-white/10"
            )}>
              {editedRecipe.category}
            </span>
            {isEditing ? (
              <input 
                className="text-3xl lg:text-5xl font-serif text-white font-medium leading-[1.1] tracking-tight max-w-3xl w-full bg-transparent border-b border-white/50 focus:outline-none focus:border-white"
                value={editedRecipe.title}
                onChange={(e) => setEditedRecipe({...editedRecipe, title: e.target.value})}
              />
            ) : (
              <h1 className="text-3xl lg:text-5xl font-serif text-white font-medium leading-[1.1] tracking-tight max-w-3xl">
                {editedRecipe.title}
              </h1>
            )}
          </motion.div>
        </div>
      </div>

      {/* Content Body */}
      <div className="px-6 lg:px-12 py-8 lg:py-12 max-w-5xl mx-auto w-full">
        <div className="flex flex-wrap items-center gap-6 pb-10 mb-10 border-b border-border">
          <div className="flex items-center gap-4 text-text-muted">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-accent" />
              <span className="text-sm font-medium">Pour {Math.round((editedRecipe.servings || 4) * multiplier)} personnes</span>
            </div>
            {!isEditing && (
              <div className="flex items-center gap-3 bg-surface border border-border rounded-full px-3 py-1 shadow-sm">
                <button 
                  onClick={() => setMultiplier(Math.max(0.25, multiplier - 0.25))} 
                  className="p-1 text-accent hover:bg-accent/10 rounded-full transition-colors focus:outline-none"
                  aria-label="Réduire les portions"
                >
                  <Minus size={16} />
                </button>
                <span className="text-sm font-bold min-w-[2.5rem] text-center bg-sand-dark text-text-main py-0.5 rounded-md px-1 select-none">
                  {multiplier}x
                </span>
                <button 
                  onClick={() => setMultiplier(multiplier + 0.25)} 
                  className="p-1 text-accent hover:bg-accent/10 rounded-full transition-colors focus:outline-none"
                  aria-label="Augmenter les portions"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <Utensils size={18} className="text-accent" />
            <span className="text-sm font-medium">Préparation {editedRecipe.category ? editedRecipe.category.toLowerCase() : ''}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Ingredients Column */}
          <div className="lg:col-span-5">
            <h3 className="text-[11px] font-bold text-text-light uppercase tracking-[0.2em] mb-6">
              Ingrédients
            </h3>
            <ul className="space-y-4">
              {editedRecipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-4 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/40 mt-2 shrink-0 group-hover:bg-accent transition-colors" />
                  {isEditing ? (
                    <input 
                      className="text-[15px] leading-relaxed text-text-main w-full bg-transparent border-b border-border focus:outline-none"
                      value={ing}
                      onChange={(e) => {
                        const newIngs = [...editedRecipe.ingredients];
                        newIngs[i] = e.target.value;
                        setEditedRecipe({...editedRecipe, ingredients: newIngs});
                      }}
                    />
                  ) : (
                    <span className="text-[15px] leading-relaxed text-text-main">{adjustQuantity(ing)}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions Column */}
          <div className="lg:col-span-7">
            <h3 className="text-[11px] font-bold text-text-light uppercase tracking-[0.2em] mb-6">
              Mode opératoire
            </h3>
            
            <div className="space-y-6">
              {editedRecipe.instructions.map((step, i) => {
                const cleanStep = step.replace(/^- /, '');
                return (
                  <div key={i} className="flex gap-5">
                    <span className="text-sm font-serif italic text-accent-light shrink-0 mt-0.5">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    
                    {isEditing ? (
                      <textarea 
                        className="text-[16px] leading-[1.7] text-text-main w-full bg-transparent border-b border-border focus:outline-none resize-none overflow-hidden min-h-[60px]"
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...editedRecipe.instructions];
                          newSteps[i] = e.target.value;
                          setEditedRecipe({...editedRecipe, instructions: newSteps});
                        }}
                      />
                    ) : (
                      <p className="text-[16px] leading-[1.7] text-text-main text-justify flex-1">
                        {cleanStep}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {editedRecipe.notes && !isEditing && (
              <div className="mt-12 p-6 rounded-2xl bg-sand-dark border border-border relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                <h4 className="font-bold text-[10px] text-text-muted uppercase tracking-[0.2em] mb-3">
                  Note du Chef
                </h4>
                <p className="text-sm italic text-text-muted leading-relaxed">
                  {editedRecipe.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons at bottom */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-4 pb-8 border-t border-border/50 pt-10">
          <button 
            onClick={() => {
              if (isEditing) {
                saveChanges();
              } else {
                setIsEditing(true);
              }
            }}
            className="flex w-full md:w-auto items-center justify-center gap-3 bg-text-main text-white px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-base lg:text-lg"
          >
            {isEditing ? (
              <>
                <Save size={24} />
                Enregistrer les modifications
              </>
            ) : (
              <>
                <Edit3 size={24} />
                Modifier la recette
              </>
            )}
          </button>
          
          {isEditing && (
            <button
              onClick={() => {
                setEditedRecipe(recipe);
                setIsEditing(false);
              }}
              className="flex w-full md:w-auto items-center justify-center gap-3 bg-surface border border-border text-text-main px-8 py-4 rounded-full font-bold shadow-sm hover:shadow-md hover:bg-sand-dark transition-all text-base lg:text-lg"
            >
              <X size={24} />
              Annuler
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
