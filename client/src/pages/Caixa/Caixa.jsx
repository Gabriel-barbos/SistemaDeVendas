import React, { useState, useEffect, useCallback, useMemo } from "react";
import debounce from "lodash/debounce";
import {
  BarcodeOutlined,
  TagOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  DollarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Input, Button, List, message, Modal, Result } from "antd";
import product from "../../assets/product.avif";
import emptyGIF from "../../assets/EmptyGIF.gif";
import emptyCart from "../../assets/EmptyCart.gif";
import "../Caixa/caixa.css";
const { Search } = Input;
import ProductItem from "../../components/ProductItem";
import useProducts from "../Produtos/useProducts";


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

  const handleSearch = useCallback(
    (value) => {
      setSearchTerm(value);
      setSelectedProduct(null);
      if (!value.trim()) {
        setFilteredProducts([]);
        return;
      }
      const filtered = products.filter(
        (product) =>
          product.name?.toLowerCase().includes(value.toLowerCase()) ||
          product.BarCode?.includes(value)
      );
      setFilteredProducts(filtered);
    },
    [products]
  );

  const debouncedHandleSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  );

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

  // Calcula o troco enquanto o usuário digita
  const computedTroco = useMemo(() => {
    const received = parseFloat(dinheiroReceived);
    if (!isNaN(received) && received >= totalValue) {
      return received - totalValue;
    }
    return null;
  }, [dinheiroReceived, totalValue]);

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

      // Prepara os dados do comprovante para impressão
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

  const handlePrint = () => {
    const printContents = document.getElementById("receipt-content").innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Comprovante de Venda</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            ul { list-style-type: none; padding: 0; }
            li { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="page-container">
      <div className="left-page">
        <div className="searchbar">
          <div className="page-title">
            <BarcodeOutlined style={{ fontSize: 25, marginRight: 5 }} />
            <h2> Adicionar produto</h2>
          </div>
          <Search
            placeholder="Digite o código ou nome do produto"
            allowClear
            enterButton="Adicionar"
            size="large"
            value={searchTerm}
            onChange={(e) => debouncedHandleSearch(e.target.value)}
            onSearch={handleAddProduct}
          />
          {filteredProducts.length > 0 && (
            <List
              className="autocomplete-list"
              dataSource={filteredProducts}
              renderItem={(item) => (
                <List.Item className="autocomplete-item" onClick={() => handleSelectProduct(item)}>
                  {item.name} - R$ {item.price}
                </List.Item>
              )}
            />
          )}
        </div>

        <div className="order-list">
          <div className="page-title">
            <TagOutlined style={{ fontSize: 25, marginRight: 5 }} />
            <h2> Lista de compra</h2>
          </div>
          <div className="list">
            {purchaseList.length === 0 ? (
              <div className="empty-purchase-list" style={{ textAlign: "center", padding: "20px" }}>
                <img
                  src={emptyCart}
                  alt="Nenhum item"
                  style={{ width: "100%", maxWidth: "250px", marginBottom: "5px" }}
                />
                <p style={{ fontSize: 20, fontWeight: 600 }}>Nenhum item na lista de compras</p>
              </div>
            ) : (
              purchaseList.map((item, index) => (
                <ProductItem
                  key={index}
                  product={item.product}
                  quantity={item.quantity}
                  onQuantityChange={(newQuantity) => handleQuantityChange(index, newQuantity)}
                  onRemove={() => handleRemoveProduct(index)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="right-page">
        <div className="product-container">
          <div className="page-title">
            <ShoppingOutlined style={{ fontSize: 25, marginRight: 5 }} />
            <h2>Detalhes do pedido</h2>
          </div>
          {lastProduct ? (
            <>
              <img
                className="product-img"
                src={lastProduct.image && lastProduct.image.length > 0 ? lastProduct.image[0] : product}
                alt="Produto"
              />
              <div className="product-details">
                <div className="detail-item">
                  <TagOutlined style={{ fontSize: 20, marginRight: 10 }} />
                  <span className="detail-text">
                    <strong>Nome do Produto:</strong> {lastProduct.name}
                  </span>
                </div>
                <div className="detail-item">
                  <DollarOutlined style={{ fontSize: 20, marginRight: 10 }} />
                  <span className="detail-text">
                    <strong>Preço:</strong> R$ {lastProduct.price}
                  </span>
                </div>
                <div className="detail-item">
                  <BarcodeOutlined style={{ fontSize: 20, marginRight: 10 }} />
                  <span className="detail-text">
                    <strong>Cod.produto:</strong> {lastProduct.code || lastProduct.BarCode}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <img className="product-img" src={emptyGIF} alt="Produto" />
              <div className="product-details">
                <div className="detail-item">
                  <span className="empty-text">Nenhum produto adicionado</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="total-container">
          <div className="page-title">
            <ShoppingCartOutlined style={{ fontSize: 25, marginRight: 5 }} />
            <h2>Resumo da compra</h2>
          </div>
          <div className="details">
            <span>Total: </span>
            <span className="total-value">
              {totalValue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>

          <div className="page-title">
            <ShoppingCartOutlined style={{ fontSize: 25, marginRight: 5 }} />
            <h2>Forma de pagamento:</h2>
          </div>

          <div className="payment-buttons">
            <Button
              icon={<CreditCardOutlined />}
              onClick={() => handlePaymentSelect("cartao")}
              disabled={selectedPayment && selectedPayment !== "cartao"}
              className={selectedPayment === "cartao" ? "selected" : ""}
            >
              Cartão
            </Button>
            <Button
              icon={<DollarOutlined />}
              onClick={() => handlePaymentSelect("dinheiro")}
              disabled={selectedPayment && selectedPayment !== "dinheiro"}
              className={selectedPayment === "dinheiro" ? "selected" : ""}
            >
              Dinheiro
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => handlePaymentSelect("fiado")}
              disabled={selectedPayment && selectedPayment !== "fiado"}
              className={selectedPayment === "fiado" ? "selected" : ""}
            >
              Fiado
            </Button>
          </div>

          {selectedPayment === "fiado" && (
            <Input
              placeholder="Nome do cliente"
              value={fiadoName}
              onChange={(e) => setFiadoName(e.target.value)}
              style={{ marginTop: "10px" }}
            />
          )}

          <Button
            type="primary"
            className="concluir-compra"
            onClick={handleConcluirCompra}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <CheckCircleOutlined />
            Concluir Compra
          </Button>
        </div>
      </div>

      <Modal
        visible={saleConfirmed}
        footer={null}
        onCancel={() => setSaleConfirmed(false)}
      >
        <Result
          status="success"
          title="Venda confirmada!"
          subTitle="A sua compra foi registrada com sucesso."
          extra={[
            <Button type="primary" key="print" onClick={handlePrint}>
              Imprimir Comprovante
            </Button>,
            <Button type="default" key="ok" onClick={() => setSaleConfirmed(false)}>
              OK
            </Button>,
          ]}
        />
      </Modal>

      <Modal
        visible={dinheiroModalVisible}
        title="Calcular Troco"
        onCancel={() => {
          setDinheiroModalVisible(false);
          setSelectedPayment(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setDinheiroModalVisible(false);
              setSelectedPayment(null);
            }}
          >
            Cancelar
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={() => {
              const received = parseFloat(dinheiroReceived);
              if (isNaN(received) || received < totalValue) {
                message.error("Valor recebido deve ser maior ou igual ao total");
                return;
              }
              setDinheiroTroco(received - totalValue);
              setDinheiroModalVisible(false);
              message.success(`Troco calculado: R$ ${(received - totalValue).toFixed(2)}`);
            }}
          >
            Confirmar
          </Button>,
        ]}
      >
        <Input
          type="number"
          placeholder="Valor recebido"
          value={dinheiroReceived}
          onChange={(e) => setDinheiroReceived(e.target.value)}
        />
        <p>Total: R$ {totalValue.toFixed(2)}</p>
        {computedTroco !== null && <p>Troco: R$ {computedTroco.toFixed(2)}</p>}
      </Modal>

      {/* Div oculta com o conteúdo do comprovante para impressão */}
      <div id="receipt-content" style={{ display: "none" }}>
        <h1>Comprovante de Venda</h1>
        {receiptData && (
          <>
            <p>
              <strong>Total:</strong>{" "}
              {receiptData.total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <ul>
              {receiptData.items.map((item, index) => (
                <li key={index}>
                  {item.product.name} - Quantidade: {item.quantity} - Valor:{" "}
                  {Number(item.product.price).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </li>
              ))}
            </ul>
            <p>
              <strong>Forma de Pagamento:</strong> {receiptData.payment}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Caixa;
