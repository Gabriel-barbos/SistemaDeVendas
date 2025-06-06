import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
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
} from 'antd';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import useProducts from '../pages/Produtos/useProducts'

const { Search } = Input;
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
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} é obrigatório.` }]}
      >
        <Input
          ref={inputRef}
          type="number"
          min={0}
          onPressEnter={save}
          onBlur={save}
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ padding: '5px 12px', cursor: 'pointer' }}
        onClick={toggleEdit}
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

  const possibleTagColors = useMemo(
    () => [
      'magenta',
      'red',
      'volcano',
      'orange',
      'gold',
      'lime',
      'green',
      'cyan',
      'blue',
      'geekblue',
      'purple',
    ],
    []
  );

  //logica para cores de categoria
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

  // Opções de filtro de categoria para a tabela
  const categoryOptions = useMemo(
    () =>
      [...new Set(products.map((p) => p.category))].map((cat) => ({
        text: cat,
        value: cat,
      })),
    [products]
  );

  // Dados filtrados pela pesquisa e seleção de categorias
  const filteredData = useMemo(() => {
    return products
      .filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      )
      .filter((item) =>
        selectedCategories.length
          ? selectedCategories.includes(item.category)
          : true
      );
  }, [products, searchText, selectedCategories]);

  // Carrega produtos apenas uma vez ao montar
  useEffect(() => {
    fetchProducts();
  }, []);

  // Lida com edição de quantidade: chama backend para atualizar
  const handleSave = async (row) => {
    const { _id, quantity } = row; 
    try {
      await updateProduct(_id, { quantity });
    } catch (err) {
    }
  };

  // Lida com exclusão de produto: chama backend para deletar
  const handleDelete = async (record) => {
    const { _id } = record;
    try {
      await deleteProduct(_id);
    } catch (err) {
    }
  };

  // Pesquisa por nome
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Atualiza categorias selecionadas para filtragem
  const handleCategoryFilter = (selectedKeys) => {
    setSelectedCategories(selectedKeys || []);
  };

  // Configura componentes editáveis na tabela
  const componentsConfig = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = [
    {
      title: 'Produto',
      dataIndex: 'image',
      key: 'avatar',
      width: '4%',
      render: (images) => (
        <Avatar
          shape="square"
          size={48}
          src={images && images.length > 0 ? images[0] : undefined}
          icon={(!images || images.length === 0) ? <SearchOutlined /> : null}
        />
      ),
    },
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      width: '20%',
      filters: categoryOptions,
      filteredValue: selectedCategories,
      onFilter: (value, record) => record.category === value,
      render: (value) => (
        <Tag color={tagColors[value] || 'blue'}>{value}</Tag>
      ),
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '12%',
      editable: true,
      sorter: (a, b) => a.quantity - b.quantity,
      sortDirections: ['ascend', 'descend'],
      render: (value) => <span>{value}</span>,
    },
    {
      title: 'Ações',
      dataIndex: 'operation',
      key: 'operation',
      width: '12%',
      render: (_, record) =>
        products.length ? (
          <Popconfirm
            title="Tem certeza que deseja deletar?"
            onConfirm={() => handleDelete(record)}
            okText="Sim"
            cancelText="Não"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              DELETAR
            </Button>
          </Popconfirm>
        ) : null,
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
      }),
    };
  });

  if (error) {
    message.error('Erro ao carregar dados de estoque');
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Pesquisar por nome"
          onSearch={handleSearch}
          allowClear
          style={{ width: 240 }}
        />
      </Space>
      <Table
        components={componentsConfig}
        rowClassName={() => 'editable-row'}
        bordered
        rowKey="_id"
        dataSource={filteredData}
        columns={mergedColumns}
        pagination={{ pageSize: 8 }}
        loading={loading}
        scroll={{ x: 'max-content' }}
        onChange={(pagination, filters) => {
          if (filters.category) {
            handleCategoryFilter(filters.category);
          }
        }}
      />
    </div>
  );
};

export default ProductStockTable;
