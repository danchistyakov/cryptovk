import React, { useEffect, useState, useMemo } from 'react';
import './App.css';

const App = () => {
  const currencies = useMemo(() => ['BTC', 'ETH'], []);
  const actions = useMemo(() => ['buy', 'sell'], []);

  const [data, setData] = useState(currencies.map(a => ({
    currency: a,
    ...Object.fromEntries(actions.map(a => [a, 'Загрузка...'])),
  })));

  useEffect(() => {
    currencies.map((currency, index) => {
      const socket = new WebSocket('wss://api.exchange.bitcoin.com/api/2/ws');

      socket.addEventListener('open', () => {
        socket.send(JSON.stringify({
          method: 'subscribeTrades',
          params: {
            symbol: currency + 'USD',
            limit: 1,
          },
        }));
      });

      socket.addEventListener('message', e => {
        const { params } = JSON.parse(e.data);
        if (params) {
          const action = actions.find(a => a === params.data[0].side);
          if (action) {
            setData(data => data.map((a, i) => i === index
              ? { ...a, [action]: params.data[0].price }
              : a
            ));
          }
        }
      });
    });
  }, [currencies, actions]);

  return (
    <div className="App">
      <table>
        <tbody>
          <tr>
            <th>Криптовалюта</th>
            <th>Покупка</th>
            <th>Продажа</th>
          </tr>
          {data.map(n => (
            <tr key={n.currency}>
              <td>{n.currency}</td>
              <td>{n.buy} $</td>
              <td>{n.sell} $</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
