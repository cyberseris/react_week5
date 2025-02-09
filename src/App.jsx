import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "bootstrap";
import ReactLoading from 'react-loading';
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState([]);
  const [cart, setCart] = useState([]);
  const [qtySelect, setQtySelect] = useState(1);
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getProducts();
    getCart();
  }, []);
  
const getProducts = async () => {
      setIsScreenLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/products`);
        setProducts(res.data.products);
      } catch (error) {
        alert("取得產品失敗");
      } finally{
        setIsScreenLoading(false);
      }
    };

  const addCart = async(product) => {
    setIsLoading(true);
    try{
      const resAddCart = await axios.post(`${BASE_URL}/v2/api/${API_PATH}/cart`, {
        data:{
          "product_id": product.id,
          "qty": Number(qtySelect)
        }
      });
      setQtySelect(1);
      getCart();
    }catch(error){
      console.log(error)
    }finally{
      setIsLoading(false);
    }
  }

  const getCart = async() => {
    try{
      const resGetCart = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/cart`);
      setCart(Array.isArray(resGetCart.data.data.carts)?resGetCart.data.data.carts:[]);
      getTotalPrice();
    }catch(error){
      console.log(error)
    }
  }

  const updateCart = async(item,num) => {
    setIsScreenLoading(true);
    try{
      if((item.qty+num)>0){
        const resUpdateCart = await axios.put(`${BASE_URL}/v2/api/${API_PATH}/cart/${item.id}`,{
          data:{
            product_id:item.id,
            qty:item.qty+num
          }
      })
      getCart();
      }
    }catch(error){
      console.log(error)
    }finally{
      setIsScreenLoading(false);
    }
  }

  const removeCartItem = async(id) => {
    setIsScreenLoading(true);
    try{
      const resremoveCartItem = await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/cart/${id}`); 
      getCart();
    }catch(error){
      console.log(error)
    }finally{
      setIsScreenLoading(false);
    }
  }
  
  const removeCart = async() => {
    setIsScreenLoading(true);
    try{
      const resRemoveCart = await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/carts`); 
      getCart();
    }catch(error){
      console.log(error)
    }finally{
      setIsScreenLoading(false);
    }
  }

  const getTotalPrice = () => {
    const total = cart?.reduce((prev,item)=>{
        return prev + item.product.price*item.qty
    },0);
    return total
  }

  const productModalRef = useRef(null);
  useEffect(() => {
    new Modal(productModalRef.current, { backdrop: false });
  }, []);

  const openModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.show();
  };

  const closeModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();
  };

  const handleSeeMore = (product) => {
    setTempProduct(product);
    openModal();
  };

  const  {
    register,
    handleSubmit,
    formState:{errors},
    reset
  } = useForm();

  const onSubmit = handleSubmit((data) => {
    const {message, ...user} = data;
    const userInfo = {
      data:{
        user,
        message
      }
    }
    checkout(userInfo);
  })

  const checkout = async(data) => {
    setIsScreenLoading(true);
    try{
      const resCheck = await axios.post(`${BASE_URL}/v2/api/${API_PATH}/order`, data)
      reset();
    }catch(error){
      console.log('結帳失敗')
    }finally{
      setIsScreenLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="mt-4">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>圖片</th>
              <th>商品名稱</th>
              <th>價格</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) =>{
              return (
                  <tr key={product.id}>
                    <td style={{ width: "200px" }}>
                      <img
                        className="img-fluid"
                        src={product.imageUrl}
                        alt={product.title}
                      />
                    </td>
                    <td>{product.title}</td>
                    <td>
                      <del className="h6">原價 {product.origin_price} 元</del>
                      <div className="h5">特價 {product.price}元</div>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          onClick={() => handleSeeMore(product)}
                          type="button"
                          className="btn btn-outline-secondary me-2"
                        >
                          查看更多
                        </button>
                        <button type="button" onClick={()=>addCart(product)} className="btn btn-outline-danger d-flex align-items-center" disabled={isLoading}>
                          <div>加到購物車</div>
                          {isLoading && <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
            })}
          </tbody>
        </table>

        <div
          ref={productModalRef}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          className="modal fade"
          id="productModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title fs-5">
                  產品名稱：{tempProduct.title}
                </h2>
                <button
                  onClick={closeModal}
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <img
                  src={tempProduct.imageUrl}
                  alt={tempProduct.title}
                  className="img-fluid"
                />
                <p>內容：{tempProduct.content}</p>
                <p>描述：{tempProduct.description}</p>
                <p>
                  價錢：{tempProduct.price}{" "}
                  <del>{tempProduct.origin_price}</del> 元
                </p>
                <div className="input-group align-items-center">
                  <label htmlFor="qtySelect">數量：</label>
                  <select
                    value={qtySelect}
                    onChange={(e) => setQtySelect(e.target.value)}
                    id="qtySelect"
                    className="form-select"
                  >
                    {Array.from({ length: 10 }).map((_, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={()=>{addCart(tempProduct)}} className="btn btn-primary d-flex align-items-center" disabled={isLoading}>
                  <div>加入購物車</div>
                  {isLoading && <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-end py-3">
          <button type="button" onClick={removeCart} className="btn btn-outline-danger">
            清空購物車
          </button>
        </div>

        <table className="table align-middle">
          <thead>
            <tr>
              <th></th>
              <th>品名</th>
              <th style={{ width: "150px" }}>數量/單位</th>
              <th className="text">單價</th>
              <th className="text-end">總價</th>
            </tr>
          </thead>

          <tbody>
            {
              cart.length?cart?.map((item) => {
                return (
                  <tr key={item.id}>
                    <td>
                      <button type="button" onClick={()=>removeCartItem(item.id)} className="btn btn-outline-danger btn-sm">
                        x
                      </button>
                    </td>
                    <td>{item.product.title}</td>
                    <td style={{ width: "150px" }}>
                      <div className="d-flex align-items-center">
                        <div className="btn-group me-2" role="group">
                          <button
                            type="button"
                            onClick={()=>updateCart(item,-1)}
                            disabled = {item.qty===1}
                            className="btn btn-outline-dark btn-sm"
                          >
                            -
                          </button>
                          <span
                            className="btn border border-dark"
                            style={{ width: "50px", cursor: "auto" }}
                          >{item.qty}</span>
                          <button
                            type="button"
                            onClick={()=>updateCart(item,1)}
                            className="btn btn-outline-dark btn-sm"
                          >
                            +
                          </button>
                        </div>
                        <span className="input-group-text bg-transparent border-0">
                          {item.product.unit}
                        </span>
                      </div>
                    </td>
                    <td className="">{item.product.price}</td>
                    <td className="text-end">{item.total}</td>
                  </tr>
                )
              }):<td colSpan="4" className="text-center">
                目前購物車沒有任何東西：
              </td>
            }

          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" className="text-end">
                總計：
              </td>
              <td className="text-end" style={{ width: "130px" }}>
                {
                  getTotalPrice()
                }
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="my-5 row justify-content-center">
        <form onSubmit={onSubmit} className="col-md-6">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              {...register('email', {
                required: 'Email 欄位必填',
                pattern:{
                  value:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message:'Email 格式錯誤'
                }
              })}
              id="email"
              type="email"
              className={`form-control ${errors.email && 'is-invalid'}`}
              placeholder="請輸入 Email"
            />
            {errors.email && <p className="text-danger my-2">{errors.email.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              收件人姓名
            </label>
            <input
              {...register('name', {
                required: '姓名欄位必填',
              })}
              id="name"
              className={`form-control ${errors.name && 'is-invalid'}`}
              placeholder="請輸入姓名"
            />
            {errors.name && <p className="text-danger my-2">{errors.name.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="tel" className="form-label">
              收件人電話
            </label>
            <input
              {...register('tel', {
                required: '電話欄位必填',
                pattern:{
                  value:/^(0[2-8]\d{7}|09\d{8})$/,
                  message:'電話格式錯誤'
                }
              })}
              id="tel"
              type="text"
              className={`form-control ${errors.tel && 'is-invalid'}`}
              placeholder="請輸入電話"
            />
            {errors.tel && <p className="text-danger my-2">{errors.tel.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              收件人地址
            </label>
            <input
              {...register('address', {
                required: '地址欄位必填',
              })}
              id="address"
              type="text"
              className={`form-control ${errors.address && 'is-invalid'}`}
              placeholder="請輸入地址"
            />
            {errors.address && <p className="text-danger my-2">{errors.address.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="message" className="form-label">
              留言
            </label>
            <textarea
              {...register('message')}
              id="message"
              className="form-control"
              cols="30"
              rows="10"
            ></textarea>
          </div>
          <div className="text-end">
            <button type="submit" className="btn btn-danger">
              送出訂單
            </button>
          </div>
        </form>
      </div>

      {isScreenLoading && <div
          className="d-flex justify-content-center align-items-center"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(255,255,255,0.3)",
            zIndex: 999,
          }}
        >
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
      </div>}

    </div>
  );
}

export default App;
