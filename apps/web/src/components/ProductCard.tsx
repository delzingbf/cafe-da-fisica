import { useState} from 'react';;
import './ProductCard.css';


// 'struct do card'
export interface ProductCardProps {
  name: string;
  isVegan: boolean;
  type: string;
  price: number;
  imagemPlaceholder?: string; // ? == opcional
}

// recebe dados e exporta a interface
export function ProductCard({name, isVegan, type, price}: ProductCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return(
        <>

    <div className='card-container' onClick={() => setIsModalOpen(true)}>
      <h3 className='card-titulo'>{name}</h3>
      {/* AQUI IREMOS COLOCAR A FOTO*/}
      <div className='card-foto'>
        📷
      </div>

      {isVegan && (
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
         <h2>{name}</h2>
         <p className="modal-tipo">Categoria: {type}</p>
         <p className ="modal-preco">R$ {price.toFixed(2)}</p>

         {isVegan && (
            <span className="tag-vegano">vegano</span>
         )}

         <button className="botao-adicionar">Adicionar no carrinho</button>

         </div>
    </div>
    )}
    </>
  );
}
