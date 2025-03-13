import React, { useState } from 'react';
import { Button, Drawer, Form, Input, InputNumber, message, Upload, Popconfirm } from 'antd';
import { EyeOutlined, DeleteOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import "../assets/productCard.css";
import useProducts from '../pages/Produtos/useProducts';

function ProductCard({ product }) {
  const { updateProduct, deleteProduct } = useProducts(); // Hook para atualizar e deletar produtos
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm(); // Formulário do Ant Design

  // Abrir Drawer e preencher os campos
  const showDrawer = () => {
    setOpen(true);
    form.setFieldsValue({
      name: product.name,
      price: product.price,
      cost: product.cost,
      quantity: product.quantity,
      code: product.code,
      BarCode: product.BarCode,
    });
  };

  // Fechar Drawer
  const onClose = () => setOpen(false);

  // Atualizar Produto
  const handleUpdate = async (values) => {
    try {
      // Se houver imagens novas, pegar apenas as URLs
      const updatedProduct = { ...values, images: product.images };
      await updateProduct(product._id, updatedProduct);
      message.success('Produto atualizado com sucesso!');
      onClose();
    } catch (error) {
      message.error('Erro ao atualizar produto');
    }
  };

  // Excluir Produto
  const handleDelete = async () => {
    try {
      await deleteProduct(product._id);
      message.success('Produto excluído com sucesso!');
      onClose();
    } catch (error) {
      message.error('Erro ao excluir produto');
    }
  };

  return (
    <div className='card-container'>
      {/* Imagem do produto */}
      <img className="card-img" src={product.image?.[0] || "https://via.placeholder.com/150"} alt={product.name} />

      {/* Informações do produto */}
      <div className="card-content">
        <span className='card-title'>{product.name || "Produto sem nome"}</span>
        <span className='card-code'>cod. {product.code || "N/A"}</span>
        <span className='card-price'> R$ {product.price ? product.price.toFixed(2) : "0,00"}</span>
      </div>

      {/* Botão para abrir o Drawer */}
      <Button
        type="primary"
        icon={<EyeOutlined />}
        style={{ backgroundColor: '#', borderColor: '#f7f7f7', color: 'white' }}
        onClick={showDrawer}
      >
        Ver detalhes
      </Button>

      {/* Drawer de Edição */}
      <Drawer title="Editar Produto" onClose={onClose} open={open} width={400}>
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="name" label="Nome do Produto" rules={[{ required: true, message: 'Insira o nome do produto' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="code" label="Código do Produto" rules={[{ required: true, message: 'Insira o código' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="BarCode" label="Código de Barras" rules={[{ required: true, message: 'Insira o código de barras' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="price" label="Preço (R$)" rules={[{ required: true, message: 'Insira o preço' }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item name="cost" label="Custo (R$)" rules={[{ required: true, message: 'Insira o custo' }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item name="quantity" label="Quantidade em Estoque" rules={[{ required: true, message: 'Insira a quantidade' }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>


          <Button type="primary" icon={<SaveOutlined />} htmlType="submit" block>
            Salvar Alterações
          </Button>
        </Form>

        {/* Botão de exclusão com Popconfirm */}
        <Popconfirm title="Tem certeza que deseja excluir?" onConfirm={handleDelete} okText="Sim" cancelText="Não">
          <Button type="default" danger icon={<DeleteOutlined />} block style={{ marginTop: 10 }}>
            Excluir Produto
          </Button>
        </Popconfirm>
      </Drawer>
    </div>
  );
}

export default ProductCard;
