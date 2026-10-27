import fundo from '../../img/fundo.jpg';

// A imagem é pequena, então é repetida em mosaico no tamanho original
// (sem esticar, fica nítida) e bem apagada, só como textura de fundo.
// O elemento pai precisa ser `relative`, e o conteúdo por cima também.
export default function FundoImagem({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 bg-repeat opacity-[0.07] dark:opacity-[0.04] ${className}`}
      style={{ backgroundImage: `url(${fundo})`, backgroundSize: '240px auto' }}
    />
  );
}
