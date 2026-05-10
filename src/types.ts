export interface Recipe {
  id: string;
  title: string;
  category: string;
  ingredients: string[];
  instructions: string[];
  yield?: string;
  notes?: string;
  imageUrl?: string;
  servings?: number;
}

export const CATEGORIES = [
  "Bases Salées",
  "Entrées",
  "Accompagnements",
  "Apéritifs",
  "Bases Sucrées",
  "Boulangerie",
  "Bûches de Noël",
  "Crèmes, Glaces, Mousses",
  "Cuisine du Brésil",
  "Cuisine Indienne",
  "Desserts d'Ailleurs",
  "Entremets",
  "Fruits et Coques",
  "Gourmandises",
  "Gros Gâteaux",
  "Macarons",
  "Ottolenghi",
  "Plats Uniques & Pâtes",
  "Plats Express",
  "Poissons & Crustacés",
  "Salades",
  "Sauces, Dips & Marinades",
  "Saveurs d'Asie",
  "Soupes",
  "Tartes",
  "Tout Chocolat",
  "Viande"
];
