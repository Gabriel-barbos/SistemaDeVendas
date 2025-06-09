import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Table,
  Input,
  Avatar,
  Tag,
  Space,
  Button,
  message,
  Typography,
  Select,
  Card,
  Row,
  Col,
  Badge,
  Alert,
  InputNumber,
  Popconfirm,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  WarningOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import useProducts from '../pages/Produtos/useProducts';

const { Search } = Input;
const { Text } = Typography;
const { Option } = Select;

const ProductStockTable = () => {
  const {
    products,
    loading,
    error,
    fetchProducts,
    deleteProduct,
    updateProduct, // Assumindo que existe esta função no hook
  } = useProducts();

  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showLowStock, setShowLowStock] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [editingQuantity, setEditingQuantity] = useState(0);

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

  // Produtos com estoque baixo para alerta
  const lowStockProducts = useMemo(() =>
    products.filter(p => p.quantity <= LOW_STOCK_THRESHOLD && p.quantity > 0),
    [products]
  );

  const outOfStockProducts = useMemo(() =>
    products.filter(p => p.quantity === 0),
    [products]
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const isEditing = (record) => record._id === editingKey;

  const edit = (record) => {
    setEditingKey(record._id);
    setEditingQuantity(record.quantity);
  };

  const cancel = () => {
    setEditingKey('');
    setEditingQuantity(0);
  };

  const save = async (record) => {
    try {
      const updatedProduct = {
        ...record,
        quantity: editingQuantity
      };

      await updateProduct(record._id, updatedProduct);
      setEditingKey('');
      setEditingQuantity(0);
      message.success('Quantidade atualizada com sucesso!');
    } catch (error) {
      message.error('Erro ao atualizar quantidade');
    }
  };

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

  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  const getStockTag = useCallback((quantity) => {
    if (quantity === 0) {
      return <Tag color="red" icon={<WarningOutlined />}>Sem Estoque</Tag>;
    }
    if (quantity <= LOW_STOCK_THRESHOLD) {
      return <Tag color="orange" icon={<WarningOutlined />}>Estoque Baixo</Tag>;
    }
    return <Tag color="green">Em Estoque</Tag>;
  }, []);

  const columns = [
    {
      title: 'Produto',
      dataIndex: 'image',
      key: 'avatar',
      width: 80,
      fixed: 'left',
      render: (images, record) => (
        <Avatar
          shape="square"
          size={48}
          src={images && images.length > 0 ? images[0] : undefined}
          icon={(!images || images.length === 0) ? <ShoppingCartOutlined /> : null}
        />
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
      title: 'Quantidade',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      render: (value, record) => {
        const editable = isEditing(record);
        return editable ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <InputNumber
              min={0}
              value={editingQuantity}
              onChange={setEditingQuantity}
              style={{ width: 80 }}
              size="small"
            />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              unidades
            </Text>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ fontSize: '16px' }}>
              {value}
            </Text>
            <Text type="secondary" style={{ fontSize: '11px', marginLeft: 4 }}>
              unidades
            </Text>
          </div>
        );
      },
      sorter: (a, b) => a.quantity - b.quantity,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Status',
      key: 'stockStatus',
      width: 130,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          {getStockTag(record.quantity)}
        </div>
      ),
      sorter: (a, b) => a.quantity - b.quantity,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Preço Custo',
      dataIndex: 'cost',
      key: 'cost',
      width: 120,
      sorter: (a, b) => a.cost - b.cost,
      render: (value) => (
        <Text style={{ color: '#ff4d4f' }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: 'Ações',
      key: 'operation',
      width: 150,
      fixed: 'right',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<SaveOutlined />}
              onClick={() => save(record)}
            >
              Salvar
            </Button>
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={cancel}
            >
              Cancelar
            </Button>
          </Space>
        ) : (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => edit(record)}
              disabled={editingKey !== ''}
            >
              Editar
            </Button>
            <Popconfirm
              title="Tem certeza que deseja deletar este produto?"
              onConfirm={() => handleDelete(record)}
              okText="Sim"
              cancelText="Não"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              >
                Deletar
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  if (error) {
    message.error('Erro ao carregar dados de estoque');
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Alertas de Estoque */}
      {outOfStockProducts.length > 0 && (
        <Alert
          message={`${outOfStockProducts.length} produto(s) sem estoque`}
          description={`Produtos: ${outOfStockProducts.map(p => p.name).join(', ')}`}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {lowStockProducts.length > 0 && (
        <Alert
          message={`${lowStockProducts.length} produto(s) com estoque baixo`}
          description={`Produtos: ${lowStockProducts.map(p => p.name).join(', ')}`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Filtros e Controles */}
      <Card style={{ marginBottom: 16 }}>
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
              <Button
                type={showLowStock ? 'primary' : 'default'}
                icon={<WarningOutlined />}
                onClick={() => setShowLowStock(!showLowStock)}
              >
                {showLowStock ? 'Mostrar Todos' : 'Estoque Baixo'}
              </Button>
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
          bordered
          rowKey="_id"
          dataSource={filteredData}
          columns={columns}
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
              setSelectedCategories(filters.category || []);
            }
          }}
          summary={(data) => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <Text strong>Total ({data.length} itens)</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <Text strong>
                    {data.reduce((sum, item) => sum + item.quantity, 0)} unidades
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <Text strong>
                    {formatCurrency(
                      data.reduce((sum, item) => sum + (item.cost * item.quantity), 0)
                    )}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
};

export default ProductStockTable;