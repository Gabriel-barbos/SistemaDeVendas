import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/estoque';

const useEstoque = () => {
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar o estoque
  const fetchEstoque = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setEstoque(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar a quantidade de um produto
  const updateProductQuantity = async (id, quantity) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, { quantity });
  
      if (response.status === 200) {
        setEstoque(prevEstoque =>
          prevEstoque.map(produto =>
            produto._id === id ? { ...produto, quantity } : produto
          )
        );
      } else {
        console.error('Erro ao atualizar a quantidade do produto');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // Busca o estoque quando o hook é usado
  useEffect(() => {
    fetchEstoque();
  }, []);

  return {
    estoque,
    loading,
    error,
    fetchEstoque,
    updateProductQuantity,
  };
};

export default useEstoque;