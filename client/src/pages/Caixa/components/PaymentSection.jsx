import React, { useState } from "react";
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

  const handleAbrirCaixa = () => setModalAbrir(true);
  const handleFecharCaixa = () => setModalFechar(true);

  const confirmarAbertura = () => {
    setCaixaAberto(true);
    setModalAbrir(false);
    message.success("Caixa aberto com sucesso!");
  };

  const confirmarFechamento = () => {
    setCaixaAberto(false);
    setModalFechar(false);
    setValorAbertura(0);
    message.info("Caixa fechado.");
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
          >
            {caixaAberto ? "Fechar Caixa" : "Abrir Caixa"}
          </Button>
        </div>
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
      >
        <div className="modal-content">
          <p style={{ fontSize: "16px", marginBottom: "10px" }}>
            Você tem certeza que deseja fechar o caixa?
          </p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Valor de abertura:{" "}
            {valorAbertura.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </Modal>
    </>
  );
}

export default PaymentSection;
