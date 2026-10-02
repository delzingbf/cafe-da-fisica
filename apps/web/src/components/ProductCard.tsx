import './ProductCard.css';


// 'struct do card'
export interface ProductCardProps {
  nome: string;
  isVegano: boolean;
  imagemPlaceholder?: string; // O "?" diz que esse dado é opcional por enquanto
}

// recebe dados e exporta a interface
export function ProductCard({nome, isVegano}: ProductCardProps) {
  return(
    <div className='card-container'>


      <h3 className='card-titulo'>{nome}</h3>

      {/* AQUI IREMOS COLOCAR A FOTO*/}
      <div className='card-foto'>
        📷
      </div>

      {isVegano && (
        <span className="tag-vegano">vegano</span>
      )}

    </div>
  );
}
