import { useState} from 'react';;
import './ProductCard.css';


// 'struct do card'
export interface ProductCardProps {
  nome: string;
  isVegano: boolean;
  tipo: string;
  preco: number;
  imagemPlaceholder?: string; // ? == opcional
}

// recebe dados e exporta a interface
export function ProductCard({nome, isVegano, tipo, preco}: ProductCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return(
        <>

    <div className='card-container' onClick={() => setIsModalOpen(true)}>
      <h3 className='card-titulo'>{nome}</h3>
      {/* AQUI IREMOS COLOCAR A FOTO*/}
      <div className='card-foto'>
        📷
      </div>

      {isVegano && (
        <span className="tag-vegano">vegano</span>
      )}

    </div>
    {/* janela do modal*/}
    {isModalOpen && (
        <div className = "modal-overlay">
        <div className = "modal-content">

        <button className="botao-fechar" onClick={() => setIsModalOpen(false)}>X</button>

         {/*INFORMACOES SOBRE PRODUTO*/}

         <div className ='modal-foto-grande'>📷</div>
         <h2>{nome}</h2>
         <p className="modal-tipo">Categoria: {tipo}</p>
         <p className ="modal-preco">R$ {preco.toFixed(2)}</p>

         {isVegano && (
            <span className="tag-vegano">vegano</span>
         )}

         <button className="botao-adicionar">Adicionar no carrinho</button>

         </div>
    </div>
    )}
    </>
  );
}
