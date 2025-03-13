import { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';

const API_URL = 'https://sistemapdv-2.onrender.com/products';

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar todos os produtos
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      setProducts(response.data);
    } catch (err) {
      setError(err);
      message.error("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };

  // Criar produto e atualizar lista
  const createProduct = async (productData) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(API_URL, productData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success("Produto criado com sucesso!");
      fetchProducts();
    } catch (err) {
      setError(err);
      message.error("Erro ao criar produto.");
    } finally {
      setLoading(false);
    }
  };

  // Atualizar produto e atualizar lista
  const updateProduct = async (id, productData) => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(`${API_URL}/${id}`, productData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success("Produto atualizado com sucesso!");
      fetchProducts();
    } catch (err) {
      setError(err);
      message.error("Erro ao atualizar produto.");
    } finally {
      setLoading(false);
    }
  };

  // Deletar produto e atualizar lista
  const deleteProduct = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
      message.success("Produto excluído com sucesso!");
      fetchProducts();
    } catch (err) {
      setError(err);
      message.error("Erro ao excluir produto.");
    } finally {
      setLoading(false);
    }
  };

  // Buscar produtos ao carregar a página
  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};

export default useProducts;
