import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { message } from 'antd';

const API_URL = 'https://sistema-de-vendas-lemon.vercel.app/products';

// Cache simples em memória
const cache = {
  data: null,
  timestamp: null,
  TTL: 5 * 60 * 1000, // 5 minutos
};

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  // Verifica se o cache ainda é válido
  const isCacheValid = useCallback(() => {
    return cache.data && 
           cache.timestamp && 
           (Date.now() - cache.timestamp) < cache.TTL;
  }, []);

  // Função para buscar todos os produtos com cache
  const fetchProducts = useCallback(async (forceRefresh = false) => {
    // Se já tem cache válido e não é um refresh forçado, usa o cache
    if (!forceRefresh && isCacheValid()) {
      setProducts(cache.data);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      const productsData = response.data;
      
      // Atualiza o cache
      cache.data = productsData;
      cache.timestamp = Date.now();
      
      setProducts(productsData);
    } catch (err) {
      setError(err);
      message.error("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }, [isCacheValid]);

  // Atualiza estado local sem fazer nova requisição
  const updateLocalState = useCallback((updatedProducts) => {
    setProducts(updatedProducts);
    // Atualiza também o cache
    cache.data = updatedProducts;
    cache.timestamp = Date.now();
  }, []);

  // Criar produto com otimização
  const createProduct = useCallback(async (productData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(API_URL, productData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      message.success("Produto criado com sucesso!");
      
      // Atualização otimista - adiciona o produto retornado ao estado atual
      const newProduct = response.data;
      const updatedProducts = [...products, newProduct];
      updateLocalState(updatedProducts);
      
    } catch (err) {
      setError(err);
      message.error("Erro ao criar produto.");
      throw err; // Re-throw para o componente tratar se necessário
    } finally {
      setLoading(false);
    }
  }, [products, updateLocalState]);

  // Atualizar produto com otimização
  const updateProduct = useCallback(async (id, productData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/${id}`, productData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      message.success("Produto atualizado com sucesso!");
      
      // Atualização otimista - atualiza o produto no estado atual
      const updatedProduct = response.data;
      const updatedProducts = products.map(product => 
        product._id === id ? updatedProduct : product
      );
      updateLocalState(updatedProducts);
      
    } catch (err) {
      setError(err);
      message.error("Erro ao atualizar produto.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [products, updateLocalState]);

  // Deletar produto com otimização
  const deleteProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
      message.success("Produto excluído com sucesso!");
      
      // Atualização otimista - remove o produto do estado atual
      const updatedProducts = products.filter(product => product._id !== id);
      updateLocalState(updatedProducts);
      
    } catch (err) {
      setError(err);
      message.error("Erro ao excluir produto.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [products, updateLocalState]);

  // Função para limpar cache manualmente
  const clearCache = useCallback(() => {
    cache.data = null;
    cache.timestamp = null;
  }, []);

  // Buscar produtos ao carregar a página (apenas uma vez)
  useEffect(() => {
    if (!hasFetched.current) {
      fetchProducts();
      hasFetched.current = true;
    }
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    clearCache, // Para limpar cache quando necessário
  };
};

export default useProducts;