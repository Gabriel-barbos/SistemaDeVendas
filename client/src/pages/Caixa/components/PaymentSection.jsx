import React from "react";
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Input, Button } from "antd";

function PaymentSection({
  totalValue,
  selectedPayment,
  fiadoName,
  onPaymentSelect,
  onFiadoNameChange,
  onConcluirCompra,
  isSubmitting,
}) {
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

        <Button
          type="primary"
          className="concluir-compra"
          onClick={onConcluirCompra}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          <CheckCircleOutlined />
          Concluir Compra
        </Button>
      </div>
    </>
  );
}

export default PaymentSection;