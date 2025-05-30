import React, { useState, useEffect, useCallback, useMemo } from "react";
import debounce from "lodash/debounce";
import { message } from "antd";
import useProducts from "../Produtos/useProducts";
import ProductSearch from "./components/ProductSearch";
import PurchaseList from "./components/PurchaseList";
import OrderDetails from "./components/OrderDetails";
import PaymentSection from "./components/PaymentSection";
import SaleModals from "./components/SaleModals";
import "../Caixa/caixa.css";

function Caixa() {
  const { products, fetchProducts } = useProducts();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchaseList, setPurchaseList] = useState([]);
  const [saleConfirmed, setSaleConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Estados para dados adicionais de pagamento
  const [fiadoName, setFiadoName] = useState("");
  const [dinheiroModalVisible, setDinheiroModalVisible] = useState(false);
  const [dinheiroReceived, setDinheiroReceived] = useState("");
  const [dinheiroTroco, setDinheiroTroco] = useState(null);

  // Estado para controlar busca automática vs manual
  const [lastSearchTime, setLastSearchTime] = useState(0);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRemoveProduct = useCallback((indexToRemove) => {
    setPurchaseList((prevList) =>
      prevList.filter((_, index) => index !== indexToRemove)
    );
  }, []);

  const handleQuantityChange = useCallback((index, newQuantity) => {
    if (newQuantity < 1) {
      message.error("A quantidade deve ser pelo menos 1.");
      return;
    }
    setPurchaseList((prevList) => {
      const newList = [...prevList];
      newList[index].quantity = newQuantity;
      return newList;
    });
  }, []);

  const handlePaymentSelect = useCallback((paymentType) => {
    setSelectedPayment((prevPayment) => {
      const newPayment = prevPayment === paymentType ? null : paymentType;
      if (newPayment === "dinheiro") {
        setDinheiroModalVisible(true);
      } else {
        setDinheiroModalVisible(false);
      }
      return newPayment;
    });
  }, []);

  // Sistema de busca melhorado para códigos de barras
  const performSearch = useCallback((value) => {
    if (!value.trim()) {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.name?.toLowerCase().includes(value.toLowerCase()) ||
        product.BarCode?.includes(value) ||
        product.code?.includes(value)
    );
    
    setFilteredProducts(filtered);

    // Se encontrou produto exato por código de barras, seleciona automaticamente
    const exactMatch = products.find(
      (product) => product.BarCode === value || product.code === value
    );
    
    if (exactMatch) {
      setSelectedProduct(exactMatch);
      setSearchTerm(exactMatch.name);
      setFilteredProducts([]);
    }
  }, [products]);

  const handleSearch = useCallback((value) => {
    const currentTime = Date.now();
    setSearchTerm(value);
    setSelectedProduct(null);
    setLastSearchTime(currentTime);

    // Limpa timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Para códigos de barras (números longos), busca imediatamente
    const isBarcode = /^\d{8,}$/.test(value);
    
    if (isBarcode) {
      performSearch(value);
    } else {
      // Para busca por nome, usa debounce
      const newTimeout = setTimeout(() => {
        if (Date.now() - currentTime >= 300) {
          performSearch(value);
        }
      }, 300);
      setSearchTimeout(newTimeout);
    }
  }, [performSearch, searchTimeout]);

  const handleSelectProduct = useCallback((product) => {
    setSearchTerm(product.name);
    setSelectedProduct(product);
    setFilteredProducts([]);
  }, []);

  const handleAddProduct = useCallback(() => {
    if (selectedProduct) {
      const index = purchaseList.findIndex(
        (item) => item.product._id === selectedProduct._id
      );
      if (index !== -1) {
        handleQuantityChange(index, purchaseList[index].quantity + 1);
      } else {
        setPurchaseList((prev) => [
          ...prev,
          { product: selectedProduct, quantity: 1 },
        ]);
      }
      setSearchTerm("");
      setSelectedProduct(null);
      message.success("Produto adicionado à lista de compra!");
    } else {
      message.error("Selecione um produto da lista de sugestões.");
    }
  }, [selectedProduct, purchaseList, handleQuantityChange]);

  const totalValue = useMemo(() => {
    return purchaseList.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
  }, [purchaseList]);

  const lastProduct = useMemo(() => {
    return purchaseList.length > 0 ? purchaseList[purchaseList.length - 1].product : null;
  }, [purchaseList]);

  const handleConcluirCompra = useCallback(async () => {
    if (purchaseList.length === 0) {
      message.error("A lista de compra está vazia!");
      return;
    }
    if (!selectedPayment) {
      message.error("Selecione uma forma de pagamento!");
      return;
    }
    if (selectedPayment === "fiado" && !fiadoName.trim()) {
      message.error("Informe o nome do cliente para pagamento fiado");
      return;
    }
    if (selectedPayment === "dinheiro" && dinheiroReceived === "") {
      message.error("Calcule o troco para pagamento em dinheiro");
      return;
    }
    setIsSubmitting(true);

    const items = purchaseList.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    }));

    const payment = { method: selectedPayment };
    if (selectedPayment === "fiado") {
      payment.details = fiadoName;
    } else if (selectedPayment === "dinheiro") {
      payment.details = `Valor recebido: R$ ${parseFloat(dinheiroReceived).toFixed(2)}`;
    }

    const data = { items, payment };

    try {
      const response = await fetch("https://sistema-de-vendas-lemon.vercel.app/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao registrar venda.");
      }

      await response.json();

      const saleDataForReceipt = {
        items: purchaseList,
        total: totalValue,
        payment:
          selectedPayment === "fiado"
            ? `Fiado - ${fiadoName}`
            : selectedPayment === "dinheiro"
            ? `Dinheiro - Valor recebido: R$ ${parseFloat(dinheiroReceived).toFixed(2)} | Troco: R$ ${
                dinheiroTroco !== null ? dinheiroTroco.toFixed(2) : "0.00"
              }`
            : "Cartão",
      };

      setReceiptData(saleDataForReceipt);
      setSaleConfirmed(true);

      // Limpa os dados da compra
      setPurchaseList([]);
      setSelectedPayment(null);
      setFiadoName("");
      setDinheiroTroco(null);
      setDinheiroReceived("");
    } catch (error) {
      console.error("Erro:", error);
      message.error("Erro ao concluir a compra!");
    } finally {
      setIsSubmitting(false);
    }
  }, [purchaseList, selectedPayment, fiadoName, dinheiroReceived, totalValue, dinheiroTroco]);

  return (
    <div className="page-container">
      <div className="left-page">
        <ProductSearch
          searchTerm={searchTerm}
          filteredProducts={filteredProducts}
          onSearch={handleSearch}
          onSelectProduct={handleSelectProduct}
          onAddProduct={handleAddProduct}
        />

        <PurchaseList
          purchaseList={purchaseList}
          onQuantityChange={handleQuantityChange}
          onRemoveProduct={handleRemoveProduct}
        />
      </div>

      <div className="right-page">
        <OrderDetails lastProduct={lastProduct} />

        <PaymentSection
          totalValue={totalValue}
          selectedPayment={selectedPayment}
          fiadoName={fiadoName}
          onPaymentSelect={handlePaymentSelect}
          onFiadoNameChange={setFiadoName}
          onConcluirCompra={handleConcluirCompra}
          isSubmitting={isSubmitting}
        />
      </div>

      <SaleModals
        saleConfirmed={saleConfirmed}
        dinheiroModalVisible={dinheiroModalVisible}
        dinheiroReceived={dinheiroReceived}
        totalValue={totalValue}
        dinheiroTroco={dinheiroTroco}
        receiptData={receiptData}
        onSaleConfirmedClose={() => setSaleConfirmed(false)}
        onDinheiroModalClose={() => {
          setDinheiroModalVisible(false);
          setSelectedPayment(null);
        }}
        onDinheiroReceivedChange={setDinheiroReceived}
        onDinheiroTrocoSet={setDinheiroTroco}
        onDinheiroModalConfirm={() => setDinheiroModalVisible(false)}
      />
    </div>
  );
}

export default Caixa;