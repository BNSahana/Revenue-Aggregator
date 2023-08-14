import React, { useState, useEffect } from "react";
import "./App.css";

const formatNumber = (number) => new Intl.NumberFormat("en", { minimumFractionDigits: 2 }).format(number);

const App = () => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          fetch("/api/branch1.json"),
          fetch("/api/branch2.json"),
          fetch("/api/branch3.json"),
        ]);

        const data = await Promise.all(responses.map(response => response.json()));
        
        const mergedData = mergeData(data.map(branch => branch.products));
        const sortedData = sortOn([...mergedData], "name");
        
        const holder = sortedData.reduce((acc, d) => {
          if (acc.hasOwnProperty(d.name)) {
            acc[d.name] += d.revenue;
          } else {
            acc[d.name] = d.revenue;
          }
          return acc;
        }, {});

        const finalProducts = Object.keys(holder).map(name => ({ name, revenue: holder[name] }));
        
        setStores(finalProducts);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const mergeData = (allData) => {
    const maxLength = Math.max(...allData.map(branch => branch.length));
    const merged = [];

    for (let i = 0; i < maxLength; i++) {
      allData.forEach(branch => {
        if (branch[i]) {
          merged.push({
            name: branch[i].name,
            revenue: branch[i].unitPrice * branch[i].sold,
          });
        }
      });
    }

    return merged;
  };

  const sortOn = (arr, prop) =>
    arr.slice().sort((a, b) => (a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0));

  const getValueInput = (evt) => {
    const inputValue = evt.target.value;
    setInput(inputValue);
    filterNames(inputValue);
  };

  const filterNames = (inputValue) => {
    const filteredStores = stores.filter((item) =>
      item.name.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFiltered(filteredStores);
  };

  const calculateTotalRev = (storeList) =>
    storeList.reduce((sum, current) => sum + current.revenue, 0);

  const renderTableData = () => {
    const storeList = filtered.length === 0 ? stores : filtered;

    return storeList.map((store) => (
      <tr key={store.name}>
        <td>{store.name}</td>
        <td>{formatNumber(store.revenue)}</td>
      </tr>
    ));
  };

  return (
    <div>
      <h1>Revenue Aggregator</h1>
    <div className="product-list">
      <label>Search Products</label>
      <input
        type="text"
        onChange={getValueInput}
        placeholder='Enter product name to search...'
      />
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>{renderTableData()}</tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>
              {formatNumber(
                calculateTotalRev(filtered.length === 0 ? stores : filtered)
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    </div>
  );
};

export default App;