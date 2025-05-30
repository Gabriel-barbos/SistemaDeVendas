import React from "react";
import { BarcodeOutlined } from "@ant-design/icons";
import { Input, List } from "antd";

const { Search } = Input;

function ProductSearch({ 
  searchTerm, 
  filteredProducts, 
  onSearch, 
  onSelectProduct, 
  onAddProduct 
}) {
  return (
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
        onChange={(e) => onSearch(e.target.value)}
        onSearch={onAddProduct}
      />
      {filteredProducts.length > 0 && (
        <List
          className="autocomplete-list"
          dataSource={filteredProducts}
          renderItem={(item) => (
            <List.Item 
              className="autocomplete-item" 
              onClick={() => onSelectProduct(item)}
            >
              {item.name} - R$ {item.price}
            </List.Item>
          )}
        />
      )}
    </div>
  );
}

export default ProductSearch;