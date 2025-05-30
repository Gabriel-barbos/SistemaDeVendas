import React, { useMemo } from "react";
import { Input, Button, Modal, Result, message } from "antd";

function SaleModals({
  saleConfirmed,
  dinheiroModalVisible,
  dinheiroReceived,
  totalValue,
  dinheiroTroco,
  receiptData,
  onSaleConfirmedClose,
  onDinheiroModalClose,
  onDinheiroReceivedChange,
  onDinheiroTrocoSet,
  onDinheiroModalConfirm,
}) {
  // Calcula o troco em tempo real
  const computedTroco = useMemo(() => {
    const received = parseFloat(dinheiroReceived);
    if (!isNaN(received) && received >= totalValue) {
      return received - totalValue;
    }
    return null;
  }, [dinheiroReceived, totalValue]);

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

  const handleConfirmDinheiro = () => {
    const received = parseFloat(dinheiroReceived);
    if (isNaN(received) || received < totalValue) {
      message.error("Valor recebido deve ser maior ou igual ao total");
      return;
    }
    onDinheiroTrocoSet(received - totalValue);
    onDinheiroModalConfirm();
    message.success(`Troco calculado: R$ ${(received - totalValue).toFixed(2)}`);
  };

  return (
    <>
      <Modal
        visible={saleConfirmed}
        footer={null}
        onCancel={onSaleConfirmedClose}
      >
        <Result
          status="success"
          title="Venda confirmada!"
          subTitle="A sua compra foi registrada com sucesso."
          extra={[
            <Button type="primary" key="print" onClick={handlePrint}>
              Imprimir Comprovante
            </Button>,
            <Button type="default" key="ok" onClick={onSaleConfirmedClose}>
              OK
            </Button>,
          ]}
        />
      </Modal>

      <Modal
        visible={dinheiroModalVisible}
        title="Calcular Troco"
        onCancel={onDinheiroModalClose}
        footer={[
          <Button key="cancel" onClick={onDinheiroModalClose}>
            Cancelar
          </Button>,
          <Button key="confirm" type="primary" onClick={handleConfirmDinheiro}>
            Confirmar
          </Button>,
        ]}
      >
        <Input
          type="number"
          placeholder="Valor recebido"
          value={dinheiroReceived}
          onChange={(e) => onDinheiroReceivedChange(e.target.value)}
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
    </>
  );
}

export default SaleModals;