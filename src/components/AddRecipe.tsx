import { motion } from 'motion/react';
import { Camera, ImagePlus, Check, X, FileText, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useRef } from 'react';
import React from 'react';
import { CATEGORIES } from '../types';

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function AddRecipe() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [servings, setServings] = useState(4);
  
  const [categoryMode, setCategoryMode] = useState<'select' | 'new'>('select');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    setSelectedFile(file);
    setIsParsing(true);

    // Appel direct à Gemini pour analyser le document
    const prompt = `Analyse ce document de recette. Extrais le titre, la catégorie, les ingrédients et les étapes au format JSON avec cette structure exacte :
    { "title": "Titre", "category": "Catégorie", "ingredients": ["ingrédient 1"], "instructions": ["étape 1"] }`;
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        // Utilisation du SDK déjà présent dans ton package.json
        const result = await ai.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: [
             prompt,
             { inlineData: { data: base64, mimeType: file.type } }
           ],
           config: {
             responseMimeType: 'application/json'
           }
        });
        
        const data = JSON.parse(result.text || "{}");
        
        // Auto-remplissage des champs du formulaire
        setTitle(data.title || '');
        setIngredients(data.ingredients ? data.ingredients.join('\n') : '');
        setInstructions(data.instructions ? data.instructions.join('\n') : '');
        setIsParsing(false);
      };
      
      reader.onerror = () => {
        setIsParsing(false);
      }
    } catch (e) {
      setIsParsing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="max-w-3xl mx-auto px-6 py-12 lg:py-20 pb-32"
    >
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-3xl lg:text-5xl font-serif font-semibold text-text-main mb-4 tracking-tight">
          Nouvelle recette
        </h1>
        <p className="text-text-muted text-sm max-w-md mx-auto lg:mx-0">
          Ajoutez votre création à la collection via une photo, ou glissez un PDF pour que l'IA extraie la recette automatiquement.
        </p>
      </div>

      <div className="space-y-12">
        {/* Photo/PDF Upload area */}
        <section>
          <div 
            className={cn(
              "w-full h-64 lg:h-80 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer relative overflow-hidden group",
              dragActive ? "border-accent bg-accent/5 scale-[1.02]" : "border-border hover:border-accent/50 bg-surface hover:bg-surface-hover"
            )}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            {isParsing ? (
              <div className="flex flex-col items-center justify-center text-accent">
                <Loader2 size={32} className="animate-spin mb-4" />
                <span className="text-sm font-medium">L'IA analyse votre PDF...</span>
                <span className="text-xs opacity-70 mt-1">Extraction des ingrédients et étapes</span>
              </div>
            ) : selectedFile ? (
              <div className="flex flex-col items-center justify-center text-text-main">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
                   {selectedFile.type === 'application/pdf' ? <FileText size={24} /> : <ImagePlus size={24} />}
                </div>
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-text-muted mt-2 hover:underline">Changer de fichier</span>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center text-text-muted group-hover:scale-110 transition-transform shadow-sm">
                  <ImagePlus size={24} />
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-text-main block mb-1">
                    Ajouter une photo ou un PDF
                  </span>
                  <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                    Glisser-déposer ou cliquer
                  </span>
                </div>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept="image/*,application/pdf" 
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-text-light uppercase tracking-widest pl-2">
              Titre de la recette
            </label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Tarte au citron meringuée"
              className="w-full bg-surface px-6 py-4 rounded-2xl text-lg font-medium text-text-main placeholder:text-text-light border border-border focus:outline-none focus:border-accent focus:ring-4 ring-accent/10 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-text-light uppercase tracking-widest pl-2">
              Nombre de personnes (base)
            </label>
            <input 
              type="number" 
              value={servings} 
              onChange={e => setServings(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full bg-surface px-6 py-4 rounded-2xl text-lg font-medium text-text-main border border-border focus:outline-none focus:border-accent focus:ring-4 ring-accent/10 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-text-light uppercase tracking-widest pl-2">
                Catégorie
              </label>
              {categoryMode === 'select' ? (
                <select 
                  value={selectedCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'OTHER') {
                      setCategoryMode('new');
                      setNewCategory('');
                    } else {
                      setSelectedCategory(val);
                    }
                  }}
                  className="w-full bg-surface px-6 py-4 rounded-2xl text-sm font-medium text-text-main border border-border focus:outline-none focus:border-accent focus:ring-4 ring-accent/10 transition-all shadow-sm appearance-none cursor-pointer"
                >
                  <option value="" disabled>Sélectionner...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="OTHER" className="font-bold">Créer une nouvelle catégorie...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nom de la nouvelle catégorie"
                    className="flex-1 bg-surface px-6 py-4 rounded-2xl text-sm font-medium text-text-main placeholder:text-text-light border border-border focus:outline-none focus:border-accent focus:ring-4 ring-accent/10 transition-all shadow-sm"
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      setCategoryMode('select');
                      setSelectedCategory('');
                    }}
                    className="px-6 py-4 rounded-2xl text-text-muted hover:text-text-main bg-surface border border-border transition-colors hover:bg-surface-hover"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-text-light uppercase tracking-widest pl-2">
                Ingrédients (un par ligne)
              </label>
              <textarea 
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Ex: 2 oeufs&#10;100g de sucre..."
                rows={5}
                className="w-full bg-surface px-6 py-4 rounded-2xl text-sm font-medium text-text-main placeholder:text-text-light border border-border focus:outline-none focus:border-accent focus:ring-4 ring-accent/10 transition-all shadow-sm resize-none custom-scrollbar"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-text-light uppercase tracking-widest pl-2">
                Instructions (une par ligne)
              </label>
              <textarea 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ex: 1. Mélanger les oeufs et le sucre...&#10;2. Ajouter la farine..."
                rows={6}
                className="w-full bg-surface px-6 py-4 rounded-2xl text-sm font-medium text-text-main placeholder:text-text-light border border-border focus:outline-none focus:border-accent focus:ring-4 ring-accent/10 transition-all shadow-sm resize-none custom-scrollbar"
              />
            </div>
          </div>
        </section>
        
        <div className="pt-6 flex justify-end gap-4 border-t border-border">
          <button className="px-6 py-3 rounded-full text-sm font-medium text-text-muted hover:text-text-main transition-colors">
            Annuler
          </button>
          <button className="px-8 py-3 rounded-full text-sm font-medium bg-text-main text-white shadow-md hover:shadow-lg hover:bg-black transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            <Check size={16} />
            Enregistrer
          </button>
        </div>
      </div>
    </motion.div>
  );
}
