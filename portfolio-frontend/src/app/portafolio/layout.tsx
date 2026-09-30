// El slot @modal convive con el listado: children es /portafolio y modal solo
// se llena cuando una ruta interceptada esta activa.
export default function PortafolioLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
