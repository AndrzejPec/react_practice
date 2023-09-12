/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

export const App = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none',
  });

  const products = productsFromServer.map((product) => {
    const category = categoriesFromServer
      .find(categoryToFind => categoryToFind.id === product.categoryId);
    const user = usersFromServer
      .find(userToFind => userToFind.id === category.ownerId);

    return {
      id: product.id,
      name: product.name,
      category: `${category.icon} - ${category.title}`,
      user: user.name,
      userGender: user.sex,
    };
  });

  const handleUserClick = (userId) => {
    setSelectedUser(userId);
  };

  const filteredProducts = products.filter(product => (
    (!selectedUser || product.user === selectedUser)
    && (!searchTerm
      || product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    && (selectedCategories.size === 0
      || selectedCategories.has(product.category.split(' - ')[1]))
  ));

  const sortedProducts = React.useMemo(() => {
    const sortableProducts = [...filteredProducts];

    if (sortConfig.key && sortConfig.direction !== 'none') {
      sortableProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }

        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }

        return 0;
      });
    }

    return sortableProducts;
  }, [filteredProducts, sortConfig]);

  const handleSortClick = (key) => {
    let direction = 'ascending';

    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key
      && sortConfig.direction === 'descending') {
      direction = 'none';
    } else {
      direction = 'ascending';
    }

    setSortConfig({ key, direction });
  };

  const handleCategoryClick = (category) => {
    const newCategories = new Set(selectedCategories);

    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }

    setSelectedCategories(newCategories);
  };

  const resetFilters = () => {
    setSelectedUser(null);
    setSearchTerm('');
    setSelectedCategories(new Set());
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                onClick={() => handleUserClick(null)}
                className={!selectedUser ? 'is-active' : ''}
                onKeyDown={() => handleUserClick(null)}
                role="button"
                tabIndex={0}
                data-cy="FilterAllUsers"
                href="#/"
              >
                All
              </a>
              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  onClick={() => handleUserClick(user.name)}
                  onKeyDown={() => handleUserClick(user.name)}
                  role="button"
                  tabIndex={0}
                  data-cy="FilterUser"
                  href="#/"
                  className={selectedUser === user.name ? 'is-active' : ''}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {searchTerm && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setSearchTerm('')}
                    />
                  </span>
                )}

              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={`button is-success mr-6 ${selectedCategories.size === 0 ? '' : 'is-outlined'}`}
                onClick={() => setSelectedCategories(new Set())}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={`button mr-2 my-1 ${selectedCategories.has(category.title) ? 'is-info' : ''}`}
                  onClick={() => handleCategoryClick(category.title)}
                  onKeyDown={() => handleCategoryClick(category.title)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={resetFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {filteredProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th onClick={() => handleSortClick('id')}>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className={`fas fa-sort${sortConfig.key === 'id' ? `-${sortConfig.direction !== 'none' ? sortConfig.direction : ''}` : ''}`} />
                        </span>
                      </a>
                    </span>
                  </th>
                  <th onClick={() => handleSortClick('name')}>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className={`fas fa-sort${sortConfig.key === 'id' ? `-${sortConfig.direction !== 'none' ? sortConfig.direction : ''}` : ''}`} />
                        </span>
                      </a>
                    </span>
                  </th>
                  <th onClick={() => handleSortClick('category')}>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className={`fas fa-sort${sortConfig.key === 'id' ? `-${sortConfig.direction !== 'none' ? sortConfig.direction : ''}` : ''}`} />
                        </span>
                      </a>
                    </span>
                  </th>
                  <th onClick={() => handleSortClick('user')}>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className={`fas fa-sort${sortConfig.key === 'id' ? `-${sortConfig.direction !== 'none' ? sortConfig.direction : ''}` : ''}`} />
                        </span>
                      </a>
                    </span>
                  </th>

                </tr>
              </thead>

              <tbody>
                {sortedProducts.map(product => (
                  <tr key={product.id} data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>
                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">{product.category}</td>
                    <td
                      data-cy="ProductUser"
                      className={product.userGender === 'm'
                        ? 'has-text-link'
                        : 'has-text-danger'}
                    >
                      {product.user}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          )}
        </div>
      </div>
    </div>
  );
};
