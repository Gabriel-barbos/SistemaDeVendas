import React, { useState, useContext, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Table,
  Input,
  Form,
  Popconfirm,
  Avatar,
  Tag,
  Space,
  Button,
  message,
  Typography,
  Tooltip,
  Select,
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Modal,
  Image,
  Descriptions,
  InputNumber,
  Switch,
  Dropdown,
  Menu,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  ExportOutlined,
  ReloadOutlined,
  WarningOutlined,
  PlusOutlined,
  BarChartOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TagOutlined,
} from '@ant-design/icons';
import useProducts from '../pages/Produtos/useProducts';

const { Search } = Input;
const { Text, Title } = Typography;
const { Option } = Select;
const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  inputType = 'text',
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    const inputNode = inputType === 'number' ? (
      <InputNumber
        ref={inputRef}
        min={0}
        style={{ width: '100%' }}
        onPressEnter={save}
        onBlur={save}
      />
    ) : (
      <Input ref={inputRef} onPressEnter={save} onBlur={save} />
    );

    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} é obrigatório.` }]}
      >
        {inputNode}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ 
          padding: '5px 12px', 
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'background-color 0.3s',
        }}
        onClick={toggleEdit}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const ProductStockTable = () => {
  const {
    products,
    loading,
    error,
    fetchProducts,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showLowStock, setShowLowStock] = useState(false);
  const [editForm] = Form.useForm();

  const LOW_STOCK_THRESHOLD = 5;

  const possibleTagColors = useMemo(
    () => [
      'magenta', 'red', 'volcano', 'orange', 'gold', 'lime',
      'green', 'cyan', 'blue', 'geekblue', 'purple',
    ],
    []
  );

  // Mapeamento de cores para categorias
  const tagColors = useMemo(() => {
    const mapping = {};
    const uniqueCats = [...new Set(products.map((p) => p.category))];
    uniqueCats.forEach((cat) => {
      const hash = cat
        .split('')
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const color = possibleTagColors[hash % possibleTagColors.length];
      mapping[cat] = color;
    });
    return mapping;
  }, [products, possibleTagColors]);

  // Estatísticas do estoque
  const stockStats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalCost = products.reduce((sum, p) => sum + (p.cost * p.quantity), 0);
    const lowStockItems = products.filter(p => p.quantity <= LOW_STOCK_THRESHOLD).length;
    const outOfStockItems = products.filter(p => p.quantity === 0).length;
    
    return {
      totalProducts,
      totalValue,
      totalCost,
      lowStockItems,
      outOfStockItems,
      profit: totalValue - totalCost,
    };
  }, [products]);

  // Opções de filtro de categoria
  const categoryOptions = useMemo(
    () =>
      [...new Set(products.map((p) => p.category))].map((cat) => ({
        text: cat,
        value: cat,
      })),
    [products]
  );

  // Dados filtrados
  const filteredData = useMemo(() => {
    let filtered = products.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code.toLowerCase().includes(searchText.toLowerCase()) ||
      item.BarCode.toLowerCase().includes(searchText.toLowerCase())
    );

    if (selectedCategories.length) {
      filtered = filtered.filter((item) =>
        selectedCategories.includes(item.category)
      );
    }

    if (showLowStock) {
      filtered = filtered.filter((item) => item.quantity <= LOW_STOCK_THRESHOLD);
    }

    return filtered;
  }, [products, searchText, selectedCategories, showLowStock]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = useCallback(async (row) => {
    const { _id, quantity, price, cost } = row;
    try {
      await updateProduct(_id, { quantity, price, cost });
      message.success('Produto atualizado com sucesso!');
    } catch (err) {
      message.error('Erro ao atualizar produto');
    }
  }, [updateProduct]);

  const handleDelete = useCallback(async (record) => {
    const { _id } = record;
    try {
      await deleteProduct(_id);
      message.success('Produto deletado com sucesso!');
    } catch (err) {
      message.error('Erro ao deletar produto');
    }
  }, [deleteProduct]);

  const handleSearch = useCallback((value) => {
    setSearchText(value);
  }, []);

  const handleCategoryFilter = useCallback((selectedKeys) => {
    setSelectedCategories(selectedKeys || []);
  }, []);

  const showProductDetails = useCallback((product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  }, []);

  const showEditModal = useCallback((product) => {
    setEditingProduct(product);
    editForm.setFieldsValue(product);
    setEditModalVisible(true);
  }, [editForm]);

  const handleEditSave = useCallback(async () => {
    try {
      const values = await editForm.validateFields();
      await updateProduct(editingProduct._id, values);
      setEditModalVisible(false);
      setEditingProduct(null);
      editForm.resetFields();
      message.success('Produto atualizado com sucesso!');
    } catch (err) {
      message.error('Erro ao atualizar produto');
    }
  }, [editForm, editingProduct, updateProduct]);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(filteredData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'estoque.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    message.success('Dados exportados com sucesso!');
  }, [filteredData]);

  const getStockStatus = useCallback((quantity) => {
    if (quantity === 0) return { status: 'error', text: 'Sem Estoque' };
    if (quantity <= LOW_STOCK_THRESHOLD) return { status: 'warning', text: 'Estoque Baixo' };
    return { status: 'success', text: 'Em Estoque' };
  }, []);

  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  const componentsConfig = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const actionMenu = (record) => (
    <Menu>
      <Menu.Item 
        key="view" 
        icon={<EyeOutlined />}
        onClick={() => showProductDetails(record)}
      >
        Visualizar
      </Menu.Item>
      <Menu.Item 
        key="edit" 
        icon={<EditOutlined />}
        onClick={() => showEditModal(record)}
      >
        Editar
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />}
        danger
        onClick={() => handleDelete(record)}
      >
        Deletar
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Produto',
      dataIndex: 'image',
      key: 'avatar',
      width: 80,
      fixed: 'left',
      render: (images, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge 
            count={record.quantity === 0 ? 'Vazio' : record.quantity <= LOW_STOCK_THRESHOLD ? '!' : 0}
            status={getStockStatus(record.quantity).status}
          >
            <Avatar
              shape="square"
              size={48}
              src={images && images.length > 0 ? images[0] : undefined}
              icon={(!images || images.length === 0) ? <ShoppingCartOutlined /> : null}
              style={{ cursor: 'pointer' }}
              onClick={() => showProductDetails(record)}
            />
          </Badge>
        </div>
      ),
    },
    {
      title: 'Informações',
      key: 'info',
      width: 250,
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: '14px' }}>{record.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Código: {record.code}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Barras: {record.BarCode}
          </Text>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      filters: categoryOptions,
      filteredValue: selectedCategories,
      onFilter: (value, record) => record.category === value,
      render: (value) => (
        <Tag color={tagColors[value] || 'blue'} icon={<TagOutlined />}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Estoque',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      editable: true,
      sorter: (a, b) => a.quantity - b.quantity,
      sortDirections: ['ascend', 'descend'],
      render: (value, record) => {
        const stockInfo = getStockStatus(value);
        return (
          <div style={{ textAlign: 'center' }}>
            <Badge status={stockInfo.status} />
            <Text 
              strong 
              type={value === 0 ? 'danger' : value <= LOW_STOCK_THRESHOLD ? 'warning' : 'success'}
            >
              {value}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {stockInfo.text}
            </Text>
          </div>
        );
      },
    },

    {
      title: 'Preço Custo',
      dataIndex: 'cost',
      key: 'cost',
      width: 120,
      editable: true,
      sorter: (a, b) => a.cost - b.cost,
      render: (value) => (
        <Text style={{ color: '#ff4d4f' }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: 'Valor Total',
      key: 'totalValue',
      width: 120,
      sorter: (a, b) => (a.price * a.quantity) - (b.price * b.quantity),
      render: (_, record) => (
        <div style={{ textAlign: 'right' }}>
          <Text strong>{formatCurrency(record.price * record.quantity)}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Margem: {((record.price - record.cost) / record.cost * 100).toFixed(1)}%
          </Text>
        </div>
      ),
    },
    {
      title: 'Ações',
      key: 'operation',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown 
          overlay={actionMenu(record)} 
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<EyeOutlined />}>
            Ações
          </Button>
        </Dropdown>
      ),
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        inputType: ['quantity', 'price', 'cost'].includes(col.dataIndex) ? 'number' : 'text',
      }),
    };
  });

  if (error) {
    message.error('Erro ao carregar dados de estoque');
  }

  return (
    <div style={{  minHeight: '100vh' }}>
      {/* Estatísticas */}
     

      {/* Filtros e Controles */}
      <Card style={{ marginBottom: 0 }}>
        <Row gutter={16} align="middle">
          <Col flex="300px">
            <Search
              placeholder="Pesquisar por nome, código ou código de barras"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col flex="200px">
            <Select
              mode="multiple"
              placeholder="Filtrar categorias"
              value={selectedCategories}
              onChange={setSelectedCategories}
              style={{ width: '100%' }}
              size="large"
            >
              {categoryOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <Tag color={tagColors[option.value]} size="small">
                    {option.value}
                  </Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Mostrar apenas produtos com estoque baixo">
                <Switch
                  checkedChildren="Estoque Baixo"
                  unCheckedChildren="Todos"
                  checked={showLowStock}
                  onChange={setShowLowStock}
                />
              </Tooltip>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchProducts}
                loading={loading}
              >
                Atualizar
              </Button>
         
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabela */}
      <Card>
        <Table
          components={componentsConfig}
          rowClassName={(record) => {
            if (record.quantity === 0) return 'row-out-of-stock';
            if (record.quantity <= LOW_STOCK_THRESHOLD) return 'row-low-stock';
            return 'editable-row';
          }}
          bordered
          rowKey="_id"
          dataSource={filteredData}
          columns={mergedColumns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} itens`,
          }}
          loading={loading}
          scroll={{ x: 1200, y: 600 }}
          onChange={(pagination, filters) => {
            if (filters.category) {
              handleCategoryFilter(filters.category);
            }
          }}
          summary={(data) => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={6}>
                  <Text strong>Total ({data.length} itens)</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  <Text strong>
                    {formatCurrency(
                      data.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    )}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      {/* Modal de Detalhes do Produto */}
      <Modal
        title="Detalhes do Produto"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedProduct && (
          <div>
            <Row gutter={24}>
              <Col span={8}>
                <Image
                  width="100%"
                  src={selectedProduct.image?.[0]}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
              </Col>
              <Col span={16}>
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Nome" span={2}>
                    {selectedProduct.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Código">
                    {selectedProduct.code}
                  </Descriptions.Item>
                  <Descriptions.Item label="Código de Barras">
                    {selectedProduct.BarCode}
                  </Descriptions.Item>
                  <Descriptions.Item label="Categoria">
                    <Tag color={tagColors[selectedProduct.category]}>
                      {selectedProduct.category}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Quantidade">
                    <Badge 
                      status={getStockStatus(selectedProduct.quantity).status}
                      text={`${selectedProduct.quantity} unidades`}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Preço de Venda">
                    {formatCurrency(selectedProduct.price)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Preço de Custo">
                    {formatCurrency(selectedProduct.cost)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Valor Total">
                    {formatCurrency(selectedProduct.price * selectedProduct.quantity)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Margem de Lucro">
                    {((selectedProduct.price - selectedProduct.cost) / selectedProduct.cost * 100).toFixed(2)}%
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Modal de Edição */}
      <Modal
        title="Editar Produto"
        open={editModalVisible}
        onOk={handleEditSave}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingProduct(null);
          editForm.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Código" name="code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Código de Barras" name="BarCode" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Categoria" name="category" rules={[{ required: true }]}>
            <Select>
              <Option value="eletronicos">Eletrônicos</Option>
              <Option value="acessorios">Acessórios</Option>
              <Option value="outros">Outros</Option>
              <Option value="cosmeticos">Cosméticos</Option>
              <Option value="utilidades">Utilidades</Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Quantidade" name="quantity" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Preço de Venda" name="price" rules={[{ required: true }]}>
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Preço de Custo" name="cost" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        .editable-row:hover {
          background-color: #fafafa;
        }
        .row-low-stock {
          background-color: #fff7e6;
        }
        .row-out-of-stock {
          background-color: #fff2f0;
        }
        .ant-table-summary {
          background-color: #fafafa;
        }
      `}</style>
    </div>
  );
};

export default ProductStockTable;