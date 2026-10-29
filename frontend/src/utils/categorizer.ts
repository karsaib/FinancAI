export const autoCategorize = (description: string, categories: any[] = []): string => {
  if (!description) return 'Egyéb';
  
  // Ékezetmentesítés segédfüggvény
  const removeAccents = (str: string) => 
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const cleanDesc = removeAccents(description);

  // 1. Dinamikus kategóriák és kulcsszavak ellenőrzése (ha vannak a store-ban)
  if (Array.isArray(categories)) {
    for (const cat of categories) {
      if (cat.name && cleanDesc.includes(removeAccents(cat.name))) {
        return cat.name;
      }
      if (cat.keywords && Array.isArray(cat.keywords)) {
        for (const kw of cat.keywords) {
          if (kw && cleanDesc.includes(removeAccents(kw))) {
            return cat.name;
          }
        }
      }
    }
  }


  return 'Egyéb';
};