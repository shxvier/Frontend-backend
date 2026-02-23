import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [vinyls, setVinyls] = useState([])

  useEffect(() => {
    // Твой бэкенд на порту 5050
    fetch('http://localhost:5050/api/products')
      .then(res => res.json())
      .then(data => setVinyls(data))
      .catch(err => console.error("Ошибка связи с сервером:", err))
  }, [])

  return (
    <div className="shop-wrap">
      <header className="shop-header">
        <h1>VINYL_<span>COLLECTION</span></h1>
        <p>Практическая работа №4: API + React</p>
      </header>
      
      <div className="product-grid">
        {vinyls.map(item => (
          <div key={item.id} className="product-card">
            <div className="tag">{item.category || 'Vinyl'}</div>
            <h3>{item.title}</h3>
            <p className="desc">{item.description || 'Rare collectors edition vinyl record.'}</p>
            <div className="price-row">
              <span className="price">{item.price} ₽</span>
              <span className="stock">Склад: {item.stock || 5}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App