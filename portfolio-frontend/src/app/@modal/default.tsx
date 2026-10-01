// Estado por defecto del slot @modal: vacio.
//
// Es obligatorio en una ruta paralela a nivel raiz. Sin el, cualquier ruta que
// no coincida con una interceptora (es decir, casi todas) fallaria al resolver
// el slot. Devolver null lo deja inerte y el resto del sitio no se entera.
export default function ModalPorDefecto() {
  return null;
}
