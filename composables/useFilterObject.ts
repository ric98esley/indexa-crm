import { stringify } from "querystring";

export const useFilterObject = (obj: any) => {
  // Crea un objeto vacío para almacenar los valores filtrados
  let filtered = {};
  // Recorre las propiedades del objeto con un bucle for...in
  for (let key in obj) {
    // Comprueba si el valor de la propiedad es distinto de undefined y de string vacío
    if (obj[key] !== undefined && obj[key] !== "" && obj[key] !== null) {
      // Añade la propiedad y el valor al objeto filtrado
      filtered[key] = obj[key];
    }
  }
  // Devuelve el objeto filtrado
  return filtered;
}