import React, { useState, useEffect } from "react";
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  FileTextOutlined,
  LockOutlined,
  UnlockOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Input, Button, Modal, InputNumber, Tooltip, message } from "antd";
import axios from "axios";


const API_BASE_URL = "https://sistema-de-vendas-lemon.vercel.app"

function PaymentSection({
  totalValue,
  selectedPayment,
  fiadoName,
  onPaymentSelect,
  onFiadoNameChange,
  onConcluirCompra,
  isSubmitting,
}) {
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [modalAbrir, setModalAbrir] = useState(false);
  const [modalFechar, setModalFechar] = useState(false);
  const [valorAbertura, setValorAbertura] = useState(0);
  const [valorFechamento, setValorFechamento] = useState(0);
  const [dadosCaixa, setDadosCaixa] = useState(null);
  const [loading, setLoading] = useState(false);

  // Verificar se há caixa aberto ao carregar o componente
  useEffect(() => {
    verificarCaixaAberto();
  }, []);

  const verificarCaixaAberto = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/caixa/aberto`);
      if (response.data) {
        setCaixaAberto(true);
        setDadosCaixa(response.data);
        setValorAbertura(response.data.valorAbertura);
      }
    } catch (error) {
      // Se não encontrar caixa aberto, mantém fechado
      setCaixaAberto(false);
      setDadosCaixa(null);
    }
  };

  const handleAbrirCaixa = () => {
    setValorAbertura(0);
    setModalAbrir(true);
  };

  const handleFecharCaixa = () => {
    setValorFechamento(0);
    setModalFechar(true);
  };

  const confirmarAbertura = async () => {
    if (valorAbertura < 0) {
      message.error("O valor de abertura não pode ser negativo.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/caixa/abrir`, {
        valorAbertura: valorAbertura,
      });

      setCaixaAberto(true);
      setDadosCaixa(response.data.caixa);
      setModalAbrir(false);
      message.success("Caixa aberto com sucesso!");
    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Erro ao abrir o caixa.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const confirmarFechamento = async () => {
    if (valorFechamento < 0) {
      message.error("O valor de fechamento não pode ser negativo.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/caixa/fechar`, {
        valorFechamento: valorFechamento,
      });

      const caixaFechado = response.data.caixa;
      
      // Mostrar resumo do fechamento
      Modal.info({
        title: "Caixa Fechado com Sucesso",
        content: (
          <div>
            <p><strong>Valor de Abertura:</strong> {caixaFechado.valorAbertura.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            <p><strong>Total Vendas Dinheiro:</strong> {caixaFechado.totalVendasDinheiro.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            <p><strong>Valor Esperado:</strong> {(caixaFechado.valorAbertura + caixaFechado.totalVendasDinheiro).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            <p><strong>Valor Informado:</strong> {caixaFechado.valorFechamento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            <p style={{ color: caixaFechado.diferenca >= 0 ? 'green' : 'red' }}>
              <strong>Diferença:</strong> {caixaFechado.diferenca.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
        ),
        okText: "Entendi"
      });

      setCaixaAberto(false);
      setDadosCaixa(null);
      setModalFechar(false);
      setValorAbertura(0);
      setValorFechamento(0);
    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Erro ao fechar o caixa.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleConcluirCompra = () => {
    if (!caixaAberto) {
      message.warning("Abra o caixa antes de concluir a compra.");
      return;
    }
    onConcluirCompra();
  };

  return (
    <>
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
            onClick={() => onPaymentSelect("cartao")}
            disabled={selectedPayment && selectedPayment !== "cartao"}
            className={selectedPayment === "cartao" ? "selected" : ""}
          >
            Cartão
          </Button>
          <Button
            icon={<DollarOutlined />}
            onClick={() => onPaymentSelect("dinheiro")}
            disabled={selectedPayment && selectedPayment !== "dinheiro"}
            className={selectedPayment === "dinheiro" ? "selected" : ""}
          >
            Dinheiro
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => onPaymentSelect("fiado")}
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
            onChange={(e) => onFiadoNameChange(e.target.value)}
            style={{ marginTop: "10px" }}
          />
        )}

        <Tooltip
          title={!caixaAberto ? "Abra o caixa para concluir a compra" : ""}
        >
          <Button
            type="primary"
            className="concluir-compra"
            onClick={handleConcluirCompra}
            loading={isSubmitting}
            disabled={!caixaAberto || isSubmitting}
          >
            <CheckCircleOutlined />
            Concluir Compra
          </Button>
        </Tooltip>

        <div className="caixa-button-container">
          <Button
            type={caixaAberto ? "danger" : "primary"}
            icon={caixaAberto ? <LockOutlined /> : <UnlockOutlined />}
            onClick={caixaAberto ? handleFecharCaixa : handleAbrirCaixa}
            className="caixa-button"
            size="large"
            loading={loading}
          >
            {caixaAberto ? "Fechar Caixa" : "Abrir Caixa"}
          </Button>
        </div>

        {/* Mostrar informações do caixa aberto */}
        {caixaAberto && dadosCaixa && (
          <div style={{ 
            marginTop: "10px", 
            padding: "8px", 
            backgroundColor: "#f0f9ff", 
            border: "1px solid #91caff", 
            borderRadius: "6px",
            fontSize: "12px"
          }}>
            <div style={{ color: "#1890ff", fontWeight: "500" }}>
              Caixa Aberto - {new Date(dadosCaixa.dataAbertura).toLocaleString("pt-BR")}
            </div>
            <div style={{ color: "#666" }}>
              Valor inicial: {dadosCaixa.valorAbertura.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Abrir Caixa */}
      <Modal
        title="Abrir Caixa"
        open={modalAbrir}
        onOk={confirmarAbertura}
        onCancel={() => setModalAbrir(false)}
        okText="Confirmar"
        cancelText="Cancelar"
        className="modal-caixa"
        confirmLoading={loading}
      >
        <div className="modal-content">
          <p>Informe o valor inicial do caixa:</p>
          <InputNumber
            value={valorAbertura}
            onChange={setValorAbertura}
            formatter={(value) =>
              `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            }
            parser={(value) => value.replace(/R\$\s?|(\.)/g, "")}
            style={{ width: "100%" }}
            size="large"
            min={0}
            placeholder="0,00"
          />
        </div>
      </Modal>

      {/* Modal Fechar Caixa */}
      <Modal
        title="Fechar Caixa"
        open={modalFechar}
        onOk={confirmarFechamento}
        onCancel={() => setModalFechar(false)}
        okText="Sim, fechar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
        className="modal-caixa"
        confirmLoading={loading}
      >
        <div className="modal-content">
          <p style={{ fontSize: "16px", marginBottom: "15px" }}>
            Informe o valor atual no caixa para fechamento:
          </p>
          
          <InputNumber
            value={valorFechamento}
            onChange={setValorFechamento}
            formatter={(value) =>
              `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            }
            parser={(value) => value.replace(/R\$\s?|(\.)/g, "")}
            style={{ width: "100%", marginBottom: "15px" }}
            size="large"
            min={0}
            placeholder="0,00"
          />

          {dadosCaixa && (
            <div style={{ fontSize: "14px", color: "#666" }}>
              <p style={{ margin: "5px 0" }}>
                <strong>Valor de abertura:</strong>{" "}
                {dadosCaixa.valorAbertura.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              <p style={{ margin: "5px 0", fontSize: "12px", color: "#999" }}>
                Aberto em: {new Date(dadosCaixa.dataAbertura).toLocaleString("pt-BR")}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default PaymentSection;